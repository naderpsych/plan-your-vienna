# -*- coding: utf-8 -*-
"""
Travel times between consecutive stops, read off Google Maps.

Same method as the hours agent: a real headless Chrome opens the directions
page for each pair and reads the duration Google prints. No API, no key.

Times are not calculated here — whatever Google says is what gets stored, so
a trip with a change of line carries its real waiting time.

Writes src/data/legs.generated.json, keyed "<from id>><to id>".

Run:  python scripts/google_legs.py [max pairs]
"""
import calendar
import json
import os
import random
import re
import sys
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "src", "data", "itinerary.ts")
TARGET = os.path.join(ROOT, "src", "data", "legs.generated.json")

BATCH = int(sys.argv[1]) if len(sys.argv) > 1 else 60

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
BLOCK_SIGNS = ("Bevor Sie zu Google weitergehen", "unusual traffic",
               "ungewöhnlicher Datenverkehr", "Ich bin kein Roboter")

# Google prints "1 Std. 5 min" / "47 min" — lower case, so match either.
DURATION = re.compile(r"(?:(\d+)\s*(?:Std\.?|Stunden?))?\s*(?:(\d+)\s*min)", re.I)
CLOCK = re.compile(r"(\d{1,2}):(\d{2})")

# Cards whose time is the arrival only, while the plan says when they end.
ENDS_AT = {
    "sun-opera-arrive": "21:45",
}
# U4, S7, bus 60B, tram D …
LINES = re.compile(r"\b(U\d|S\d{1,2}|\d{1,3}[A-Z]?)\b")


def stops_by_day():
    """
    [(day id, [stop, …]), …] in visiting order.

    Only the `stops:` array of each day counts — alternatives sit at the same
    indentation but are not part of the route, and the wish list that follows
    is not a day at all.
    """
    source = open(SOURCE, encoding="utf-8").read()
    hotel_lat = re.search(r"^  lat: ([\d.]+),", source, re.M).group(1)
    hotel_lng = re.search(r"^  lng: ([\d.]+),", source, re.M).group(1)

    days = []
    current = None
    stop = None
    in_stops = False
    day_iso = None
    with open(SOURCE, encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("export const wishlist"):
                break
            # the morning block is built by a helper, so it has no literal entry
            m = re.match(r'^      breakfast\("([^"]+)"\),', line)
            if m and current:
                current[1].append(
                    {"id": f"{m.group(1)}-hotel", "lat": hotel_lat, "lng": hotel_lng}
                )
                continue
            # hotel stops point at the shared constant rather than numbers
            if in_stops and stop is not None and "lat: HOTEL.lat," in line:
                stop["lat"] = hotel_lat
                continue
            if in_stops and stop is not None and "lng: HOTEL.lng," in line:
                stop["lng"] = hotel_lng
                current[1].append(stop)
                stop = None
                continue
            m = re.search(r'^    id: "([^"]+)",', line)
            if m:
                current = (m.group(1), [])
                days.append(current)
                in_stops = False
                day_iso = None
                continue
            m = re.search(r'^    iso: "(\d{4}-\d{2}-\d{2})",', line)
            if m:
                day_iso = m.group(1)
                continue
            if current is None:
                continue
            if re.match(r"^    stops: \[", line):
                in_stops = True
                continue
            if re.match(r"^    alternatives: \[", line):
                in_stops = False
                continue
            if not in_stops:
                continue
            m = re.search(r'^        id: "([^"]+)",', line)
            if m:
                stop = {"id": m.group(1), "lat": None, "lng": None,
                        "time": None, "iso": day_iso}
                continue
            if stop is None:
                continue
            m = re.search(r'^        time: "([^"]+)",', line)
            if m:
                stop["time"] = m.group(1)
                continue
            m = re.search(r"^        lat: ([\d.]+),", line)
            if m:
                stop["lat"] = m.group(1)
                continue
            m = re.search(r"^        lng: ([\d.]+),", line)
            if m:
                stop["lng"] = m.group(1)
                if stop["lat"]:
                    current[1].append(stop)
                stop = None
    return days


def departure(a, b):
    """
    When the plan leaves `a` for `b`: when `a` ends if its time is a range (or
    the plan gives an end), otherwise when `b` starts. Returned as the local
    wall-clock time Google expects in the !8j field.
    """
    iso = a.get("iso") or b.get("iso")
    if not iso:
        return None
    clock = None
    if a["id"] in ENDS_AT:
        clock = ENDS_AT[a["id"]]
    else:
        times = CLOCK.findall(a.get("time") or "")
        if len(times) >= 2:
            clock = "%s:%s" % times[-1]
        else:
            start = CLOCK.findall(b.get("time") or "")
            if start:
                clock = "%s:%s" % start[0]
            elif times:
                clock = "%s:%s" % times[0]
    if not clock:
        return None
    y, mo, d = (int(x) for x in iso.split("-"))
    h, mi = (int(x) for x in clock.split(":"))
    return calendar.timegm((y, mo, d, h, mi, 0)), "%s %02d:%02d" % (iso, h, mi)


def pairs_to_check():
    out = []
    for _day_id, stops in stops_by_day():
        for a, b in zip(stops, stops[1:]):
            out.append((a, b))
    return out


def read_duration(page, origin, destination, mode, depart=None):
    route = (f"https://www.google.com/maps/dir/{origin['lat']},{origin['lng']}/"
             f"{destination['lat']},{destination['lng']}/")
    if mode == "transit" and depart:
        # 6e0 = depart at, 7e2 = local time, 8j = that time, 3e3 = transit
        url = route + f"data=!4m6!4m5!2m3!6e0!7e2!8j{depart}!3e3?hl=de"
    elif mode == "transit":
        url = route + "data=!4m2!4m1!3e3?hl=de"
    else:
        url = route + "data=!4m2!4m1!3e2?hl=de"
    page.goto(url, timeout=60000, wait_until="domcontentloaded")
    page.wait_for_timeout(random.randint(4000, 6000))

    body = page.inner_text("body")[:6000]
    if "/sorry/" in page.url or any(sign in body for sign in BLOCK_SIGNS):
        return None, None, True

    # The trip cards carry the duration; fall back to the first one on the page.
    text = ""
    for selector in ('div[id^="section-directions-trip-"]', "#section-directions-trip-0"):
        nodes = page.query_selector_all(selector)
        if nodes:
            text = nodes[0].inner_text()
            break
    if not text:
        text = body

    m = DURATION.search(text)
    if not m:
        return None, None, False
    hours = int(m.group(1) or 0)
    minutes = int(m.group(2) or 0)
    total = hours * 60 + minutes
    if total <= 0:
        return None, None, False

    summary = None
    if mode == "transit":
        found = []
        for line in LINES.findall(text.replace("\n", " ")):
            if line not in found and len(found) < 3:
                found.append(line)
        if found:
            summary = " → ".join(found)
    return total, summary, False


def main():
    pairs = pairs_to_check()[:BATCH]
    print(f"{len(pairs)} legs to time")

    try:
        with open(TARGET, encoding="utf-8") as fh:
            store = json.load(fh)
    except Exception:
        store = {"generated": None, "legs": {}}
    store.setdefault("legs", {})

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    done = blocked = 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True, args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent=UA, locale="de-AT", viewport={"width": 1280, "height": 900}
        )
        page = ctx.new_page()

        for a, b in pairs:
            key = f"{a['id']}>{b['id']}"
            entry = dict(store["legs"].get(key, {}))
            try:
                walk, _summary, hit = read_duration(page, a, b, "walking")
                if hit:
                    blocked += 1
                    print(f"  ~ {key}: blocked, skipping")
                    page.wait_for_timeout(random.randint(9000, 15000))
                    continue
                if walk:
                    entry["walk_min"] = walk

                # Only worth a transit lookup when the walk is a real slog.
                if walk is None or walk > 22:
                    when = departure(a, b)
                    transit, summary, hit = read_duration(
                        page, a, b, "transit", when[0] if when else None)
                    if when:
                        entry["depart"] = when[1]
                    if hit:
                        blocked += 1
                        page.wait_for_timeout(random.randint(9000, 15000))
                    elif transit:
                        entry["transit_min"] = transit
                        if summary:
                            entry["transit_summary"] = summary
            except Exception as err:
                print(f"  ! {key}: {err}")
                continue

            if entry:
                entry["checked"] = today
                store["legs"][key] = entry
                done += 1
                print(f"  + {key}: walk {entry.get('walk_min', '-')} min, "
                      f"transit {entry.get('transit_min', '-')} min "
                      f"{entry.get('transit_summary', '')}")

            page.wait_for_timeout(random.randint(1500, 3000))

        browser.close()

    store["generated"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with open(TARGET, "w", encoding="utf-8") as fh:
        json.dump(store, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    print(f"done — {done} legs timed, {blocked} blocked, {len(store['legs'])} stored")


if __name__ == "__main__":
    main()

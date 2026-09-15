# -*- coding: utf-8 -*-
"""
Google Maps hours agent for the Vienna trip.

Opens a real headless Chrome, searches Google Maps for every place in the
itinerary and in the map warehouse, expands the weekly hours table and reads
the rows off the screen.
No API, no key, no billing — the same approach as google_agent.py in the
timeout-food project, ported to Vienna and to German locale, because
google.com/maps?hl=de prints 24-hour times that need no AM/PM parsing.

Writes src/data/hours.generated.json, which the site prefers over the hours
typed into the data files.

Run:  python scripts/google_hours.py [max places]
"""
import json
import os
import random
import re
import sys
import urllib.parse
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES = [
    os.path.join(ROOT, "src", "data", "itinerary.ts"),
    os.path.join(ROOT, "src", "data", "warehouse.ts"),
]
TARGET = os.path.join(ROOT, "src", "data", "hours.generated.json")

BATCH = int(sys.argv[1]) if len(sys.argv) > 1 else 60

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

# Sunday first, to match JavaScript's Date.getDay()
DE_DAYS = {
    "Sonntag": 0, "Montag": 1, "Dienstag": 2, "Mittwoch": 3,
    "Donnerstag": 4, "Freitag": 5, "Samstag": 6,
}
DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
TIME_RANGE = re.compile(r"(\d{1,2}:\d{2})\s*[–\-−]\s*(\d{1,2}:\d{2})")
BLOCK_SIGNS = ("Bevor Sie zu Google weitergehen", "unusual traffic",
               "ungewöhnlicher Datenverkehr", "I'm not a robot",
               "Ich bin kein Roboter")


def norm_time(t):
    h, m = t.split(":")
    h = int(h)
    if h == 0:
        h = 24  # "0:00" as the end of a range means midnight
    return f"{h:02d}:{m}"


def parse_hours(rows):
    """Rows like 'Freitag 09:00–18:00' -> week array + a readable line."""
    week = [None] * 7
    human = []
    for row in rows:
        text = re.sub(r"\s+", " ", row.replace("‎", " ").replace("\t", " ")).strip()
        day = next((d for d in DE_DAYS if text.startswith(d)), None)
        if day is None:
            continue
        idx = DE_DAYS[day]
        if "Geschlossen" in text:
            human.append(f"{DAY_SHORT[idx]} Closed")
            continue
        if "Durchgehend" in text or "24 Stunden" in text:
            week[idx] = "00:00-24:00"
            human.append(f"{DAY_SHORT[idx]} open 24h")
            continue
        found = TIME_RANGE.findall(text)
        if not found:
            continue
        first, last = found[0], found[-1]
        week[idx] = f"{norm_time(first[0])}-{norm_time(last[1])}"
        human.append(
            f"{DAY_SHORT[idx]} "
            + ", ".join(f"{norm_time(a)}-{norm_time(b)}" for a, b in found)
        )
    if not any(w is not None for w in week) and not human:
        return None, None
    return week, " · ".join(human)


def places_from_source():
    """(id, query, title) for every place in the data files that has a query."""
    out = []
    seen = set()
    for source in SOURCES:
        out.extend(_places_in(source, seen))
    return out


def _places_in(path, seen):
    out = []
    current_id = None
    current_title = None
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            m = re.search(r'\bid:\s*"([^"]+)"', line)
            if m:
                current_id, current_title = m.group(1), None
                continue
            m = re.search(r'\btitle:\s*"([^"]+)"', line)
            if m and current_id:
                current_title = m.group(1)
                continue
            m = re.search(r'\bquery:\s*"([^"]+)"', line)
            if m and current_id:
                if current_id not in seen:
                    seen.add(current_id)
                    out.append((current_id, m.group(1), current_title or current_id))
                current_id = None
    return out


def scrape(page, query):
    """What Google shows for this search, or None if we got blocked."""
    url = "https://www.google.com/maps/search/" + urllib.parse.quote(query) + "?hl=de"
    page.goto(url, timeout=45000, wait_until="domcontentloaded")
    page.wait_for_timeout(random.randint(2800, 4200))  # read like a person

    body = page.inner_text("body")[:4000]
    if "/sorry/" in page.url or any(sign in body for sign in BLOCK_SIGNS):
        return None

    result = {}

    # A list of results instead of one place: open the first entry.
    h1 = page.query_selector("h1")
    title = h1.inner_text().strip() if h1 else ""
    if not title or title in ("Ergebnisse", "Results"):
        link = page.query_selector('a[href*="/maps/place/"]')
        if link:
            try:
                link.click(timeout=5000)
                page.wait_for_timeout(3200)
            except Exception:
                pass
        h1 = page.query_selector("h1")
        title = h1.inner_text().strip() if h1 else ""

    if title and title not in ("Ergebnisse", "Results") and len(title) < 60:
        result["google_name"] = title

    el = page.query_selector('button[data-item-id="address"]')
    if el:
        addr = el.inner_text().strip().split(chr(10))[-1].strip()
        if addr:
            result["address"] = addr

    # The hours table starts collapsed on one row — click to expand the week.
    rows = []
    for selector in ('[aria-label*="Öffnungszeiten"]', '[jsaction*="openhours"]',
                     '[aria-label*="Uhrzeit"]'):
        try:
            for handle in page.query_selector_all(selector)[:3]:
                try:
                    handle.click(timeout=2500)
                    page.wait_for_timeout(900)
                except Exception:
                    continue
                rows = [r.inner_text() for r in page.query_selector_all("table tr")[:9]]
                if len(rows) >= 5:
                    break
            if len(rows) >= 5:
                break
        except Exception:
            continue
    if not rows:
        rows = [r.inner_text() for r in page.query_selector_all("table tr")[:9]]

    week, human = parse_hours(rows)
    if week:
        result["week"] = week
        result["human"] = human

    result["closed_permanently"] = "Dauerhaft geschlossen" in body
    return result


def main():
    places = places_from_source()[:BATCH]
    print(f"{len(places)} places to look up")

    try:
        with open(TARGET, encoding="utf-8") as fh:
            store = json.load(fh)
    except Exception:
        store = {"generated": None, "places": {}}
    store.setdefault("places", {})

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    found = blocked = 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True, args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent=UA, locale="de-AT", viewport={"width": 1280, "height": 900}
        )
        page = ctx.new_page()

        for stop_id, query, title in places:
            try:
                got = scrape(page, query)
            except Exception as err:
                print(f"  ! {title}: {err}")
                continue

            if got is None:
                blocked += 1
                print(f"  ~ {title}: blocked by Google, skipping")
                page.wait_for_timeout(random.randint(9000, 15000))
                continue

            if got.get("week"):
                entry = store["places"].get(stop_id, {})
                entry.update({
                    "week": got["week"],
                    "human": got.get("human"),
                    "google_name": got.get("google_name"),
                    "address": got.get("address"),
                    "closed_permanently": got.get("closed_permanently", False),
                    "checked": today,
                })
                store["places"][stop_id] = entry
                found += 1
                print(f"  + {title}: {got.get('human', '')[:60]}")
            else:
                print(f"  - {title}: no hours shown")

            page.wait_for_timeout(random.randint(1800, 3600))

        browser.close()

    store["generated"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with open(TARGET, "w", encoding="utf-8") as fh:
        json.dump(store, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    print(f"done — {found} with hours, {blocked} blocked, {len(store['places'])} stored")


if __name__ == "__main__":
    main()

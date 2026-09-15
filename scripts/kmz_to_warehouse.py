# -*- coding: utf-8 -*-
"""Turn the shared Google My Maps export into a place warehouse the site can use."""
import io
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

SRC = r"C:\Users\NaderElmahdy\Downloads\Vienna Tourist Map by @HappyToWander.kmz"
OUT = r"C:\Users\NaderElmahdy\claudecode\plan-your-vienna\src\data\warehouse.ts"
NS = {"k": "http://www.opengis.net/kml/2.2"}

z = zipfile.ZipFile(SRC)
kml = z.read([n for n in z.namelist() if n.endswith(".kml")][0]).decode("utf-8")
root = ET.fromstring(kml)


def clean(text):
    if not text:
        return ""
    text = re.sub(r"<br\s*/?>", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&amp;", "&").replace("&nbsp;", " ").replace("&#39;", "'")
    text = text.replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">")
    text = re.sub(r"https?://\S+", "", text)
    return re.sub(r"\s+", " ", text).strip()


def slug(text, used):
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:38] or "place"
    candidate = "map-" + base
    n = 2
    while candidate in used:
        candidate = "map-%s-%d" % (base, n)
        n += 1
    used.add(candidate)
    return candidate


groups = []
used_ids = set()

for folder in root.iter("{http://www.opengis.net/kml/2.2}Folder"):
    title = folder.findtext("k:name", default="", namespaces=NS).strip()
    items = []
    for pm in folder.findall("k:Placemark", NS):
        name = clean(pm.findtext("k:name", default="", namespaces=NS))
        about = clean(pm.findtext("k:description", default="", namespaces=NS))
        coords = pm.findtext(".//k:coordinates", default="", namespaces=NS).strip()
        if not name or not coords:
            continue
        parts = coords.split(",")
        lng, lat = float(parts[0]), float(parts[1])
        items.append({
            "id": slug(name, used_ids),
            "title": name,
            "about": about[:400],
            "lat": round(lat, 5),
            "lng": round(lng, 5),
        })
    if items:
        groups.append({"title": title, "items": items})


def ts_string(value):
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


lines = [
    "/**",
    " * Place warehouse — the shared Vienna map (Vienna Tourist Map by @HappyToWander),",
    " * converted from its KMZ export. Nothing here is scheduled: these are places to",
    " * pull into a day from the list at the bottom of the page.",
    " *",
    " * Regenerate with scripts/kmz_to_warehouse.py if the map is updated.",
    " */",
    'import type { Stop } from "@/data/itinerary";',
    "",
    "export const warehouse: { title: string; items: Stop[] }[] = [",
]

for group in groups:
    lines.append("  {")
    lines.append("    title: %s," % ts_string(group["title"]))
    lines.append("    items: [")
    for item in group["items"]:
        lines.append("      {")
        lines.append("        id: %s," % ts_string(item["id"]))
        lines.append("        title: %s," % ts_string(item["title"]))
        if item["about"]:
            lines.append("        about: %s," % ts_string(item["about"]))
        lines.append("        lat: %s," % item["lat"])
        lines.append("        lng: %s," % item["lng"])
        lines.append("        query: %s," % ts_string(item["title"] + " Wien"))
        lines.append("      },")
    lines.append("    ],")
    lines.append("  },")

lines.append("];")
lines.append("")

io.open(OUT, "w", encoding="utf-8").write("\n".join(lines))

total = sum(len(g["items"]) for g in groups)
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
print("wrote %d places in %d categories" % (total, len(groups)))
for g in groups:
    print("  %-26s %d" % (g["title"], len(g["items"])))
    print("     e.g. %s — %s" % (g["items"][0]["title"], g["items"][0]["about"][:70]))

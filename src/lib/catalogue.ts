/**
 * Every place the site knows about, in one list.
 *
 * The wish list, each day's alternatives, the 71 places from the map and
 * anything you typed yourself all end up here — folded together by name, so a
 * place that sits in three of those lists (Demel, say) appears once, carrying
 * the richest description of the three and a note of where it came from.
 */
import { days, wishlist, type Stop } from "@/data/itinerary";
import { warehouse } from "@/data/warehouse";

export type Source = "Wish list" | "Alternatives" | "Map" | "My places";

export type CatalogueItem = Stop & { sources: Source[] };

const key = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** How much a version of a place actually tells you. */
function richness(stop: Stop): number {
  return (
    (stop.about ? 2 : 0) +
    (stop.plan ? 2 : 0) +
    (stop.hours ? 1 : 0) +
    (stop.lat ? 1 : 0) +
    (stop.kind ? 1 : 0)
  );
}

export function buildCatalogue(mine: Stop[] = []): CatalogueItem[] {
  const merged = new Map<string, CatalogueItem>();

  const add = (stop: Stop, source: Source) => {
    const k = key(stop.title);
    const seen = merged.get(k);
    if (!seen) {
      merged.set(k, { ...stop, sources: [source] });
      return;
    }
    const sources = seen.sources.includes(source) ? seen.sources : [...seen.sources, source];
    // Keep whichever copy says more, but never lose where it was found.
    merged.set(k, richness(stop) > richness(seen) ? { ...stop, sources } : { ...seen, sources });
  };

  wishlist.forEach((s) => add(s, "Wish list"));
  days.forEach((d) => d.alternatives.forEach((s) => add(s, "Alternatives")));
  warehouse.forEach((g) => g.items.forEach((s) => add(s, "Map")));
  mine.forEach((s) => add(s, "My places"));

  return [...merged.values()].sort((a, b) => a.title.localeCompare(b.title));
}

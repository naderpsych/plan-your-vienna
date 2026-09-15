/**
 * Starter entries for "My places".
 *
 * These are yours — added here rather than typed into the browser so they
 * survive a new phone or a cleared cache. Anything you add in the page itself
 * sits alongside them, and deleting one here keeps it deleted.
 */
import type { Stop } from "@/data/itinerary";

export const myPlacesSeed: Stop[] = [
  {
    id: "mine-oberlaa",
    kind: "cafe",
    title: "Kurkonditorei Oberlaa",
    about:
      "Neuer Markt 16. The café and pastry shop the Viennese actually buy from, rather than the one on the postcards.",
    plan: "Kardinalschnitte · Topfenstrudel · Malakofftorte.",
    lat: 48.2049,
    lng: 16.3703,
    query: "Kurkonditorei Oberlaa Neuer Markt 16 Wien",
  },
  {
    id: "mine-mq-libelle",
    kind: "view",
    title: "MQ Libelle",
    about:
      "A glass viewing deck on the roof of the MuseumsQuartier, ten minutes from the hotel. Free to walk onto.",
    lat: 48.2033,
    lng: 16.3585,
    query: "MQ Libelle Wien",
  },
  {
    id: "mine-chinacy",
    title: "Chinacy",
    plan: "Added from your list — no description yet. Open it on Google to see what it is.",
    query: "Chinacy Wien",
  },
];

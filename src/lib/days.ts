import { days as tripDays, type Day } from "@/data/itinerary";

/** Local calendar date — the trip is planned in Vienna time, not UTC. */
export function localIso(date = new Date()): string {
  return date.toLocaleDateString("en-CA");
}

export const todayIso = localIso();

/**
 * A seventh, empty day for right now. Nothing is scheduled in it: you fill it
 * from your own lists, and every candidate is checked against today's hours.
 */
export const todayDay: Day = {
  id: "today",
  iso: todayIso,
  date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  weekday: "Today",
  theme: "Nothing planned — build it from your lists",
  stops: [],
  alternatives: [],
};

export const allDays: Day[] = [...tripDays, todayDay];

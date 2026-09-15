/**
 * The editable layer on top of the fixed itinerary.
 *
 * Everything the traveller changes — places removed from a day, places added
 * to one, whether from the wish list or typed by hand — lives in localStorage
 * so the trip survives a reload without needing a server.
 */
import { FOOD_KINDS, holidays, type Hours, type Stop } from "@/data/itinerary";
import generatedHours from "@/data/hours.generated.json";

const KEY = "vienna-plan-v1";

export type PlanState = {
  /** Stop ids hidden from their day. */
  removed: string[];
  /** Extra stops per day id. */
  added: Record<string, Stop[]>;
  /** The traveller's own list, kept beside the built-in wish list. */
  mine: Stop[];
};

const EMPTY: PlanState = { removed: [], added: {}, mine: [] };

export function loadPlan(): PlanState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<PlanState>;
    return {
      removed: parsed.removed ?? [],
      added: parsed.added ?? {},
      mine: parsed.mine ?? [],
    };
  } catch {
    return EMPTY;
  }
}

export function savePlan(plan: PlanState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(plan));
  } catch {
    /* private mode — the trip still works, it just will not persist */
  }
}

/** Minutes past midnight, or null when the label is not a clock time. */
export function minutesOf(time?: string): number | null {
  const m = time?.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** The day's stops after removals and additions, ordered by clock time. */
export function stopsFor(dayId: string, base: Stop[], plan: PlanState): Stop[] {
  const removed = new Set(plan.removed);
  const all = [...base.filter((s) => !removed.has(s.id)), ...(plan.added[dayId] ?? [])];
  return all.sort((a, b) => {
    const ma = minutesOf(a.time);
    const mb = minutesOf(b.time);
    if (ma === null && mb === null) return 0;
    if (ma === null) return 1;
    if (mb === null) return -1;
    return ma - mb;
  });
}

type GeneratedEntry = {
  week: (string | null)[];
  human?: string;
  google_name?: string;
  checked?: string;
  closed_permanently?: boolean;
};

const generated = generatedHours as {
  generated: string | null;
  places: Record<string, GeneratedEntry>;
};

/** Google-scraped hours win over the ones typed into the data file. */
export function hoursFor(stop: Stop): (Hours & { google?: boolean }) | undefined {
  const fromGoogle = generated.places?.[stop.id];
  if (fromGoogle?.week) {
    return {
      week: fromGoogle.week,
      source: "osm",
      google: true,
      ...(fromGoogle.human ? { note: fromGoogle.human } : {}),
      ...(fromGoogle.checked ? { checked: fromGoogle.checked } : {}),
    };
  }
  return stop.hours;
}

export function isPermanentlyClosed(stop: Stop): boolean {
  return generated.places?.[stop.id]?.closed_permanently === true;
}

export type Fit = {
  level: "ok" | "tight" | "bad" | "unknown";
  message: string;
};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function fmt(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Does this place work on this date at this time?
 * Checks the weekday's opening hours and Austrian public holidays.
 */
export function checkFit(stop: Stop, iso: string, time: string): Fit {
  const holiday = holidays[iso];
  const weekday = new Date(`${iso}T12:00:00`).getDay();
  const dayName = WEEKDAY_NAMES[weekday];

  if (isPermanentlyClosed(stop)) {
    return { level: "bad", message: "Google lists this place as permanently closed" };
  }

  const hours = hoursFor(stop);
  const holidayNote = holiday
    ? ` It is also ${holiday}, a public holiday — expect Sunday hours or a closed door.`
    : "";

  if (!hours?.week) {
    return {
      level: "unknown",
      message: `No opening hours on file yet — check the Google listing before you go.${holidayNote}`,
    };
  }

  const range = hours.week[weekday];
  if (!range) {
    return { level: "bad", message: `Closed on ${dayName}.${holidayNote}` };
  }

  const [openStr, closeStr] = range.split("-");
  const open = minutesOf(openStr);
  const close = minutesOf(closeStr);
  const at = minutesOf(time);

  if (open === null || close === null || at === null) {
    return { level: "unknown", message: `Opening hours on ${dayName}: ${range}.${holidayNote}` };
  }

  if (at < open) {
    return {
      level: "bad",
      message: `Too early — opens at ${fmt(open)} on ${dayName}.${holidayNote}`,
    };
  }
  if (at >= close) {
    return {
      level: "bad",
      message: `Too late — closes at ${fmt(close)} on ${dayName}.${holidayNote}`,
    };
  }
  if (close - at <= 45) {
    return {
      level: "tight",
      message: `Only ${close - at} minutes before it closes at ${fmt(close)}.${holidayNote}`,
    };
  }
  if (holiday) {
    return {
      level: "tight",
      message: `Open ${range} on a normal ${dayName}, but ${holiday} is a public holiday — verify first.`,
    };
  }
  return { level: "ok", message: `Open ${range} on ${dayName}.` };
}

/** The opening hours for one date: "08:00–17:30", "Closed", or null when unknown. */
export function hoursToday(stop: Stop, iso: string): string | null {
  const hours = hoursFor(stop);
  if (!hours?.week) return null;
  const range = hours.week[new Date(`${iso}T12:00:00`).getDay()];
  if (!range) return "Closed";
  return range.replace("-", "–");
}

/** True for restaurants, cafés and markets — the cards that get the warm colour. */
export function isFood(stop: Stop): boolean {
  return stop.kind !== undefined && FOOD_KINDS.includes(stop.kind);
}

export function googleUrl(stop: Stop): string {
  const q = stop.query ?? stop.title;
  return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
}

export function newStopId(): string {
  return `custom-${Math.random().toString(36).slice(2, 10)}`;
}

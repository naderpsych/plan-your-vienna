/**
 * The leg between two stops.
 *
 * Distance is computed here — that is geometry, and a detour factor makes it
 * close enough. Travel time is not guessed: the transit figure comes from
 * Google, read by the legs agent and stored in legs.generated.json. Until the
 * agent has a pair, the line shows the distance and sends you to Google.
 */
import type { Stop } from "@/data/itinerary";
import generatedLegs from "@/data/legs.generated.json";

/** Straight-line kilometres between two points. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type GeneratedLeg = {
  walk_min?: number | null;
  transit_min?: number | null;
  transit_summary?: string | null;
  checked?: string | null;
};

const legs = generatedLegs as unknown as {
  generated: string | null;
  legs: Record<string, GeneratedLeg>;
};

export type Leg = {
  /** Street distance estimate, in kilometres. */
  km: number;
  /** Minutes, straight from Google. Null when the agent has not read this pair. */
  minutes: number | null;
  mode: "walk" | "transit";
  /** Which lines Google suggested, when it said. */
  summary?: string;
  url: string;
};

/** Vienna streets are not straight, so pad the crow-flies distance. */
const DETOUR = 1.25;
/** Beyond this nobody walks it, so the transit time is the one that matters. */
const WALKABLE_KM = 1.8;

export function legKey(from: Stop, to: Stop): string {
  return `${from.id}>${to.id}`;
}

export function legBetween(from: Stop, to: Stop): Leg | null {
  if (!from.lat || !from.lng || !to.lat || !to.lng) return null;

  const straight = haversineKm(
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng },
  );
  if (straight < 0.05) return null; // same place, near enough

  const km = straight * DETOUR;
  const base =
    `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}` +
    `&destination=${to.lat},${to.lng}`;

  const known = legs.legs?.[legKey(from, to)];
  const walkable = km <= WALKABLE_KM;
  const mode: "walk" | "transit" = walkable ? "walk" : "transit";
  const minutes = walkable ? (known?.walk_min ?? null) : (known?.transit_min ?? null);

  return {
    km,
    minutes,
    mode,
    url: `${base}&travelmode=${walkable ? "walking" : "transit"}`,
    ...(!walkable && known?.transit_summary ? { summary: known.transit_summary } : {}),
  };
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1)} km`;
}

/** "1h 30" / "45 min" */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}` : `${h}h`;
}

/** What the timeline prints between two cards. */
export function describeLeg(leg: Leg): string {
  const distance = formatDistance(leg.km);
  if (leg.minutes === null) {
    return `${distance} · ${leg.mode === "walk" ? "walk" : "by public transport"} — tap for the time`;
  }
  if (leg.mode === "walk") return `${distance} · ${leg.minutes} min walk`;
  return `${distance} · ${leg.minutes} min${leg.summary ? ` · ${leg.summary}` : ""}`;
}

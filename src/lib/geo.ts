/**
 * Rough distances between two stops.
 *
 * These are straight-line figures with a detour factor, not routed directions —
 * good enough to tell a five-minute hop from a half-hour trek, and every leg
 * links out to Google for the real route.
 */
import type { Stop } from "@/data/itinerary";

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

export type Leg = {
  /** Street distance estimate, in kilometres. */
  km: number;
  minutes: number;
  mode: "walk" | "transit";
  url: string;
};

/** Vienna streets are not straight, so pad the crow-flies distance. */
const DETOUR = 1.25;
const WALK_KMH = 4.6;
/** Waiting, walking to the stop, changing lines. */
const TRANSIT_OVERHEAD_MIN = 9;
const TRANSIT_KMH = 19;
/** Past this, nobody walks it. */
const WALK_LIMIT_MIN = 28;

export function legBetween(from: Stop, to: Stop): Leg | null {
  if (!from.lat || !from.lng || !to.lat || !to.lng) return null;

  const straight = haversineKm(
    { lat: from.lat, lng: from.lng },
    { lat: to.lat, lng: to.lng },
  );
  if (straight < 0.05) return null; // same place, near enough

  const km = straight * DETOUR;
  const walkMinutes = Math.round((km / WALK_KMH) * 60);
  const url =
    `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}` +
    `&destination=${to.lat},${to.lng}`;

  if (walkMinutes <= WALK_LIMIT_MIN) {
    return { km, minutes: walkMinutes, mode: "walk", url: `${url}&travelmode=walking` };
  }
  return {
    km,
    minutes: Math.round(TRANSIT_OVERHEAD_MIN + (km / TRANSIT_KMH) * 60),
    mode: "transit",
    url: `${url}&travelmode=transit`,
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

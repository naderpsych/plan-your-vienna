/**
 * Live Vienna forecast for the trip dates, from Open-Meteo.
 * No key, no account — one request covering the whole range, cached for
 * three hours so flipping between days does not re-fetch.
 */
import { useEffect, useState } from "react";

const LAT = 48.2082;
const LNG = 16.3738;
const CACHE_KEY = "vienna-weather-v1";
const CACHE_MS = 3 * 60 * 60 * 1000;

type DayWeather = {
  code: number;
  max: number;
  min: number;
  rain: number;
};

type Cache = { at: number; days: Record<string, DayWeather> };

/** WMO weather codes → what to show. */
function describe(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Clear" };
  if (code <= 2) return { icon: "🌤️", label: "Mostly sunny" };
  if (code === 3) return { icon: "☁️", label: "Overcast" };
  if (code <= 48) return { icon: "🌫️", label: "Fog" };
  if (code <= 57) return { icon: "🌦️", label: "Drizzle" };
  if (code <= 67) return { icon: "🌧️", label: "Rain" };
  if (code <= 77) return { icon: "🌨️", label: "Snow" };
  if (code <= 82) return { icon: "🌧️", label: "Showers" };
  if (code <= 86) return { icon: "🌨️", label: "Snow showers" };
  return { icon: "⛈️", label: "Thunderstorm" };
}

let inflight: Promise<Record<string, DayWeather>> | null = null;

async function fetchRange(from: string, to: string) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Europe%2FVienna&start_date=${from}&end_date=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const json = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: (number | null)[];
    };
  };
  const out: Record<string, DayWeather> = {};
  json.daily.time.forEach((iso, i) => {
    out[iso] = {
      code: json.daily.weather_code[i]!,
      max: Math.round(json.daily.temperature_2m_max[i]!),
      min: Math.round(json.daily.temperature_2m_min[i]!),
      rain: json.daily.precipitation_probability_max[i] ?? 0,
    };
  });
  return out;
}

export default function Weather({ iso, from, to }: { iso: string; from: string; to: string }) {
  const [days, setDays] = useState<Record<string, DayWeather> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as Cache;
        if (Date.now() - cached.at < CACHE_MS) {
          setDays(cached.days);
          return;
        }
      }
    } catch {
      /* fall through to the network */
    }

    inflight = inflight ?? fetchRange(from, to);
    inflight
      .then((result) => {
        setDays(result);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), days: result }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => setFailed(true))
      .finally(() => {
        inflight = null;
      });
  }, [from, to]);

  if (failed) return null;

  const day = days?.[iso];
  if (!day) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {days ? "Forecast not out yet" : "Loading forecast…"}
      </span>
    );
  }

  const { icon, label } = describe(day.code);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
      <span aria-hidden className="text-base">
        {icon}
      </span>
      <span className="font-semibold">{day.max}°</span>
      <span className="text-muted-foreground">/ {day.min}°</span>
      <span className="text-xs text-muted-foreground">
        {label}
        {day.rain > 20 ? ` · ${day.rain}% rain` : ""}
      </span>
    </span>
  );
}

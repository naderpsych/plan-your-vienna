import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import type { Day, Stop } from "@/data/itinerary";

function numberIcon(n: number) {
  return L.divIcon({
    className: "trip-pin-wrapper",
    html: `<div class="trip-pin">${n}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function TripMap({ day }: { day: Day }) {
  const located = day.stops.filter(
    (s): s is Stop & { lat: number; lng: number } =>
      typeof s.lat === "number" && typeof s.lng === "number",
  );

  const center: [number, number] = located.length
    ? [
        located.reduce((a, s) => a + s.lat, 0) / located.length,
        located.reduce((a, s) => a + s.lng, 0) / located.length,
      ]
    : [48.2082, 16.3738];

  const line = located.map((s) => [s.lat, s.lng] as [number, number]);
  const bounds = line.length > 1 ? L.latLngBounds(line).pad(0.15) : null;

  return (
    <MapContainer
      key={day.id}
      {...(bounds ? { bounds } : { center, zoom: 14 })}
      scrollWheelZoom

      className="h-full w-full"
      style={{ background: "var(--color-muted)" }}
    >


      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline
        positions={line}
        pathOptions={{
          color: "var(--map-route)",
          weight: 4,
          opacity: 0.85,
          dashArray: "1 8",
          lineCap: "round",
        }}
      />
      {located.map((s, i) => (
        <Marker
          key={`${s.title}-${i}`}
          position={[s.lat, s.lng]}
          icon={numberIcon(i + 1)}
        >
          <Popup>
            <div className="space-y-1 text-left">
              {s.time && (
                <div className="font-mono text-xs text-muted-foreground">{s.time}</div>
              )}
              <div className="font-semibold text-foreground">{s.title}</div>
              {s.about && (
                <div className="text-xs text-muted-foreground">{s.about}</div>
              )}
              <a
                className="inline-block pt-1 text-xs font-semibold text-primary underline"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  s.query ?? `${s.lat},${s.lng}`,
                )}`}
              >
                Navigate here →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

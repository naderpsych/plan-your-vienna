import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { days, bookings, foodList, type Stop } from "@/data/itinerary";

const TripMap = lazy(() => import("@/components/TripMap"));
const MyNotes = lazy(() => import("@/components/MyNotes"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "וינה 19–24.9 · מסלול יומי ומפות" },
      {
        name: "description",
        content:
          "מסלול טיול מפורט בווינה: לוח זמנים לכל יום, אזהרות פתיחה וסגירה, חלופות, רשימת אוכל אוסטרי ומפה עם מסלול וניווט.",
      },
      { property: "og:title", content: "וינה 19–24.9 · מסלול יומי ומפות" },
      {
        property: "og:description",
        content:
          "לוח זמנים יומי, מפה אינטראקטיבית עם המסלול, וכפתור ניווט לכל עצירה.",
      },
    ],
  }),
  component: Index,
});

function navUrl(s: Stop) {
  const dest = s.query ?? (s.lat && s.lng ? `${s.lat},${s.lng}` : s.title);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

function routeUrl(stops: Stop[]) {
  const pts = stops.filter((s) => s.lat && s.lng);
  const dest = pts[pts.length - 1];
  if (!dest) return "https://www.google.com/maps";
  const mid = pts.slice(0, -1).map((s) => `${s.lat},${s.lng}`).join("|");
  return `https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=${dest.lat},${dest.lng}${
    mid ? `&waypoints=${encodeURIComponent(mid)}` : ""
  }`;
}

function Index() {
  const [dayIdx, setDayIdx] = useState(0);
  const [view, setView] = useState<"itinerary" | "map">("itinerary");
  const [openFood, setOpenFood] = useState<string | null>(null);
  const day = days[dayIdx] ?? days[0]!;
  const located = day.stops.filter((s) => s.lat && s.lng);


  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <header
        className="px-4 pb-7 pt-8 text-primary-foreground sm:px-8"
        style={{ backgroundImage: "var(--gradient-header)" }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Wien · 19–24 September
          </p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">וינה, שישה ימים</h1>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
            לוח זמנים יומי, מה סגור ומה פתוח, חלופות — ומפה עם המסלול המלא של כל יום.
          </p>

          <div className="mt-6 inline-flex rounded-full bg-primary-foreground/12 p-1 backdrop-blur">
            {(
              [
                ["itinerary", "לוח הימים"],
                ["map", "מפת היום"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  view === key
                    ? "bg-gold text-gold-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Day selector */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3 sm:px-8">
          {days.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setDayIdx(i)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-right transition-all ${
                i === dayIdx
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              <span className="block text-sm font-bold">
                {d.weekday} {d.star && "⭐"}
              </span>
              <span
                className={`block font-mono text-xs ${
                  i === dayIdx ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {d.date}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              {day.weekday} {day.date}
            </h2>
            <p className="text-sm text-muted-foreground">{day.theme}</p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {located.length} עצירות על המפה
          </span>
        </div>

        {view === "map" ? (
          <section className="space-y-4">
            <div className="h-[65vh] overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
              <ClientOnly
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    טוען מפה…
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      טוען מפה…
                    </div>
                  }
                >
                  <TripMap day={day} />
                </Suspense>
              </ClientOnly>
            </div>

            <a
              href={routeUrl(day.stops)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              פתח את כל המסלול ב‑Google Maps ↗
            </a>

            <ol className="grid gap-2 sm:grid-cols-2">
              {located.map((s, i) => (
                <li
                  key={`${s.title}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{s.title}</span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      {s.time}
                    </span>
                  </span>
                  <a
                    href={navUrl(s)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    ניווט
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <section className="space-y-6">
            {day.warn && <Banner tone="warn">{day.warn}</Banner>}
            {day.closed && (
              <Banner tone="warn">
                <strong>סגור היום:</strong> {day.closed}
              </Banner>
            )}
            {day.open && (
              <Banner tone="ok">
                <strong>פתוח דווקא היום:</strong> {day.open}
              </Banner>
            )}

            <ol className="relative space-y-3 border-r-2 border-dashed border-border pr-5">
              {day.stops.map((s, i) => (
                <li key={`${s.title}-${i}`} className="relative">
                  <span className="absolute -right-[27px] top-5 size-3 rounded-full border-2 border-background bg-gold" />
                  <article className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {s.time && (
                        <span className="font-mono text-sm font-bold text-primary">
                          {s.time}
                        </span>
                      )}
                      <h3 className="text-lg font-bold">
                        {s.title} {s.star && <span className="text-gold">⭐</span>}
                      </h3>
                    </div>
                    {s.detail && (
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {s.detail}
                      </p>
                    )}
                    {s.warn && (
                      <p className="mt-3 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">
                        ⚠️ {s.warn}
                      </p>
                    )}
                    {s.lat && (
                      <div className="mt-3 flex gap-2">
                        <a
                          href={navUrl(s)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
                        >
                          ניווט GPS
                        </a>
                        <button
                          onClick={() => setView("map")}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-primary"
                        >
                          הצג במפה
                        </button>
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ol>

            {day.alternatives.length > 0 && (
              <div className="rounded-2xl border border-border bg-secondary p-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  חלופות
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {day.alternatives.map((a) => (
                    <li
                      key={a}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {view === "itinerary" && (
          <>
            <section className="mt-12 rounded-2xl border border-gold/40 bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-bold">להזמין השבוע</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {bookings.map((b) => (
                  <li
                    key={b}
                    className="rounded-full bg-gold px-3 py-1.5 text-sm font-semibold text-gold-foreground"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold">🥨 רשימת האוכל האוסטרי</h2>
              <div className="mt-4 space-y-2">
                {foodList.map((group) => {
                  const open = openFood === group.title;
                  return (
                    <div
                      key={group.title}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <button
                        onClick={() => setOpenFood(open ? null : group.title)}
                        className="flex w-full items-center justify-between px-4 py-3 text-right font-bold"
                      >
                        <span>{group.title}</span>
                        <span className="text-muted-foreground">{open ? "−" : "+"}</span>
                      </button>
                      {open && (
                        <ul className="space-y-3 border-t border-border px-4 py-3">
                          {group.items.map((it) => (
                            <li key={it.name}>
                              <span className="font-semibold text-primary">{it.name}</span>
                              {it.text && (
                                <span className="text-sm text-muted-foreground"> — {it.text}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <ClientOnly fallback={null}>
              <Suspense fallback={null}>
                <MyNotes />
              </Suspense>
            </ClientOnly>
          </>
        )}
      </main>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "warn" | "ok";
  children: React.ReactNode;
}) {
  return (
    <p
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "warn"
          ? "border-gold/50 bg-accent text-accent-foreground"
          : "border-primary/25 bg-primary/5 text-primary"
      }`}
    >
      {tone === "warn" ? "⚠️ " : "✅ "}
      {children}
    </p>
  );
}

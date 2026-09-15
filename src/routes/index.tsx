import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { days, bookings, foodList, wishlist, type Stop } from "@/data/itinerary";
import {
  checkFit,
  googleUrl,
  hoursFor,
  loadPlan,
  newStopId,
  savePlan,
  stopsFor,
  type Fit,
  type PlanState,
} from "@/lib/plan";

const TripMap = lazy(() => import("@/components/TripMap"));
const MyNotes = lazy(() => import("@/components/MyNotes"));
const Weather = lazy(() => import("@/components/Weather"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vienna 19–24 Sep · Daily itinerary & maps" },
      {
        name: "description",
        content:
          "A detailed Vienna itinerary: a schedule for every day, live weather, opening-hour checks, alternatives, an Austrian food list and a map with the route and navigation.",
      },
      { property: "og:title", content: "Vienna 19–24 Sep · Daily itinerary & maps" },
      {
        property: "og:description",
        content:
          "A daily schedule, an interactive map with the route, and a navigation button for every stop.",
      },
    ],
  }),
  component: Index,
});

const FIRST_DAY = days[0]!.iso;
const LAST_DAY = days[days.length - 1]!.iso;

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

const EMPTY_PLAN: PlanState = { removed: [], added: {} };

function Index() {
  const [dayIdx, setDayIdx] = useState(0);
  const [view, setView] = useState<"itinerary" | "map">("itinerary");
  const [openList, setOpenList] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanState>(EMPTY_PLAN);

  useEffect(() => {
    setPlan(loadPlan());
  }, []);

  function update(next: PlanState) {
    setPlan(next);
    savePlan(next);
  }

  const day = days[dayIdx] ?? days[0]!;
  const stops = stopsFor(day.id, day.stops, plan);
  const located = stops.filter((s) => s.lat && s.lng);

  function removeStop(id: string) {
    update({ ...plan, removed: [...plan.removed, id] });
  }

  function restoreAll() {
    update({ ...plan, removed: [] });
  }

  function addStop(dayId: string, stop: Stop) {
    update({
      ...plan,
      removed: plan.removed.filter((id) => id !== stop.id),
      added: { ...plan.added, [dayId]: [...(plan.added[dayId] ?? []), stop] },
    });
  }

  const removedHere = day.stops.filter((s) => plan.removed.includes(s.id));

  return (
    <div dir="ltr" className="min-h-screen bg-background text-foreground">
      <header
        className="px-4 pb-7 pt-8 text-primary-foreground sm:px-8"
        style={{ backgroundImage: "var(--gradient-header)" }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Wien · 19–24 September
          </p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Vienna, six days</h1>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
            Every day starts at the hotel. Live forecast, opening-hour checks, and a map
            with the full route — add or drop a place whenever the plan changes.
          </p>

          <div className="mt-6 inline-flex rounded-full bg-primary-foreground/12 p-1 backdrop-blur">
            {(
              [
                ["itinerary", "Itinerary"],
                ["map", "Day map"],
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
              className={`shrink-0 rounded-xl border px-4 py-2 text-left transition-all ${
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
          <div className="flex flex-wrap items-center gap-3">
            <ClientOnly fallback={null}>
              <Suspense fallback={null}>
                <Weather iso={day.iso} from={FIRST_DAY} to={LAST_DAY} />
              </Suspense>
            </ClientOnly>
            <span className="font-mono text-xs text-muted-foreground">
              {located.length} stops on the map
            </span>
          </div>
        </div>

        {view === "map" ? (
          <section className="space-y-4">
            <div className="h-[65vh] overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
              <ClientOnly
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading map…
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Loading map…
                    </div>
                  }
                >
                  <TripMap day={{ ...day, stops }} />
                </Suspense>
              </ClientOnly>
            </div>

            <a
              href={routeUrl(stops)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open the whole route in Google Maps ↗
            </a>

            <ol className="grid gap-2 sm:grid-cols-2">
              {located.map((s, i) => (
                <li
                  key={s.id}
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
                    Navigate
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
                <strong>Closed today:</strong> {day.closed}
              </Banner>
            )}
            {day.open && (
              <Banner tone="ok">
                <strong>Open today:</strong> {day.open}
              </Banner>
            )}

            <ol className="relative space-y-3 border-l-2 border-dashed border-border pl-5">
              {stops.map((s) => (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[27px] top-5 size-3 rounded-full border-2 border-background bg-gold" />
                  <StopCard
                    stop={s}
                    iso={day.iso}
                    onShowMap={() => setView("map")}
                    {...(s.fixed ? {} : { onRemove: () => removeStop(s.id) })}
                  />
                </li>
              ))}
              <li className="relative">
                <span className="absolute -left-[27px] top-5 size-3 rounded-full border-2 border-background bg-border" />
                <AddCustomStop
                  dayIso={day.iso}
                  onAdd={(stop) => addStop(day.id, stop)}
                />
              </li>
            </ol>

            {removedHere.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {removedHere.length} place{removedHere.length > 1 ? "s" : ""} hidden from this
                day ({removedHere.map((s) => s.title).join(", ")}).{" "}
                <button onClick={restoreAll} className="font-semibold text-primary underline">
                  Restore
                </button>
              </p>
            )}

            {day.alternatives.length > 0 && (
              <div className="rounded-2xl border border-border bg-secondary p-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Alternatives
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
              <h2 className="text-xl font-bold">Book this week</h2>
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
              <h2 className="text-2xl font-bold">🥨 Wish list &amp; the Austrian food list</h2>
              <div className="mt-4 space-y-2">
                <div className="overflow-hidden rounded-2xl border border-gold/50 bg-card">
                  <button
                    onClick={() => setOpenList(openList === "wish" ? null : "wish")}
                    className="flex w-full items-center justify-between px-4 py-3 text-left font-bold"
                  >
                    <span>⭐ Wish list — places to slot into a day</span>
                    <span className="text-muted-foreground">
                      {openList === "wish" ? "−" : "+"}
                    </span>
                  </button>
                  {openList === "wish" && (
                    <div className="space-y-3 border-t border-border px-4 py-4">
                      {wishlist.map((item) => (
                        <WishlistRow
                          key={item.id}
                          item={item}
                          plan={plan}
                          onAdd={addStop}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {foodList.map((group) => {
                  const open = openList === group.title;
                  return (
                    <div
                      key={group.title}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <button
                        onClick={() => setOpenList(open ? null : group.title)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left font-bold"
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

function StopCard({
  stop,
  iso,
  onRemove,
  onShowMap,
}: {
  stop: Stop;
  iso: string;
  onRemove?: () => void;
  onShowMap: () => void;
}) {
  const hours = hoursFor(stop);
  // Hotel anchors and travel blocks have no opening hours to argue with.
  const fit = stop.time && !stop.fixed ? checkFit(stop, iso, stop.time) : null;

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {stop.time && (
            <span className="font-mono text-sm font-bold text-primary">{stop.time}</span>
          )}
          <h3 className="text-lg font-bold">
            {stop.title} {stop.star && <span className="text-gold">⭐</span>}
          </h3>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            aria-label={`Remove ${stop.title} from this day`}
            title="Remove from this day"
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-destructive"
          >
            ✕
          </button>
        )}
      </div>

      {stop.about && <p className="mt-2 text-sm leading-relaxed">{stop.about}</p>}
      {stop.plan && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">The plan: </span>
          {stop.plan}
        </p>
      )}
      {stop.warn && (
        <p className="mt-3 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">
          ⚠️ {stop.warn}
        </p>
      )}

      {fit && fit.level !== "ok" && (
        <p
          className={`mt-3 text-xs font-semibold ${
            fit.level === "bad" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {fit.level === "bad" ? "⛔ " : "ℹ️ "}
          {fit.message}
        </p>
      )}
      {hours?.note && fit?.level === "ok" && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">{hours.note}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {stop.lat && (
          <>
            <a
              href={navUrl(stop)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
            >
              GPS navigation
            </a>
            <button
              onClick={onShowMap}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              Show on map
            </button>
          </>
        )}
        {!stop.fixed && (
          <a
            href={googleUrl(stop)}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-primary"
          >
            Hours on Google
          </a>
        )}
      </div>
    </article>
  );
}

function FitLine({ fit }: { fit: Fit }) {
  const tone =
    fit.level === "ok"
      ? "text-primary"
      : fit.level === "bad"
        ? "text-destructive"
        : "text-muted-foreground";
  const mark = fit.level === "ok" ? "✅" : fit.level === "bad" ? "⛔" : "ℹ️";
  return (
    <p className={`text-xs font-semibold ${tone}`}>
      {mark} {fit.message}
    </p>
  );
}

/** Pick a day and a time, see whether the place is actually open then. */
function AddToDay({
  stop,
  onAdd,
  onCancel,
}: {
  stop: Stop;
  onAdd: (dayId: string, stop: Stop) => void;
  onCancel: () => void;
}) {
  const [dayId, setDayId] = useState(days[1]!.id);
  const [time, setTime] = useState("12:00");
  const day = days.find((d) => d.id === dayId)!;
  const fit = checkFit(stop, day.iso, time);

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border bg-secondary p-3">
      <div className="flex flex-wrap gap-2">
        <select
          value={dayId}
          onChange={(e) => setDayId(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              {d.weekday} {d.date}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <FitLine fit={fit} />

      <div className="flex gap-2">
        <button
          onClick={() => onAdd(dayId, { ...stop, id: `${stop.id}--${dayId}`, time })}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          {fit.level === "bad" ? "Add anyway" : "Add to this day"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function WishlistRow({
  item,
  plan,
  onAdd,
}: {
  item: Stop;
  plan: PlanState;
  onAdd: (dayId: string, stop: Stop) => void;
}) {
  const [open, setOpen] = useState(false);
  const placedOn = days.filter((d) =>
    (plan.added[d.id] ?? []).some((s) => s.id.startsWith(`${item.id}--`)),
  );

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-bold">{item.title}</h4>
          {item.about && <p className="mt-1 text-sm text-muted-foreground">{item.about}</p>}
          {item.plan && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">The plan: </span>
              {item.plan}
            </p>
          )}
          {item.warn && (
            <p className="mt-2 rounded-lg bg-accent px-2.5 py-1.5 text-xs text-accent-foreground">
              ⚠️ {item.warn}
            </p>
          )}
          {placedOn.length > 0 && (
            <p className="mt-2 text-xs font-semibold text-primary">
              Added to {placedOn.map((d) => `${d.weekday} ${d.date}`).join(", ")}
            </p>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          {open ? "Close" : "Add to a day"}
        </button>
      </div>

      {open && (
        <AddToDay
          stop={item}
          onAdd={(dayId, stop) => {
            onAdd(dayId, stop);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/** Free-text place, for something you spotted that is not on any list. */
function AddCustomStop({
  dayIso,
  onAdd,
}: {
  dayIso: string;
  onAdd: (stop: Stop) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00");
  const [plan, setPlan] = useState("");

  function submit() {
    const name = title.trim();
    if (!name) return;
    onAdd({
      id: newStopId(),
      title: name,
      time,
      query: `${name} Wien`,
      ...(plan.trim() ? { plan: plan.trim() } : {}),
    });
    setTitle("");
    setPlan("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-border bg-card/50 px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
      >
        + Add a place to this day
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Place name"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <input
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="What are you doing there? (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
      />
      <p className="text-xs text-muted-foreground">
        Opening hours are checked once the daily agent finds the place on Google. Until then
        the card links straight to its Google listing.
      </p>
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          Add to {new Date(`${dayIso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" })}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground"
        >
          Cancel
        </button>
      </div>
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

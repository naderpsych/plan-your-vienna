import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  bookings,
  foodList,
  wishlist,
  type Day,
  type Kind,
  type Stop,
} from "@/data/itinerary";
// `days` is the six planned days plus today, so every day control gets it free.
import { allDays as days, todayDay } from "@/lib/days";
import { buildCatalogue, type CatalogueItem } from "@/lib/catalogue";
import { warehouse } from "@/data/warehouse";
import { KIND_LABEL } from "@/data/itinerary";
import {
  checkFit,
  googleUrl,
  hoursFor,
  hoursToday,
  isFood,
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

const FORECAST_RANGE = days.map((d) => d.iso).sort();
const FIRST_DAY = FORECAST_RANGE[0]!;
const warehouseCount = warehouse.reduce((n, g) => n + g.items.length, 0);
const LAST_DAY = FORECAST_RANGE[FORECAST_RANGE.length - 1]!;

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

const EMPTY_PLAN: PlanState = { removed: [], added: {}, mine: [] };

export default function App() {
  const [dayIdx, setDayIdx] = useState(0);
  const [view, setView] = useState<"itinerary" | "map" | "warehouse">("itinerary");
  const [openList, setOpenList] = useState<string | null>(null);
  const [altOpen, setAltOpen] = useState(false);
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

  function addMine(stop: Stop) {
    update({ ...plan, mine: [...plan.mine, stop] });
  }

  function removeMine(id: string) {
    update({ ...plan, mine: plan.mine.filter((s) => s.id !== id) });
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

          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex shrink-0 rounded-full bg-primary-foreground/12 p-1 backdrop-blur">
              {(
                [
                  ["itinerary", "Itinerary"],
                  ["map", "Day map"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    view === key
                      ? "bg-gold text-gold-foreground"
                      : "text-primary-foreground/80 hover:text-primary-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setView("warehouse")}
              className={`ml-auto shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                view === "warehouse"
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-primary-foreground/30 text-primary-foreground/80 hover:border-primary-foreground/60 hover:text-primary-foreground"
              }`}
            >
              More
              <span className="ml-1.5 font-mono text-xs opacity-70">{warehouseCount}</span>
            </button>
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
            <Suspense fallback={null}>
              <Weather iso={day.iso} from={FIRST_DAY} to={LAST_DAY} />
            </Suspense>
            <span className="font-mono text-xs text-muted-foreground">
              {located.length} stops on the map
            </span>
          </div>
        </div>

        {view === "warehouse" ? (
          <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {warehouseCount} places from your Vienna map, nothing scheduled. Open a
              category, read what a place is, and drop it into{" "}
              <span className="font-semibold text-foreground">
                {day.weekday} {day.date}
              </span>{" "}
              — or any other day — at a time you pick. Switch the day above first if you
              want a different one.
            </p>
            {warehouse.map((group) => {
              const open = openList === group.title;
              return (
                <div
                  key={group.title}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <button
                    onClick={() => setOpenList(open ? null : group.title)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-bold"
                  >
                    <span>📍 {group.title}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {group.items.length}
                      </span>
                      <span className="text-muted-foreground">{open ? "−" : "+"}</span>
                    </span>
                  </button>
                  {open && (
                    <div className="space-y-3 border-t border-border px-4 py-4">
                      {group.items.map((item) => (
                        <PlaceRow
                          key={item.id}
                          item={item}
                          plan={plan}
                          onAdd={addStop}
                          defaultDayId={day.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ) : view === "map" ? (
          <section className="space-y-4">
            <div className="h-[65vh] overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading map…
                  </div>
                }
              >
                <TripMap day={{ ...day, stops }} />
              </Suspense>
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

            {stops.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                {day.id === todayDay.id
                  ? "Nothing planned for today. Add places from your lists below — only what is actually open right now will come back green."
                  : "This day is empty. Add something below."}
              </p>
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
                <AddPlacePanel
                  day={day}
                  plan={plan}
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
              <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
                <button
                  onClick={() => setAltOpen(!altOpen)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Alternatives for {day.weekday}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {day.alternatives.length}
                    </span>
                    <span className="text-muted-foreground">{altOpen ? "−" : "+"}</span>
                  </span>
                </button>
                {altOpen && (
                  <div className="space-y-2 border-t border-border px-4 py-4">
                    <p className="text-xs text-muted-foreground">
                      Tap one to read what it is, then drop it straight into the day.
                    </p>
                    {day.alternatives.map((alt) => (
                      <PlaceRow
                        key={alt.id}
                        item={alt}
                        plan={plan}
                        onAdd={addStop}
                        defaultDayId={day.id}
                        actionLabel="Add to this day"
                      />
                    ))}
                  </div>
                )}
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
              <h2 className="text-2xl font-bold">
                Places to pull in, and what to eat
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every list below drops straight into a day, with the opening hours checked
                for the day and time you pick.
              </p>
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
                        <PlaceRow key={item.id} item={item} plan={plan} onAdd={addStop} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <button
                    onClick={() => setOpenList(openList === "mine" ? null : "mine")}
                    className="flex w-full items-center justify-between px-4 py-3 text-left font-bold"
                  >
                    <span>
                      ➕ My places — anything you add yourself
                      {plan.mine.length > 0 && (
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {plan.mine.length}
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      {openList === "mine" ? "−" : "+"}
                    </span>
                  </button>
                  {openList === "mine" && (
                    <div className="space-y-3 border-t border-border px-4 py-4">
                      <NewPlaceForm onSave={addMine} />
                      {plan.mine.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nothing here yet. Add a place and it will sit alongside the wish
                          list, ready to drop into any day.
                        </p>
                      ) : (
                        plan.mine.map((item) => (
                          <PlaceRow
                            key={item.id}
                            item={item}
                            plan={plan}
                            onAdd={addStop}
                            onDelete={() => removeMine(item.id)}
                          />
                        ))
                      )}
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
                        <span>🥨 {group.title}</span>
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

            <Suspense fallback={null}>
              <MyNotes />
            </Suspense>
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
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
      <div
        className="flex items-start justify-between gap-3 border-b px-4 py-3"
        style={headStyle(stop)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {stop.time && (
              <span className="font-mono text-sm font-bold text-primary">{stop.time}</span>
            )}
            <h3 className="text-lg font-bold" style={{ color: "var(--place-title)" }}>
              {stop.title} {stop.star && <span className="text-gold">⭐</span>}
            </h3>
          </div>
          <KindLine stop={stop} iso={iso} />
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            aria-label={`Remove ${stop.title} from this day`}
            title="Remove from this day"
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-card hover:text-destructive"
          >
            ✕
          </button>
        )}
      </div>

      <div className="px-4 py-3">
      {stop.about && <p className="text-sm leading-relaxed">{stop.about}</p>}
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
      </div>
    </article>
  );
}

/** A blue band, or a warm one when the place is somewhere you eat. */
function headStyle(stop: Stop) {
  return isFood(stop)
    ? {
        background: "var(--card-head-food)",
        borderColor: "var(--card-head-food-border)",
      }
    : {
        background: "var(--card-head)",
        borderColor: "var(--card-head-border)",
      };
}

/** What the place is, and — on a day card — when it is open on that date. */
function KindLine({ stop, iso }: { stop: Stop; iso?: string }) {
  const label = stop.kind ? KIND_LABEL[stop.kind] : null;
  const hours = iso ? hoursToday(stop, iso) : null;
  if (!label && !hours) return null;

  // The hours belong to the day this stop sits on, not to the real-world today,
  // so the line names that weekday rather than saying "today".
  const weekday = iso
    ? new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short" })
    : "";

  return (
    <p className="mt-0.5 text-xs text-muted-foreground">
      {label && <span className="font-bold uppercase tracking-wide">{label}</span>}
      {label && hours && " · "}
      {hours && (
        <span className={hours === "Closed" ? "font-semibold text-destructive" : ""}>
          {hours === "Closed" ? `Closed on ${weekday}` : `Open ${weekday} ${hours}`}
        </span>
      )}
    </p>
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
  defaultDayId,
}: {
  stop: Stop;
  onAdd: (dayId: string, stop: Stop) => void;
  onCancel: () => void;
  defaultDayId?: string;
}) {
  const [dayId, setDayId] = useState(defaultDayId ?? days[1]!.id);
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

function PlaceRow({
  item,
  plan,
  onAdd,
  onDelete,
  defaultDayId,
  actionLabel = "Add to a day",
}: {
  item: Stop;
  plan: PlanState;
  onAdd: (dayId: string, stop: Stop) => void;
  onDelete?: () => void;
  defaultDayId?: string;
  actionLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const placedOn = days.filter((d) =>
    (plan.added[d.id] ?? []).some((s) => s.id.startsWith(`${item.id}--`)),
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div
        className="flex items-center justify-between gap-3 border-b px-3 py-2"
        style={headStyle(item)}
      >
        <div className="min-w-0">
          <h4 className="font-bold" style={{ color: "var(--place-title)" }}>
            {item.title}
          </h4>
          <KindLine stop={item} />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg border border-primary/30 bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
          >
            {open ? "Close" : actionLabel}
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label={`Delete ${item.title}`}
              className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:text-destructive"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="min-w-0">
          {item.about && <p className="text-sm text-muted-foreground">{item.about}</p>}
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
      </div>

      {open && (
        <AddToDay
          stop={item}
          onAdd={(dayId, stop) => {
            onAdd(dayId, stop);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
          {...(defaultDayId ? { defaultDayId } : {})}
        />
      )}
    </div>
  );
}

const KIND_FILTERS: { value: Kind | "all"; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "food", label: "Restaurants" },
  { value: "cafe", label: "Cafés" },
  { value: "market", label: "Markets" },
  { value: "museum", label: "Museums" },
  { value: "sight", label: "Landmarks" },
  { value: "view", label: "Viewpoints" },
  { value: "park", label: "Parks" },
  { value: "shop", label: "Shops" },
  { value: "concert", label: "Concerts" },
];

/**
 * Pick a place for this day out of everything already saved — the wish list,
 * the day alternatives, the map and your own additions, folded into one list —
 * or type something new. Each candidate is checked against this day's hours.
 */
function AddPlacePanel({
  day,
  plan,
  onAdd,
}: {
  day: Day;
  plan: PlanState;
  onAdd: (stop: Stop) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"lists" | "new">("lists");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [query, setQuery] = useState("");
  const [time, setTime] = useState("12:00");

  const catalogue = useMemo(() => buildCatalogue(plan.mine), [plan.mine]);
  const already = new Set((plan.added[day.id] ?? []).map((s) => s.id.split("--")[0]));

  const matches = catalogue.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.about ?? "").toLowerCase().includes(q)
    );
  });

  // Open first, then the ones with no hours on file, then the closed ones.
  const ranked = [...matches].sort((a, b) => {
    const rank = (item: CatalogueItem) => {
      const fit = checkFit(item, day.iso, time);
      return fit.level === "ok" ? 0 : fit.level === "tight" ? 1 : fit.level === "unknown" ? 2 : 3;
    };
    return rank(a) - rank(b);
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-border bg-card/50 px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
      >
        + Add a place to {day.id === todayDay.id ? "today" : day.weekday}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-full bg-secondary p-1">
          {(
            [
              ["lists", "From my lists"],
              ["new", "Type a new place"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                mode === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
        >
          Close
        </button>
      </div>

      {mode === "new" ? (
        <NewStopFields
          time={time}
          setTime={setTime}
          onSave={(stop) => {
            onAdd(stop);
            setOpen(false);
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your lists…"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              aria-label="What time"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {KIND_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setKind(f.value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  kind === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {ranked.length} place{ranked.length === 1 ? "" : "s"} across your wish list,
            the day alternatives, the map and your own — open ones first, checked against{" "}
            {day.id === todayDay.id ? "today" : `${day.weekday} ${day.date}`} at {time}.
          </p>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {ranked.slice(0, 60).map((item) => {
              const fit = checkFit(item, day.iso, time);
              const tone =
                fit.level === "ok"
                  ? "text-primary"
                  : fit.level === "bad"
                    ? "text-destructive"
                    : "text-muted-foreground";
              const mark =
                fit.level === "ok" ? "✅" : fit.level === "bad" ? "⛔" : "ℹ️";
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2"
                  style={isFood(item) ? { background: "var(--card-head-food)" } : undefined}
                >
                  <div className="min-w-0">
                    <p className="font-semibold" style={{ color: "var(--place-title)" }}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.kind && (
                        <span className="font-bold uppercase tracking-wide">
                          {KIND_LABEL[item.kind]}
                        </span>
                      )}
                      {item.kind && " · "}
                      <span>{item.sources.join(" + ")}</span>
                    </p>
                    <p className={`mt-1 text-xs font-semibold ${tone}`}>
                      {mark} {fit.message}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onAdd({ ...item, id: `${item.id}--${day.id}`, time });
                      setOpen(false);
                    }}
                    disabled={already.has(item.id)}
                    className="shrink-0 rounded-lg border border-primary/30 bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-40"
                  >
                    {already.has(item.id) ? "Added" : `Add ${time}`}
                  </button>
                </div>
              );
            })}
            {ranked.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nothing matches. Try another category, or type the place yourself.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Adds an entry to your own category — name, and a line about it. */
function NewPlaceForm({ onSave }: { onSave: (stop: Stop) => void }) {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");

  function submit() {
    const name = title.trim();
    if (!name) return;
    onSave({
      id: newStopId(),
      title: name,
      query: `${name} Wien`,
      ...(about.trim() ? { about: about.trim() } : {}),
    });
    setTitle("");
    setAbout("");
  }

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-border bg-background p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Place name"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
      />
      <input
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="What is it? (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
      />
      <button
        onClick={submit}
        className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        Add to my list
      </button>
    </div>
  );
}

/** The "type a new place" half of the add panel. */
function NewStopFields({
  time,
  setTime,
  onSave,
}: {
  time: string;
  setTime: (value: string) => void;
  onSave: (stop: Stop) => void;
}) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    const name = title.trim();
    if (!name) return;
    onSave({
      id: newStopId(),
      title: name,
      time,
      query: `${name} Wien`,
      ...(note.trim() ? { plan: note.trim() } : {}),
    });
    setTitle("");
    setNote("");
  }

  return (
    <div className="space-y-2">
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
          aria-label="What time"
        />
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="What are you doing there? (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
      />
      <p className="text-xs text-muted-foreground">
        The hours agent picks the place up on its next run and the card starts
        showing its opening hours. Until then it links straight to Google.
      </p>
      <button
        onClick={submit}
        className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        Add at {time}
      </button>
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

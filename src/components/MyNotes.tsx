import { useEffect, useState } from "react";

type Note = { id: string; text: string; done: boolean };

const KEY = "vienna-my-notes";

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw) as Note[]);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(notes));
  }, [notes, loaded]);

  function add() {
    const t = text.trim();
    if (!t) return;
    setNotes((n) => [{ id: crypto.randomUUID(), text: t, done: false }, ...n]);
    setText("");
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-2xl font-bold">📝 My list</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Anything you want to add along the way — saved here on this device.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Add something…"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50"
        />
        <button
          onClick={add}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add +
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Still empty — add your first item.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2"
            >
              <input
                type="checkbox"
                checked={n.done}
                onChange={() =>
                  setNotes((list) =>
                    list.map((x) => (x.id === n.id ? { ...x, done: !x.done } : x)),
                  )
                }
                className="size-4 accent-[var(--primary)]"
              />
              <span
                className={`min-w-0 flex-1 text-sm ${
                  n.done ? "text-muted-foreground line-through" : ""
                }`}
              >
                {n.text}
              </span>
              <button
                onClick={() => setNotes((list) => list.filter((x) => x.id !== n.id))}
                aria-label="Delete"
                className="rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

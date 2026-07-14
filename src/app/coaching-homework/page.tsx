"use client";

import { useEffect, useMemo, useState } from "react";

interface Item {
  id: string;
  homework_number: number;
  text: string;
  done: boolean;
  created_at: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors";

export default function CoachingHomeworkPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [activeNumber, setActiveNumber] = useState<number>(1);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/coaching-homework/items");
    const data = await res.json();
    const loaded: Item[] = data.items ?? [];
    setItems(loaded);
    const maxNumber = loaded.reduce((m, it) => Math.max(m, it.homework_number), 0);
    setActiveNumber((prev) => (prev === 1 && maxNumber > 0 ? maxNumber : prev));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<number, Item[]>();
    for (const it of items) {
      if (!map.has(it.homework_number)) map.set(it.homework_number, []);
      map.get(it.homework_number)!.push(it);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [items]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    const res = await fetch("/api/coaching-homework/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homework_number: activeNumber, text: newText }),
    });
    if (res.ok) {
      setNewText("");
      load();
    }
  }

  async function toggleDone(item: Item) {
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, done: !it.done } : it))
    );
    await fetch(`/api/coaching-homework/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !item.done }),
    });
  }

  async function removeItem(item: Item) {
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    await fetch(`/api/coaching-homework/items/${item.id}`, { method: "DELETE" });
  }

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">שיעורי בית - אימון אישי</h1>
        <p className="text-slate-400 text-sm mb-8">
          הדף הזה אישי - המאמן רואה אותו רק דרך קישור נפרד לצפייה בלבד.
        </p>

        <form onSubmit={addItem} className="flex gap-2 mb-8">
          <input
            type="number"
            min={1}
            value={activeNumber}
            onChange={(e) => setActiveNumber(Number(e.target.value) || 1)}
            className={`${inputClass} w-24`}
            title="מספר שיעורי בית"
          />
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="דבר חדש שעשיתי / משפט..."
            className={inputClass}
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            הוספה
          </button>
        </form>

        {loading && <p className="text-slate-400">טוען...</p>}

        {!loading && grouped.length === 0 && (
          <p className="text-slate-400">עדיין אין פריטים. הוסף למעלה.</p>
        )}

        <div className="space-y-8">
          {grouped.map(([number, groupItems]) => (
            <div key={number}>
              <h2 className="text-lg font-bold text-white mb-3">
                שיעורי בית מספר {number}
              </h2>
              <ul className="space-y-2">
                {groupItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/20"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleDone(item)}
                      className="w-5 h-5 accent-brand-accent shrink-0"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.done ? "text-slate-500 line-through" : "text-slate-200"
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => removeItem(item)}
                      className="text-slate-500 hover:text-red-400 text-xs shrink-0"
                    >
                      מחיקה
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

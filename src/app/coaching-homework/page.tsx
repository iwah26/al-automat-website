"use client";

import { useEffect, useMemo, useState } from "react";

interface Homework {
  id: string;
  number: number;
  title: string;
  done: boolean;
  created_at: string;
}

interface Item {
  id: string;
  homework_id: string;
  text: string;
  done: boolean;
  created_at: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors";

const TABLE_HEADERS = ["שם", "חוזקות", "חולשות", "פחדים", "מה יגרום לשינוי", "עיסוק מתאים"];
const TABLE_SEP = "|||";

export default function CoachingHomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/coaching-homework/homeworks");
    const data = await res.json();
    setHomeworks(data.homeworks ?? []);
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const itemsByHomework = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      if (!map.has(it.homework_id)) map.set(it.homework_id, []);
      map.get(it.homework_id)!.push(it);
    }
    return map;
  }, [items]);

  const nextNumber = useMemo(
    () => homeworks.reduce((m, hw) => Math.max(m, hw.number), 0) + 1,
    [homeworks]
  );

  async function addHomework(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch("/api/coaching-homework/homeworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: nextNumber, title: newTitle }),
    });
    if (res.ok) {
      setNewTitle("");
      load();
    }
  }

  async function toggleHomeworkDone(hw: Homework) {
    setHomeworks((prev) =>
      prev.map((h) => (h.id === hw.id ? { ...h, done: !h.done } : h))
    );
    await fetch(`/api/coaching-homework/homeworks/${hw.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !hw.done }),
    });
  }

  async function addItem(homeworkId: string, e: React.FormEvent) {
    e.preventDefault();
    const text = (newItemText[homeworkId] ?? "").trim();
    if (!text) return;
    const res = await fetch("/api/coaching-homework/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homework_id: homeworkId, text }),
    });
    if (res.ok) {
      setNewItemText((prev) => ({ ...prev, [homeworkId]: "" }));
      load();
    }
  }

  async function toggleItemDone(item: Item) {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">שיעורי בית - אימון אישי</h1>
        <p className="text-slate-400 text-sm mb-8">
          הדף הזה אישי - המאמן רואה אותו רק דרך קישור נפרד לצפייה בלבד.
        </p>

        <form onSubmit={addHomework} className="flex gap-2 mb-8">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`שיעורי בית מספר ${nextNumber} - כותרת המשימה`}
            className={inputClass}
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            שיעור בית חדש
          </button>
        </form>

        {loading && <p className="text-slate-400">טוען...</p>}
        {!loading && homeworks.length === 0 && (
          <p className="text-slate-400">עדיין אין שיעורי בית. הוסף למעלה.</p>
        )}

        <div className="space-y-3">
          {homeworks.map((hw) => {
            const hwItems = itemsByHomework.get(hw.id) ?? [];
            const isOpen = openId === hw.id;
            return (
              <div
                key={hw.id}
                className="rounded-xl bg-brand-card border border-brand-accent/20 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={hw.done}
                    onChange={() => toggleHomeworkDone(hw)}
                    className="w-5 h-5 accent-brand-accent shrink-0"
                  />
                  <button
                    onClick={() => setOpenId(isOpen ? null : hw.id)}
                    className={`flex-1 text-right text-sm font-bold ${
                      hw.done ? "text-slate-500 line-through" : "text-white"
                    }`}
                  >
                    שיעורי בית מספר {hw.number} - {hw.title}
                  </button>
                  <button
                    onClick={() => setOpenId(isOpen ? null : hw.id)}
                    className="text-slate-400 text-xs shrink-0"
                  >
                    {isOpen ? "סגירה ▲" : `רשימה (${hwItems.length}) ▼`}
                  </button>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-brand-accent/10 space-y-2">
                    {hwItems.some((it) => it.text.includes(TABLE_SEP)) ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-brand-bg text-slate-300">
                              {TABLE_HEADERS.map((h) => (
                                <th
                                  key={h}
                                  className="text-right px-3 py-2 font-medium whitespace-nowrap border-b border-brand-accent/20"
                                >
                                  {h}
                                </th>
                              ))}
                              <th className="border-b border-brand-accent/20" />
                            </tr>
                          </thead>
                          <tbody>
                            {hwItems.map((item) => {
                              const cells = item.text.split(TABLE_SEP);
                              return (
                                <tr key={item.id} className="align-top border-b border-brand-accent/10">
                                  {cells.map((cell, i) => (
                                    <td
                                      key={i}
                                      className={`px-3 py-2 min-w-[160px] ${
                                        item.done ? "text-slate-500" : "text-slate-200"
                                      } ${i === 0 ? "font-bold text-white whitespace-nowrap" : ""}`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                  <td className="px-2 py-2 whitespace-nowrap">
                                    <button
                                      onClick={() => removeItem(item)}
                                      className="text-slate-500 hover:text-red-400 text-xs"
                                    >
                                      מחיקה
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      hwItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-bg"
                        >
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleItemDone(item)}
                            className="w-4 h-4 accent-brand-accent shrink-0"
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
                        </div>
                      ))
                    )}

                    <form
                      onSubmit={(e) => addItem(hw.id, e)}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        value={newItemText[hw.id] ?? ""}
                        onChange={(e) =>
                          setNewItemText((prev) => ({ ...prev, [hw.id]: e.target.value }))
                        }
                        placeholder="סעיף חדש ברשימה..."
                        className={`${inputClass} py-2`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-xs hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        הוספה
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

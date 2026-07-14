"use client";

import { useState } from "react";

interface Homework {
  id: string;
  number: number;
  title: string;
  done: boolean;
}

interface Item {
  id: string;
  homework_id: string;
  text: string;
  done: boolean;
}

const TABLE_HEADERS = ["שם", "חוזקות", "חולשות", "פחדים", "מה יגרום לשינוי", "עיסוק מתאים"];
const TABLE_SEP = "|||";

export default function HomeworkList({
  homeworks,
  items,
}: {
  homeworks: Homework[];
  items: Item[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const itemsByHomework = new Map<string, Item[]>();
  for (const item of items) {
    if (!itemsByHomework.has(item.homework_id)) itemsByHomework.set(item.homework_id, []);
    itemsByHomework.get(item.homework_id)!.push(item);
  }

  return (
    <div className="space-y-3">
      {homeworks.map((hw) => {
        const hwItems = itemsByHomework.get(hw.id) ?? [];
        const isOpen = openId === hw.id;
        return (
          <div key={hw.id} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                {hw.done ? "✅" : "⬜"}
              </span>
              <button
                onClick={() => setOpenId(isOpen ? null : hw.id)}
                className={`flex-1 text-right text-sm font-bold ${
                  hw.done ? "text-slate-400 line-through" : "text-black"
                }`}
              >
                שיעורי בית מספר {hw.number} - {hw.title}
              </button>
              <button
                onClick={() => setOpenId(isOpen ? null : hw.id)}
                className="text-slate-500 text-xs shrink-0"
              >
                {isOpen ? "סגירה ▲" : `רשימה (${hwItems.length}) ▼`}
              </button>
            </div>

            {isOpen && hwItems.length > 0 && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-200 space-y-2">
                {hwItems.some((it) => it.text.includes(TABLE_SEP)) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          {TABLE_HEADERS.map((h) => (
                            <th
                              key={h}
                              className="text-right px-3 py-2 font-medium whitespace-nowrap border-b border-slate-200"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hwItems.map((item) => {
                          const cells = item.text.split(TABLE_SEP);
                          return (
                            <tr key={item.id} className="align-top border-b border-slate-100">
                              {cells.map((cell, i) => (
                                <td
                                  key={i}
                                  className={`px-3 py-2 min-w-[160px] ${
                                    item.done ? "text-slate-400" : "text-black"
                                  } ${i === 0 ? "font-bold whitespace-nowrap" : ""}`}
                                >
                                  {cell}
                                </td>
                              ))}
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
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50"
                    >
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center text-xs">
                        {item.done ? "✅" : "⬜"}
                      </span>
                      <span
                        className={`flex-1 text-sm ${
                          item.done ? "text-slate-400 line-through" : "text-black"
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

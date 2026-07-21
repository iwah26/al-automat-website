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
  parent_item_id: string | null;
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
    if (item.parent_item_id) continue;
    if (!itemsByHomework.has(item.homework_id)) itemsByHomework.set(item.homework_id, []);
    itemsByHomework.get(item.homework_id)!.push(item);
  }

  const subItemsByParent = new Map<string, Item[]>();
  for (const item of items) {
    if (!item.parent_item_id) continue;
    if (!subItemsByParent.has(item.parent_item_id)) subItemsByParent.set(item.parent_item_id, []);
    subItemsByParent.get(item.parent_item_id)!.push(item);
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
                  hwItems.map((item) => {
                    const subItems = subItemsByParent.get(item.id) ?? [];
                    return (
                      <div key={item.id} className="rounded-lg bg-slate-50 overflow-hidden">
                        <div className="flex items-center gap-3 px-3 py-2">
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
                        {subItems.length > 0 && (
                          <div className="px-3 pb-2 mr-6 border-r-2 border-slate-200 space-y-1">
                            {subItems.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-3 px-3 py-1 rounded-lg bg-white">
                                <span className="w-4 h-4 shrink-0 flex items-center justify-center text-xs">
                                  {sub.done ? "✅" : "⬜"}
                                </span>
                                <span
                                  className={`flex-1 text-sm ${
                                    sub.done ? "text-slate-400 line-through" : "text-black"
                                  }`}
                                >
                                  {sub.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

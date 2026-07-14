import { notFound } from "next/navigation";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

export const dynamic = "force-dynamic";

const TABLE_HEADERS = ["שם", "חוזקות", "חולשות", "פחדים", "מה יגרום לשינוי", "עיסוק מתאים"];
const TABLE_SEP = "|||";

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

export default async function CoachingHomeworkAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!process.env.COACHING_HOMEWORK_KEY || key !== process.env.COACHING_HOMEWORK_KEY) {
    notFound();
  }

  const supabase = getRabanimSupabase();
  const { data: homeworks, error: hwError } = await supabase
    .from("coaching_homeworks")
    .select("*")
    .order("number", { ascending: true });

  const { data: items, error: itemsError } = await supabase
    .from("coaching_homework_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (hwError || itemsError) notFound();

  const homeworksList: Homework[] = homeworks ?? [];
  const itemsList: Item[] = items ?? [];
  const itemsByHomework = new Map<string, Item[]>();
  for (const item of itemsList) {
    if (!itemsByHomework.has(item.homework_id)) itemsByHomework.set(item.homework_id, []);
    itemsByHomework.get(item.homework_id)!.push(item);
  }

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">שיעורי בית - צפייה</h1>
        <p className="text-slate-400 text-sm mb-8">תצוגה בלבד, לא ניתן לערוך מכאן</p>

        {homeworksList.length === 0 && <p className="text-slate-400">אין עדיין שיעורי בית.</p>}

        <div className="space-y-3">
          {homeworksList.map((hw) => {
            const hwItems = itemsByHomework.get(hw.id) ?? [];
            return (
              <div
                key={hw.id}
                className="rounded-xl bg-brand-card border border-brand-accent/20 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                    {hw.done ? "✅" : "⬜"}
                  </span>
                  <span
                    className={`flex-1 text-sm font-bold ${
                      hw.done ? "text-slate-500 line-through" : "text-white"
                    }`}
                  >
                    שיעורי בית מספר {hw.number} - {hw.title}
                  </span>
                </div>

                {hwItems.length > 0 && (
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
                          <span className="w-4 h-4 shrink-0 flex items-center justify-center text-xs">
                            {item.done ? "✅" : "⬜"}
                          </span>
                          <span
                            className={`flex-1 text-sm ${
                              item.done ? "text-slate-500 line-through" : "text-slate-200"
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
      </div>
    </main>
  );
}

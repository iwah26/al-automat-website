import { notFound } from "next/navigation";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

export const dynamic = "force-dynamic";

interface Item {
  id: string;
  homework_number: number;
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
  const { data, error } = await supabase
    .from("coaching_homework_items")
    .select("*")
    .order("homework_number", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) notFound();

  const items: Item[] = data ?? [];
  const grouped = new Map<number, Item[]>();
  for (const item of items) {
    if (!grouped.has(item.homework_number)) grouped.set(item.homework_number, []);
    grouped.get(item.homework_number)!.push(item);
  }
  const groups = [...grouped.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">שיעורי בית - צפייה</h1>
        <p className="text-slate-400 text-sm mb-8">תצוגה בלבד, לא ניתן לערוך מכאן</p>

        {groups.length === 0 && <p className="text-slate-400">אין עדיין פריטים.</p>}

        <div className="space-y-8">
          {groups.map(([number, groupItems]) => (
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
                    <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                      {item.done ? "✅" : "⬜"}
                    </span>
                    <span
                      className={`flex-1 text-sm ${
                        item.done ? "text-slate-500 line-through" : "text-slate-200"
                      }`}
                    >
                      {item.text}
                    </span>
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

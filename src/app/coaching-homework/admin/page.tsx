import { notFound } from "next/navigation";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import HomeworkList from "./HomeworkList";

export const dynamic = "force-dynamic";

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

  return (
    <main className="min-h-screen bg-white py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-black mb-1">שיעורי בית - צפייה</h1>
        <p className="text-slate-500 text-sm mb-8">תצוגה בלבד, לא ניתן לערוך מכאן</p>

        {(homeworks ?? []).length === 0 && (
          <p className="text-slate-500">אין עדיין שיעורי בית.</p>
        )}

        <HomeworkList homeworks={homeworks ?? []} items={items ?? []} />
      </div>
    </main>
  );
}

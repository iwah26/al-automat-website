import { notFound } from "next/navigation";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

export const dynamic = "force-dynamic";

interface Response {
  id: string;
  respondent_name: string;
  q1_strengths: string | null;
  q2_weaknesses: string | null;
  q3_fears: string | null;
  q4_change: string | null;
  q5_role: string | null;
  created_at: string;
}

const QUESTIONS: { key: keyof Response; label: string }[] = [
  { key: "q1_strengths", label: "חוזקות" },
  { key: "q2_weaknesses", label: "חולשות" },
  { key: "q3_fears", label: "מה מפחיד" },
  { key: "q4_change", label: "מה יגרום לשינוי" },
  { key: "q5_role", label: "עיסוק מתאים" },
];

export default async function MashovAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!process.env.MASHOV_ADMIN_KEY || key !== process.env.MASHOV_ADMIN_KEY) {
    notFound();
  }

  const supabase = getRabanimSupabase();
  const { data, error } = await supabase
    .from("mashov_responses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) notFound();

  const responses: Response[] = data ?? [];

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">משוב אישי</h1>
          <p className="text-slate-400 text-sm mt-1">
            {responses.length} תשובות
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-brand-accent/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark text-slate-300">
                <th className="text-right px-4 py-3 font-medium whitespace-nowrap">
                  שם
                </th>
                {QUESTIONS.map((q) => (
                  <th
                    key={q.key}
                    className="text-right px-4 py-3 font-medium min-w-[220px]"
                  >
                    {q.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-t border-brand-accent/10 align-top ${
                    i % 2 === 0 ? "bg-brand-bg" : "bg-brand-dark/40"
                  }`}
                >
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                    {r.respondent_name}
                  </td>
                  {QUESTIONS.map((q) => (
                    <td key={q.key} className="px-4 py-3 text-slate-300">
                      {r[q.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

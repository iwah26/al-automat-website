import { notFound } from "next/navigation";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

export const dynamic = "force-dynamic";

interface Application {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  business_name: string | null;
  business_field: string | null;
  years_active: string | null;
  website: string | null;
  q_strengths: string | null;
  q_contribution: string | null;
  q_gaps: string | null;
  q_needs: string | null;
  q_notes: string | null;
  created_at: string;
}

const ANSWERS: { key: keyof Application; label: string }[] = [
  { key: "q_strengths", label: "במה טוב" },
  { key: "q_contribution", label: "מה יכול לתרום" },
  { key: "q_gaps", label: "חוסרים בעסק" },
  { key: "q_needs", label: "מה רוצה מהקבוצה" },
  { key: "q_notes", label: "הערות" },
];

export default async function NetworkingAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const adminKey = process.env.NETWORKING_ADMIN_KEY;
  if (!adminKey || key !== adminKey) notFound();

  const supabase = getRabanimSupabase();
  const { data, error } = await supabase
    .from("networking_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) notFound();

  const rows: Application[] = data ?? [];

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">בקשות לקבוצת נטוורקינג</h1>
          <p className="text-slate-400 text-sm mt-1">{rows.length} בקשות</p>
        </div>

        <div className="space-y-5">
          {rows.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-brand-accent/20 bg-brand-dark/40 p-5"
            >
              <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                <h2 className="text-white font-bold text-lg">{r.full_name}</h2>
                {r.business_name && (
                  <span className="text-brand-accent text-sm">{r.business_name}</span>
                )}
                {r.business_field && (
                  <span className="text-slate-400 text-sm">· {r.business_field}</span>
                )}
                <span className="text-slate-500 text-xs mr-auto">
                  {new Date(r.created_at).toLocaleDateString("he-IL")}
                </span>
              </header>

              <p className="text-slate-300 text-sm mb-4">
                {[
                  r.phone,
                  r.email,
                  r.city,
                  r.years_active && `${r.years_active} שנים`,
                  r.website,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <dl className="space-y-3">
                {ANSWERS.filter((a) => r[a.key]).map((a) => (
                  <div key={a.key}>
                    <dt className="text-slate-400 text-xs mb-1">{a.label}</dt>
                    <dd className="text-slate-200 text-sm whitespace-pre-wrap">
                      {r[a.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

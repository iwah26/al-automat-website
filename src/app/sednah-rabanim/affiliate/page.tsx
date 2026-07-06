import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  role: string | null;
  community_name: string | null;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  avreich: "אברך",
  "rav-kehila": "רב קהילה",
  "rav-rashi": "הרב הראשי",
  "rav-yeshiva": "רב בישיבה",
  menahel: "מנהל מוסד",
  "menahel-beit-sefer": "מנהל בית ספר",
  "melamed-beit-sefer": "מלמד בבית ספר",
};

export default async function AffiliatePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) notFound();

  const supabase = getRabanimSupabase();

  const { data: regData, error: regError } = await supabase
    .from("rabanim_registrations")
    .select("id, first_name, last_name, role, community_name, payment_status, paid_at, created_at")
    .eq("referral_code", code)
    .order("created_at", { ascending: false });

  if (regError) notFound();

  const { count: clickCount } = await supabase
    .from("rabanim_link_clicks")
    .select("id", { count: "exact", head: true })
    .eq("code", code);

  const registrations: Registration[] = regData ?? [];
  const paidCount = registrations.filter((r) => r.payment_status === "paid").length;

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">הרשמות דרך הקישור שלך</h1>
          <p className="text-slate-400 text-sm mt-1">
            {clickCount ?? 0} כניסות לקישור · {registrations.length} נרשמו · {paidCount} שילמו
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-brand-accent/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark text-slate-300">
                <th className="text-right px-4 py-3 font-medium">שם</th>
                <th className="text-right px-4 py-3 font-medium">תפקיד</th>
                <th className="text-right px-4 py-3 font-medium">קהילה</th>
                <th className="text-right px-4 py-3 font-medium">סטטוס תשלום</th>
                <th className="text-right px-4 py-3 font-medium">תאריך הרשמה</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-t border-brand-accent/10 ${i % 2 === 0 ? "bg-brand-bg" : "bg-brand-dark/40"}`}
                >
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {r.role ? (ROLE_LABELS[r.role] ?? r.role) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{r.community_name ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.payment_status === "paid" ? (
                      <span className="text-green-400 font-semibold">שולם ✓</span>
                    ) : (
                      <span className="text-slate-500">ממתין</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap" dir="ltr">
                    {new Date(r.created_at).toLocaleDateString("he-IL")}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    עדיין אין הרשמות דרך הקישור שלך
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

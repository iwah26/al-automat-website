import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Contact {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  phone1_prefix: string;
  phone1_number: string;
  phone2_prefix: string | null;
  phone2_number: string | null;
  email: string | null;
  business_name: string | null;
  business_category: string | null;
  business_subcategory: string | null;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!process.env.NAVCHERET_EXPORT_KEY || key !== process.env.NAVCHERET_EXPORT_KEY) {
    notFound();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data, error } = await supabase
    .from("navcheret_contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) notFound();

  const contacts: Contact[] = data ?? [];

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">נבחרת היועצים</h1>
            <p className="text-slate-400 text-sm mt-1">{contacts.length} חברים רשומים</p>
          </div>
          <a
            href={`/api/navcheret/export?key=${key}`}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            ייצא vCard
          </a>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-brand-accent/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark text-slate-300">
                <th className="text-right px-4 py-3 font-medium">שם</th>
                <th className="text-right px-4 py-3 font-medium">טלפון ראשי</th>
                <th className="text-right px-4 py-3 font-medium">טלפון שני</th>
                <th className="text-right px-4 py-3 font-medium">מייל</th>
                <th className="text-right px-4 py-3 font-medium">עסק</th>
                <th className="text-right px-4 py-3 font-medium">תחום</th>
                <th className="text-right px-4 py-3 font-medium">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-t border-brand-accent/10 ${i % 2 === 0 ? "bg-brand-bg" : "bg-brand-dark/40"}`}
                >
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                    {c.first_name} {c.last_name}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap" dir="ltr">
                    {c.phone1_prefix} {c.phone1_number}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap" dir="ltr">
                    {c.phone2_number ? `${c.phone2_prefix} ${c.phone2_number}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400" dir="ltr">
                    {c.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {c.business_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {c.business_category ?? "—"}
                    {c.business_subcategory ? (
                      <span className="text-slate-500"> / {c.business_subcategory}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap" dir="ltr">
                    {new Date(c.created_at).toLocaleDateString("he-IL")}
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    עוד אף אחד לא מילא את הטופס
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

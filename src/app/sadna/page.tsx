import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SadnaIntro } from "@/components/SadnaIntro";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { headers } from "next/headers";

export const metadata = {
  title: "סדנת AI כמו מקצוען — בונים מערכות ואפליקציות בלי קוד | על אוטומט",
  description:
    "סדנה מעשית לחרדים עובדים: לבנות מערכות ואפליקציות לעבודה בלי לדעת קוד. שישי 9.10 + 16.10, 9:30–12:30, בזום.",
};

const SEATS_TOTAL = 30;

async function logClickIfPresent(code: string | undefined) {
  if (!code) return;
  try {
    const ua = (await headers()).get("user-agent") ?? undefined;
    await getRabanimSupabase().from("rabanim_link_clicks").insert({ code, user_agent: ua });
  } catch {
    // מעקב בלבד — לא אמור לשבור את טעינת הדף בשום מקרה
  }
}

async function isFull(): Promise<boolean> {
  try {
    const { count, error } = await getRabanimSupabase()
      .from("rabanim_registrations")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid")
      .eq("cohort", "round4");
    if (error) throw error;
    return (count ?? 0) >= SEATS_TOTAL;
  } catch {
    // אם הבדיקה נכשלת — עדיף לתת להיכנס מאשר לחסום רישום בטעות
    return false;
  }
}

export default async function SadnaPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  await logClickIfPresent(c);
  const full = await isFull();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        {full ? (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-black text-white leading-snug mb-4">
              כל המקומות במחזור הזה נתפסו 🙏
            </h1>
            <p className="text-xl text-slate-300">
              תודה על ההתעניינות. נעדכן כשייפתח המחזור הבא.
            </p>
          </div>
        ) : (
          <SadnaIntro referralCode={c} />
        )}
      </main>
      <Footer />
    </>
  );
}

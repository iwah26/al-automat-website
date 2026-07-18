import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MetaPixel } from "@/components/MetaPixel";
import { SednahRabanimIntro } from "@/components/SednahRabanimIntro";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { headers } from "next/headers";

export const metadata = {
  title: "הרשמה לסדנת הרבנים - מחזור ב' | על אוטומט",
  description: "הרשמה לסדנת AI לרבנים — מחזור ב', 26.7 + 2.8",
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
      .eq("cohort", "round2");
    if (error) throw error;
    return (count ?? 0) >= SEATS_TOTAL;
  } catch {
    return false;
  }
}

export default async function SednahRabanimRound2Page({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  await logClickIfPresent(c);
  const full = await isFull();

  return (
    <>
      <MetaPixel />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        {full ? (
          <div className="max-w-2xl mx-auto text-center text-right mb-16">
            <h1 className="text-4xl font-black text-white leading-snug mb-4">
              כל המקומות במחזור הזה נתפסו 🙏
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              תודה על ההתעניינות בסדנת &quot;קלוד קוד לרבנים&quot;. המחזור הזה
              מלא — אנחנו כבר עובדים על מועד נוסף.
            </p>
          </div>
        ) : (
          <SednahRabanimIntro referralCode={c} cohort="round2" />
        )}
      </main>
      <Footer />
    </>
  );
}

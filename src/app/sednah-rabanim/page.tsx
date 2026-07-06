import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SednahRabanimIntro } from "@/components/SednahRabanimIntro";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "הרשמה לסדנת הרבנים | על אוטומט",
  description: "הרשמה לסדנת AI לרבנים — טופס רישום",
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
      .eq("payment_status", "paid");
    if (error) throw error;
    return (count ?? 0) >= SEATS_TOTAL;
  } catch {
    // אם הבדיקה נכשלת — עדיף לתת להיכנס מאשר לחסום רישום בטעות
    return false;
  }
}

export default async function SednahRabanimPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  await logClickIfPresent(c);

  if (await isFull()) {
    redirect(c ? `/sednah-rabanim-round2?c=${encodeURIComponent(c)}` : "/sednah-rabanim-round2");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <SednahRabanimIntro referralCode={c} />
      </main>
      <Footer />
    </>
  );
}

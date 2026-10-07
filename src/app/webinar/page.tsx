import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WebinarRegisterForm } from "@/components/WebinarRegisterForm";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { headers } from "next/headers";

export const metadata = {
  title: "וובינר חינם: אם לא תדע AI כמו מקצוען — תישאר מאחור | על אוטומט",
  description:
    "וובינר פתוח וחינמי לחרדים עובדים — איך בונים מערכות ואפליקציות בלי לדעת קוד. חמישי 8.10, 21:00.",
};

const TAKEAWAYS = [
  "למה לשאול את ChatGPT זה לא לדעת AI — ומה ההבדל בין חובבן למקצוען.",
  "איך בונים מערכת או אפליקציה לעבודה שלך — בלי לכתוב שורת קוד אחת.",
  "דוגמאות אמיתיות שנבנו מאפס: אתר, מערכת לניהול לקוחות, דוחות שמכינים את עצמם, ועוד.",
  "הכלים שעובדים איתם — ומה ההבדל בין הגרסה החינמית לזו שבאמת עובדת.",
  "מה בן אדם בלי רקע טכני באמת יכול לבנות לעצמו — ומה לא.",
];

// מעקב מקור: ?c=<קוד> — מתעד כל כניסה, גם של מי שלא נרשם בסוף.
// הקוד עצמו נשמר גם על הליד עצמו (referral_code) דרך WebinarRegisterForm.
async function logClickIfPresent(code: string | undefined) {
  if (!code) return;
  try {
    const ua = (await headers()).get("user-agent") ?? undefined;
    await getRabanimSupabase().from("rabanim_link_clicks").insert({ code, user_agent: ua });
  } catch {
    // מעקב בלבד — לא אמור לשבור את טעינת הדף בשום מקרה
  }
}

export default async function WebinarPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  await logClickIfPresent(c);
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xl text-slate-300 mb-3">תכניס את זה טוב טוב לראש:</p>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            אם לא תדע AI כמו מקצוען —{" "}
            <span className="text-brand-accent">תישאר מאחור.</span>
          </h1>
          <p className="text-xl text-slate-200 leading-relaxed mb-6">
            תשמע טוב: לשאול את ChatGPT זה לא לדעת AI. מי שלא יודע AI באמת,
            נשאר מאחור.
          </p>
          <p className="text-slate-400 leading-relaxed mb-8">
            לחרדים עובדים · בלי ידע בתכנות · בלי רקע טכני
            <br />
            לבנות מערכות ואפליקציות לעבודה — בלי לדעת קוד.
          </p>

          <div className="inline-block w-full p-6 rounded-2xl bg-brand-card border border-brand-accent/20 text-right mb-8">
            <p className="font-bold text-white text-lg mb-1">
              יום חמישי 8.10 · 21:00 · וובינר בזום · ללא עלות
            </p>
            <p className="text-slate-400 text-sm">
              כשעה וחצי. הקישור לזום יישלח אליך במייל מיד אחרי ההרשמה.
            </p>
          </div>

          <div className="w-full p-6 rounded-2xl bg-brand-card border border-brand-accent/20 text-right mb-10">
            <p className="font-bold text-white text-lg mb-4">
              מה תקבל בוובינר עצמו — גם אם לא תמשיך הלאה
            </p>
            <ul className="space-y-3 text-slate-300">
              {TAKEAWAYS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-brand-accent shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <WebinarRegisterForm referralCode={c} />

        <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl border border-brand-accent/20 text-right">
          <p className="text-white font-semibold mb-2">
            הוובינר הוא גם מפגש הכנה לסדנה המעשית
          </p>
          <p className="text-slate-300 leading-relaxed">
            שני מפגשים — יום שישי 9.10 ויום שישי 16.10, בשעות 9:30–12:30 בבוקר,
            בזום. בסדנה לא מסתכלים, בונים. כל משתתף יוצא עם מערכת משלו, לעבודה
            שלו.
          </p>
          <p className="text-slate-400 text-sm mt-3">
            מספר המקומות מוגבל. כל הפרטים יינתנו בוובינר.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WebinarRegisterForm } from "@/components/WebinarRegisterForm";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { headers } from "next/headers";

export const metadata = {
  title: "וובינר חינם: אל תישאר מאחור | על אוטומט",
  description:
    "וובינר פתוח וחינמי — איך מטמיעים AI בארגון, בלי ידע טכני. חמישי 20.8, 21:00 שעון ישראל.",
};

const TIMEZONES = [
  { flag: "🇮🇱", label: "ישראל", time: "21:00" },
  { flag: "🇪🇸🇫🇷", label: "ספרד / צרפת", time: "20:00" },
  { flag: "🇬🇧", label: "אנגליה", time: "19:00" },
  { flag: "🇦🇷", label: "ארגנטינה", time: "15:00" },
  { flag: "🇺🇸🇻🇪", label: "ארה״ב (מזרח) / ונצואלה", time: "14:00" },
  { flag: "🇲🇽", label: "מקסיקו", time: "12:00" },
];

const TAKEAWAYS = [
  "תבין שכדי לעבוד עם AI צריך רק יצירתיות ורעיונות — שום ידע טכני.",
  "מה ההבדל בפועל בין לשוחח עם AI לבין להעסיק אותו.",
  "הכלים שעובדים איתם — ומה ההבדל בין הגרסה החינמית לזו שבאמת עובדת.",
  "דוגמאות אמיתיות שנבנו: אתר אינטרנט, מערכת ניהול קהילה, לוח אינטראקטיבי לבית הכנסת, ועוד.",
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
          <h1 className="text-5xl font-black text-white leading-tight mb-4">
            אל תישאר מאחור
          </h1>
          <p className="text-xl text-slate-200 leading-relaxed mb-6">
            99.9% מהאנשים משתמשים ב-AI כמו חובבנים. תהיה מאלו שכבר מטמיעים AI
            בארגונים שלהם, כמקצוענים.
          </p>
          <p className="text-slate-400 leading-relaxed mb-8">
            לרבנים · מנהלי מוסדות · גבאי צדקה · גבאי בתי כנסת · מנהלי תלמודי תורה
            <br />
            בלי ידע טכני. בלי מתכנת.
          </p>

          <div className="inline-block w-full p-6 rounded-2xl bg-brand-card border border-brand-accent/20 text-right mb-8">
            <p className="font-bold text-white text-lg mb-1">
              יום חמישי 20.8 · וובינר בזום · ללא עלות
            </p>
            <p className="text-slate-400 text-sm mb-4">שעות לפי אזור</p>
            <ul className="space-y-1 text-slate-300">
              {TIMEZONES.map((tz) => (
                <li key={tz.label}>
                  {tz.flag} {tz.label} — {tz.time}
                </li>
              ))}
            </ul>
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
            שני מפגשים — יום שישי 21.8 ויום שישי 28.8, בשעות 9:30–12:30 בבוקר
            (שעון ישראל), בזום. בסדנה לא מסתכלים, בונים. כל משתתף יוצא עם מערכת
            משלו.
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

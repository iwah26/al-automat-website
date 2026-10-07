import Link from "next/link";
import { getPriceILS } from "@/lib/rabanimPricing";

const COHORT = "round4";
const FORM_PATH = "/sadna/form";

export function SadnaIntro({ referralCode }: { referralCode?: string }) {
  const formHref = referralCode
    ? `${FORM_PATH}?c=${encodeURIComponent(referralCode)}`
    : FORM_PATH;
  const price = getPriceILS(COHORT);

  return (
    <div className="max-w-2xl mx-auto text-right mb-16">
      <div className="text-center mb-10">
        <p className="text-xl text-slate-300 mb-3">תכניס את זה טוב טוב לראש:</p>
        <h1 className="text-4xl font-black text-white leading-snug">
          אם לא תדע AI כמו מקצוען —{" "}
          <span className="text-brand-accent">תישאר מאחור.</span>
        </h1>
        <p className="text-xl text-white font-bold mt-4">
          סדנה מעשית: לבנות מערכות ואפליקציות לעבודה — בלי לדעת קוד.
        </p>
      </div>

      <div className="space-y-5 text-slate-300 text-lg leading-relaxed">
        <p>
          מעסיקים כבר מחפשים מי שיודע לעבוד עם AI. לא מי ששואל את ChatGPT
          שאלות — מי שיודע לגרום ל-AI לעבוד בשבילו.
        </p>
        <p>
          בסדנה תלמד לעבוד עם Claude Code — כלי AI שבונה בשבילך מערכות,
          אפליקציות ואוטומציות. אתה מסביר בעברית פשוטה מה אתה צריך, והוא בונה.
        </p>
        <p className="font-semibold text-white">
          בסדנה בת שני מפגשים תבנה בעצמך:
        </p>
        <ul className="space-y-2">
          <li>🛠️ מערכת או אפליקציה אמיתית לעבודה שלך</li>
          <li>🤖 אוטומציה שחוסכת לך שעות בכל שבוע</li>
          <li>🧠 את הדרך לעבוד עם AI כמו מקצוען — ולהמשיך לבנות לבד</li>
        </ul>
        <p>
          <span className="text-white font-semibold">לא צריך:</span> ידע
          בתכנות, רקע טכני או ניסיון קודם עם AI.
          <br />
          <span className="text-white font-semibold">צריך:</span> מחשב,
          אינטרנט ורצון לא להישאר מאחור.
        </p>
        <p>
          📼 כל המפגשים מוקלטים. אחרי הסדנה תקבל גישה לאתר ייעודי עם ההקלטות
          המלאות, תמלול ופרומפטים שימושיים.
        </p>

        <div className="p-5 rounded-2xl bg-brand-card border border-brand-accent/20 space-y-1">
          <p className="font-semibold text-white">📅 שישי 9.10 + שישי 16.10</p>
          <p className="font-semibold text-white">🕘 9:30–12:30 בבוקר</p>
          <p className="font-semibold text-white">💻 בזום</p>
        </div>

        <p className="font-bold text-white text-xl">
          🔥 גישה מוגבלת ל-30 מקומות בלבד
        </p>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-brand-card border border-brand-accent/20">
        <div className="flex items-center gap-4 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/yitzchak-wahnon.jpg"
            alt="יצחק ווחנון"
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-accent flex-shrink-0"
          />
          <h2 className="text-xl font-bold text-white">מי אני?</h2>
        </div>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>שמי יצחק ווחנון, ואני מנהל את קודשא.</p>
          <p>
            במהלך השנים צברתי ידע מקיף בכלי טכנולוגיה מתקדמת, ובשנים האחרונות
            למדתי לעומק את נושא האוטומציה ובניית מערכות CRM.
          </p>
          <p>
            אבל מה שקורה עכשיו עם AI עולה על הכל. ולא סתם AI — מערכות AI
            שבונות מערכות, כמו Claude Code. זה באמת <strong>Game Changer</strong>.
          </p>
          <p>
            היום אני מריץ בעזרתן מערכות ניהול, אוטומציות ואתרים — ואת הדרך
            הזאת אני מלמד בסדנה, צעד אחר צעד, גם למי שמעולם לא נגע בקוד.
          </p>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-3xl font-black text-white mb-8">
          כל זה רק ב-{price}₪
        </p>
        <Link
          href={formHref}
          className="inline-block px-10 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity"
        >
          להרשמה ←
        </Link>
      </div>
    </div>
  );
}

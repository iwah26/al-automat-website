import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | על אוטומט",
  description: "מדיניות הפרטיות של על אוטומט",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-bg py-24 px-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10 text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          חזרה לאתר
        </Link>

        <h1 className="text-4xl font-black text-white mb-2">מדיניות פרטיות</h1>
        <p className="text-slate-500 text-sm mb-12">עדכון אחרון: יולי 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">פרטי בית העסק</h2>
            <p>על אוטומט — שירותי אוטומציה ו-AI</p>
            <p>כתובת: סלמן מוצפי 8, ירושלים</p>
            <p>
              דוא&quot;ל:{" "}
              <a href="mailto:director@al-automat.co.il" className="text-brand-accent hover:underline">
                director@al-automat.co.il
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">אילו פרטים אנחנו אוספים</h2>
            <p>
              כאשר אתה נרשם לוובינר, לסדנה או למילוי טופס באתר או ברשתות החברתיות — אנו אוספים
              שם מלא, כתובת דוא&quot;ל, ומספר טלפון (אם נמסר).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">כיצד אנו משתמשים בפרטים</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>שליחת פרטי התחברות לוובינרים ולסדנאות (כולל קישורי זום)</li>
              <li>עדכונים על אירועים ותכנים הקשורים לרישום שביצעת</li>
              <li>שיפור השירות שאנו מספקים</li>
            </ul>
            <p className="mt-3">
              אנחנו לא מוכרים או מעבירים את הפרטים שלך לצד שלישי למטרות שיווקיות.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">הסרה ומחיקת מידע</h2>
            <p>
              בכל שלב תוכל לבקש הסרה מרשימות התפוצה או מחיקה מלאה של הפרטים שלך, בפנייה בדוא&quot;ל
              ל-
              <a href="mailto:director@al-automat.co.il" className="text-brand-accent hover:underline">
                director@al-automat.co.il
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">שינויים במדיניות</h2>
            <p>
              על אוטומט שומרת לעצמה את הזכות לעדכן מדיניות זו מעת לעת. עדכונים מהותיים יפורסמו
              בעמוד זה.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

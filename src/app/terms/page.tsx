import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תקנון וביטולים | על אוטומט",
  description: "תנאי השימוש ומדיניות ביטול עסקאות של על אוטומט",
};

export default function TermsPage() {
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

        <h1 className="text-4xl font-black text-white mb-2">תקנון וביטולים</h1>
        <p className="text-slate-500 text-sm mb-12">עדכון אחרון: יוני 2026</p>

        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">פרטי בית העסק</h2>
            <p>על אוטומט — שירותי אוטומציה ו-AI</p>
            <p>כתובת: סלמן מוצפי 8, ירושלים</p>
            <p>
              טלפון:{" "}
              <a href="tel:026233170" className="text-brand-accent hover:underline">
                02-623-3170
              </a>
            </p>
            <p>
              דוא&quot;ל:{" "}
              <a href="mailto:director@al-automat.co.il" className="text-brand-accent hover:underline">
                director@al-automat.co.il
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">כללי</h2>
            <p>
              השימוש בשירותי על אוטומט מהווה הסכמה לתנאים המפורטים להלן. התקנון כתוב בלשון זכר מטעמי נוחות בלבד ומתייחס לכל המגדרים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">מדיניות ביטול עסקאות</h2>
            <p className="mb-3">
              בהתאם לחוק הגנת הצרכן, התשמ&quot;א–1981 ותקנות הגנת הצרכן (ביטול עסקה), התשע&quot;א–2010, הלקוח רשאי לבטל עסקה בתנאים הבאים:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-2">
              <li>
                ניתן לבטל עסקה תוך <strong className="text-white">14 ימים</strong> מיום ביצוע העסקה, בתנאי שלא החלה ביצוע העבודה.
              </li>
              <li>
                לאחר תחילת ביצוע השירות, הביטול כפוף לתנאים שסוכמו בהסכם הספציפי בין הצדדים.
              </li>
              <li>
                במקרה של ביטול עסקה בהתאם לחוק, יוחזר הסכום ששולם בניכוי דמי ביטול בשיעור של 5% ממחיר העסקה או 100 ₪ — הנמוך מביניהם.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">אופן הגשת בקשת ביטול</h2>
            <p className="mb-3">בקשת ביטול יש להגיש בכתב באחת מהדרכים הבאות:</p>
            <ul className="list-disc list-inside space-y-2 mr-2">
              <li>
                בדוא&quot;ל:{" "}
                <a href="mailto:director@al-automat.co.il" className="text-brand-accent hover:underline">
                  director@al-automat.co.il
                </a>
              </li>
              <li>
                בטלפון:{" "}
                <a href="tel:026233170" className="text-brand-accent hover:underline">
                  02-623-3170
                </a>
              </li>
              <li>בדואר לכתובת: סלמן מוצפי 8, ירושלים</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">הגבלת אחריות</h2>
            <p>
              על אוטומט אינה אחראית לנזקים עקיפים, תוצאתיים או מיוחדים הנובעים משימוש בשירותים. האחריות המרבית מוגבלת לסכום ששולם עבור השירות הספציפי.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">שינויים בתקנון</h2>
            <p>
              על אוטומט שומרת לעצמה את הזכות לעדכן תקנון זה בכל עת. שינויים מהותיים יפורסמו באתר ויכנסו לתוקף 14 ימים לאחר פרסומם.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">סמכות שיפוטית</h2>
            <p>
              על תקנון זה יחולו דיני מדינת ישראל. סמכות השיפוט הבלעדית תהא לבתי המשפט המוסמכים בירושלים.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "ההרשמה התקבלה | על אוטומט",
};

const inputClass =
  "block px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white";

export default function SednahRabanimSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-white mb-4">
              התשלום התקבל, ברוך הבא לסדנה! 🎉
            </h1>
            <p className="text-slate-300 text-lg">
              תוך כמה רגעים תקבל גם הודעת אישור בוואטסאפ, עם סיסמה אישית לגישה
              להקלטות. כל מה שצריך להכין לפני המפגש הראשון מרוכז כאן.
            </p>
          </div>

          <div className="space-y-8">
            <section className={inputClass}>
              <h2 className="text-xl font-bold text-white mb-3">
                📅 פרטי הסדנה
              </h2>
              <ul className="text-slate-300 space-y-1">
                <li>מפגש ראשון: 12.7 (כ״ז תמוז)</li>
                <li>מפגש שני: 19.7 (ה׳ אב)</li>
                <li>שעה: 18:00–21:00 שעון ישראל</li>
                <li>
                  לינק זום (לשני המפגשים):{" "}
                  <a
                    href="https://us02web.zoom.us/j/81000618945?pwd=hCmFZOH5MbK3B4FwwKSmBpVTLyB1Um.1"
                    className="text-brand-accent underline"
                  >
                    לחץ כאן להצטרפות
                  </a>
                </li>
              </ul>
            </section>

            <section className={inputClass}>
              <h2 className="text-xl font-bold text-white mb-3">
                💻 מחשב
              </h2>
              <ul className="text-slate-300 space-y-1 list-disc pr-5">
                <li>מחשב נייד / נייח עם Windows או Mac</li>
                <li>חיבור אינטרנט יציב</li>
                <li>מסך שניתן לשתף בזום</li>
              </ul>
            </section>

            <section className={inputClass}>
              <h2 className="text-xl font-bold text-white mb-3">
                🛠️ התקנות — לפני המפגש הראשון
              </h2>
              <div className="text-slate-300 space-y-4">
                <div>
                  <p className="font-semibold text-white">א. Node.js</p>
                  <p>
                    כנס ל-
                    <a
                      href="https://nodejs.org"
                      className="text-brand-accent underline"
                    >
                      nodejs.org
                    </a>{" "}
                    → הורד את הגרסה "LTS" (הכפתור הירוק הגדול) → התקן, לחץ
                    "Next" עד הסוף
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-white">ב. Claude Code</p>
                  <p>
                    אחרי שהתקנת Node.js, פתח Terminal (Mac) או Command Prompt
                    (Windows) והדבק:
                  </p>
                  <code className="block bg-brand-dark rounded-lg px-3 py-2 mt-1 text-sm text-brand-accent">
                    npm install -g @anthropic-ai/claude-code
                  </code>
                </div>
              </div>
            </section>

            <section className={inputClass}>
              <h2 className="text-xl font-bold text-white mb-3">
                🔑 חשבונות לפתוח מראש — חינם
              </h2>
              <ul className="text-slate-300 space-y-2 list-disc pr-5">
                <li>
                  <a
                    href="https://console.anthropic.com"
                    className="text-brand-accent underline"
                  >
                    console.anthropic.com
                  </a>{" "}
                  — צור חשבון, API Keys → Create Key. שמור את המפתח, הוא
                  מופיע פעם אחת בלבד
                </li>
                <li>
                  <a
                    href="https://github.com"
                    className="text-brand-accent underline"
                  >
                    github.com
                  </a>{" "}
                  — חשבון חינמי לגיבוי הקוד
                </li>
                <li>
                  <a
                    href="https://vercel.com"
                    className="text-brand-accent underline"
                  >
                    vercel.com
                  </a>{" "}
                  — כניסה עם חשבון GitHub, לפרסום לאינטרנט
                </li>
                <li>
                  <a
                    href="https://supabase.com"
                    className="text-brand-accent underline"
                  >
                    supabase.com
                  </a>{" "}
                  — חשבון חינמי + פרויקט חדש, לבסיס הנתונים
                </li>
              </ul>
              <p className="text-amber-400 mt-3 text-sm">
                ⚠️ שמור את כל ה-API Keys במקום אחד (NotePad / Apple Notes) —
                תצטרך אותם בסדנה
              </p>
            </section>

            <section className={inputClass}>
              <h2 className="text-xl font-bold text-white mb-3">
                📼 גישה להקלטות
              </h2>
              <p className="text-slate-300">
                אחרי כל מפגש תעלה הקלטה לעמוד קורס ייעודי. הגישה מוגנת
                בסיסמה אישית שקיבלת/תקבל בוואטסאפ — עד 2 מכשירים.{" "}
                <a href="/course" className="text-brand-accent underline">
                  מעבר לעמוד הקורס
                </a>
              </p>
            </section>

            <p className="text-center text-slate-400">
              שאלות? פשוט תכתוב לנו בוואטסאפ — נתראה בזום! 😊
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";

const QUESTIONS: { key: string; label: string }[] = [
  { key: "q1_strengths", label: "מה לדעתך החוזקות שלי?" },
  { key: "q2_weaknesses", label: "מה לדעתך החולשות שלי?" },
  { key: "q3_fears", label: "מה לדעתך מפחיד אותי?" },
  { key: "q4_change", label: "מה לדעתך יגרום לשינוי?" },
  { key: "q5_role", label: "מה לדעתך העיסוק הכי מתאים עבורי?" },
];

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors resize-none";

export default function MashovPage() {
  const [respondentName, setRespondentName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/mashov/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respondent_name: respondentName, ...answers }),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      setRespondentName("");
      setAnswers({});
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-brand-bg flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black text-white mb-2">תודה!</h1>
          <p className="text-slate-300">התשובות נשמרו.</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            למלא עוד תשובה (עבור אדם אחר)
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <p className="text-slate-200 leading-relaxed mb-8">
          במסגרת קורס שאני עובר לקידום האישי שלי, התבקשתי לשאול אנשים שאני
          מעריך ומחשיב את דעתם. אשמח לתשובה כנה — אני מבטיח לא להיפגע, נהפוך
          הוא: תשובה אמיתית היא זו שבאמת תשרת את המטרה שלי.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              שם מי שעונה
            </label>
            <input
              required
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              className={inputClass}
              placeholder="שם"
            />
          </div>

          {QUESTIONS.map((q) => (
            <div key={q.key}>
              <label className="block text-slate-300 text-sm mb-2">
                {q.label}
              </label>
              <textarea
                rows={3}
                value={answers[q.key] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-5 py-3 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? "שולח..." : "שליחה"}
          </button>

          {status === "error" && (
            <p className="text-red-400 text-sm text-center">
              משהו השתבש, נסה שוב.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  required?: boolean;
  placeholder?: string;
  hint?: string;
};

const DETAILS: Field[] = [
  { key: "full_name", label: "שם מלא", required: true },
  { key: "phone", label: "טלפון", required: true, placeholder: "050-0000000" },
  { key: "email", label: "אימייל" },
  { key: "city", label: "עיר" },
  { key: "business_name", label: "שם העסק" },
  { key: "business_field", label: "תחום העסק", placeholder: "נדל״ן, ייעוץ, שיווק..." },
  { key: "years_active", label: "כמה שנים בעסק" },
  { key: "website", label: "אתר / עמוד עסקי", placeholder: "קישור" },
];

const QUESTIONS: Field[] = [
  {
    key: "q_strengths",
    label: "במה אתה טוב?",
    type: "textarea",
    hint: "התחומים שבהם אתה חזק באמת — מקצועית או אישית",
  },
  {
    key: "q_contribution",
    label: "מה אתה יכול לתרום לקבוצה?",
    type: "textarea",
    hint: "ידע, קשרים, לקוחות, ניסיון, שירות",
  },
  {
    key: "q_gaps",
    label: "באילו תחומים יש לך חוסרים בעסק?",
    type: "textarea",
    hint: "מה חסר לך היום כדי לצמוח",
  },
  {
    key: "q_needs",
    label: "מה היית רוצה שהקבוצה תיתן לך?",
    type: "textarea",
    hint: "מה תגדיר כהצלחה מהחברות בקבוצה",
  },
  { key: "q_notes", label: "משהו נוסף שחשוב שנדע?", type: "textarea" },
];

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors resize-none";

export default function NetworkingPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  function set(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/networking/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      setValues({});
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
          <p className="text-slate-300">
            הפרטים התקבלו. נחזור אליך עם הפרטים על הקבוצה.
          </p>
        </div>
      </main>
    );
  }

  function renderField(f: Field) {
    return (
      <div key={f.key}>
        <label className="block text-slate-300 text-sm mb-2">
          {f.label}
          {f.required && <span className="text-brand-accent"> *</span>}
        </label>
        {f.type === "textarea" ? (
          <textarea
            rows={3}
            required={f.required}
            value={values[f.key] ?? ""}
            onChange={(e) => set(f.key, e.target.value)}
            className={inputClass}
            placeholder={f.placeholder}
          />
        ) : (
          <input
            required={f.required}
            value={values[f.key] ?? ""}
            onChange={(e) => set(f.key, e.target.value)}
            className={inputClass}
            placeholder={f.placeholder}
          />
        )}
        {f.hint && <p className="text-slate-500 text-xs mt-1.5">{f.hint}</p>}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-3">
          קבוצת נטוורקינג לבעלי עסקים
        </h1>
        <p className="text-slate-200 leading-relaxed mb-8">
          אנחנו מקימים קבוצה של בעלי עסקים שעוזרים אחד לשני לצמוח — קשרים,
          לקוחות, ידע ופתרונות. השאלון קצר (2–3 דקות), והמטרה שלו היא להכיר
          אותך ואת העסק, ולהבין מה אתה מביא ומה אתה צריך.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-brand-accent/20 pb-2">
              פרטים אישיים
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">{DETAILS.map(renderField)}</div>
          </section>

          <section className="space-y-5 pt-2">
            <h2 className="text-lg font-bold text-white border-b border-brand-accent/20 pb-2">
              אתה והקבוצה
            </h2>
            {QUESTIONS.map(renderField)}
          </section>

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

"use client";

import { useState } from "react";

const PREFIXES = [
  { code: "+972", label: "🇮🇱 +972" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+7", label: "🇷🇺 +7" },
  { code: "+380", label: "🇺🇦 +380" },
];

const CATEGORIES: Record<string, string[]> = {
  "ייעוץ עסקי": ["אסטרטגיה עסקית", "פיתוח עסקי", "תפעול וניהול", "ייעוץ ארגוני"],
  "שיווק ומכירות": ["שיווק דיגיטלי", "מכירות", "מיתוג", "יחסי ציבור", "תוכן ויצירה"],
  "פיננסים וחשבונאות": ["ראיית חשבון", "CFO חיצוני", "ניהול תזרים", "השקעות"],
  "טכנולוגיה ודיגיטל": ["פיתוח תוכנה", "אוטומציה ו-AI", "סייבר ואבטחה", "ענן ותשתיות"],
  "משאבי אנוש": ["גיוס עובדים", "הדרכה", "ניהול ארגוני", "רווחת עובדים"],
  "חינוך והדרכה": ["הרצאות", "סדנאות", "קורסים", "קואצ'ינג"],
  'נדל"ן': ['נדל"ן מסחרי', 'נדל"ן מגורים', 'השקעות נדל"ן', "ניהול נכסים"],
  "משפטים": ["דיני חברות", "חוזים ועסקאות", "דיני עבודה", "קניין רוחני"],
  "בריאות ורפואה": ["רפואה", "פארמה", "ניהול קליניקות", "בריאות דיגיטלית"],
  "קמעונאות ומסחר": ["חנויות פיזיות", "מסחר אלקטרוני", "יבוא/יצוא", "שרשרת אספקה"],
  "ייצור ותעשייה": ["ייצור", "לוגיסטיקה", "בטיחות תעסוקתית", "אנרגיה"],
  "רהיטים": ["ריהוט למגורים", "ריהוט לעסקים", "עיצוב פנים", "ייצור ריהוט", "יבוא ריהוט"],
  "אחר": [],
};

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors";

function PhoneField({
  label,
  prefix,
  number,
  onPrefix,
  onNumber,
  required,
}: {
  label: string;
  prefix: string;
  number: string;
  onPrefix: (v: string) => void;
  onNumber: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      <div className="flex gap-2" dir="ltr">
        <select
          value={prefix}
          onChange={(e) => onPrefix(e.target.value)}
          className="px-3 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white focus:outline-none focus:border-brand-accent transition-colors text-sm shrink-0"
        >
          {PREFIXES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          required={required}
          placeholder="0501234567"
          value={number}
          onChange={(e) => onNumber(e.target.value.replace(/[^0-9]/g, ""))}
          pattern="[0-9]{7,15}"
          title="מספר טלפון חוקי — ספרות בלבד"
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function NavcheretPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    phone1Prefix: "+972",
    phone1Number: "",
    phone2Prefix: "+972",
    phone2Number: "",
    email: "",
    businessName: "",
    website: "",
    category: "",
    subcategory: "",
  });

  function set<K extends keyof typeof fields>(key: K, value: string) {
    setFields((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "category" ? { subcategory: "" } : {}),
    }));
  }

  const subcategories = fields.category ? (CATEGORIES[fields.category] ?? []) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/navcheret/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: fields.firstName,
          last_name: fields.lastName,
          phone1_prefix: fields.phone1Prefix,
          phone1_number: fields.phone1Number,
          phone2_prefix: fields.phone2Number ? fields.phone2Prefix : null,
          phone2_number: fields.phone2Number || null,
          email: fields.email || null,
          business_name: fields.businessName || null,
          website: fields.website || null,
          business_category: fields.category || null,
          business_subcategory: fields.subcategory || null,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-black text-white mb-3">תודה!</h1>
          <p className="text-slate-300 text-lg">הפרטים נשמרו בהצלחה.</p>
          <p className="text-slate-400 mt-2">שמחים שאתה חלק מנבחרת היועצים!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-brand-accent text-sm font-medium mb-2 tracking-widest uppercase">
            נבחרת היועצים · איתמר שולם
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            הכנס את הפרטים שלך
          </h1>
          <p className="text-slate-400 text-sm">
            המידע ישמר ויוצא לאנשי קשר לשימוש חברי הקבוצה
          </p>
        </div>

        <div className="bg-brand-dark rounded-3xl p-6 md:p-8 border border-brand-accent/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* שם */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">שם פרטי *</label>
                <input
                  type="text"
                  required
                  placeholder="ישראל"
                  value={fields.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">שם משפחה *</label>
                <input
                  type="text"
                  required
                  placeholder="ישראלי"
                  value={fields.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <PhoneField
              label="טלפון ראשי *"
              prefix={fields.phone1Prefix}
              number={fields.phone1Number}
              onPrefix={(v) => set("phone1Prefix", v)}
              onNumber={(v) => set("phone1Number", v)}
              required
            />

            <PhoneField
              label="טלפון שני"
              prefix={fields.phone2Prefix}
              number={fields.phone2Number}
              onPrefix={(v) => set("phone2Prefix", v)}
              onNumber={(v) => set("phone2Number", v)}
            />

            <div>
              <label className="block text-sm text-slate-300 mb-1">כתובת מייל</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={fields.email}
                onChange={(e) => set("email", e.target.value)}
                dir="ltr"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">שם העסק</label>
              <input
                type="text"
                placeholder="החברה שלי"
                value={fields.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">אתר האינטרנט</label>
              <input
                type="url"
                placeholder="https://www.example.com"
                value={fields.website}
                onChange={(e) => set("website", e.target.value)}
                dir="ltr"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">תחום העסק</label>
              <select
                value={fields.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              >
                <option value="">— בחר תחום —</option>
                {Object.keys(CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">התמחות</label>
                <select
                  value={fields.subcategory}
                  onChange={(e) => set("subcategory", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— בחר התמחות —</option>
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {status === "loading" ? "שומר..." : "שלח את הפרטים"}
            </button>

            {status === "error" && (
              <p className="text-center text-red-400 text-sm">
                משהו השתבש. נסה שוב או צור קשר עם יצחק.
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          הפרטים ישמשו לניהול קשרים בין חברי הקבוצה בלבד
        </p>
      </div>
    </main>
  );
}

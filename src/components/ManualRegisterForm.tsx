"use client";

import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const input =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors text-right";
interface Learner { firstName: string; lastName: string; phone: string; email: string }

export function ManualRegisterForm({ v, n, s }: { v: string; n: number; s: string }) {
  const [payerName, setPayerName] = useState("");
  const [learners, setLearners] = useState<Learner[]>(
    Array.from({ length: n }, () => ({ firstName: "", lastName: "", phone: "", email: "" }))
  );
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const setL = (i: number, k: keyof Learner, val: string) =>
    setLearners((p) => p.map((l, j) => (j === i ? { ...l, [k]: val } : l)));
  const filled = learners.filter((l) => l.firstName || l.lastName || l.phone || l.email);
  const valid = filled.length > 0 && filled.every((l) => l.firstName.trim() && l.lastName.trim() && l.phone.trim() && EMAIL_REGEX.test(l.email));

  async function submit() {
    setStatus("loading");
    try {
      const res = await fetch("/api/rabanim/manual-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ v, n, s, payerName, learners: filled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data.error || ""); setStatus("error"); return; }
      setStatus("done");
    } catch {
      setMsg(""); setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-white mb-4">ההרשמה הושלמה!</h1>
        <p className="text-slate-300 text-lg leading-relaxed">
          כל אחד מהלומדים מקבל עכשיו בוואטסאפ ובמייל את כל הפרטים: קישור הזום, סיסמה לאתר ההקלטות וקישור לקבוצה.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-right">
      <h1 className="text-3xl font-black text-white leading-snug mb-2">הרשמה לסדנת Claude Code לחרדים</h1>
      <p className="text-slate-300 mb-1">שלישי 20.10 + שלישי 27.10 · 16:00–19:00 · בזום</p>
      <p className="text-slate-400 mb-8">✅ התשלום התקבל (העברה בנקאית). נשאר רק למלא את פרטי {n === 1 ? "הלומד" : `${n} הלומדים`}.</p>

      <input className={input + " mb-6"} placeholder="שם המשלם (לא חובה)" value={payerName} onChange={(e) => setPayerName(e.target.value)} />

      <div className="space-y-4">
        {learners.map((l, i) => (
          <div key={i} className="p-4 rounded-2xl border border-brand-accent/25 bg-brand-card/40">
            <p className="text-white font-semibold mb-3">לומד {i + 1}</p>
            <div className="grid grid-cols-2 gap-3">
              <input className={input} placeholder="שם פרטי" value={l.firstName} onChange={(e) => setL(i, "firstName", e.target.value)} />
              <input className={input} placeholder="שם משפחה" value={l.lastName} onChange={(e) => setL(i, "lastName", e.target.value)} />
              <input className={input} type="tel" placeholder="טלפון (לוואטסאפ)" value={l.phone} onChange={(e) => setL(i, "phone", e.target.value)} />
              <input className={input} type="email" placeholder="מייל" value={l.email} onChange={(e) => setL(i, "email", e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <button onClick={submit} disabled={!valid || status === "loading"} className="mt-8 w-full py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40">
        {status === "loading" ? "רושם..." : "סיום הרשמה ←"}
      </button>
      {status === "error" && <p className="text-red-400 text-center mt-3">{msg || "משהו השתבש. נסה שוב."}</p>}
    </div>
  );
}

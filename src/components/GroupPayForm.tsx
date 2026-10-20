"use client";

import { useState } from "react";

const UNIT_PRICE = 800;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const input =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors text-right";

interface Learner { firstName: string; lastName: string; phone: string; email: string }
const emptyLearner = (): Learner => ({ firstName: "", lastName: "", phone: "", email: "" });

export function GroupPayForm({ k }: { k: string }) {
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [learners, setLearners] = useState<Learner[]>([emptyLearner(), emptyLearner()]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const filled = learners.filter((l) => l.firstName.trim() && l.lastName.trim());
  const learnersOk = filled.length > 0 && learners.every((l) => {
    const any = l.firstName || l.lastName || l.phone || l.email;
    return !any || (l.firstName.trim() && l.lastName.trim() && l.phone.trim() && EMAIL_REGEX.test(l.email));
  });
  const valid = businessName.trim() && contactName.trim() && phone.trim() && EMAIL_REGEX.test(email) && learnersOk;
  const total = UNIT_PRICE * filled.length;

  const setL = (i: number, key: keyof Learner, v: string) =>
    setLearners((prev) => prev.map((l, j) => (j === i ? { ...l, [key]: v } : l)));

  async function pay(paymentMethod: "credit" | "credit2" | "bit") {
    setStatus("loading");
    try {
      const res = await fetch("/api/rabanim/group-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k, businessName, taxId, contactName, email, phone, learners: filled, paymentMethod }),
      });
      if (!res.ok) throw new Error("failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setStatus("error");
    }
  }

  const btn = "py-4 px-2 rounded-xl text-white font-bold leading-tight hover:opacity-90 transition-opacity disabled:opacity-40";

  return (
    <div className="max-w-xl mx-auto text-right">
      <h1 className="text-3xl font-black text-white leading-snug mb-2">שיעור בנושא המקוואות</h1>
      <p className="text-slate-400 mb-8">תשלום עבור כמה לומדים. הקבלה תצא על שם העסק.</p>

      <h2 className="text-white font-bold text-lg mb-3">פרטי המשלם (לקבלה)</h2>
      <div className="space-y-3">
        <input className={input} placeholder="שם העסק (כפי שיופיע בקבלה)" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        <input className={input} placeholder="ח.פ / ע.מ" inputMode="numeric" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        <input className={input} placeholder="שם איש הקשר" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className={input} type="tel" placeholder="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className={input} type="email" placeholder="מייל (לקבלה)" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <h2 className="text-white font-bold text-lg mt-8 mb-3">הלומדים</h2>
      <div className="space-y-4">
        {learners.map((l, i) => (
          <div key={i} className="p-4 rounded-2xl border border-brand-accent/25 bg-brand-card/40">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-semibold">לומד {i + 1}</span>
              {learners.length > 1 && (
                <button type="button" onClick={() => setLearners((p) => p.filter((_, j) => j !== i))} className="text-slate-400 text-sm hover:text-red-300">
                  הסר
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={input} placeholder="שם פרטי" value={l.firstName} onChange={(e) => setL(i, "firstName", e.target.value)} />
              <input className={input} placeholder="שם משפחה" value={l.lastName} onChange={(e) => setL(i, "lastName", e.target.value)} />
              <input className={input} type="tel" placeholder="טלפון" value={l.phone} onChange={(e) => setL(i, "phone", e.target.value)} />
              <input className={input} type="email" placeholder="מייל" value={l.email} onChange={(e) => setL(i, "email", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      {learners.length < 10 && (
        <button type="button" onClick={() => setLearners((p) => [...p, emptyLearner()])} className="mt-3 w-full py-3 rounded-xl border border-dashed border-brand-accent/50 text-white hover:bg-brand-card transition-colors">
          + הוסף לומד
        </button>
      )}

      <p className="text-white font-bold text-xl mt-8 mb-3">
        לתשלום: {filled.length} × {UNIT_PRICE}₪ = {total.toLocaleString("he-IL")}₪
      </p>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => pay("credit")} disabled={!valid || status === "loading"} className={`${btn} bg-gradient-to-l from-brand-accent-2 to-brand-accent`}>
          💳 אשראי<span className="block text-sm font-normal opacity-90">תשלום אחד</span>
        </button>
        <button onClick={() => pay("credit2")} disabled={!valid || status === "loading"} className={`${btn} bg-gradient-to-l from-brand-accent-2 to-brand-accent`}>
          💳 אשראי<span className="block text-sm font-normal opacity-90">2 תשלומים</span>
        </button>
        <button onClick={() => pay("bit")} disabled={!valid || status === "loading"} className={`${btn} bg-[#00a3a6]`}>
          bit<span className="block text-sm font-normal opacity-90">תשלום אחד</span>
        </button>
      </div>
      {status === "loading" && <p className="text-slate-300 text-center mt-3">מעביר לתשלום...</p>}
      {status === "error" && <p className="text-red-400 text-center mt-3">משהו השתבש. נסה שוב.</p>}
      <p className="text-slate-500 text-sm mt-3">התשלום מאובטח דרך מורנינג (חשבונית ירוקה). הקבלה נשלחת למייל של המשלם.</p>
    </div>
  );
}

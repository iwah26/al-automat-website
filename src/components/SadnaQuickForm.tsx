"use client";

import { useState } from "react";
import { DIAL_CODES } from "@/lib/dialCodes";

// מחזור ד׳: קודם רק פרטים בסיסיים ותשלום. שאר השאלות — אחרי התשלום, ב-/sadna/details.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputBase =
  "px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors text-right";
const inputClass = "w-full " + inputBase;

export function SadnaQuickForm({ referralCode, price, testCode }: { referralCode?: string; price: number; testCode?: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dial, setDial] = useState("972");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const emailValid = EMAIL_REGEX.test(email);
  const valid = firstName.trim() && lastName.trim() && phone.trim() && emailValid;

  async function pay(paymentMethod: "credit" | "bit") {
    setStatus("loading");
    try {
      try {
        localStorage.setItem("rabanim_firstName", firstName);
        localStorage.setItem("rabanim_lastName", lastName);
        localStorage.setItem("rabanim_cohort", "round4");
      } catch {
        // רק לנוחות בדף התודה
      }
      const res = await fetch("/api/rabanim/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: `${dial}${phone.replace(/\D/g, "").replace(/^0+/, "")}`,
          referralCode,
          cohort: "round4",
          paymentMethod,
          testCode,
        }),
      });
      if (!res.ok) throw new Error("checkout failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto text-right">
      {testCode && (
        <p className="mb-6 p-3 rounded-xl border border-yellow-400/60 text-yellow-300 text-center font-bold">
          🧪 מצב בדיקה — אם הקישור תקין, החיוב יהיה ₪1 בלבד
        </p>
      )}
      <h1 className="text-3xl font-black text-white leading-snug">
        שלום{" "}
        {(firstName || lastName) && (
          <span className="text-brand-accent">{`${firstName} ${lastName}`.trim()}</span>
        )}
      </h1>
      <p className="text-slate-300 mt-2 mb-1 text-lg">
        הרשמה לסדנת Claude Code לחרדים · שישי 9.10 + 16.10 · 9:30–12:30
      </p>
      <p className="text-slate-400 mb-8">
        ממלאים 4 פרטים ועוברים לתשלום. את שאר השאלות תמלא מיד אחרי התשלום.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="שם פרטי" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          <input placeholder="שם משפחה" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </div>
        <div className="flex gap-2">
          <input type="tel" placeholder="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputBase + " flex-1 min-w-0"} />
          <select value={dial} onChange={(e) => setDial(e.target.value)} className={inputBase + " w-24 flex-none truncate text-sm"}>
            {DIAL_CODES.map((c) => (
              <option key={c.iso2} value={c.dialCode}>
                +{c.dialCode} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input type="email" placeholder="מייל" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          {email.length > 0 && !emailValid && <p className="text-red-400 text-sm mt-1">כתובת מייל לא תקינה</p>}
        </div>
      </div>

      <p className="text-white font-bold text-xl mt-8 mb-3">לתשלום — {price}₪</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => pay("credit")}
          disabled={!valid || status === "loading"}
          className="py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {status === "loading" ? "מעביר..." : "💳 אשראי"}
        </button>
        <button
          onClick={() => pay("bit")}
          disabled={!valid || status === "loading"}
          className="py-4 rounded-xl bg-[#00a3a6] text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {status === "loading" ? "מעביר..." : "bit"}
        </button>
      </div>
      <p className="text-slate-500 text-sm mt-3">
        באשראי אפשר לחלק לשני תשלומים. התשלום מאובטח דרך מורנינג (חשבונית ירוקה), והחשבונית נשלחת אליך במייל.
      </p>
      {status === "error" && <p className="text-red-400 text-center mt-4">משהו השתבש. נסה שוב.</p>}
    </div>
  );
}

"use client";

import { useState } from "react";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors text-right";

export function WebinarRegisterForm({ referralCode }: { referralCode?: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/webinar/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, referralCode }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center text-white text-xl font-bold">
        נרשמת בהצלחה! פרטי הזום נשלחו למייל שלך 🙏
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        placeholder="שם מלא"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className={inputClass}
        required
      />
      <input
        type="email"
        placeholder="מייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
        required
      />
      <input
        type="tel"
        placeholder="טלפון (אופציונלי)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClass}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {status === "loading" ? "נרשם..." : "הרשמה לוובינר ←"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-center">משהו השתבש. נסה שוב.</p>
      )}
    </form>
  );
}

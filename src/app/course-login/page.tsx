"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CourseLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/rabanim/course-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/course/1");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "סיסמה שגויה");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="max-w-sm w-full text-center">
        <h1 className="text-2xl font-black text-white mb-6">
          כניסה לעמוד הקורס
        </h1>
        <input
          type="text"
          inputMode="numeric"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white text-center text-lg tracking-widest focus:outline-none focus:border-brand-accent"
        />
        {error && <p className="text-red-400 mt-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? "בודק..." : "כניסה"}
        </button>
      </form>
    </main>
  );
}

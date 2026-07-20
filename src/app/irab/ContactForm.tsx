"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/irab-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-[#8dc63f] bg-green-50 p-8 flex items-center justify-center text-center">
        <p className="text-lg font-medium text-[#6ea62b]">
          תודה! הפנייה התקבלה ונחזור אליך בהקדם.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200 p-8 flex flex-col gap-4"
    >
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          שם מלא
        </label>
        <input
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#8dc63f] focus:outline-none focus:ring-1 focus:ring-[#8dc63f]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          טלפון
        </label>
        <input
          name="phone"
          type="tel"
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#8dc63f] focus:outline-none focus:ring-1 focus:ring-[#8dc63f]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          אימייל
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#8dc63f] focus:outline-none focus:ring-1 focus:ring-[#8dc63f]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          הודעה
        </label>
        <textarea
          name="message"
          rows={4}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-[#8dc63f] focus:outline-none focus:ring-1 focus:ring-[#8dc63f]"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6ea62b] transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "שולח..." : "שליחה"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">
          משהו השתבש — אפשר גם לפנות ישירות ב-director@irabadvice.com
        </p>
      )}
    </form>
  );
}

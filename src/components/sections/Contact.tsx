"use client";

import { useState } from "react";
import { useReducedMotion, motion } from "framer-motion";
import { content } from "@/data/content";

const WEBHOOK_URL =
  "https://hook.integrator.boost.space/otgpr8yi5mzx38k4n76s3d97wzq3wjp0";

type Status = "idle" | "loading" | "success" | "error";

export function Contact() {
  const reduce = useReducedMotion();
  const { contact } = content;
  const waHref = `https://wa.me/${contact.whatsappNumber}`;

  const [status, setStatus] = useState<Status>("idle");
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    acceptedPrivacy: false,
  });

  function set(key: keyof typeof fields, value: string | boolean) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const payload = [
      {
        source: "contact",
        fullName: fields.fullName,
        email: fields.email,
        phone: fields.phone,
        message: fields.message,
        acceptedPrivacy: fields.acceptedPrivacy,
        page: window.location.href,
        timestamp: new Date().toISOString(),
      },
    ];

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("bad response");
      setStatus("success");
      setFields({ fullName: "", email: "", phone: "", message: "", acceptedPrivacy: false });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-24 px-6 bg-brand-bg">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {contact.sectionTitle}
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">{contact.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Business contact details */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-slate-400 text-sm">
            <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {contact.phone}
            </a>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {contact.address}
            </span>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-gradient-to-l from-green-500 to-emerald-400 text-white font-bold text-xl hover:opacity-90 transition-opacity shadow-lg shadow-green-500/25"
          >
            <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {contact.whatsappLabel}
          </a>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-brand-accent/20" />
            <span className="text-slate-500 text-sm">או</span>
            <div className="flex-1 h-px bg-brand-accent/20" />
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder={contact.form.namePlaceholder}
                value={fields.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors"
              />
              <input
                type="tel"
                placeholder={contact.form.phonePlaceholder}
                value={fields.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
            <input
              type="email"
              required
              placeholder={contact.form.emailPlaceholder}
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors"
            />
            <textarea
              rows={5}
              required
              placeholder={contact.form.messagePlaceholder}
              value={fields.message}
              onChange={(e) => set("message", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-accent/30 text-white placeholder-slate-400 focus:outline-none focus:border-brand-accent transition-colors resize-none"
            />
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fields.acceptedPrivacy}
                onChange={(e) => set("acceptedPrivacy", e.target.checked)}
                className="w-4 h-4 rounded accent-brand-accent"
              />
              <span className="text-slate-400 text-sm">{contact.form.privacyLabel}</span>
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === "loading" ? "שולח..." : contact.form.submitLabel}
            </button>
            {status === "success" && (
              <p className="text-center text-emerald-400 font-medium">{contact.form.successMessage}</p>
            )}
            {status === "error" && (
              <p className="text-center text-red-400 font-medium">{contact.form.errorMessage}</p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}

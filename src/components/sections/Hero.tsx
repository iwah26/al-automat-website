"use client";

import { useReducedMotion, motion } from "framer-motion";
import { content } from "@/data/content";

export function Hero() {
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-bg"
      aria-label="פתיחה"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-brand-accent-2/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-sm"
          >
            אוטומציות · בוטים · CRM · AI
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            {content.hero.headline}
          </h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {content.hero.subheadline}
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href={content.hero.ctaHref}
              className="px-8 py-4 rounded-xl bg-gradient-to-l from-brand-accent-2 to-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-brand-accent/25"
            >
              {content.hero.cta}
            </a>
            <a
              href={content.hero.secondaryCtaHref}
              className="px-8 py-4 rounded-xl border border-brand-accent/40 text-slate-300 font-medium text-lg hover:border-brand-accent hover:text-white transition-colors"
            >
              {content.hero.secondaryCta}
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={reduce ? {} : { y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        aria-hidden
      >
        <svg
          className="w-6 h-6 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.div>
    </section>
  );
}

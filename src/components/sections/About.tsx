"use client";

import { useReducedMotion, motion } from "framer-motion";
import { content } from "@/data/content";

export function About() {
  const reduce = useReducedMotion();

  return (
    <section id="about" className="py-24 px-6 bg-brand-bg">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
              {content.about.sectionTitle}
            </h2>
            <div className="space-y-4">
              {content.about.paragraphs.map((para, i) => (
                <p key={i} className="text-slate-300 text-lg leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="grid grid-cols-1 gap-4"
          >
            {content.about.highlights.map((item) => (
              <div
                key={item.label}
                className="p-6 rounded-2xl bg-brand-card border border-brand-accent/20 flex items-center gap-6"
              >
                <span className="text-5xl font-black gradient-text leading-none">
                  {item.value}
                </span>
                <span className="text-slate-300 text-lg">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

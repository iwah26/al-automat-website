"use client";

import { useReducedMotion, motion } from "framer-motion";
import { content } from "@/data/content";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  index: number;
}

function TestimonialCard({ quote, name, role, index }: TestimonialCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col gap-4 rounded-2xl border border-brand-accent/25 bg-brand-dark/60 p-6 backdrop-blur-sm"
    >
      {/* Stars */}
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <blockquote className="text-slate-300 leading-relaxed flex-1">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <footer className="flex items-center gap-3 pt-2 border-t border-brand-accent/20">
        {/* Avatar initials */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-accent-2 to-brand-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{name}</p>
          <p className="text-slate-400 text-xs">{role}</p>
        </div>
      </footer>
    </motion.div>
  );
}

export function Testimonials() {
  const { sectionTitle, items } = content.testimonials;

  return (
    <section id="testimonials" className="py-24 bg-brand-bg" aria-label="המלצות">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {sectionTitle}
          </h2>
          <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-l from-brand-accent-2 to-brand-accent" />
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <TestimonialCard key={i} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

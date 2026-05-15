"use client";

import { useReducedMotion, motion } from "framer-motion";
import { content } from "@/data/content";

export function CV() {
  const reduce = useReducedMotion();

  return (
    <section id="cv" className="py-24 px-6 bg-brand-dark print:py-8 print:px-0">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 print:mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 print:text-black">
            {content.cv.sectionTitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-white mb-8 print:text-black">
              {content.cv.backgroundTitle}
            </h3>
            <div className="relative">
              <div className="absolute top-0 bottom-0 right-2 w-px bg-brand-accent/30 print:bg-slate-300" />
              <div className="space-y-8">
                {content.cv.timeline.map((item, i) => (
                  <div key={i} className="relative pr-8">
                    <div className="absolute right-0 top-1.5 w-4 h-4 rounded-full bg-brand-accent border-2 border-brand-dark print:border-white" />
                    <span className="text-brand-accent text-sm font-medium print:text-blue-700">
                      {item.year}
                    </span>
                    <h4 className="text-white font-bold mt-1 print:text-black">{item.role}</h4>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed print:text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lectures */}
          <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold text-white mb-8 print:text-black">
              {content.cv.lecturesTitle}
            </h3>
            <div className="space-y-4">
              {content.cv.lectures.map((lecture, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-brand-card border border-brand-accent/20 print:border-slate-300 print:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-white font-semibold text-sm print:text-black">
                        {lecture.title}
                      </h4>
                      <p className="text-slate-400 text-xs mt-1 print:text-slate-500">
                        {lecture.audience}
                      </p>
                    </div>
                    <span className="text-brand-accent text-xs font-medium shrink-0 print:text-blue-700">
                      {lecture.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

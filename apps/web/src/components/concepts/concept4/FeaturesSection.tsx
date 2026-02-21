"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/mock-data";

const cardStyles = [
  "bg-amber-50 border-amber-200",
  "bg-rose-50 border-rose-200",
  "bg-violet-50 border-violet-200",
  "bg-sky-50 border-sky-200",
  "bg-emerald-50 border-emerald-200",
  "bg-orange-50 border-orange-200",
];

const iconEmojis = ["🎯", "📊", "⚡", "🎟️", "🎹", "💫"];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-5xl px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold text-rose-900 text-center mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Packed with goodies
        </motion.h2>
        <motion.p
          className="text-center text-rose-400 mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Everything you need, nothing you don&apos;t
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={`rounded-3xl border-2 p-6 ${cardStyles[i % cardStyles.length]} hover:shadow-lg transition-shadow`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="text-3xl mb-3">{iconEmojis[i]}</div>
              <h3 className="text-lg font-bold text-rose-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-rose-700/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/mock-data";

export function FeaturesSection() {
  return (
    <section className="py-24 border-t border-stone-200">
      <div className="mx-auto max-w-5xl px-8">
        <motion.h2
          className="font-serif text-3xl sm:text-4xl font-light text-stone-900 text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Thoughtfully designed
        </motion.h2>
        <motion.p
          className="text-center text-stone-500 mb-16 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Every detail considered for the streaming experience
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <div className="flex items-start gap-4">
                <span className="text-xs text-stone-400 font-mono mt-1 tabular-nums">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

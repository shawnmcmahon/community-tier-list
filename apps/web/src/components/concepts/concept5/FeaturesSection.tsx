"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/mock-data";

const featureIcons = ["◉", "⊞", "⚡", "◎", "⌨", "▣"];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-800">
      <div className="mx-auto max-w-6xl px-8">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px flex-1 bg-zinc-800" />
            <h2 className="font-mono text-sm text-emerald-500 uppercase tracking-widest">
              System Capabilities
            </h2>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 rounded-lg overflow-hidden">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-zinc-950 p-6 hover:bg-zinc-900/80 transition-colors"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-emerald-500 font-mono text-lg">
                  {featureIcons[i]}
                </span>
                <span className="font-mono text-xs text-zinc-600 uppercase">
                  mod.{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-mono text-sm font-bold text-zinc-200 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

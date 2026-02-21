"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/mock-data";

const neonColors = [
  "border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:shadow-fuchsia-500/10",
  "border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-cyan-500/10",
  "border-amber-500/30 hover:border-amber-400/60 hover:shadow-amber-500/10",
  "border-pink-500/30 hover:border-pink-400/60 hover:shadow-pink-500/10",
  "border-violet-500/30 hover:border-violet-400/60 hover:shadow-violet-500/10",
  "border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-emerald-500/10",
];

const iconColors = [
  "text-fuchsia-400",
  "text-cyan-400",
  "text-amber-400",
  "text-pink-400",
  "text-violet-400",
  "text-emerald-400",
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="mx-auto max-w-6xl px-8">
        <motion.h2
          className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Power{" "}
          <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
            Features
          </span>
        </motion.h2>
        <motion.p
          className="text-center text-gray-500 mb-16 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Everything a streamer needs for interactive tier lists
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={`rounded-xl border bg-gray-900/50 p-6 shadow-lg hover:shadow-xl transition-all ${neonColors[i % neonColors.length]}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div
                className={`text-2xl font-black mb-3 ${iconColors[i % iconColors.length]}`}
              >
                {["⚡", "🎮", "🚀", "👥", "⌨️", "📡"][i]}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

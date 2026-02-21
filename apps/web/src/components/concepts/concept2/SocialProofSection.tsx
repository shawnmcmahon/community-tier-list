"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "12K+", label: "Sessions", color: "text-fuchsia-400" },
  { value: "850K+", label: "Votes Cast", color: "text-cyan-400" },
  { value: "2.4K", label: "Streamers", color: "text-amber-400" },
  { value: "<50ms", label: "Latency", color: "text-emerald-400" },
];

export function SocialProofSection() {
  return (
    <section className="py-20 bg-black border-y border-gray-800">
      <div className="mx-auto max-w-5xl px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div
                className={`text-4xl sm:text-5xl font-black ${stat.color}`}
              >
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-500 uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

const metrics = [
  { key: "sessions.total", value: "12,847", delta: "+342 (7d)" },
  { key: "votes.total", value: "854,219", delta: "+12.4K (7d)" },
  { key: "users.active", value: "2,431", delta: "+89 (7d)" },
  { key: "latency.p99", value: "48ms", delta: "-2ms (7d)" },
];

export function SocialProofSection() {
  return (
    <section className="py-16 bg-zinc-950 border-y border-zinc-800">
      <div className="mx-auto max-w-5xl px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.key}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className="font-mono text-xs text-zinc-600 mb-1">
                {m.key}
              </div>
              <div className="font-mono text-2xl font-bold text-zinc-100 tabular-nums">
                {m.value}
              </div>
              <div className="font-mono text-xs text-emerald-500 mt-1">
                {m.delta}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

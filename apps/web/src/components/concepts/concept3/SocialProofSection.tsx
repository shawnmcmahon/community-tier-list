"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "12K+", label: "Sessions Created" },
  { value: "850K+", label: "Votes Cast" },
  { value: "2.4K", label: "Active Streamers" },
  { value: "< 50ms", label: "Vote Latency" },
];

const testimonials = [
  {
    quote:
      "My chat goes absolutely wild when I stage a controversial pick. The real-time vote bars are perfect content.",
    author: "StreamerKai",
    role: "Variety Streamer",
    viewers: "4.2K avg viewers",
  },
  {
    quote:
      "Setup takes 30 seconds with TierMaker import. I use it for every tier list stream now.",
    author: "NightOwlGaming",
    role: "FPS Streamer",
    viewers: "8.1K avg viewers",
  },
  {
    quote:
      "The fact that viewers don't need to sign up is huge. Everyone just clicks the link and votes.",
    author: "PixelDust",
    role: "Creative Streamer",
    viewers: "1.8K avg viewers",
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <p className="text-sm leading-relaxed text-slate-600 mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white text-sm font-bold">
                  {t.author[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {t.author}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.role} &middot; {t.viewers}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

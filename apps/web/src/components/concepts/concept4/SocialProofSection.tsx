"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "My chat goes wild every time! The cutest tier list tool ever.",
    author: "StreamerKai",
    emoji: "🌟",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    quote: "Setup is so fast. Import, go live, done. My community loves it.",
    author: "NightOwlGaming",
    emoji: "🎮",
    bg: "bg-rose-50 border-rose-200",
  },
  {
    quote: "No sign-up for viewers is brilliant. Everyone can participate.",
    author: "PixelDust",
    emoji: "✨",
    bg: "bg-violet-50 border-violet-200",
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-orange-50/50">
      <div className="mx-auto max-w-5xl px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { v: "12K+", l: "Sessions", emoji: "📦" },
            { v: "850K+", l: "Votes", emoji: "🗳️" },
            { v: "2.4K", l: "Streamers", emoji: "📺" },
            { v: "<50ms", l: "Latency", emoji: "⚡" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-3xl font-extrabold text-rose-900">
                {s.v}
              </div>
              <div className="text-sm text-rose-400">{s.l}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              className={`rounded-3xl border-2 p-6 ${t.bg}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="text-2xl mb-3">{t.emoji}</div>
              <p className="text-sm leading-relaxed text-rose-800/70 mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <span className="text-sm font-bold text-rose-900">
                {t.author}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

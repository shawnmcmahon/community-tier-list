"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "The most elegant tier list tool I've used. My community loves the simplicity.",
    author: "StreamerKai",
    role: "Variety Streamer",
  },
  {
    quote:
      "Real-time voting bars make for incredible content. Setup is effortless.",
    author: "NightOwlGaming",
    role: "FPS Streamer",
  },
  {
    quote:
      "No sign-up for viewers is a game changer. Everyone participates.",
    author: "PixelDust",
    role: "Creative Streamer",
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-stone-50">
      <div className="mx-auto max-w-5xl px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.author}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="font-serif text-lg leading-relaxed text-stone-700 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6">
                <div className="w-8 h-px bg-stone-300 mx-auto mb-4" />
                <cite className="not-italic">
                  <span className="block text-sm font-medium text-stone-900">
                    {t.author}
                  </span>
                  <span className="block text-xs text-stone-400 mt-0.5">
                    {t.role}
                  </span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

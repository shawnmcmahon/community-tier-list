"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative py-32 lg:py-44">
      <div className="mx-auto max-w-4xl px-8 text-center">
        <motion.p
          className="text-sm tracking-[0.2em] uppercase text-stone-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          A new way to rank, together
        </motion.p>

        <motion.h1
          className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-[1.1] tracking-tight text-stone-900"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Community
          <br />
          <em className="italic text-stone-500">Tier Lists</em>
        </motion.h1>

        <motion.p
          className="mt-8 text-lg leading-relaxed text-stone-500 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Stage items for your audience. Let them vote in real time.
          See where the community lands while you stream.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link href="/dashboard">
            <Button
              size="xl"
              className="bg-stone-900 text-white hover:bg-stone-800 rounded-full px-10 font-light tracking-wide"
            >
              Begin Creating
            </Button>
          </Link>
          <Link
            href="/s/best-fps-2025"
            className="text-sm text-stone-500 underline underline-offset-4 decoration-stone-300 hover:text-stone-900 hover:decoration-stone-900 transition-colors"
          >
            View a live session
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="w-px h-16 bg-gradient-to-b from-stone-300 to-transparent mx-auto" />
      </motion.div>
    </section>
  );
}

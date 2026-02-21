"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-rose-50 to-white py-24 lg:py-32">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-yellow-200/40 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="absolute top-40 right-1/3 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-8 text-center">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white border-2 border-dashed border-orange-300 px-5 py-2 text-sm font-medium text-orange-600 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          ✨ Collect your community&apos;s opinions
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-rose-900">Rank it.</span>{" "}
          <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
            Love it.
          </span>
          <br />
          <span className="text-rose-900">Share it.</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg text-rose-700/70 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Create adorable tier list sessions, let your viewers vote on their
          favorites, and collect the results like trading cards.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link href="/dashboard">
            <Button
              size="xl"
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-400 hover:to-rose-400 rounded-2xl shadow-lg shadow-rose-200 font-bold text-lg px-10"
            >
              Start Collecting
            </Button>
          </Link>
          <Link href="/s/best-fps-2025">
            <Button
              variant="outline"
              size="xl"
              className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold text-lg"
            >
              See a Demo
            </Button>
          </Link>
        </motion.div>

        {/* Floating sticker cards */}
        <motion.div
          className="mt-16 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {["S", "A", "B", "C", "D"].map((tier, i) => {
            const bg = [
              "bg-amber-100 border-amber-300 text-amber-700",
              "bg-rose-100 border-rose-300 text-rose-700",
              "bg-violet-100 border-violet-300 text-violet-700",
              "bg-sky-100 border-sky-300 text-sky-700",
              "bg-stone-100 border-stone-300 text-stone-600",
            ];
            const rotations = [-6, -2, 2, -3, 5];
            return (
              <motion.div
                key={tier}
                className={`flex h-20 w-20 items-center justify-center rounded-3xl border-2 shadow-lg text-3xl font-black ${bg[i]}`}
                initial={{ opacity: 0, y: 30, rotate: rotations[i]! * 2 }}
                animate={{ opacity: 1, y: 0, rotate: rotations[i] }}
                transition={{
                  duration: 0.5,
                  delay: 0.8 + i * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{
                  scale: 1.2,
                  rotate: 0,
                  transition: { duration: 0.2 },
                }}
              >
                {tier}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

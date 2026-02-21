"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
      {/* Neon grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00ff08_1px,transparent_1px),linear-gradient(to_bottom,#00ffff08_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-[128px]" />

      <div className="relative mx-auto max-w-6xl px-8 w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-sm text-fuchsia-300 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
            </span>
            LIVE NOW
          </motion.div>

          <motion.h1
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter leading-none"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-white">TIER</span>
            <br />
            <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.4)]">
              LISTS
            </span>
          </motion.h1>

          <motion.p
            className="mt-8 text-xl text-gray-400 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your audience votes. You rank. The community decides.
            All in real time.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link href="/dashboard">
              <Button
                size="xl"
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:from-fuchsia-500 hover:to-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)] rounded-xl text-lg px-10 font-bold uppercase tracking-wider"
              >
                Start Session
              </Button>
            </Link>
            <Link href="/s/best-fps-2025">
              <Button
                variant="outline"
                size="xl"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-400/50 rounded-xl text-lg uppercase tracking-wider font-bold"
              >
                Watch Live
              </Button>
            </Link>
          </motion.div>

          {/* Animated tier preview */}
          <motion.div
            className="mt-20 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {["S", "A", "B", "C", "D"].map((tier, i) => {
              const colors = [
                "from-amber-400 to-orange-500 shadow-amber-500/30",
                "from-red-400 to-rose-500 shadow-red-500/30",
                "from-violet-400 to-purple-500 shadow-violet-500/30",
                "from-blue-400 to-cyan-500 shadow-blue-500/30",
                "from-gray-400 to-gray-500 shadow-gray-500/30",
              ];
              return (
                <motion.div
                  key={tier}
                  className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${colors[i]} shadow-lg text-white text-2xl font-black`}
                  initial={{ opacity: 0, y: 20, rotate: -5 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.9 + i * 0.1,
                    type: "spring",
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 5,
                    transition: { duration: 0.2 },
                  }}
                >
                  {tier}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

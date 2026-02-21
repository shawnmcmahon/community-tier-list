"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-zinc-950 py-24 lg:py-32 overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e06_1px,transparent_1px),linear-gradient(to_bottom,#22c55e06_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-auto max-w-6xl px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              className="mb-6 flex items-center gap-2 font-mono text-sm text-emerald-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="h-px w-8 bg-emerald-500" />
              <span>v1.0.0 — STABLE</span>
            </motion.div>

            <motion.h1
              className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              community
              <br />
              <span className="text-emerald-400">tier_lists</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-zinc-400 max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Real-time tier list voting infrastructure for live streamers.
              Stage items, aggregate community votes, output ranked boards.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-500 rounded-md font-mono font-bold"
                >
                  $ init session
                </Button>
              </Link>
              <Link href="/s/best-fps-2025">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-600 rounded-md font-mono"
                >
                  $ watch demo
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Terminal mock */}
          <motion.div
            className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs font-mono text-zinc-500">
                session — best-fps-2025
              </span>
            </div>
            <div className="p-5 font-mono text-sm space-y-1.5">
              <p className="text-zinc-500">
                <span className="text-emerald-500">$</span> session status
              </p>
              <p className="text-zinc-300">
                <span className="text-zinc-500">status:</span>{" "}
                <span className="text-emerald-400">LIVE</span>
              </p>
              <p className="text-zinc-300">
                <span className="text-zinc-500">viewers:</span> 1,247
              </p>
              <p className="text-zinc-300">
                <span className="text-zinc-500">items:</span> 24 total, 9
                placed
              </p>
              <p className="text-zinc-300">
                <span className="text-zinc-500">staged:</span> Call of Duty
              </p>
              <div className="h-px w-full bg-zinc-800 my-2" />
              <p className="text-zinc-500">
                <span className="text-emerald-500">$</span> votes
                --current
              </p>
              <p className="text-amber-400">
                S: ████████████░░░░ 342 (25.3%)
              </p>
              <p className="text-red-400">
                A: ████████████████ 518 (38.4%)
              </p>
              <p className="text-violet-400">
                B: █████████░░░░░░░ 289 (21.4%)
              </p>
              <p className="text-blue-400">
                C: █████░░░░░░░░░░░ 156 (11.6%)
              </p>
              <p className="text-zinc-500">
                D: █░░░░░░░░░░░░░░░  43 ( 3.2%)
              </p>
              <div className="h-px w-full bg-zinc-800 my-2" />
              <p className="text-zinc-500">
                <span className="text-emerald-500">$</span>{" "}
                <span className="animate-pulse">▊</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

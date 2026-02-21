"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TIER_CONFIG, type Tier } from "@/lib/mock-data";

const tierKeys: Tier[] = ["S", "A", "B", "C", "D"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f022_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f022_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live voting for streamers
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Tier lists,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              decided together.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg leading-relaxed text-slate-600 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create interactive tier list sessions. Stage items for your audience,
            let them vote in real time, and see where the community lands — all
            while you stream.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/dashboard">
              <Button size="xl" className="shadow-lg shadow-slate-900/10">
                Create a Session
              </Button>
            </Link>
            <Link href="/s/best-fps-2025">
              <Button variant="outline" size="xl">
                View Demo Session
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Best FPS Games of 2025
                </h3>
                <p className="text-sm text-slate-500">
                  1,247 viewers voting live
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-emerald-600">
                  Live
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {tierKeys.map((tier, i) => {
                const config = TIER_CONFIG[tier];
                const widths = [92, 78, 60, 40, 20];
                return (
                  <motion.div
                    key={tier}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${config.bg} ${config.border}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-md font-bold text-lg ${config.color} bg-white border ${config.border}`}
                    >
                      {tier}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {widths[i]}% of votes
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/60">
                        <motion.div
                          className={`h-full rounded-full ${config.color.replace("text-", "bg-")}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${widths[i]}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.8 + i * 0.1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

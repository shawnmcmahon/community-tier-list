"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  TIER_CONFIG,
  MOCK_PLACED_ITEMS,
  MOCK_ITEMS,
  MOCK_VOTE_DISTRIBUTION,
  type Tier,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tierKeys: Tier[] = ["S", "A", "B", "C", "D"];
const totalVotes = Object.values(MOCK_VOTE_DISTRIBUTION).reduce(
  (a, b) => a + b,
  0
);

const stagedItem = MOCK_ITEMS[4]!;
const poolItems = MOCK_ITEMS.slice(5);

const neonTierColors: Record<Tier, { bar: string; glow: string }> = {
  S: { bar: "bg-amber-500", glow: "shadow-amber-500/30" },
  A: { bar: "bg-rose-500", glow: "shadow-rose-500/30" },
  B: { bar: "bg-violet-500", glow: "shadow-violet-500/30" },
  C: { bar: "bg-cyan-500", glow: "shadow-cyan-500/30" },
  D: { bar: "bg-gray-500", glow: "shadow-gray-500/30" },
};

export default function SessionPage() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00ff04_1px,transparent_1px),linear-gradient(to_bottom,#00ffff04_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white font-black text-xs"
            >
              TL
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-white">
                Best FPS Games of 2025
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>by StreamerKai</span>
                <span>&middot;</span>
                <span>24 items</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
              </span>
              <span className="text-fuchsia-400 font-bold tabular-nums">1,247</span>
              <span className="text-gray-600 hidden sm:inline">watching</span>
            </div>
            <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-sm shadow-emerald-500/10">
              ● Live
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1800px] px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <motion.div
              className="rounded-2xl border border-fuchsia-500/20 bg-gray-900/80 backdrop-blur p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    Now Voting
                  </h2>
                </div>
                <span className="text-xs text-gray-500 font-bold tabular-nums">
                  {totalVotes.toLocaleString()} votes cast
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-3 sm:w-48 shrink-0">
                  <div className="h-32 w-32 rounded-2xl bg-gray-800 border border-fuchsia-500/20 flex items-center justify-center shadow-lg shadow-fuchsia-500/5">
                    <span className="text-4xl font-black text-fuchsia-600/60">
                      {stagedItem.label[0]}
                    </span>
                  </div>
                  <span className="font-bold text-white text-center">
                    {stagedItem.label}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5">
                  {tierKeys.map((tier) => {
                    const count = MOCK_VOTE_DISTRIBUTION[tier];
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const colors = neonTierColors[tier];
                    return (
                      <div key={tier} className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-black text-sm bg-gray-800 border border-gray-700 ${TIER_CONFIG[tier].color}`}>
                          {tier}
                        </span>
                        <div className="flex-1">
                          <div className="h-8 w-full rounded-lg bg-gray-800/60 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-lg ${colors.bar} flex items-center px-2.5 shadow-md ${colors.glow}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                              {pct > 8 && (
                                <span className="text-xs font-black text-white">
                                  {pct}%
                                </span>
                              )}
                            </motion.div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right tabular-nums font-bold">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {tierKeys.map((tier) => (
                  <Button
                    key={tier}
                    variant={`tier_${tier.toLowerCase()}` as "tier_s" | "tier_a" | "tier_b" | "tier_c" | "tier_d"}
                    size="lg"
                    className="flex-1 min-w-[64px] rounded-xl font-black"
                  >
                    {tier}
                    <kbd className="ml-1.5 text-[10px] opacity-60 border border-white/20 rounded px-1">
                      {tierKeys.indexOf(tier) + 1}
                    </kbd>
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Streamer's Board */}
            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Streamer&apos;s Board
                </h3>
                <span className="text-xs text-gray-500 font-bold">
                  {MOCK_PLACED_ITEMS.length} placed
                </span>
              </div>
              <TierBoard items={MOCK_PLACED_ITEMS} />
            </motion.div>

            {/* Community Board */}
            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Community&apos;s Board
                </h3>
                <span className="text-xs text-gray-500 font-bold">
                  Based on {totalVotes.toLocaleString()} votes
                </span>
              </div>
              <TierBoard
                items={MOCK_PLACED_ITEMS.map((item, idx) => ({
                  ...item,
                  tier: tierKeys[
                    Math.min(4, Math.max(0, (tierKeys.indexOf(item.tier!) + (idx % 2 === 0 ? 1 : -1) + 5) % 5))
                  ],
                }))}
              />
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/60 sticky top-20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Item Pool
                </h3>
                <span className="text-xs text-gray-500 font-bold">
                  {poolItems.length} remaining
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {poolItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-800/40 p-3 hover:bg-fuchsia-900/20 hover:border-fuchsia-500/30 transition-colors cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  >
                    <div className="h-14 w-14 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
                      <span className="text-lg font-black text-gray-600">
                        {item.label[0]}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 text-center leading-tight truncate w-full font-medium">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TierBoard({
  items,
}: {
  items: { id: string; label: string; tier?: Tier }[];
}) {
  return (
    <div className="space-y-1.5">
      {tierKeys.map((tier) => {
        const config = TIER_CONFIG[tier];
        const colors = neonTierColors[tier];
        const tierItems = items.filter((i) => i.tier === tier);
        return (
          <div
            key={tier}
            className={cn(
              "flex items-stretch gap-0 rounded-xl border overflow-hidden min-h-[52px]",
              "border-gray-800 bg-gray-900/40"
            )}
          >
            <div
              className={cn(
                "flex w-14 shrink-0 items-center justify-center font-black text-lg border-r border-gray-800",
                config.color,
                `${colors.bar}/20`
              )}
              style={{ backgroundColor: `color-mix(in srgb, transparent, currentColor 10%)` }}
            >
              {tier}
            </div>
            <div className="flex flex-wrap items-center gap-2 p-2 flex-1">
              {tierItems.length === 0 && (
                <span className="text-xs text-gray-700 italic px-2">
                  Empty
                </span>
              )}
              {tierItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg bg-gray-800/60 border border-gray-700 px-3 py-1.5"
                >
                  <div className="h-6 w-6 rounded bg-gray-900 flex items-center justify-center text-xs font-black text-gray-500">
                    {item.label[0]}
                  </div>
                  <span className="text-xs font-semibold text-gray-300">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

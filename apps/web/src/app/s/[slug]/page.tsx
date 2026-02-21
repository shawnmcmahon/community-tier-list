"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function SessionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-900 font-bold text-xs"
            >
              TL
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold leading-tight">
                Best FPS Games of 2025
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>by StreamerKai</span>
                <span>&middot;</span>
                <span>24 items</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-medium">1,247</span>
              <span className="text-slate-500 hidden sm:inline">watching</span>
            </div>
            <Badge variant="live">Live</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Left: Tier Boards */}
          <div className="space-y-6">
            {/* Staged Item + Voting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                      </span>
                      <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                        Now Voting
                      </h2>
                    </div>
                    <span className="text-xs text-slate-500">
                      {totalVotes.toLocaleString()} votes cast
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Item Preview */}
                    <div className="flex flex-col items-center gap-3 sm:w-48 shrink-0">
                      <div className="h-32 w-32 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                        <span className="text-4xl font-bold text-slate-600">
                          {stagedItem.label[0]}
                        </span>
                      </div>
                      <span className="font-semibold text-white text-center">
                        {stagedItem.label}
                      </span>
                    </div>

                    {/* Vote Distribution */}
                    <div className="flex-1 space-y-2.5">
                      {tierKeys.map((tier) => {
                        const config = TIER_CONFIG[tier];
                        const count = MOCK_VOTE_DISTRIBUTION[tier];
                        const pct =
                          totalVotes > 0
                            ? Math.round((count / totalVotes) * 100)
                            : 0;
                        return (
                          <div key={tier} className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-md font-bold text-sm ${config.color} bg-white/5 border border-white/10`}
                            >
                              {tier}
                            </span>
                            <div className="flex-1">
                              <div className="h-7 w-full rounded-md bg-white/5 overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-md ${config.color.replace("text-", "bg-")} flex items-center px-2`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                  }}
                                >
                                  {pct > 8 && (
                                    <span className="text-xs font-semibold text-white">
                                      {pct}%
                                    </span>
                                  )}
                                </motion.div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500 w-12 text-right tabular-nums">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tierKeys.map((tier) => (
                      <Button
                        key={tier}
                        variant={
                          `tier_${tier.toLowerCase()}` as
                            | "tier_s"
                            | "tier_a"
                            | "tier_b"
                            | "tier_c"
                            | "tier_d"
                        }
                        size="lg"
                        className="flex-1 min-w-[64px]"
                      >
                        {tier}
                        <kbd className="ml-1.5 text-[10px] opacity-60 border border-white/20 rounded px-1">
                          {tierKeys.indexOf(tier) + 1}
                        </kbd>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Streamer's Board */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">
                      Streamer&apos;s Board
                    </CardTitle>
                    <span className="text-xs text-slate-500">
                      {MOCK_PLACED_ITEMS.length} placed
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <TierBoard items={MOCK_PLACED_ITEMS} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Board */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">
                      Community&apos;s Board
                    </CardTitle>
                    <span className="text-xs text-slate-500">
                      Based on {totalVotes.toLocaleString()} votes
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <TierBoard
                    items={MOCK_PLACED_ITEMS.map((item, idx) => ({
                      ...item,
                      tier: tierKeys[
                        Math.min(
                          4,
                          Math.max(
                            0,
                            (tierKeys.indexOf(item.tier!) +
                              (idx % 2 === 0 ? 1 : -1) +
                              5) %
                              5
                          )
                        )
                      ],
                    }))}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar: Item Pool */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card className="border-white/10 bg-white/5 sticky top-20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">
                      Item Pool
                    </CardTitle>
                    <span className="text-xs text-slate-500">
                      {poolItems.length} remaining
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {poolItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        className="group flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                      >
                        <div className="h-14 w-14 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center">
                          <span className="text-lg font-bold text-slate-600">
                            {item.label[0]}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 text-center leading-tight truncate w-full">
                          {item.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
        const tierItems = items.filter((i) => i.tier === tier);
        return (
          <div
            key={tier}
            className={cn(
              "flex items-stretch gap-0 rounded-lg border overflow-hidden min-h-[52px]",
              config.border,
              "bg-white/[0.02]"
            )}
          >
            <div
              className={cn(
                "flex w-14 shrink-0 items-center justify-center font-bold text-lg border-r",
                config.bg,
                config.border,
                config.color
              )}
            >
              {tier}
            </div>
            <div className="flex flex-wrap items-center gap-2 p-2 flex-1">
              {tierItems.length === 0 && (
                <span className="text-xs text-slate-600 italic px-2">
                  Empty
                </span>
              )}
              {tierItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1.5"
                >
                  <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                    {item.label[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-300">
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

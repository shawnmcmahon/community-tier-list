"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { io, type Socket } from "socket.io-client";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { TIER_CONFIG, TIERS, type Tier } from "@/lib/mock-data";
import { emptyVoteDistribution, type SessionItem, type SessionStatus, type TierPlacement, type VoteDistribution } from "@/lib/live-session";
import { cn } from "@/lib/utils";

const VOTER_KEY_STORAGE_KEY = "community-tier-list:voter-key";

const neonTierColors: Record<Tier, { bar: string; glow: string }> = {
  S: { bar: "bg-amber-500", glow: "shadow-amber-500/30" },
  A: { bar: "bg-rose-500", glow: "shadow-rose-500/30" },
  B: { bar: "bg-violet-500", glow: "shadow-violet-500/30" },
  C: { bar: "bg-cyan-500", glow: "shadow-cyan-500/30" },
  D: { bar: "bg-gray-500", glow: "shadow-gray-500/30" },
};

type SessionStatePayload = {
  sessionSlug: string;
  title: string;
  status: SessionStatus;
  voteWindowOpen: boolean;
  currentStagedItemId: string | null;
  updatedAt: number;
};

type VoteDistributionPayload = VoteDistribution & {
  itemId: string | null;
};

type PlacementWithItem = {
  id: string;
  label: string;
  imageUrl: string;
  tier?: Tier;
};

type LiveSessionClientProps = {
  sessionSlug: string;
  initialTitle: string;
  hostDisplayName?: string;
  initialStatus: SessionStatus;
  initialVoteWindowOpen: boolean;
  initialCurrentStagedItemId: string | null;
  initialViewerCount: number;
  initialItems: SessionItem[];
  initialStreamerPlacements: TierPlacement[];
  initialCommunityPlacements: TierPlacement[];
  initialDistribution: VoteDistribution;
  viewerTwitchUserId?: string;
  viewerDisplayName?: string;
};

function placementItems(
  placements: TierPlacement[],
  items: SessionItem[],
): PlacementWithItem[] {
  const itemMap = new Map(items.map((item) => [item._id, item]));

  return placements
    .slice()
    .sort((a, b) => a.position - b.position)
    .flatMap((placement) => {
      const item = itemMap.get(placement.itemId);
      if (!item) {
        return [];
      }

      return [
        {
          id: item._id,
          label: item.label,
          imageUrl: item.imageUrl,
          tier: placement.tier,
        },
      ];
    });
}

export function LiveSessionClient({
  sessionSlug,
  initialTitle,
  hostDisplayName,
  initialStatus,
  initialVoteWindowOpen,
  initialCurrentStagedItemId,
  initialViewerCount,
  initialItems,
  initialStreamerPlacements,
  initialCommunityPlacements,
  initialDistribution,
  viewerTwitchUserId,
  viewerDisplayName,
}: LiveSessionClientProps) {
  const socketRef = useRef<Socket | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SessionStatus>(initialStatus);
  const [voteWindowOpen, setVoteWindowOpen] = useState(initialVoteWindowOpen);
  const [currentStagedItemId, setCurrentStagedItemId] = useState<string | null>(initialCurrentStagedItemId);
  const [viewerCount] = useState(initialViewerCount);
  const [communityPlacements, setCommunityPlacements] = useState(initialCommunityPlacements);
  const [distribution, setDistribution] = useState<VoteDistribution>(initialDistribution);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const currentStagedItemIdRef = useRef<string | null>(initialCurrentStagedItemId);

  const stagedItem = useMemo(
    () => initialItems.find((item) => item._id === currentStagedItemId) ?? null,
    [currentStagedItemId, initialItems],
  );
  const poolItems = useMemo(
    () =>
      initialItems
        .filter((item) => item.status === "pool")
        .filter((item) => !initialStreamerPlacements.some((placement) => placement.itemId === item._id)),
    [initialItems, initialStreamerPlacements],
  );
  const streamerBoardItems = useMemo(
    () => placementItems(initialStreamerPlacements, initialItems),
    [initialItems, initialStreamerPlacements],
  );
  const communityBoardItems = useMemo(
    () => placementItems(communityPlacements, initialItems),
    [communityPlacements, initialItems],
  );

  useEffect(() => {
    currentStagedItemIdRef.current = currentStagedItemId;
  }, [currentStagedItemId]);

  useEffect(() => {
    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;
    if (!realtimeUrl) {
      setVoteMessage("Realtime URL is not configured.");
      return;
    }

    const socket = io(realtimeUrl, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      const storedVoterKey = window.localStorage.getItem(VOTER_KEY_STORAGE_KEY) ?? undefined;
      socket.emit(
        "session:join",
        {
          sessionSlug,
          twitchUserId: viewerTwitchUserId,
          voterKey: storedVoterKey,
        },
        (response: { ok: boolean; data?: { voterKey: string }; error?: string }) => {
          if (!response.ok) {
            setVoteMessage(response.error ?? "Unable to join session");
            return;
          }

          if (response.data?.voterKey) {
            window.localStorage.setItem(VOTER_KEY_STORAGE_KEY, response.data.voterKey);
          }
        },
      );
    });

    socket.on("session:state", (payload: SessionStatePayload) => {
      setTitle(payload.title);
      setStatus(payload.status);
      setVoteWindowOpen(payload.voteWindowOpen);
      setCurrentStagedItemId(payload.currentStagedItemId);
      if (!payload.currentStagedItemId) {
        setDistribution(emptyVoteDistribution());
      }
    });

    socket.on("votes:distribution", (payload: VoteDistributionPayload) => {
      if (!payload.itemId || payload.itemId === currentStagedItemIdRef.current) {
        setDistribution({
          S: payload.S,
          A: payload.A,
          B: payload.B,
          C: payload.C,
          D: payload.D,
          totalVotes: payload.totalVotes,
          avgScore: payload.avgScore,
        });
      }
    });

    socket.on("community:placements", (payload: TierPlacement[]) => {
      setCommunityPlacements(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionSlug, viewerTwitchUserId]);

  async function handleVote(tier: Tier) {
    if (!socketRef.current || !stagedItem) {
      return;
    }

    setIsSubmittingVote(true);
    setVoteMessage(null);

    const storedVoterKey = window.localStorage.getItem(VOTER_KEY_STORAGE_KEY) ?? undefined;
    socketRef.current.emit(
      "viewer:vote",
      {
        itemId: stagedItem._id,
        tier,
        voterKey: storedVoterKey,
        twitchUserId: viewerTwitchUserId,
      },
      (response: { ok: boolean; data?: { totalVotes: number }; error?: string }) => {
        setIsSubmittingVote(false);
        if (!response.ok) {
          setVoteMessage(response.error ?? "Vote failed");
          return;
        }

        setVoteMessage(`Vote submitted${viewerDisplayName ? ` for ${viewerDisplayName}` : ""}.`);
      },
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ff00ff04_1px,transparent_1px),linear-gradient(to_bottom,#00ffff04_1px,transparent_1px)] bg-[size:60px_60px]" />

      <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-600 to-pink-600 text-xs font-black text-white"
            >
              TL
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-white">{title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{hostDisplayName ? `by ${hostDisplayName}` : "community tier list"}</span>
                <span>&middot;</span>
                <span>{initialItems.length} items</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" />
              </span>
              <span className="font-bold tabular-nums text-fuchsia-400">{viewerCount.toLocaleString()}</span>
              <span className="hidden text-gray-600 sm:inline">joined</span>
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-bold uppercase shadow-sm",
                status === "live"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-emerald-500/10"
                  : status === "completed"
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
                    : "border-gray-400/30 bg-gray-400/10 text-gray-400",
              )}
            >
              {status === "live" ? "● " : null}
              {status}
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1800px] px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <motion.div
              className="rounded-2xl border border-fuchsia-500/20 bg-gray-900/80 p-6 backdrop-blur"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    Now Voting
                  </h2>
                </div>
                <span className="text-xs font-bold tabular-nums text-gray-500">
                  {distribution.totalVotes.toLocaleString()} votes cast
                </span>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex shrink-0 flex-col items-center gap-3 sm:w-48">
                  <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-gray-800 shadow-lg shadow-fuchsia-500/5">
                    <span className="text-4xl font-black text-fuchsia-600/60">
                      {stagedItem?.label[0] ?? "?"}
                    </span>
                  </div>
                  <span className="text-center font-bold text-white">
                    {stagedItem?.label ?? "Waiting for the host to stage the next item"}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5">
                  {TIERS.map((tier) => {
                    const count = distribution[tier];
                    const pct =
                      distribution.totalVotes > 0
                        ? Math.round((count / distribution.totalVotes) * 100)
                        : 0;
                    const colors = neonTierColors[tier];
                    return (
                      <div key={tier} className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-sm font-black ${TIER_CONFIG[tier].color}`}>
                          {tier}
                        </span>
                        <div className="flex-1">
                          <div className="h-8 w-full overflow-hidden rounded-lg bg-gray-800/60">
                            <motion.div
                              className={`flex h-full items-center rounded-lg px-2.5 shadow-md ${colors.bar} ${colors.glow}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                              {pct > 8 ? (
                                <span className="text-xs font-black text-white">{pct}%</span>
                              ) : null}
                            </motion.div>
                          </div>
                        </div>
                        <span className="w-12 text-right text-xs font-bold tabular-nums text-gray-500">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {TIERS.map((tier) => (
                  <Button
                    key={tier}
                    variant={`tier_${tier.toLowerCase()}` as "tier_s" | "tier_a" | "tier_b" | "tier_c" | "tier_d"}
                    size="lg"
                    className="min-w-[64px] flex-1 rounded-xl font-black"
                    disabled={!stagedItem || !voteWindowOpen || status !== "live" || isSubmittingVote}
                    onClick={() => handleVote(tier)}
                  >
                    {tier}
                    <kbd className="ml-1.5 rounded border border-white/20 px-1 text-[10px] opacity-60">
                      {TIERS.indexOf(tier) + 1}
                    </kbd>
                  </Button>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                {!voteWindowOpen || status !== "live"
                  ? "Voting is closed right now."
                  : voteMessage ?? "Vote with the buttons above."}
              </div>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Streamer&apos;s Board
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  {streamerBoardItems.length} placed
                </span>
              </div>
              <TierBoard items={streamerBoardItems} />
            </motion.div>

            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Community&apos;s Board
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  Based on {distribution.totalVotes.toLocaleString()} live votes
                </span>
              </div>
              <TierBoard items={communityBoardItems} />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              className="sticky top-20 rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Item Pool
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  {poolItems.length} remaining
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {poolItems.map((item, i) => (
                  <motion.div
                    key={item._id}
                    className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-800/40 p-3 transition-colors hover:border-fuchsia-500/30 hover:bg-fuchsia-900/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-700 bg-gray-900">
                      <span className="text-lg font-black text-gray-600">{item.label[0]}</span>
                    </div>
                    <span className="w-full truncate text-center text-[11px] font-medium leading-tight text-gray-500">
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
  items: PlacementWithItem[];
}) {
  return (
    <div className="space-y-1.5">
      {TIERS.map((tier) => {
        const config = TIER_CONFIG[tier];
        const colors = neonTierColors[tier];
        const tierItems = items.filter((item) => item.tier === tier);
        return (
          <div
            key={tier}
            className={cn(
              "flex min-h-[52px] items-stretch gap-0 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40",
            )}
          >
            <div
              className={cn(
                "flex w-14 shrink-0 items-center justify-center border-r border-gray-800 font-black text-lg",
                config.color,
                `${colors.bar}/20`,
              )}
              style={{ backgroundColor: "color-mix(in srgb, transparent, currentColor 10%)" }}
            >
              {tier}
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2 p-2">
              {tierItems.length === 0 ? (
                <span className="px-2 text-xs italic text-gray-700">Empty</span>
              ) : null}
              {tierItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-1.5"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-xs font-black text-gray-500">
                    {item.label[0]}
                  </div>
                  <span className="text-xs font-semibold text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useKeyboardVote } from "@/hooks/useKeyboardVote";
import { useMyBoard } from "@/hooks/useMyBoard";
import { useLiveSession } from "@/hooks/useLiveSession";
import {
  type SessionItem,
  type SessionStatus,
  type TierPlacement,
  type VoteDistribution,
} from "@/lib/live-session";
import { TIERS, type Tier } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tierColors: Record<Tier, { bar: string; glow: string }> = {
  S: { bar: "bg-tier-s", glow: "" }, A: { bar: "bg-tier-a", glow: "" },
  B: { bar: "bg-tier-b", glow: "" }, C: { bar: "bg-tier-c", glow: "" }, D: { bar: "bg-tier-d", glow: "" },
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
  initialItems: SessionItem[];
  initialStreamerPlacements: TierPlacement[];
  initialCommunityPlacements: TierPlacement[];
  initialDistribution: VoteDistribution;
  canHost: boolean;
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
  initialItems,
  initialStreamerPlacements,
  initialCommunityPlacements,
  initialDistribution,
  canHost,
}: LiveSessionClientProps) {
  const {
    title, status, voteWindowOpen, currentStagedItemId, items,
    streamerPlacements, communityPlacements, distribution, viewerCount, recentJoins,
    connectionState, connectionError, hostError, isWorking, voteMessage, isSubmittingVote,
    setLive, complete, stageItem, unstageItem, openVoting, closeVoting, finalizeItem,
    addItems, importTierMaker, submitVote: castVote,
  } = useLiveSession(sessionSlug, {
    title: initialTitle, status: initialStatus, voteWindowOpen: initialVoteWindowOpen,
    currentStagedItemId: initialCurrentStagedItemId, items: initialItems,
    streamerPlacements: initialStreamerPlacements, communityPlacements: initialCommunityPlacements,
    distribution: initialDistribution,
  });
  const hostReady = canHost && connectionState === "connected";
  const { placements: myPlacements, recordVote } = useMyBoard(sessionSlug, items);
  async function submitVote(tier: Tier) {
    const vote = await castVote(tier);
    if (vote) recordVote(vote.itemId, vote.tier);
  }

  const [newItemsText, setNewItemsText] = useState("");
  const [tierMakerUrl, setTierMakerUrl] = useState("");
  const [hostNotice, setHostNotice] = useState<string | null>(null);
  const interactionError = connectionError;
  const stagedItem = useMemo(
    () => items.find((item) => item._id === currentStagedItemId) ?? null,
    [currentStagedItemId, items],
  );
  const poolItems = useMemo(
    () =>
      items
        .filter((item) => item.status === "pool")
        .filter((item) => !streamerPlacements.some((placement) => placement.itemId === item._id)),
    [items, streamerPlacements],
  );
  const streamerBoardItems = useMemo(
    () => placementItems(streamerPlacements, items),
    [items, streamerPlacements],
  );
  const myBoardItems = useMemo(
    () => placementItems(myPlacements, items),
    [myPlacements, items],
  );
  const communityBoardItems = useMemo(
    () => placementItems(communityPlacements, items),
    [communityPlacements, items],
  );

  useKeyboardVote({
    enabled: Boolean(stagedItem) && voteWindowOpen && status === "live" && !isSubmittingVote && connectionState === "connected",
    onVote: submitVote,
  });

  async function handleAddItems() {
    const labels = newItemsText
      .split("\n")
      .map((label) => label.trim())
      .filter(Boolean);

    if (labels.length === 0) {
      return;
    }

    try {
      setHostNotice(null);
      const nextItems = await addItems(labels);
      if (!nextItems) {
        return;
      }
      setNewItemsText("");
      setHostNotice(`Added ${labels.length} item${labels.length === 1 ? "" : "s"} to the pool.`);
    } catch {}
  }

  async function handleTierMakerImport() {
    const nextUrl = tierMakerUrl.trim();
    if (!nextUrl) {
      return;
    }

    try {
      setHostNotice(null);
      const payload = await importTierMaker(nextUrl);
      if (!payload) {
        return;
      }

      setTierMakerUrl("");
      setHostNotice(
        payload.importTitle
          ? `Imported ${payload.importedCount} items from ${payload.importTitle}.`
          : `Imported ${payload.importedCount} TierMaker items.`,
      );
    } catch {}
  }

  return (
    <div className="relative min-h-screen bg-black text-white">


      <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-tier-s text-xs font-black text-gray-950"
            >
              TL
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-white">{title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{hostDisplayName ? `by ${hostDisplayName}` : "community tier list"}</span>
                <span>&middot;</span>
                <span>{items.length} items</span>
                {recentJoins[0] ? (
                  <>
                    <span>&middot;</span>
                    <span>latest: {recentJoins[0]}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => { void navigator.clipboard.writeText(window.location.href).then(() => setHostNotice("Session link copied.")).catch(() => setHostNotice("Copy the session URL from your address bar.")); }}>Share session</Button>
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="font-bold tabular-nums text-amber-400">
                {viewerCount.toLocaleString()}
              </span>
              <span className="hidden text-gray-400 sm:inline">online</span>
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-bold uppercase shadow-sm",
                status === "live"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-emerald-500/10"
                  : status === "completed"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-400/30 bg-gray-400/10 text-gray-400",
              )}
            >
              {status}
            </span>
          </div>
        </div>
      </header>

      {hostNotice && !canHost ? <p role="status" className="px-4 pt-4 text-sm text-emerald-300">{hostNotice}</p> : null}
      {hostNotice && !canHost ? <p role="status" className="px-4 pt-4 text-sm text-emerald-300">{hostNotice}</p> : null}
      <main className="relative mx-auto max-w-[1800px] px-4 py-6 lg:px-6">
        <h1 className="mb-5 text-xl font-bold sm:hidden">{title}</h1>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {canHost ? (
              <HostControlPanel
                canHost={canHost}
                hostReady={hostReady}
                hostError={hostError}
                isWorking={isWorking}
                hostNotice={hostNotice}
                newItemsText={newItemsText}
                setNewItemsText={setNewItemsText}
                tierMakerUrl={tierMakerUrl}
                setTierMakerUrl={setTierMakerUrl}
                status={status}
                stagedItem={stagedItem}
                poolItems={poolItems}
                voteWindowOpen={voteWindowOpen}
                onAddItems={handleAddItems}
                onImportTierMaker={handleTierMakerImport}
                onSetLive={() => void setLive()}
                onComplete={() => void complete()}
                onStageItem={(itemId) => void stageItem(itemId)}
                onUnstage={() => void unstageItem()}
                onOpenVoting={() => void openVoting()}
                onCloseVoting={() => void closeVoting()}
                onFinalize={(tier) => void finalizeItem(tier)}
              />
            ) : null}

            {connectionState !== "connected" || interactionError ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
              >
                {interactionError ??
                  (connectionState === "reconnecting"
                    ? "Reconnecting to the live session..."
                    : connectionState === "disconnected"
                      ? "Live connection is offline."
                      : "Connecting to the live session...")}
              </div>
            ) : null}

            {status === "completed" ? (
              <section className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
                <h2 className="text-xl font-bold text-tier-d">Session complete</h2>
                <p className="mt-2 text-sm text-gray-300">The final rankings are saved. Compare the streamer and community boards below.</p>
              </section>
            ) : <motion.div
              className="rounded-2xl border border-amber-500/20 bg-gray-900/80 p-6 backdrop-blur"
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
                  <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-amber-500/20 bg-gray-800 shadow-lg shadow-amber-500/5">
                    <ItemImage key={stagedItem?._id ?? "waiting"} imageUrl={stagedItem?.imageUrl} label={stagedItem?.label ?? "Waiting"} className="h-full w-full rounded-2xl" />
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
                    const colors = tierColors[tier];
                    return (
                      <div key={tier} className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black ${colors.bar} text-gray-950`}
                        >
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
                                <span className="text-xs font-black text-gray-950">{pct}%</span>
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
                    variant={
                      `tier_${tier.toLowerCase()}` as
                        | "tier_s"
                        | "tier_a"
                        | "tier_b"
                        | "tier_c"
                        | "tier_d"
                    }
                    size="lg"
                    className="min-w-[64px] flex-1 rounded-xl font-black"
                    disabled={
                      !stagedItem ||
                      !voteWindowOpen ||
                      status !== "live" ||
                      isSubmittingVote ||
                      Boolean(interactionError) || connectionState !== "connected"
                    }
                    onClick={() => submitVote(tier)}
                    aria-label={`Vote ${tier} tier`}
                  >
                    {tier}
                    <kbd className="ml-1.5 rounded border border-white/20 px-1 text-[10px] opacity-60">
                      {TIERS.indexOf(tier) + 1}
                    </kbd>
                  </Button>
                ))}
              </div>

              <div role="status" aria-live="polite" className="mt-4 text-sm text-gray-400">
                {interactionError ??
                  (!voteWindowOpen || status !== "live"
                    ? "Voting is closed right now."
                    : voteMessage ?? "Vote with the buttons above or use 1-5 / S-A-B-C-D.")}
              </div>
            </motion.div>}

            {!canHost ? (
              <motion.div
                className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    My Board
                  </h3>
                  <span className="text-xs font-bold text-gray-500">
                    {myBoardItems.length} voted
                  </span>
                </div>
                <TierBoard items={myBoardItems} />
              </motion.div>
            ) : null}

            <motion.div
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: canHost ? 0.1 : 0.2 }}
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
              transition={{ duration: 0.4, delay: canHost ? 0.2 : 0.3 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-black uppercase tracking-wider text-white">
                  Community&apos;s Board
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  {status === "completed" ? "Final audience rankings" : "Ranked when each item is finalized"}
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
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-800/40 p-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-700 bg-gray-900">
                      <ItemImage imageUrl={item.imageUrl} label={item.label} className="h-full w-full rounded-lg" />
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

function HostControlPanel({
  canHost,
  hostReady,
  hostError,
  isWorking,
  hostNotice,
  newItemsText,
  setNewItemsText,
  tierMakerUrl,
  setTierMakerUrl,
  status,
  stagedItem,
  poolItems,
  voteWindowOpen,
  onAddItems,
  onImportTierMaker,
  onSetLive,
  onComplete,
  onStageItem,
  onUnstage,
  onOpenVoting,
  onCloseVoting,
  onFinalize,
}: {
  canHost: boolean;
  hostReady: boolean;
  hostError: string | null;
  isWorking: boolean;
  hostNotice: string | null;
  newItemsText: string;
  setNewItemsText: (value: string) => void;
  tierMakerUrl: string;
  setTierMakerUrl: (value: string) => void;
  status: SessionStatus;
  stagedItem: SessionItem | null;
  poolItems: SessionItem[];
  voteWindowOpen: boolean;
  onAddItems: () => void;
  onImportTierMaker: () => void;
  onSetLive: () => void;
  onComplete: () => void;
  onStageItem: (itemId: string) => void;
  onUnstage: () => void;
  onOpenVoting: () => void;
  onCloseVoting: () => void;
  onFinalize: (tier: Tier) => void;
}) {
  if (!canHost) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-amber-200">
            Host Controls
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {hostError ??
              (hostReady ? "Host controls ready." : "Connecting host controls...")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!hostReady || isWorking || status !== "draft"} onClick={onSetLive}>
            Go Live
          </Button>
          <Button disabled={!hostReady || isWorking || status === "completed"} onClick={onComplete} variant="secondary">
            Complete
          </Button>
        </div>
      </div>

      {hostNotice ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        >
          {hostNotice}
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Add Items
          </h3>
          <textarea
            aria-label="Item labels"
            value={newItemsText}
            onChange={(event) => setNewItemsText(event.target.value)}
            placeholder={"One item label per line"}
            className="min-h-32 w-full rounded-xl border border-gray-800 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-gray-600"
          />
          <Button disabled={isWorking || status === "completed" || !newItemsText.trim()} onClick={onAddItems}>
            Add To Pool
          </Button>
          <div className="rounded-xl border border-gray-800 bg-black/30 p-3">
            <label
              htmlFor="tiermaker-url"
              className="text-xs font-bold uppercase tracking-wider text-gray-400"
            >
              Import From TierMaker
            </label>
            <input
              id="tiermaker-url"
              value={tierMakerUrl}
              onChange={(event) => setTierMakerUrl(event.target.value)}
              placeholder="https://tiermaker.com/create/..."
              className="mt-2 h-11 w-full rounded-xl border border-gray-800 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-gray-600"
            />
            <p className="mt-2 text-xs text-gray-500">
              Use a direct template URL. If TierMaker blocks automation, fall back to manual labels above.
            </p>
            <Button
              className="mt-3"
              disabled={isWorking || status === "completed" || tierMakerUrl.trim().length === 0}
              onClick={onImportTierMaker}
              variant="secondary"
            >
              Import TierMaker
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Stage Item
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {poolItems.length === 0 ? (
                <span className="text-sm text-gray-500">No pool items yet.</span>
              ) : null}
              {poolItems.map((item) => (
                <Button
                  key={item._id}
                  disabled={!hostReady || isWorking || status !== "live" || Boolean(stagedItem)}
                  onClick={() => onStageItem(item._id)}
                  variant="secondary"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Active Item
            </h3>
            <p className="mt-2 text-sm text-white">
              {stagedItem ? stagedItem.label : "No item staged"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                disabled={!hostReady || isWorking || !stagedItem || voteWindowOpen}
                onClick={onOpenVoting}
              >
                Open Voting
              </Button>
              <Button
                disabled={!hostReady || isWorking || !stagedItem || !voteWindowOpen}
                onClick={onCloseVoting}
                variant="secondary"
              >
                Close Voting
              </Button>
              <Button
                disabled={!hostReady || isWorking || !stagedItem}
                onClick={onUnstage}
                variant="secondary"
              >
                Unstage
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIERS.map((tier) => (
                <Button
                  key={tier}
                  disabled={!hostReady || isWorking || !stagedItem}
                  onClick={() => onFinalize(tier)}
                  variant="secondary"
                  aria-label={`Finalize staged item as ${tier} tier`}
                >
                  Finalize {tier}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
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
        const colors = tierColors[tier];
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
                "text-gray-950",
                colors.bar,
              )}
            >
              {tier}
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2 p-2">
              {tierItems.length === 0 ? (
                <span className="px-2 text-xs italic text-gray-500">Empty</span>
              ) : null}
              {tierItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-1.5"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-xs font-black text-gray-500">
                    <ItemImage imageUrl={item.imageUrl} label={item.label} className="h-full w-full rounded" />
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

function ItemImage({ imageUrl, label, className }: { imageUrl?: string; label: string; className: string }) {
  const [failed, setFailed] = useState(false);
  return imageUrl && imageUrl !== "/placeholder.svg" && !failed ? (
    // TierMaker image hosts vary; use a native image with a graceful fallback.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={label} className={cn("object-cover", className)} loading="lazy" onError={() => setFailed(true)} />
  ) : <span className={cn("flex items-center justify-center bg-gray-800 font-black text-gray-300", className)}>{label[0]}</span>;
}

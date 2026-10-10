"use client";

import { useEffect, useRef, useState } from "react";
import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { SessionItem, SessionStatus, TierPlacement, VoteDistribution } from "@/lib/live-session";
import type { Tier } from "@/lib/mock-data";

type Snapshot = {
  title: string; status: SessionStatus; voteWindowOpen: boolean;
  currentStagedItemId: string | null; items: SessionItem[];
  streamerPlacements: TierPlacement[]; communityPlacements: TierPlacement[];
  distribution: VoteDistribution;
};

export function useLiveSession(slug: string, initial: Snapshot) {
  const [state, setState] = useState(initial);
  const [presence, setPresence] = useState({ viewerCount: 0, recentJoins: [] as string[] });
  const [connectionState, setConnectionState] = useState("connecting");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [hostError, setHostError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const working = useRef(false);
  const submitting = useRef(false);

  async function post(body: Record<string, unknown>, endpoint = "/api/live") {
    const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, sessionSlug: slug, ...body }), signal: AbortSignal.timeout(15_000) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Unable to update the session.");
    return payload;
  }

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) { setConnectionState("disconnected"); setConnectionError("Live sessions are not configured."); return; }
    const client = new ConvexClient(url);
    const connectionId = crypto.randomUUID();
    let active = true;
    let heartbeatPending = false;
    const onError = () => { if (active) setConnectionError("Unable to sync the live session. Please reconnect."); };
    client.onUpdate(api.live.snapshot, { slug }, snapshot => {
      if (!active) return;
      if (snapshot) { setState(current => ({ ...current, ...snapshot })); setConnectionError(null); }
      else setConnectionError("This session could not be found.");
    }, onError);
    client.onUpdate(api.live.distribution, { slug }, distribution => {
      if (active) setState(current => ({ ...current, distribution }));
    }, onError);
    client.onUpdate(api.live.presence, { slug }, value => { if (active) setPresence(value); }, onError);
    const unsubscribe = client.subscribeToConnectionState(value => { if (active) setConnectionState(value.isWebSocketConnected ? "connected" : "reconnecting"); });
    const heartbeat = async () => {
      if (heartbeatPending || document.visibilityState === "hidden") return;
      heartbeatPending = true;
      try { await post({ action: "presence", connectionId, leave: false }); }
      catch { /* The next heartbeat retries; the lease expires after a disconnect. */ }
      finally { heartbeatPending = false; }
    };
    void heartbeat();
    const timer = window.setInterval(() => void heartbeat(), 45_000);
    const onVisibility = () => { if (document.visibilityState === "visible") void heartbeat(); };
    const leave = () => { void fetch("/api/live", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, action: "presence", connectionId, leave: true }), keepalive: true }).catch(() => {}); };
    window.addEventListener("pagehide", leave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false; clearInterval(timer); unsubscribe(); void client.close(); leave();
      window.removeEventListener("pagehide", leave); document.removeEventListener("visibilitychange", onVisibility);
    };
    // The subscription and presence lease belong to this session only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function run<T>(work: () => Promise<T>) {
    if (working.current) return null;
    working.current = true; setIsWorking(true); setHostError(null);
    try { return await work(); }
    catch (error) { setHostError(error instanceof Error ? error.message : "Unable to update the session."); return null; }
    finally { working.current = false; setIsWorking(false); }
  }
  const command = (command: string, extra = {}) => run(() => post({ action: "host", command, ...extra }));
  return {
    ...state, ...presence, connectionState, connectionError, hostError, isWorking, voteMessage, isSubmittingVote,
    setLive: () => command("start"), complete: () => command("complete"),
    stageItem: (itemId: string) => command("stage", { itemId }), unstageItem: () => command("unstage"),
    openVoting: () => command("open"), closeVoting: () => command("close"),
    finalizeItem: (tier: Tier) => command("finalize", { tier }),
    addItems: (labels: string[]) => run(async () => (await post({ labels }, "/api/session-items")).items as SessionItem[]),
    importTierMaker: (tiermakerUrl: string) => run(() => post({ tiermakerUrl }, "/api/tiermaker-import")),
    submitVote: async (tier: Tier) => {
      if (submitting.current || !state.currentStagedItemId || !state.voteWindowOpen || state.status !== "live") return null;
      const itemId = state.currentStagedItemId;
      submitting.current = true; setIsSubmittingVote(true); setVoteMessage(null);
      try { await post({ action: "vote", itemId, tier }); setVoteMessage(`Your ${tier} vote is counted. You can change it while voting is open.`); return { itemId, tier }; }
      catch (error) { setVoteMessage(error instanceof Error ? error.message : "Unable to vote."); return null; }
      finally { submitting.current = false; setIsSubmittingVote(false); }
    },
  };
}

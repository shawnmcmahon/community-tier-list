import { v, ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireServerSecret } from "./lib/server_auth";
import { validateHostCommand, validateVote, type HostCommand } from "./lib/live_rules";
import { tierValidator } from "./lib/validators";
import { avgToTier, summarizeTierVotes, TIER_ORDER, TIER_TO_SCORE } from "./lib/scoring";

export const snapshot = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const session = await ctx.db.query("sessions").withIndex("by_slug", q => q.eq("slug", slug)).unique();
    if (!session) return null;
    const [items, streamerPlacements, communityPlacements] = await Promise.all([
      ctx.db.query("items").withIndex("by_sessionId", q => q.eq("sessionId", session._id)).collect(),
      ctx.db.query("streamerPlacements").withIndex("by_sessionId", q => q.eq("sessionId", session._id)).collect(),
      ctx.db.query("communityPlacements").withIndex("by_sessionId", q => q.eq("sessionId", session._id)).collect(),
    ]);
    return {
      title: session.title, status: session.status, voteWindowOpen: session.voteWindowOpen,
      currentStagedItemId: session.currentStagedItemId ?? null,
      items: items.sort((a, b) => a.orderIndex - b.orderIndex),
      streamerPlacements, communityPlacements,
    };
  },
});

// Vote updates send a tiny tally, not the entire item pool and boards.
export const distribution = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const session = await ctx.db.query("sessions").withIndex("by_slug", q => q.eq("slug", slug)).unique();
    const empty = { S: 0, A: 0, B: 0, C: 0, D: 0, totalVotes: 0, avgScore: null as number | null };
    if (!session?.currentStagedItemId) return empty;
    const tally = await ctx.db.query("voteTallies").withIndex("by_item", q => q.eq("itemId", session.currentStagedItemId!)).unique();
    if (tally) return { S: tally.S, A: tally.A, B: tally.B, C: tally.C, D: tally.D, totalVotes: tally.totalVotes, avgScore: tally.totalVotes ? tally.totalScore / tally.totalVotes : null };
    // Existing sessions retain their votes during the migration.
    const votes = await ctx.db.query("votes").withIndex("by_itemId", q => q.eq("itemId", session.currentStagedItemId!)).collect();
    const summary = summarizeTierVotes(votes.map(vote => vote.tier));
    return { ...summary.distribution, totalVotes: summary.totalVotes, avgScore: summary.avgScore };
  },
});

export const command = mutation({
  args: {
    serverSecret: v.string(), slug: v.string(), hostTwitchUserId: v.string(),
    command: v.union(...["start", "complete", "stage", "unstage", "open", "close", "finalize"].map(c => v.literal(c as HostCommand))),
    itemId: v.optional(v.id("items")), tier: v.optional(tierValidator),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret);
    const session = await ctx.db.query("sessions").withIndex("by_slug", q => q.eq("slug", args.slug)).unique();
    if (!session) throw new ConvexError("Session not found.");
    const host = await ctx.db.get(session.hostUserId);
    if (host?.twitchUserId !== args.hostTwitchUserId) throw new ConvexError("Forbidden");
    const item = args.itemId ? await ctx.db.get(args.itemId) : null;
    try { validateHostCommand(args.command, session, item, session._id, args.tier); }
    catch (error) { throw new ConvexError((error as Error).message); }
    const now = Date.now();
    if (args.command === "start") await ctx.db.patch(session._id, { status: "live", updatedAt: now });
    if (args.command === "stage" && item) {
      await ctx.db.patch(item._id, { status: "staged" });
      await ctx.db.patch(session._id, { currentStagedItemId: item._id, voteWindowOpen: false, updatedAt: now });
    }
    if (args.command === "open" || args.command === "close") {
      await ctx.db.patch(session._id, { voteWindowOpen: args.command === "open", updatedAt: now });
    }
    if (args.command === "finalize" && session.currentStagedItemId && args.tier) {
      const itemId = session.currentStagedItemId;
      const previous = await ctx.db.query("streamerPlacements").withIndex("by_sessionId_itemId", q => q.eq("sessionId", session._id).eq("itemId", itemId)).unique();
      const tierPlacements = await ctx.db.query("streamerPlacements").withIndex("by_sessionId", q => q.eq("sessionId", session._id)).collect();
      const position = tierPlacements.filter(p => p.tier === args.tier).length;
      if (previous) await ctx.db.patch(previous._id, { tier: args.tier, position });
      else await ctx.db.insert("streamerPlacements", { sessionId: session._id, itemId, tier: args.tier, position });
      const votes = await ctx.db.query("votes").withIndex("by_itemId", q => q.eq("itemId", itemId)).collect();
      const summary = summarizeTierVotes(votes.map(vote => vote.tier));
      // An unvoted item has no community ranking, rather than an invented D vote.
      if (summary.avgScore !== null) {
        const tier = avgToTier(summary.avgScore)!;
        const previousCommunity = await ctx.db.query("communityPlacements").withIndex("by_sessionId_itemId", q => q.eq("sessionId", session._id).eq("itemId", itemId)).unique();
        const value = { avgScore: summary.avgScore, totalVotes: summary.totalVotes, tier, computedAt: now };
        if (previousCommunity) await ctx.db.patch(previousCommunity._id, value);
        else await ctx.db.insert("communityPlacements", { sessionId: session._id, itemId, position: 0, ...value });
        const community = await ctx.db.query("communityPlacements").withIndex("by_sessionId", q => q.eq("sessionId", session._id)).collect();
        for (const tier of TIER_ORDER) {
          const ordered = community.filter(p => p.tier === tier).sort((a, b) => b.avgScore - a.avgScore || a.computedAt - b.computedAt);
          for (const [position, placement] of ordered.entries()) await ctx.db.patch(placement._id, { position });
        }
      }
      await ctx.db.patch(itemId, { status: "placed" });
      await ctx.db.patch(session._id, { currentStagedItemId: undefined, voteWindowOpen: false, updatedAt: now });
    }
    if (args.command === "unstage" || args.command === "complete") {
      if (session.currentStagedItemId) await ctx.db.patch(session.currentStagedItemId, { status: "pool" });
      await ctx.db.patch(session._id, {
        currentStagedItemId: undefined, voteWindowOpen: false, updatedAt: now,
        ...(args.command === "complete" ? { status: "completed" as const } : {}),
      });
    }
    return { ok: true };
  },
});

export const vote = mutation({
  args: { serverSecret: v.string(), slug: v.string(), itemId: v.id("items"), voterKey: v.string(), tier: tierValidator },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret);
    const session = await ctx.db.query("sessions").withIndex("by_slug", q => q.eq("slug", args.slug)).unique();
    if (!session) throw new ConvexError("Session not found.");
    try { validateVote(session, args.itemId); } catch (error) { throw new ConvexError((error as Error).message); }
    const previous = await ctx.db.query("votes").withIndex("by_itemId_voterKey", q => q.eq("itemId", args.itemId).eq("voterKey", args.voterKey)).unique();
    if (previous && Date.now() - previous.castAt < 500) throw new ConvexError("Please wait a moment before voting again.");
    const existingTally = await ctx.db.query("voteTallies").withIndex("by_item", q => q.eq("itemId", args.itemId)).unique();
    let tally;
    if (existingTally) {
      tally = { S: existingTally.S, A: existingTally.A, B: existingTally.B, C: existingTally.C, D: existingTally.D, totalVotes: existingTally.totalVotes, totalScore: existingTally.totalScore };
    } else {
      const votes = await ctx.db.query("votes").withIndex("by_itemId", q => q.eq("itemId", args.itemId)).collect();
      const summary = summarizeTierVotes(votes.map(vote => vote.tier));
      tally = { ...summary.distribution, totalVotes: summary.totalVotes, totalScore: (summary.avgScore ?? 0) * summary.totalVotes };
    }
    if (previous) { tally[previous.tier] -= 1; tally.totalScore -= TIER_TO_SCORE[previous.tier]; }
    else tally.totalVotes += 1;
    tally[args.tier] += 1; tally.totalScore += TIER_TO_SCORE[args.tier];
    if (existingTally) await ctx.db.patch(existingTally._id, tally);
    else await ctx.db.insert("voteTallies", { itemId: args.itemId, ...tally });
    if (previous) await ctx.db.patch(previous._id, { tier: args.tier, castAt: Date.now() });
    else await ctx.db.insert("votes", { sessionId: session._id, itemId: args.itemId, voterKey: args.voterKey, tier: args.tier, castAt: Date.now() });
    return { ok: true };
  },
});

export const presence = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const session = await ctx.db.query("sessions").withIndex("by_slug", q => q.eq("slug", slug)).unique();
    if (!session) return { viewerCount: 0, recentJoins: [] };
    const rows = await ctx.db.query("connections").withIndex("by_session", q => q.eq("sessionId", session._id)).collect();
    const unique = new Map(rows.sort((a, b) => a.joinedAt - b.joinedAt).map(row => [row.voterKey, row.displayName]));
    return { viewerCount: unique.size, recentJoins: [...unique.values()].reverse().slice(0, 3) };
  },
});

export const heartbeat = mutation({
  args: { serverSecret: v.string(), slug: v.string(), voterKey: v.string(), connectionId: v.string(), displayName: v.string(), leave: v.boolean() },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret);
    const session = await ctx.db.query("sessions").withIndex("by_slug", q => q.eq("slug", args.slug)).unique();
    if (!session) throw new ConvexError("Session not found.");
    const previous = await ctx.db.query("connections").withIndex("by_connection", q => q.eq("connectionId", args.connectionId)).unique();
    if (previous && previous.voterKey !== args.voterKey) throw new ConvexError("Forbidden");
    if (!args.leave && previous && Date.now() - previous._creationTime < 10_000) return;
    if (!args.leave && !previous) {
      const connections = await ctx.db.query("connections").withIndex("by_actor", q => q.eq("sessionId", session._id).eq("voterKey", args.voterKey)).collect();
      if (connections.length >= 5) throw new ConvexError("Too many open session tabs. Close one and retry.");
    }
    if (previous) { await ctx.scheduler.cancel(previous.expirationJob); await ctx.db.delete(previous._id); }
    if (args.leave) return;
    const expirationJob = await ctx.scheduler.runAfter(90_000, internal.live.expireConnection, { connectionId: args.connectionId });
    await ctx.db.insert("connections", { sessionId: session._id, voterKey: args.voterKey, connectionId: args.connectionId, displayName: args.displayName.slice(0, 80), joinedAt: previous?.joinedAt ?? Date.now(), expirationJob });
    const participant = await ctx.db.query("participation").withIndex("by_sessionId_twitchUserId", q => q.eq("sessionId", session._id).eq("twitchUserId", args.voterKey)).unique();
    if (!participant) await ctx.db.insert("participation", { sessionId: session._id, twitchUserId: args.voterKey, joinedAt: Date.now() });
  },
});

export const expireConnection = internalMutation({
  args: { connectionId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db.query("connections").withIndex("by_connection", q => q.eq("connectionId", args.connectionId)).unique();
    if (row) await ctx.db.delete(row._id);
  },
});

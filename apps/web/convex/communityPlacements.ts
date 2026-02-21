import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { avgToTier, summarizeTierVotes, TIER_ORDER, type Tier } from "./lib/scoring";

export const computeForItem = mutation({
  args: {
    sessionId: v.id("sessions"),
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const itemVotes = await ctx.db
      .query("votes")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    const summary = summarizeTierVotes(itemVotes.map((vote) => vote.tier as Tier));
    const tier = avgToTier(summary.avgScore) ?? "D";
    const avgScore = summary.avgScore ?? 0;

    const existingForItem = await ctx.db
      .query("communityPlacements")
      .withIndex("by_sessionId_itemId", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .first();

    const computedAt = Date.now();

    if (existingForItem) {
      await ctx.db.patch(existingForItem._id, {
        avgScore,
        totalVotes: summary.totalVotes,
        tier,
        computedAt,
      });
    } else {
      await ctx.db.insert("communityPlacements", {
        sessionId: args.sessionId,
        itemId: args.itemId,
        avgScore,
        totalVotes: summary.totalVotes,
        tier,
        position: 0,
        computedAt,
      });
    }

    const sessionPlacements = await ctx.db
      .query("communityPlacements")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const tierLabel of TIER_ORDER) {
      const tierPlacements = sessionPlacements
        .filter((placement) => placement.tier === tierLabel)
        .sort((a, b) => b.avgScore - a.avgScore);

      for (const [position, placement] of tierPlacements.entries()) {
        await ctx.db.patch(placement._id, { position });
      }
    }

    return ctx.db
      .query("communityPlacements")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const listBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("communityPlacements")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { summarizeTierVotes, type Tier } from "./lib/scoring";
import { tierValidator } from "./lib/validators";

export const upsert = mutation({
  args: {
    sessionId: v.id("sessions"),
    itemId: v.id("items"),
    voterKey: v.string(),
    tier: tierValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_itemId_voterKey", (q) => q.eq("itemId", args.itemId))
      .filter((q) => q.eq(q.field("voterKey"), args.voterKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tier: args.tier,
        castAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("votes", {
      sessionId: args.sessionId,
      itemId: args.itemId,
      voterKey: args.voterKey,
      tier: args.tier,
      castAt: Date.now(),
    });
  },
});

export const distributionByItem = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .collect();

    return summarizeTierVotes(votes.map((vote) => vote.tier as Tier));
  },
});

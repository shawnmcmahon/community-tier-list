import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    twitchUserId: v.string(),
    sessionId: v.id("sessions"),
    lastVotedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("participation")
      .withIndex("by_sessionId_twitchUserId", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("twitchUserId"), args.twitchUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastVotedAt: args.lastVotedAt ?? existing.lastVotedAt,
      });
      return existing._id;
    }

    return ctx.db.insert("participation", {
      twitchUserId: args.twitchUserId,
      sessionId: args.sessionId,
      joinedAt: now,
      lastVotedAt: args.lastVotedAt,
    });
  },
});

export const historyByTwitchUser = query({
  args: { twitchUserId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("participation")
      .withIndex("by_twitchUserId", (q) => q.eq("twitchUserId", args.twitchUserId))
      .collect();
  },
});

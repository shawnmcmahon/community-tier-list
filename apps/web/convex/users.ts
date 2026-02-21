import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertFromAuth = mutation({
  args: {
    twitchUserId: v.string(),
    twitchDisplayName: v.string(),
    twitchProfileImageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("creator"), v.literal("viewer"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_twitchUserId", (q) => q.eq("twitchUserId", args.twitchUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        twitchDisplayName: args.twitchDisplayName,
        twitchProfileImageUrl: args.twitchProfileImageUrl,
        role: args.role ?? existing.role,
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      twitchUserId: args.twitchUserId,
      twitchDisplayName: args.twitchDisplayName,
      twitchProfileImageUrl: args.twitchProfileImageUrl,
      role: args.role ?? "creator",
      createdAt: now,
    });
  },
});

export const getByTwitchUserId = query({
  args: { twitchUserId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_twitchUserId", (q) => q.eq("twitchUserId", args.twitchUserId))
      .first();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => ctx.db.get(args.userId),
});

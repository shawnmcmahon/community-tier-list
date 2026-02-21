import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { upsertAndRenumberPlacements } from "./lib/placement";
import { tierValidator } from "./lib/validators";

export const upsert = mutation({
  args: {
    sessionId: v.id("sessions"),
    itemId: v.id("items"),
    tier: tierValidator,
    targetPosition: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const placements = await ctx.db
      .query("streamerPlacements")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const normalized = upsertAndRenumberPlacements(placements, {
      itemId: args.itemId,
      tier: args.tier,
      targetPosition: args.targetPosition,
    });

    const existingByItemId = new Map(placements.map((placement) => [placement.itemId, placement]));

    for (const placement of normalized) {
      const existing = existingByItemId.get(placement.itemId);
      if (existing) {
        await ctx.db.patch(existing._id, {
          tier: placement.tier,
          position: placement.position,
        });
      } else {
        await ctx.db.insert("streamerPlacements", {
          sessionId: args.sessionId,
          itemId: placement.itemId,
          tier: placement.tier,
          position: placement.position,
        });
      }
    }

    return ctx.db
      .query("streamerPlacements")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const listBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("streamerPlacements")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

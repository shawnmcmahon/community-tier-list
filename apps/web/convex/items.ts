import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { itemSourceValidator, itemStatusValidator } from "./lib/validators";

export const createBatch = mutation({
  args: {
    sessionId: v.id("sessions"),
    items: v.array(
      v.object({
        label: v.string(),
        imageUrl: v.string(),
        imageStorageId: v.optional(v.id("_storage")),
        source: itemSourceValidator,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("items")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    let nextOrderIndex = existing.length;
    const insertedIds = [];

    for (const item of args.items) {
      const itemId = await ctx.db.insert("items", {
        sessionId: args.sessionId,
        label: item.label,
        imageUrl: item.imageUrl,
        imageStorageId: item.imageStorageId,
        source: item.source,
        orderIndex: nextOrderIndex,
        status: "pool",
      });
      nextOrderIndex += 1;
      insertedIds.push(itemId);
    }

    return insertedIds;
  },
});

export const listBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return items.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

export const updateStatus = mutation({
  args: {
    itemId: v.id("items"),
    status: itemStatusValidator,
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(item._id, { status: args.status });
    return await ctx.db.get(item._id);
  },
});

export const reorder = mutation({
  args: {
    sessionId: v.id("sessions"),
    orderedItemIds: v.array(v.id("items")),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const itemById = new Map(items.map((item) => [item._id, item]));

    await Promise.all(
      args.orderedItemIds.map(async (itemId, orderIndex) => {
        const existing = itemById.get(itemId);
        if (!existing) {
          throw new Error("Item does not belong to session");
        }

        await ctx.db.patch(itemId, { orderIndex });
      }),
    );

    return true;
  },
});

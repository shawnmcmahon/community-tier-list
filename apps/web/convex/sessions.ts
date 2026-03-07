import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { sessionStatusValidator } from "./lib/validators";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

export const create = mutation({
  args: {
    hostTwitchUserId: v.string(),
    title: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const host = await ctx.db
      .query("users")
      .withIndex("by_twitchUserId", (q) => q.eq("twitchUserId", args.hostTwitchUserId))
      .first();

    if (!host) {
      throw new Error("Host user not found");
    }

    const baseSlug = slugify(args.slug ?? args.title);
    if (!baseSlug) {
      throw new Error("Unable to create slug");
    }

    let finalSlug = baseSlug;
    let suffix = 1;
    while (
      await ctx.db
        .query("sessions")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first()
    ) {
      suffix += 1;
      finalSlug = `${baseSlug}-${suffix}`;
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      hostUserId: host._id,
      slug: finalSlug,
      title: args.title,
      status: "draft",
      currentStagedItemId: undefined,
      voteWindowOpen: false,
      createdAt: now,
      updatedAt: now,
    });

    return {
      sessionId,
      slug: finalSlug,
    };
  },
});

export const listByHost = query({
  args: {
    hostTwitchUserId: v.string(),
    status: v.optional(sessionStatusValidator),
  },
  handler: async (ctx, args) => {
    const host = await ctx.db
      .query("users")
      .withIndex("by_twitchUserId", (q) => q.eq("twitchUserId", args.hostTwitchUserId))
      .first();

    if (!host) {
      return [];
    }

    if (args.status) {
      return ctx.db
        .query("sessions")
        .withIndex("by_hostUserId_status", (q) => q.eq("hostUserId", host._id))
        .filter((q) => q.eq(q.field("status"), args.status!))
        .collect();
    }

    return ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("hostUserId"), host._id))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("sessions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listDashboardByHost = query({
  args: {
    hostTwitchUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const host = await ctx.db
      .query("users")
      .withIndex("by_twitchUserId", (q) => q.eq("twitchUserId", args.hostTwitchUserId))
      .first();

    if (!host) {
      return [];
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_hostUserId_status", (q) => q.eq("hostUserId", host._id))
      .collect();

    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const [items, votes, participation] = await Promise.all([
          ctx.db
            .query("items")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
            .collect(),
          ctx.db
            .query("votes")
            .filter((q) => q.eq(q.field("sessionId"), session._id))
            .collect(),
          ctx.db
            .query("participation")
            .withIndex("by_sessionId_twitchUserId", (q) => q.eq("sessionId", session._id))
            .collect(),
        ]);

        return {
          ...session,
          itemCount: items.length,
          viewerCount: participation.length,
          voteCount: votes.length,
        };
      }),
    );

    return enriched.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const updateStatus = mutation({
  args: {
    sessionId: v.id("sessions"),
    status: sessionStatusValidator,
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(session._id);
  },
});

export const setStagedItem = mutation({
  args: {
    sessionId: v.id("sessions"),
    itemId: v.optional(v.id("items")),
    voteWindowOpen: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(session._id, {
      currentStagedItemId: args.itemId,
      voteWindowOpen: args.voteWindowOpen,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(session._id);
  },
});

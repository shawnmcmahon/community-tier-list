import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  itemSourceValidator,
  itemStatusValidator,
  sessionStatusValidator,
  tierValidator,
} from "./lib/validators";

export default defineSchema({
  users: defineTable({
    twitchUserId: v.string(),
    twitchDisplayName: v.string(),
    twitchProfileImageUrl: v.optional(v.string()),
    role: v.union(v.literal("creator"), v.literal("viewer")),
    createdAt: v.number(),
  }).index("by_twitchUserId", ["twitchUserId"]),

  sessions: defineTable({
    hostUserId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    status: sessionStatusValidator,
    currentStagedItemId: v.optional(v.id("items")),
    voteWindowOpen: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_hostUserId_status", ["hostUserId", "status"]),

  items: defineTable({
    sessionId: v.id("sessions"),
    label: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    source: itemSourceValidator,
    orderIndex: v.number(),
    status: itemStatusValidator,
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_status", ["sessionId", "status"]),

  streamerPlacements: defineTable({
    sessionId: v.id("sessions"),
    itemId: v.id("items"),
    tier: tierValidator,
    position: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_itemId", ["sessionId", "itemId"]),

  votes: defineTable({
    sessionId: v.id("sessions"),
    itemId: v.id("items"),
    voterKey: v.string(),
    tier: tierValidator,
    castAt: v.number(),
  })
    .index("by_itemId_voterKey", ["itemId", "voterKey"])
    .index("by_itemId", ["itemId"])
    .index("by_sessionId", ["sessionId"]),

  voteTallies: defineTable({
    itemId: v.id("items"), S: v.number(), A: v.number(), B: v.number(), C: v.number(), D: v.number(),
    totalVotes: v.number(), totalScore: v.number(),
  }).index("by_item", ["itemId"]),

  communityPlacements: defineTable({
    sessionId: v.id("sessions"),
    itemId: v.id("items"),
    avgScore: v.number(),
    totalVotes: v.number(),
    tier: tierValidator,
    position: v.number(),
    computedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_itemId", ["sessionId", "itemId"]),

  participation: defineTable({
    twitchUserId: v.string(),
    sessionId: v.id("sessions"),
    joinedAt: v.number(),
    lastVotedAt: v.optional(v.number()),
  })
    .index("by_twitchUserId", ["twitchUserId"])
    .index("by_sessionId_twitchUserId", ["sessionId", "twitchUserId"]),

  connections: defineTable({
    sessionId: v.id("sessions"),
    voterKey: v.string(),
    connectionId: v.string(),
    displayName: v.string(),
    joinedAt: v.number(),
    expirationJob: v.id("_scheduled_functions"),
  }).index("by_session", ["sessionId"]).index("by_connection", ["connectionId"])
    .index("by_actor", ["sessionId", "voterKey"]),
});

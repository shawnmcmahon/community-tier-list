import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import dotenv from "dotenv";

import { createRealtimeServer } from "./createRealtimeServer.ts";
import { verifyHostJwt } from "./lib/hostJwt.ts";
import type {
  SessionDoc,
  SessionItem,
  TierPlacement,
  VoteDistribution,
} from "./lib/protocol.ts";

const api = anyApi;

const currentDir = dirname(fileURLToPath(import.meta.url));
const envFiles = [
  resolve(currentDir, "../.env.local"),
  resolve(currentDir, "../../../.env.local"),
];

for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
}

const port = Number(process.env.PORT ?? 3001);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";

const convex = new ConvexHttpClient(convexUrl);

const { httpServer } = createRealtimeServer({
  corsOrigin,
  verifyHostToken: verifyHostJwt,
  store: {
    async getSessionBySlug(sessionSlug) {
      return (await convex.query((api as any).sessions.getBySlug, {
        slug: sessionSlug,
      })) as SessionDoc | null;
    },
    async getUserById(userId) {
      return (await convex.query((api as any).users.getById, {
        userId,
      })) as { _id: string; twitchUserId: string; twitchDisplayName?: string } | null;
    },
    async listItemsBySession(sessionId) {
      return (await convex.query((api as any).items.listBySession, {
        sessionId,
      })) as SessionItem[];
    },
    async listStreamerPlacementsBySession(sessionId) {
      return (await convex.query((api as any).streamerPlacements.listBySession, {
        sessionId,
      })) as TierPlacement[];
    },
    async listCommunityPlacementsBySession(sessionId) {
      return (await convex.query((api as any).communityPlacements.listBySession, {
        sessionId,
      })) as TierPlacement[];
    },
    async distributionByItem(itemId) {
      return (await convex.query((api as any).votes.distributionByItem, {
        itemId,
      })) as VoteDistribution;
    },
    async upsertParticipation(input) {
      await convex.mutation((api as any).participation.upsert, input);
    },
    async updateSessionStatus(input) {
      return (await convex.mutation((api as any).sessions.updateStatus, input)) as SessionDoc;
    },
    async setStagedItem(input) {
      return (await convex.mutation((api as any).sessions.setStagedItem, input)) as SessionDoc;
    },
    async updateItemStatus(input) {
      return (await convex.mutation((api as any).items.updateStatus, input)) as SessionItem;
    },
    async upsertStreamerPlacement(input) {
      return (await convex.mutation((api as any).streamerPlacements.upsert, input)) as TierPlacement[];
    },
    async computeCommunityPlacements(input) {
      return (await convex.mutation((api as any).communityPlacements.computeForItem, input)) as TierPlacement[];
    },
    async upsertVote(input) {
      await convex.mutation((api as any).votes.upsert, input);
    },
  },
});

httpServer.listen(port, () => {
  console.log(`Realtime server listening on port ${port}`);
});

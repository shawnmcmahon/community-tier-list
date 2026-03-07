import type { Tier } from "./sessionState.ts";

export type SessionStatus = "draft" | "live" | "completed";

export type SessionItem = {
  _id: string;
  label: string;
  imageUrl: string;
  status: "pool" | "staged" | "placed";
  orderIndex: number;
};

export type TierPlacement = {
  itemId: string;
  tier: Tier;
  position: number;
};

export type VoteDistribution = Record<Tier, number> & {
  totalVotes: number;
  avgScore: number | null;
};

export type SessionDoc = {
  _id: string;
  hostUserId: string;
  slug: string;
  title: string;
  status: SessionStatus;
  currentStagedItemId?: string;
  voteWindowOpen: boolean;
  updatedAt: number;
};

export type SessionSnapshot = {
  sessionSlug: string;
  title: string;
  status: SessionStatus;
  voteWindowOpen: boolean;
  currentStagedItemId: string | null;
  updatedAt: number;
  items: SessionItem[];
  streamerPlacements: TierPlacement[];
  communityPlacements: TierPlacement[];
};

export type StagingChangedPayload = {
  sessionSlug: string;
  currentStagedItemId: string | null;
  voteWindowOpen: boolean;
  updatedAt: number;
  items: SessionItem[];
};

export type VoteDistributionPayload = VoteDistribution & {
  sessionSlug: string;
  itemId: string | null;
};

export type BoardsUpdatedPayload = {
  sessionSlug: string;
  updatedAt: number;
  items: SessionItem[];
  streamerPlacements: TierPlacement[];
  communityPlacements: TierPlacement[];
};

export type PresenceUpdatePayload = {
  viewerCount: number;
  recentJoins: string[];
};

export type ErrorToastPayload = {
  code:
    | "forbidden"
    | "invalid_request"
    | "not_found"
    | "rate_limited"
    | "session_error";
  message: string;
  target: "host" | "viewer" | "session";
};

export function emptyVoteDistribution(
  sessionSlug: string,
  itemId: string | null = null,
): VoteDistributionPayload {
  return {
    sessionSlug,
    itemId,
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    totalVotes: 0,
    avgScore: null,
  };
}

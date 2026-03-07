import type { SessionStatus, TierPlacement, VoteDistribution } from "@/lib/live-session";
import type { SessionItem } from "@/lib/live-session";

export const VOTER_KEY_STORAGE_KEY = "community-tier-list:voter-key";

export type SessionStatePayload = {
  sessionSlug: string;
  title: string;
  status: SessionStatus;
  voteWindowOpen: boolean;
  currentStagedItemId: string | null;
  updatedAt: number;
  items?: SessionItem[];
  streamerPlacements?: TierPlacement[];
  communityPlacements?: TierPlacement[];
};

export type VoteDistributionPayload = VoteDistribution & {
  sessionSlug: string;
  itemId: string | null;
};

export type PresenceUpdatePayload = {
  viewerCount: number;
  recentJoins: string[];
};

export type StagingChangedPayload = {
  sessionSlug: string;
  currentStagedItemId: string | null;
  voteWindowOpen: boolean;
  updatedAt: number;
  items: SessionItem[];
};

export type BoardsUpdatedPayload = {
  sessionSlug: string;
  updatedAt: number;
  items: SessionItem[];
  streamerPlacements: TierPlacement[];
  communityPlacements: TierPlacement[];
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

export type JoinSessionResponse =
  | { ok: true; data: { voterKey: string } }
  | { ok: false; error: string };

export type VoteResponse =
  | { ok: true; data: { totalVotes: number; avgScore: number | null } }
  | { ok: false; error: string };

export type CommunityPlacementsPayload = TierPlacement[];

export type HostAuthenticateResponse =
  | { ok: true; data: { sessionSlug: string } }
  | { ok: false; error: string };

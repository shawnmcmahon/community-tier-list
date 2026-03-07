import type { Tier } from "@/lib/mock-data";

export type SessionStatus = "draft" | "live" | "completed";

export type SessionSummary = {
  _id: string;
  slug: string;
  title: string;
  status: SessionStatus;
  createdAt: number;
  updatedAt: number;
  itemCount: number;
  viewerCount: number;
  voteCount: number;
};

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

export function formatRelativeDate(timestamp: number): string {
  const diffMs = timestamp - Date.now();
  const absMs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMs < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }

  if (absMs < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }

  if (absMs < week) {
    return rtf.format(Math.round(diffMs / day), "day");
  }

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function emptyVoteDistribution(): VoteDistribution {
  return {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    totalVotes: 0,
    avgScore: null,
  };
}

export const TIER_ORDER = ["S", "A", "B", "C", "D"] as const;

export type Tier = (typeof TIER_ORDER)[number];

export const TIER_TO_SCORE: Record<Tier, number> = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

export function isTier(value: string): value is Tier {
  return (TIER_ORDER as readonly string[]).includes(value);
}

export function avgToTier(avgScore: number | null): Tier | null {
  if (avgScore === null || Number.isNaN(avgScore)) {
    return null;
  }

  if (avgScore >= 4.5) return "S";
  if (avgScore >= 3.5) return "A";
  if (avgScore >= 2.5) return "B";
  if (avgScore >= 1.5) return "C";
  return "D";
}

export function summarizeTierVotes(votes: Tier[]): {
  distribution: Record<Tier, number>;
  totalVotes: number;
  avgScore: number | null;
} {
  const distribution: Record<Tier, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };

  for (const tier of votes) {
    distribution[tier] += 1;
  }

  const totalVotes = votes.length;
  if (totalVotes === 0) {
    return { distribution, totalVotes, avgScore: null };
  }

  const totalScore = votes.reduce((sum, tier) => sum + TIER_TO_SCORE[tier], 0);
  return {
    distribution,
    totalVotes,
    avgScore: totalScore / totalVotes,
  };
}

export const VALID_TIERS = ["S", "A", "B", "C", "D"] as const;
export type Tier = (typeof VALID_TIERS)[number];

export type SessionVoteState = {
  status: "draft" | "live" | "completed";
  voteWindowOpen: boolean;
  currentStagedItemId?: string;
};

type ResolveVoterKeyInput = {
  providedVoterKey?: string;
  persistedVoterKey?: string;
  twitchUserId?: string;
  socketId: string;
};

export function isValidTier(value: string): value is Tier {
  return (VALID_TIERS as readonly string[]).includes(value);
}

export function canAcceptVote(session: SessionVoteState, itemId: string): boolean {
  return (
    session.status === "live" &&
    session.voteWindowOpen &&
    session.currentStagedItemId === itemId
  );
}

export function resolveVoterKey({
  providedVoterKey,
  persistedVoterKey,
  twitchUserId,
  socketId,
}: ResolveVoterKeyInput): string {
  const trimmedProvided = providedVoterKey?.trim();
  if (trimmedProvided) {
    return trimmedProvided;
  }

  const trimmedPersisted = persistedVoterKey?.trim();
  if (trimmedPersisted) {
    return trimmedPersisted;
  }

  if (twitchUserId) {
    return `twitch:${twitchUserId}`;
  }

  return `anon:${socketId}`;
}

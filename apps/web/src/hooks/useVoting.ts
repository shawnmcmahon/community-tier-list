"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

import { emptyVoteDistribution, type VoteDistribution } from "@/lib/live-session";
import type { Tier } from "@/lib/mock-data";
import {
  type ErrorToastPayload,
  VOTER_KEY_STORAGE_KEY,
  type VoteDistributionPayload,
  type VoteResponse,
} from "@/lib/realtime";

type UseVotingOptions = {
  socket: Socket | null;
  stagedItemId: string | null;
  initialDistribution: VoteDistribution;
  viewerTwitchUserId?: string;
  viewerDisplayName?: string;
  onVoteSuccess?: (itemId: string, tier: Tier) => void;
};

export function useVoting({
  socket,
  stagedItemId,
  initialDistribution,
  viewerTwitchUserId,
  viewerDisplayName,
  onVoteSuccess,
}: UseVotingOptions) {
  const [distribution, setDistribution] = useState<VoteDistribution>(initialDistribution);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const stagedItemIdRef = useRef<string | null>(stagedItemId);

  useEffect(() => {
    stagedItemIdRef.current = stagedItemId;
    if (!stagedItemId) {
      setDistribution(emptyVoteDistribution());
    }
    setVoteMessage(null);
  }, [stagedItemId]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleVoteDistribution = (payload: VoteDistributionPayload) => {
      if (!payload.itemId || payload.itemId === stagedItemIdRef.current) {
        setDistribution({
          S: payload.S,
          A: payload.A,
          B: payload.B,
          C: payload.C,
          D: payload.D,
          totalVotes: payload.totalVotes,
          avgScore: payload.avgScore,
        });
      }
    };

    const handleErrorToast = (payload: ErrorToastPayload) => {
      if (payload.target === "host") {
        return;
      }

      setVoteMessage(payload.message);
    };

    socket.on("vote:distribution", handleVoteDistribution);
    socket.on("error:toast", handleErrorToast);

    return () => {
      socket.off("vote:distribution", handleVoteDistribution);
      socket.off("error:toast", handleErrorToast);
    };
  }, [socket]);

  function submitVote(tier: Tier) {
    if (!socket || !stagedItemId) {
      return;
    }

    setIsSubmittingVote(true);
    setVoteMessage(null);

    const storedVoterKey = window.localStorage.getItem(VOTER_KEY_STORAGE_KEY) ?? undefined;
    socket.emit(
      "vote:cast",
      {
        itemId: stagedItemId,
        tier,
        voterKey: storedVoterKey,
        twitchUserId: viewerTwitchUserId,
      },
      (response: VoteResponse) => {
        setIsSubmittingVote(false);
        if (!response.ok) {
          setVoteMessage(response.error);
          return;
        }

        onVoteSuccess?.(stagedItemId, tier);
        setVoteMessage(
          viewerDisplayName ? `Vote submitted for ${viewerDisplayName}.` : "Vote submitted.",
        );
      },
    );
  }

  return {
    distribution,
    voteMessage,
    isSubmittingVote,
    submitVote,
  };
}

"use client";

import { useEffect, useMemo, useState } from "react";

import {
  placementsFromPersonalVotes,
  type PersonalVoteRecord,
  type SessionItem,
} from "@/lib/live-session";
import type { Tier } from "@/lib/mock-data";

function storageKey(sessionSlug: string) {
  return `community-tier-list:my-board:${sessionSlug}`;
}

export function useMyBoard(sessionSlug: string, items: SessionItem[]) {
  const [votes, setVotes] = useState<PersonalVoteRecord[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey(sessionSlug));
    if (!stored) {
      setVotes([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as PersonalVoteRecord[];
      setVotes(Array.isArray(parsed) ? parsed : []);
    } catch {
      setVotes([]);
    }
  }, [sessionSlug]);

  function recordVote(itemId: string, tier: Tier) {
    setVotes((current) => {
      const next = [
        ...current.filter((vote) => vote.itemId !== itemId),
        {
          itemId,
          tier,
          updatedAt: Date.now(),
        },
      ];
      window.localStorage.setItem(storageKey(sessionSlug), JSON.stringify(next));
      return next;
    });
  }

  const placements = useMemo(
    () => placementsFromPersonalVotes(items, votes),
    [items, votes],
  );

  return {
    placements,
    recordVote,
  };
}

"use client";

import { useEffect, useRef } from "react";

import type { Tier } from "@/lib/mock-data";

const KEY_TO_TIER: Record<string, Tier> = {
  "1": "S",
  "2": "A",
  "3": "B",
  "4": "C",
  "5": "D",
  s: "S",
  a: "A",
  b: "B",
  c: "C",
  d: "D",
};

type UseKeyboardVoteOptions = {
  enabled: boolean;
  onVote: (tier: Tier) => void;
};

export function useKeyboardVote({ enabled, onVote }: UseKeyboardVoteOptions) {
  const onVoteRef = useRef(onVote);

  useEffect(() => {
    onVoteRef.current = onVote;
  }, [onVote]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const tier = KEY_TO_TIER[event.key.toLowerCase()];
      if (!tier) {
        return;
      }

      event.preventDefault();
      onVoteRef.current(tier);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}

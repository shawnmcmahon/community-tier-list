"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import type { SessionItem, SessionStatus, TierPlacement } from "@/lib/live-session";
import {
  type BoardsUpdatedPayload,
  type ErrorToastPayload,
  VOTER_KEY_STORAGE_KEY,
  type CommunityPlacementsPayload,
  type JoinSessionResponse,
  type SessionStatePayload,
  type StagingChangedPayload,
} from "@/lib/realtime";

type UseSessionStateOptions = {
  socket: Socket | null;
  sessionSlug: string;
  viewerTwitchUserId?: string;
  viewerDisplayName?: string;
  initialTitle: string;
  initialStatus: SessionStatus;
  initialVoteWindowOpen: boolean;
  initialCurrentStagedItemId: string | null;
  initialItems: SessionItem[];
  initialStreamerPlacements: TierPlacement[];
  initialCommunityPlacements: TierPlacement[];
};

export function useSessionState({
  socket,
  sessionSlug,
  viewerTwitchUserId,
  viewerDisplayName,
  initialTitle,
  initialStatus,
  initialVoteWindowOpen,
  initialCurrentStagedItemId,
  initialItems,
  initialStreamerPlacements,
  initialCommunityPlacements,
}: UseSessionStateOptions) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SessionStatus>(initialStatus);
  const [voteWindowOpen, setVoteWindowOpen] = useState(initialVoteWindowOpen);
  const [currentStagedItemId, setCurrentStagedItemId] = useState<string | null>(
    initialCurrentStagedItemId,
  );
  const [items, setItems] = useState(initialItems);
  const [streamerPlacements, setStreamerPlacements] = useState(initialStreamerPlacements);
  const [communityPlacements, setCommunityPlacements] = useState(initialCommunityPlacements);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const joinSession = () => {
      const storedVoterKey = window.localStorage.getItem(VOTER_KEY_STORAGE_KEY) ?? undefined;
      socket.emit(
        "session:join",
        {
          sessionSlug,
          twitchUserId: viewerTwitchUserId,
          voterKey: storedVoterKey,
          displayName: viewerDisplayName,
        },
        (response: JoinSessionResponse) => {
          if (!response.ok) {
            setSessionError(response.error);
            return;
          }

          window.localStorage.setItem(VOTER_KEY_STORAGE_KEY, response.data.voterKey);
          setSessionError(null);
        },
      );
    };

    const handleSessionState = (payload: SessionStatePayload) => {
      setTitle(payload.title);
      setStatus(payload.status);
      setVoteWindowOpen(payload.voteWindowOpen);
      setCurrentStagedItemId(payload.currentStagedItemId);
      if (payload.items) {
        setItems(payload.items);
      }
      if (payload.streamerPlacements) {
        setStreamerPlacements(payload.streamerPlacements);
      }
      if (payload.communityPlacements) {
        setCommunityPlacements(payload.communityPlacements);
      }
      setSessionError(null);
    };

    const handleStagingChanged = (payload: StagingChangedPayload) => {
      setVoteWindowOpen(payload.voteWindowOpen);
      setCurrentStagedItemId(payload.currentStagedItemId);
      setItems(payload.items);
      setSessionError(null);
    };

    const handleBoardsUpdated = (payload: BoardsUpdatedPayload) => {
      setItems(payload.items);
      setStreamerPlacements(payload.streamerPlacements);
      setCommunityPlacements(payload.communityPlacements);
      setSessionError(null);
    };

    const handleCommunityPlacements = (payload: CommunityPlacementsPayload) => {
      setCommunityPlacements(payload);
      setSessionError(null);
    };

    const handleErrorToast = (payload: ErrorToastPayload) => {
      if (payload.target === "host") {
        return;
      }

      setSessionError(payload.message);
    };

    socket.on("connect", joinSession);
    socket.on("session:state", handleSessionState);
    socket.on("staging:changed", handleStagingChanged);
    socket.on("boards:updated", handleBoardsUpdated);
    socket.on("community:placements", handleCommunityPlacements);
    socket.on("error:toast", handleErrorToast);

    if (socket.connected) {
      joinSession();
    }

    return () => {
      socket.off("connect", joinSession);
      socket.off("session:state", handleSessionState);
      socket.off("staging:changed", handleStagingChanged);
      socket.off("boards:updated", handleBoardsUpdated);
      socket.off("community:placements", handleCommunityPlacements);
      socket.off("error:toast", handleErrorToast);
    };
  }, [socket, sessionSlug, viewerDisplayName, viewerTwitchUserId]);

  return {
    title,
    status,
    voteWindowOpen,
    currentStagedItemId,
    items,
    streamerPlacements,
    communityPlacements,
    sessionError,
    setItems,
  };
}

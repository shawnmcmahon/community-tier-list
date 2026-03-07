"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import type { PresenceUpdatePayload } from "@/lib/realtime";

type UsePresenceOptions = {
  socket: Socket | null;
  initialViewerCount: number;
};

export function usePresence({ socket, initialViewerCount }: UsePresenceOptions) {
  const [viewerCount, setViewerCount] = useState(initialViewerCount);
  const [recentJoins, setRecentJoins] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handlePresenceUpdate = (payload: PresenceUpdatePayload) => {
      setViewerCount(payload.viewerCount);
      setRecentJoins(payload.recentJoins);
    };

    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [socket]);

  return {
    viewerCount,
    recentJoins,
  };
}

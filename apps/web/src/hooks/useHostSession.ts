"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import type { SessionItem } from "@/lib/live-session";
import type { Tier } from "@/lib/mock-data";
import type { ErrorToastPayload, HostAuthenticateResponse } from "@/lib/realtime";

type UseHostSessionOptions = {
  socket: Socket | null;
  sessionSlug: string;
  canHost: boolean;
};

type AddItemsResponse =
  | { items: SessionItem[] }
  | { error: string };

type TierMakerImportResponse =
  | {
      items: SessionItem[];
      importedCount: number;
      importTitle: string | null;
      sourceUrl: string;
    }
  | { error: string };

export function useHostSession({ socket, sessionSlug, canHost }: UseHostSessionOptions) {
  const [hostReady, setHostReady] = useState(false);
  const [hostError, setHostError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!socket || !canHost) {
      setHostReady(false);
      return;
    }

    const authenticate = async () => {
      try {
        const response = await fetch("/api/host-token", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ sessionSlug }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          setHostError(payload?.error ?? "Unable to mint host token.");
          setHostReady(false);
          return;
        }

        const payload = (await response.json()) as { token: string };
        socket.emit(
          "host:authenticate",
          { token: payload.token },
          (result: HostAuthenticateResponse) => {
            if (!result.ok) {
              setHostError(result.error);
              setHostReady(false);
              return;
            }

            setHostReady(true);
            setHostError(null);
          },
        );
      } catch {
        setHostError("Unable to reach the host token endpoint.");
        setHostReady(false);
      }
    };

    const run = () => {
      setHostReady(false);
      void authenticate();
    };

    const handleDisconnect = () => {
      setHostReady(false);
      setHostError("Host controls disconnected. Reconnecting...");
    };

    const handleErrorToast = (payload: ErrorToastPayload) => {
      if (payload.target === "viewer") {
        return;
      }

      setHostError(payload.message);
    };

    socket.on("connect", run);
    socket.on("disconnect", handleDisconnect);
    socket.on("error:toast", handleErrorToast);
    if (socket.connected) {
      run();
    }

    return () => {
      socket.off("connect", run);
      socket.off("disconnect", handleDisconnect);
      socket.off("error:toast", handleErrorToast);
    };
  }, [canHost, sessionSlug, socket]);

  function emitHostAction<T>(event: string, payload: object = {}) {
    return new Promise<T>((resolve, reject) => {
      if (!socket || !hostReady) {
        reject(new Error("Host connection is not ready."));
        return;
      }

      socket.emit(
        event,
        payload,
        (response: { ok: boolean; data?: T; error?: string }) => {
          if (!response.ok) {
            reject(new Error(response.error ?? "Host action failed."));
            return;
          }

          resolve(response.data as T);
        },
      );
    });
  }

  async function runHostAction<T>(work: () => Promise<T>): Promise<T | null> {
    setIsWorking(true);
    setHostError(null);
    try {
      return await work();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown host error.";
      setHostError(message);
      return null;
    } finally {
      setIsWorking(false);
    }
  }

  return {
    hostReady,
    hostError,
    isWorking,
    setLive: () => runHostAction(() => emitHostAction("host:start", {})),
    complete: () => runHostAction(() => emitHostAction("host:complete", {})),
    stageItem: (itemId: string) =>
      runHostAction(() => emitHostAction("host:stageItem", { itemId })),
    unstageItem: () => runHostAction(() => emitHostAction("host:unstage", {})),
    openVoting: () =>
      runHostAction(() => emitHostAction("host:setVoteWindow", { open: true })),
    closeVoting: () =>
      runHostAction(() => emitHostAction("host:setVoteWindow", { open: false })),
    finalizeItem: (tier: Tier) =>
      runHostAction(() => emitHostAction("host:finalizePlacement", { tier })),
    addItems: async (labels: string[]) =>
      runHostAction(async () => {
        const response = await fetch("/api/session-items", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ sessionSlug, labels }),
        });

        const payload = (await response.json().catch(() => null)) as AddItemsResponse | null;
        if (!response.ok || !payload || "error" in payload) {
          throw new Error(payload && "error" in payload ? payload.error : "Unable to add items.");
        }

        return payload.items;
      }),
    importTierMaker: async (tiermakerUrl: string) =>
      runHostAction(async () => {
        const response = await fetch("/api/tiermaker-import", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ sessionSlug, tiermakerUrl }),
        });

        const payload = (await response.json().catch(() => null)) as TierMakerImportResponse | null;
        if (!response.ok || !payload || "error" in payload) {
          throw new Error(
            payload && "error" in payload
              ? payload.error
              : "Unable to import from TierMaker.",
          );
        }

        return payload;
      }),
  };
}

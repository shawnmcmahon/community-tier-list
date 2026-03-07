import { createServer, type Server as HttpServer } from "node:http";

import cors from "cors";
import { Server, type Socket } from "socket.io";

import { type HostJwtPayload } from "./lib/hostJwt.ts";
import { PresenceTracker } from "./lib/presenceTracker.ts";
import {
  emptyVoteDistribution,
  type BoardsUpdatedPayload,
  type ErrorToastPayload,
  type PresenceUpdatePayload,
  type SessionDoc,
  type SessionItem,
  type SessionSnapshot,
  type SessionStatus,
  type StagingChangedPayload,
  type TierPlacement,
  type VoteDistribution,
  type VoteDistributionPayload,
} from "./lib/protocol.ts";
import {
  FixedWindowRateLimiter,
  type RateLimitPolicy,
} from "./lib/rateLimiter.ts";
import {
  canAcceptVote,
  isValidTier,
  resolveVoterKey,
  type Tier,
} from "./lib/sessionState.ts";

export type SocketData = {
  sessionSlug?: string;
  hostAuth?: HostJwtPayload;
  viewerVoterKey?: string;
  viewerDisplayName?: string;
  twitchUserId?: string;
};

type AckResponse<T> = { ok: true; data: T } | { ok: false; error: string };
type Ack<T> = (response: AckResponse<T>) => void;

type JoinSessionPayload = {
  sessionSlug: string;
  twitchUserId?: string;
  voterKey?: string;
  displayName?: string;
};

type HostTokenPayload = {
  token: string;
};

type SetVoteWindowPayload = {
  open: boolean;
};

type VotePayload = {
  itemId: string;
  tier: string;
  voterKey?: string;
  twitchUserId?: string;
};

type StageItemPayload = {
  itemId: string;
};

type FinalizePlacementPayload = {
  tier: Tier;
};

type SessionStateRequestPayload = {
  sessionSlug?: string;
};

type UserDoc = {
  _id: string;
  twitchUserId: string;
  twitchDisplayName?: string;
};

type RealtimeStore = {
  getSessionBySlug(sessionSlug: string): Promise<SessionDoc | null>;
  getUserById(userId: string): Promise<UserDoc | null>;
  listItemsBySession(sessionId: string): Promise<SessionItem[]>;
  listStreamerPlacementsBySession(sessionId: string): Promise<TierPlacement[]>;
  listCommunityPlacementsBySession(sessionId: string): Promise<TierPlacement[]>;
  distributionByItem(itemId: string): Promise<VoteDistribution>;
  upsertParticipation(input: {
    twitchUserId: string;
    sessionId: string;
    lastVotedAt?: number;
  }): Promise<void>;
  updateSessionStatus(input: {
    sessionId: string;
    status: SessionStatus;
  }): Promise<SessionDoc>;
  setStagedItem(input: {
    sessionId: string;
    itemId?: string;
    voteWindowOpen: boolean;
  }): Promise<SessionDoc>;
  updateItemStatus(input: {
    itemId: string;
    status: SessionItem["status"];
  }): Promise<SessionItem>;
  upsertStreamerPlacement(input: {
    sessionId: string;
    itemId: string;
    tier: Tier;
  }): Promise<TierPlacement[]>;
  computeCommunityPlacements(input: {
    sessionId: string;
    itemId: string;
  }): Promise<TierPlacement[]>;
  upsertVote(input: {
    sessionId: string;
    itemId: string;
    voterKey: string;
    tier: Tier;
  }): Promise<void>;
};

type CreateRealtimeServerOptions = {
  corsOrigin?: string;
  httpServer?: HttpServer;
  store: RealtimeStore;
  verifyHostToken(token: string): Promise<HostJwtPayload>;
};

class RealtimeError extends Error {
  readonly code: ErrorToastPayload["code"];
  readonly target: ErrorToastPayload["target"];

  constructor(
    message: string,
    options: {
      code: ErrorToastPayload["code"];
      target: ErrorToastPayload["target"];
    },
  ) {
    super(message);
    this.name = "RealtimeError";
    this.code = options.code;
    this.target = options.target;
  }
}

const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
  "session:join": { key: "join", limit: 4, windowMs: 5_000 },
  "session:stateRequest": { key: "state", limit: 8, windowMs: 10_000 },
  "host:authenticate": { key: "host-auth", limit: 4, windowMs: 10_000 },
  "host:start": { key: "host-control", limit: 12, windowMs: 10_000 },
  "host:stageItem": { key: "host-control", limit: 12, windowMs: 10_000 },
  "host:unstage": { key: "host-control", limit: 12, windowMs: 10_000 },
  "host:setVoteWindow": { key: "host-control", limit: 12, windowMs: 10_000 },
  "host:finalizePlacement": { key: "host-control", limit: 12, windowMs: 10_000 },
  "host:complete": { key: "host-control", limit: 12, windowMs: 10_000 },
  "vote:cast": { key: "vote", limit: 15, windowMs: 8_000 },
};

const MAX_VIEWER_DISPLAY_NAME_LENGTH = 64;

function roomForSession(sessionSlug: string): string {
  return `session:${sessionSlug}`;
}

function emitError(
  socket: Socket<any, any, any, SocketData>,
  payload: ErrorToastPayload,
): void {
  socket.emit("error:toast", payload);
}

function toRealtimeError(
  error: unknown,
  fallbackTarget: ErrorToastPayload["target"],
): RealtimeError {
  if (error instanceof RealtimeError) {
    return error;
  }

  const message = error instanceof Error ? error.message : "Unexpected realtime error.";
  const lowered = message.toLowerCase();

  if (lowered.includes("not found")) {
    return new RealtimeError(message, {
      code: "not_found",
      target: fallbackTarget,
    });
  }

  if (lowered.includes("forbidden") || lowered.includes("authentication")) {
    return new RealtimeError(message, {
      code: "forbidden",
      target: fallbackTarget,
    });
  }

  if (
    lowered.includes("invalid") ||
    lowered.includes("required") ||
    lowered.includes("closed") ||
    lowered.includes("staged")
  ) {
    return new RealtimeError(message, {
      code: "invalid_request",
      target: fallbackTarget,
    });
  }

  return new RealtimeError(message, {
    code: "session_error",
    target: fallbackTarget,
  });
}

function fail<T>(
  socket: Socket<any, any, any, SocketData>,
  ack: Ack<T> | undefined,
  error: unknown,
  fallbackTarget: ErrorToastPayload["target"],
): void {
  const realtimeError = toRealtimeError(error, fallbackTarget);
  emitError(socket, {
    code: realtimeError.code,
    message: realtimeError.message,
    target: realtimeError.target,
  });
  ack?.({ ok: false, error: realtimeError.message });
}

function resolvePresenceLabel(socket: Socket<any, any, any, SocketData>): string {
  const displayName = socket.data.viewerDisplayName?.trim();
  if (displayName) {
    return displayName;
  }

  if (socket.data.hostAuth?.twitchUserId) {
    return `Host ${socket.data.hostAuth.twitchUserId}`;
  }

  if (socket.data.twitchUserId) {
    return `Viewer ${socket.data.twitchUserId}`;
  }

  return "Anonymous viewer";
}

function normalizeDisplayName(displayName?: string): string | undefined {
  const trimmed = displayName?.trim();
  if (!trimmed) {
    return undefined;
  }

  const normalizedWhitespace = trimmed.replace(/\s+/g, " ");
  return normalizedWhitespace.slice(0, MAX_VIEWER_DISPLAY_NAME_LENGTH);
}

function assertHostAuthorized(
  socket: Socket<any, any, any, SocketData>,
): asserts socket is Socket<any, any, any, SocketData & { hostAuth: HostJwtPayload }> {
  if (!socket.data.hostAuth || !socket.data.sessionSlug) {
    throw new RealtimeError("Host authentication required.", {
      code: "forbidden",
      target: "host",
    });
  }
}

function ensureSessionJoined(socket: Socket<any, any, any, SocketData>): string {
  if (!socket.data.sessionSlug) {
    throw new RealtimeError("Join a session first.", {
      code: "invalid_request",
      target: "viewer",
    });
  }

  return socket.data.sessionSlug;
}

function getRateLimitTarget(eventName: string): ErrorToastPayload["target"] {
  if (eventName.startsWith("host:")) {
    return "host";
  }

  if (eventName.startsWith("vote:")) {
    return "viewer";
  }

  return "session";
}

export function createRealtimeServer({
  corsOrigin = "*",
  httpServer,
  store,
  verifyHostToken,
}: CreateRealtimeServerOptions) {
  const presenceTracker = new PresenceTracker();
  const rateLimiter = new FixedWindowRateLimiter();
  const corsMiddleware = cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true,
  });

  const server =
    httpServer ??
    createServer((req, res) => {
      corsMiddleware(req, res, () => {
        if (req.url === "/health") {
          res.statusCode = 200;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        res.statusCode = 404;
        res.end("Not found");
      });
    });

  const io = new Server<any, any, any, SocketData>(server, {
    cors: {
      origin: corsOrigin === "*" ? true : corsOrigin,
      credentials: true,
    },
  });

  async function getSessionBySlug(sessionSlug: string): Promise<SessionDoc> {
    const session = await store.getSessionBySlug(sessionSlug);

    if (!session) {
      throw new RealtimeError("Session not found.", {
        code: "not_found",
        target: "session",
      });
    }

    return session;
  }

  async function getSessionSnapshot(sessionSlug: string): Promise<SessionSnapshot> {
    const session = await getSessionBySlug(sessionSlug);
    const [items, streamerPlacements, communityPlacements] = await Promise.all([
      store.listItemsBySession(session._id),
      store.listStreamerPlacementsBySession(session._id),
      store.listCommunityPlacementsBySession(session._id),
    ]);

    return {
      sessionSlug: session.slug,
      title: session.title,
      status: session.status,
      voteWindowOpen: session.voteWindowOpen,
      currentStagedItemId: session.currentStagedItemId ?? null,
      updatedAt: session.updatedAt,
      items,
      streamerPlacements,
      communityPlacements,
    };
  }

  async function getStagingPayload(sessionSlug: string): Promise<StagingChangedPayload> {
    const snapshot = await getSessionSnapshot(sessionSlug);

    return {
      sessionSlug: snapshot.sessionSlug,
      currentStagedItemId: snapshot.currentStagedItemId,
      voteWindowOpen: snapshot.voteWindowOpen,
      updatedAt: snapshot.updatedAt,
      items: snapshot.items,
    };
  }

  async function getBoardsPayload(sessionSlug: string): Promise<BoardsUpdatedPayload> {
    const snapshot = await getSessionSnapshot(sessionSlug);

    return {
      sessionSlug: snapshot.sessionSlug,
      updatedAt: snapshot.updatedAt,
      items: snapshot.items,
      streamerPlacements: snapshot.streamerPlacements,
      communityPlacements: snapshot.communityPlacements,
    };
  }

  async function getVoteDistributionPayload(
    session: SessionDoc,
  ): Promise<VoteDistributionPayload> {
    if (!session.currentStagedItemId) {
      return emptyVoteDistribution(session.slug);
    }

    const distribution = await store.distributionByItem(session.currentStagedItemId);

    return {
      sessionSlug: session.slug,
      itemId: session.currentStagedItemId,
      ...distribution,
    };
  }

  function emitPresenceUpdate(sessionSlug: string): void {
    const payload = presenceTracker.snapshot(sessionSlug) as PresenceUpdatePayload;
    io.to(roomForSession(sessionSlug)).emit("presence:update", payload);
  }

  function syncPresence(
    socket: Socket<any, any, any, SocketData>,
    sessionSlug: string,
  ): void {
    const previousSessionSlug = socket.data.sessionSlug;

    if (previousSessionSlug && previousSessionSlug !== sessionSlug) {
      const previousPresence = presenceTracker.leave(socket.id);
      if (previousPresence) {
        emitPresenceUpdate(previousPresence.sessionSlug);
      }
      socket.leave(roomForSession(previousSessionSlug));
    }

    socket.join(roomForSession(sessionSlug));
    presenceTracker.join({
      sessionSlug,
      socketId: socket.id,
      label: resolvePresenceLabel(socket),
    });
    emitPresenceUpdate(sessionSlug);
  }

  async function emitSessionStateToSocket(
    socket: Socket<any, any, any, SocketData>,
  ): Promise<void> {
    if (!socket.data.sessionSlug) {
      return;
    }

    const snapshot = await getSessionSnapshot(socket.data.sessionSlug);
    const session = await getSessionBySlug(socket.data.sessionSlug);
    socket.emit("session:state", snapshot);
    socket.emit("vote:distribution", await getVoteDistributionPayload(session));
  }

  async function emitSessionStateToRoom(sessionSlug: string): Promise<void> {
    const snapshot = await getSessionSnapshot(sessionSlug);
    io.to(roomForSession(sessionSlug)).emit("session:state", snapshot);
  }

  async function emitStagingChangedToRoom(sessionSlug: string): Promise<void> {
    const session = await getSessionBySlug(sessionSlug);
    io.to(roomForSession(sessionSlug)).emit(
      "staging:changed",
      await getStagingPayload(sessionSlug),
    );
    io.to(roomForSession(sessionSlug)).emit(
      "vote:distribution",
      await getVoteDistributionPayload(session),
    );
  }

  async function emitBoardsUpdatedToRoom(sessionSlug: string): Promise<void> {
    io.to(roomForSession(sessionSlug)).emit(
      "boards:updated",
      await getBoardsPayload(sessionSlug),
    );
  }

  io.on("connection", (socket) => {
    socket.use((packet, next) => {
      const [eventName, ...args] = packet;
      const policy = RATE_LIMIT_POLICIES[eventName];

      if (!policy) {
        next();
        return;
      }

      const result = rateLimiter.check(socket.id, policy);
      if (result.ok) {
        next();
        return;
      }

      const error = new RealtimeError(
        `Too many ${policy.key} requests. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`,
        {
          code: "rate_limited",
          target: getRateLimitTarget(eventName),
        },
      );

      const ack = typeof args.at(-1) === "function" ? (args.at(-1) as Ack<unknown>) : undefined;
      fail(socket, ack, error, error.target);
    });

    socket.on(
      "session:join",
      async (payload: JoinSessionPayload, ack?: Ack<{ voterKey: string }>) => {
        try {
          const session = await getSessionBySlug(payload.sessionSlug);
          const voterKey = resolveVoterKey({
            providedVoterKey: payload.voterKey,
            persistedVoterKey: socket.data.viewerVoterKey,
            twitchUserId: payload.twitchUserId,
            socketId: socket.id,
          });

          socket.data.sessionSlug = payload.sessionSlug;
          socket.data.viewerVoterKey = voterKey;
          socket.data.twitchUserId = payload.twitchUserId;
          socket.data.viewerDisplayName = normalizeDisplayName(payload.displayName);
          syncPresence(socket, payload.sessionSlug);

          if (payload.twitchUserId) {
            await store.upsertParticipation({
              twitchUserId: payload.twitchUserId,
              sessionId: session._id,
            });
          }

          await emitSessionStateToSocket(socket);
          ack?.({ ok: true, data: { voterKey } });
        } catch (error) {
          fail(socket, ack, error, "session");
        }
      },
    );

    socket.on(
      "session:stateRequest",
      async (_payload: SessionStateRequestPayload, ack?: Ack<{ ok: boolean }>) => {
        try {
          ensureSessionJoined(socket);
          await emitSessionStateToSocket(socket);
          ack?.({ ok: true, data: { ok: true } });
        } catch (error) {
          fail(socket, ack, error, "session");
        }
      },
    );

    socket.on(
      "host:authenticate",
      async (payload: HostTokenPayload, ack?: Ack<{ sessionSlug: string }>) => {
        try {
          const verified = await verifyHostToken(payload.token);
          const session = await getSessionBySlug(verified.sessionSlug);
          const hostUser = await store.getUserById(session.hostUserId);

          if (!hostUser || hostUser.twitchUserId !== verified.twitchUserId) {
            throw new RealtimeError("Forbidden.", {
              code: "forbidden",
              target: "host",
            });
          }

          socket.data.hostAuth = verified;
          socket.data.twitchUserId = verified.twitchUserId;
          socket.data.sessionSlug = verified.sessionSlug;
          syncPresence(socket, verified.sessionSlug);
          await emitSessionStateToSocket(socket);

          ack?.({ ok: true, data: { sessionSlug: verified.sessionSlug } });
        } catch (error) {
          fail(socket, ack, error, "host");
        }
      },
    );

    socket.on("host:start", async (_payload: object, ack?: Ack<SessionDoc>) => {
      try {
        assertHostAuthorized(socket);
        const sessionSlug = socket.data.sessionSlug!;
        const session = await getSessionBySlug(sessionSlug);

        const updated = await store.updateSessionStatus({
          sessionId: session._id,
          status: "live",
        });

        await emitSessionStateToRoom(updated.slug);
        ack?.({ ok: true, data: updated });
      } catch (error) {
        fail(socket, ack, error, "host");
      }
    });

    socket.on("host:complete", async (_payload: object, ack?: Ack<SessionDoc>) => {
      try {
        assertHostAuthorized(socket);
        const sessionSlug = socket.data.sessionSlug!;
        const session = await getSessionBySlug(sessionSlug);

        const updated = await store.updateSessionStatus({
          sessionId: session._id,
          status: "completed",
        });

        await emitSessionStateToRoom(updated.slug);
        ack?.({ ok: true, data: updated });
      } catch (error) {
        fail(socket, ack, error, "host");
      }
    });

    socket.on(
      "host:stageItem",
      async (
        payload: StageItemPayload,
        ack?: Ack<{ currentStagedItemId: string | null }>,
      ) => {
        try {
          assertHostAuthorized(socket);
          const sessionSlug = socket.data.sessionSlug!;
          const session = await getSessionBySlug(sessionSlug);

          if (session.currentStagedItemId) {
            throw new RealtimeError("Unstage the current item before staging a new one.", {
              code: "invalid_request",
              target: "host",
            });
          }

          await store.updateItemStatus({
            itemId: payload.itemId,
            status: "staged",
          });

          await store.setStagedItem({
            sessionId: session._id,
            itemId: payload.itemId,
            voteWindowOpen: false,
          });

          await emitStagingChangedToRoom(session.slug);
          ack?.({ ok: true, data: { currentStagedItemId: payload.itemId } });
        } catch (error) {
          fail(socket, ack, error, "host");
        }
      },
    );

    socket.on(
      "host:unstage",
      async (_payload: object, ack?: Ack<{ currentStagedItemId: null }>) => {
        try {
          assertHostAuthorized(socket);
          const sessionSlug = socket.data.sessionSlug!;
          const session = await getSessionBySlug(sessionSlug);

          if (!session.currentStagedItemId) {
            throw new RealtimeError("No staged item to unstage.", {
              code: "invalid_request",
              target: "host",
            });
          }

          await store.updateItemStatus({
            itemId: session.currentStagedItemId,
            status: "pool",
          });

          await store.setStagedItem({
            sessionId: session._id,
            itemId: undefined,
            voteWindowOpen: false,
          });

          await emitStagingChangedToRoom(session.slug);
          ack?.({ ok: true, data: { currentStagedItemId: null } });
        } catch (error) {
          fail(socket, ack, error, "host");
        }
      },
    );

    socket.on(
      "host:setVoteWindow",
      async (payload: SetVoteWindowPayload, ack?: Ack<{ voteWindowOpen: boolean }>) => {
        try {
          assertHostAuthorized(socket);
          const sessionSlug = socket.data.sessionSlug!;
          const session = await getSessionBySlug(sessionSlug);

          if (!session.currentStagedItemId) {
            throw new RealtimeError("Stage an item before opening voting.", {
              code: "invalid_request",
              target: "host",
            });
          }

          await store.setStagedItem({
            sessionId: session._id,
            itemId: session.currentStagedItemId,
            voteWindowOpen: payload.open,
          });

          await emitStagingChangedToRoom(session.slug);
          ack?.({ ok: true, data: { voteWindowOpen: payload.open } });
        } catch (error) {
          fail(socket, ack, error, "host");
        }
      },
    );

    socket.on(
      "host:finalizePlacement",
      async (payload: FinalizePlacementPayload, ack?: Ack<{ finalizedItemId: string }>) => {
        try {
          assertHostAuthorized(socket);
          const sessionSlug = socket.data.sessionSlug!;
          const session = await getSessionBySlug(sessionSlug);

          if (!session.currentStagedItemId) {
            throw new RealtimeError("No staged item to finalize.", {
              code: "invalid_request",
              target: "host",
            });
          }

          const finalizedItemId = session.currentStagedItemId;

          await store.upsertStreamerPlacement({
            sessionId: session._id,
            itemId: finalizedItemId,
            tier: payload.tier,
          });

          await store.updateItemStatus({
            itemId: finalizedItemId,
            status: "placed",
          });

          await store.setStagedItem({
            sessionId: session._id,
            itemId: undefined,
            voteWindowOpen: false,
          });

          await store.computeCommunityPlacements({
            sessionId: session._id,
            itemId: finalizedItemId,
          });

          await emitStagingChangedToRoom(session.slug);
          await emitBoardsUpdatedToRoom(session.slug);
          ack?.({ ok: true, data: { finalizedItemId } });
        } catch (error) {
          fail(socket, ack, error, "host");
        }
      },
    );

    socket.on(
      "vote:cast",
      async (
        payload: VotePayload,
        ack?: Ack<{ totalVotes: number; avgScore: number | null }>,
      ) => {
        try {
          const sessionSlug = ensureSessionJoined(socket);

          if (!isValidTier(payload.tier)) {
            throw new RealtimeError("Invalid tier.", {
              code: "invalid_request",
              target: "viewer",
            });
          }

          const session = await getSessionBySlug(sessionSlug);
          if (!canAcceptVote(session, payload.itemId)) {
            throw new RealtimeError("Voting is currently closed.", {
              code: "invalid_request",
              target: "viewer",
            });
          }

          const voterKey = resolveVoterKey({
            providedVoterKey: payload.voterKey,
            persistedVoterKey: socket.data.viewerVoterKey,
            twitchUserId: payload.twitchUserId ?? socket.data.twitchUserId,
            socketId: socket.id,
          });

          socket.data.viewerVoterKey = voterKey;

          await store.upsertVote({
            sessionId: session._id,
            itemId: payload.itemId,
            voterKey,
            tier: payload.tier,
          });

          const twitchUserId = payload.twitchUserId ?? socket.data.twitchUserId;
          if (twitchUserId) {
            await store.upsertParticipation({
              twitchUserId,
              sessionId: session._id,
              lastVotedAt: Date.now(),
            });
          }

          const distribution = await getVoteDistributionPayload(session);
          io.to(roomForSession(session.slug)).emit("vote:distribution", distribution);

          ack?.({
            ok: true,
            data: {
              totalVotes: distribution.totalVotes,
              avgScore: distribution.avgScore,
            },
          });
        } catch (error) {
          fail(socket, ack, error, "viewer");
        }
      },
    );

    socket.on("disconnect", () => {
      rateLimiter.clearSocket(socket.id);
      const presence = presenceTracker.leave(socket.id);
      if (presence) {
        emitPresenceUpdate(presence.sessionSlug);
      }
    });
  });

  return {
    httpServer: server,
    io,
  };
}

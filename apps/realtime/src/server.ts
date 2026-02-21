import "dotenv/config";

import { createServer } from "node:http";

import cors from "cors";
import { ConvexHttpClient } from "convex/browser";
import { Server, type Socket } from "socket.io";

import { api } from "../../web/convex/_generated/api.ts";
import { verifyHostJwt, type HostJwtPayload } from "./lib/hostJwt.ts";
import {
  canAcceptVote,
  isValidTier,
  resolveVoterKey,
  type Tier,
} from "./lib/sessionState.ts";

type SessionDoc = {
  _id: string;
  hostUserId: string;
  slug: string;
  title: string;
  status: "draft" | "live" | "completed";
  currentStagedItemId?: string;
  voteWindowOpen: boolean;
  updatedAt: number;
};

type SocketData = {
  sessionSlug?: string;
  hostAuth?: HostJwtPayload;
  viewerVoterKey?: string;
  twitchUserId?: string;
};

type AckResponse<T> = { ok: true; data: T } | { ok: false; error: string };
type Ack<T> = (response: AckResponse<T>) => void;

type JoinSessionPayload = {
  sessionSlug: string;
  twitchUserId?: string;
  voterKey?: string;
};

type HostTokenPayload = {
  token: string;
};

type SetSessionStatusPayload = {
  status: "draft" | "live" | "completed";
};

type SetStagedItemPayload = {
  itemId?: string;
  voteWindowOpen: boolean;
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

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
}

const port = Number(process.env.PORT ?? 3001);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";

const convex = new ConvexHttpClient(convexUrl);

const corsMiddleware = cors({
  origin: corsOrigin === "*" ? true : corsOrigin,
  credentials: true,
});

const httpServer = createServer((req, res) => {
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

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true,
  },
});

function roomForSession(sessionSlug: string): string {
  return `session:${sessionSlug}`;
}

function fail<T>(ack: Ack<T> | undefined, error: unknown): void {
  if (!ack) return;
  const message = error instanceof Error ? error.message : "Unknown error";
  ack({ ok: false, error: message });
}

async function getSessionBySlug(sessionSlug: string): Promise<SessionDoc> {
  const session = await convex.query((api as any).sessions.getBySlug, {
    slug: sessionSlug,
  });

  if (!session) {
    throw new Error("Session not found");
  }

  return session as SessionDoc;
}

async function emitSessionStateToSocket(socket: Socket<any, any, any, SocketData>) {
  if (!socket.data.sessionSlug) return;

  const session = await getSessionBySlug(socket.data.sessionSlug);
  socket.emit("session:state", {
    sessionSlug: session.slug,
    title: session.title,
    status: session.status,
    voteWindowOpen: session.voteWindowOpen,
    currentStagedItemId: session.currentStagedItemId ?? null,
    updatedAt: session.updatedAt,
  });
}

async function emitSessionStateToRoom(sessionSlug: string): Promise<void> {
  const session = await getSessionBySlug(sessionSlug);
  io.to(roomForSession(sessionSlug)).emit("session:state", {
    sessionSlug: session.slug,
    title: session.title,
    status: session.status,
    voteWindowOpen: session.voteWindowOpen,
    currentStagedItemId: session.currentStagedItemId ?? null,
    updatedAt: session.updatedAt,
  });
}

async function emitCommunityPlacements(sessionId: string, sessionSlug: string): Promise<void> {
  const placements = await convex.query((api as any).communityPlacements.listBySession, {
    sessionId,
  });

  io.to(roomForSession(sessionSlug)).emit("community:placements", placements);
}

function assertHostAuthorized(
  socket: Socket<any, any, any, SocketData>,
): asserts socket is Socket<any, any, any, SocketData & { hostAuth: HostJwtPayload }> {
  if (!socket.data.hostAuth || !socket.data.sessionSlug) {
    throw new Error("Host authentication required");
  }
}

io.on("connection", (socket) => {
  socket.on("session:join", async (payload: JoinSessionPayload, ack?: Ack<{ voterKey: string }>) => {
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
      socket.join(roomForSession(payload.sessionSlug));

      if (payload.twitchUserId) {
        await convex.mutation((api as any).participation.upsert, {
          twitchUserId: payload.twitchUserId,
          sessionId: session._id,
        });
      }

      await emitSessionStateToSocket(socket);
      ack?.({ ok: true, data: { voterKey } });
    } catch (error) {
      fail(ack, error);
    }
  });

  socket.on("host:authenticate", async (payload: HostTokenPayload, ack?: Ack<{ sessionSlug: string }>) => {
    try {
      const verified = await verifyHostJwt(payload.token);
      const session = await getSessionBySlug(verified.sessionSlug);
      const hostUser = await convex.query((api as any).users.getById, {
        userId: session.hostUserId,
      });

      if (!hostUser || hostUser.twitchUserId !== verified.twitchUserId) {
        throw new Error("Forbidden");
      }

      socket.data.hostAuth = verified;
      socket.data.sessionSlug = verified.sessionSlug;
      socket.join(roomForSession(verified.sessionSlug));
      await emitSessionStateToSocket(socket);

      ack?.({ ok: true, data: { sessionSlug: verified.sessionSlug } });
    } catch (error) {
      fail(ack, error);
    }
  });

  socket.on("host:set-status", async (payload: SetSessionStatusPayload, ack?: Ack<SessionDoc>) => {
    try {
      assertHostAuthorized(socket);
      const sessionSlug = socket.data.sessionSlug;
      if (!sessionSlug) {
        throw new Error("Session not selected");
      }
      const session = await getSessionBySlug(sessionSlug);

      const updated = await convex.mutation((api as any).sessions.updateStatus, {
        sessionId: session._id,
        status: payload.status,
      });

      await emitSessionStateToRoom(session.slug);
      ack?.({ ok: true, data: updated as SessionDoc });
    } catch (error) {
      fail(ack, error);
    }
  });

  socket.on(
    "host:set-staged-item",
    async (payload: SetStagedItemPayload, ack?: Ack<{ currentStagedItemId: string | null }>) => {
      try {
        assertHostAuthorized(socket);
        const sessionSlug = socket.data.sessionSlug;
        if (!sessionSlug) {
          throw new Error("Session not selected");
        }
        const session = await getSessionBySlug(sessionSlug);

        if (payload.itemId) {
          await convex.mutation((api as any).items.updateStatus, {
            itemId: payload.itemId,
            status: "staged",
          });
        }

        await convex.mutation((api as any).sessions.setStagedItem, {
          sessionId: session._id,
          itemId: payload.itemId,
          voteWindowOpen: payload.voteWindowOpen,
        });

        await emitSessionStateToRoom(session.slug);
        ack?.({ ok: true, data: { currentStagedItemId: payload.itemId ?? null } });
      } catch (error) {
        fail(ack, error);
      }
    },
  );

  socket.on(
    "host:set-vote-window",
    async (payload: SetVoteWindowPayload, ack?: Ack<{ voteWindowOpen: boolean }>) => {
      try {
        assertHostAuthorized(socket);
        const sessionSlug = socket.data.sessionSlug;
        if (!sessionSlug) {
          throw new Error("Session not selected");
        }
        const session = await getSessionBySlug(sessionSlug);

        await convex.mutation((api as any).sessions.setStagedItem, {
          sessionId: session._id,
          itemId: session.currentStagedItemId,
          voteWindowOpen: payload.open,
        });

        await emitSessionStateToRoom(session.slug);
        ack?.({ ok: true, data: { voteWindowOpen: payload.open } });
      } catch (error) {
        fail(ack, error);
      }
    },
  );

  socket.on("host:finalize-staged-item", async (_payload: object, ack?: Ack<{ finalizedItemId: string }>) => {
    try {
      assertHostAuthorized(socket);
      const sessionSlug = socket.data.sessionSlug;
      if (!sessionSlug) {
        throw new Error("Session not selected");
      }
      const session = await getSessionBySlug(sessionSlug);

      if (!session.currentStagedItemId) {
        throw new Error("No staged item to finalize");
      }

      const finalizedItemId = session.currentStagedItemId;
      await convex.mutation((api as any).items.updateStatus, {
        itemId: finalizedItemId,
        status: "placed",
      });

      await convex.mutation((api as any).sessions.setStagedItem, {
        sessionId: session._id,
        itemId: undefined,
        voteWindowOpen: false,
      });

      await convex.mutation((api as any).communityPlacements.computeForItem, {
        sessionId: session._id,
        itemId: finalizedItemId,
      });

      await emitSessionStateToRoom(session.slug);
      await emitCommunityPlacements(session._id, session.slug);

      ack?.({ ok: true, data: { finalizedItemId } });
    } catch (error) {
      fail(ack, error);
    }
  });

  socket.on("viewer:vote", async (payload: VotePayload, ack?: Ack<{ totalVotes: number; avgScore: number | null }>) => {
    try {
      if (!socket.data.sessionSlug) {
        throw new Error("Join a session first");
      }

      if (!isValidTier(payload.tier)) {
        throw new Error("Invalid tier");
      }

      const session = await getSessionBySlug(socket.data.sessionSlug);
      if (!canAcceptVote(session, payload.itemId)) {
        throw new Error("Voting is currently closed");
      }

      const voterKey = resolveVoterKey({
        providedVoterKey: payload.voterKey,
        persistedVoterKey: socket.data.viewerVoterKey,
        twitchUserId: payload.twitchUserId ?? socket.data.twitchUserId,
        socketId: socket.id,
      });

      socket.data.viewerVoterKey = voterKey;

      await convex.mutation((api as any).votes.upsert, {
        sessionId: session._id,
        itemId: payload.itemId,
        voterKey,
        tier: payload.tier as Tier,
      });

      if (payload.twitchUserId ?? socket.data.twitchUserId) {
        await convex.mutation((api as any).participation.upsert, {
          twitchUserId: (payload.twitchUserId ?? socket.data.twitchUserId) as string,
          sessionId: session._id,
          lastVotedAt: Date.now(),
        });
      }

      const distribution = await convex.query((api as any).votes.distributionByItem, {
        itemId: payload.itemId,
      });

      io.to(roomForSession(session.slug)).emit("votes:distribution", {
        itemId: payload.itemId,
        ...distribution,
      });

      ack?.({
        ok: true,
        data: {
          totalVotes: distribution.totalVotes,
          avgScore: distribution.avgScore,
        },
      });
    } catch (error) {
      fail(ack, error);
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Realtime server listening on port ${port}`);
});

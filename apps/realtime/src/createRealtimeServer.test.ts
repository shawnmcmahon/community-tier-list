import assert from "node:assert/strict";
import test from "node:test";

import { io as ioClient, type Socket } from "socket.io-client";

import { createRealtimeServer } from "./createRealtimeServer.ts";
import type {
  BoardsUpdatedPayload,
  SessionDoc,
  SessionItem,
  TierPlacement,
  VoteDistribution,
} from "./lib/protocol.ts";
import type { Tier } from "./lib/sessionState.ts";

type VoteRecord = {
  sessionId: string;
  itemId: string;
  voterKey: string;
  tier: Tier;
};

type ParticipationRecord = {
  sessionId: string;
  twitchUserId: string;
  lastVotedAt?: number;
};

function tierScore(tier: Tier): number {
  return { S: 5, A: 4, B: 3, C: 2, D: 1 }[tier];
}

function avgToTier(avgScore: number | null): Tier {
  if (avgScore === null) return "D";
  if (avgScore >= 4.5) return "S";
  if (avgScore >= 3.5) return "A";
  if (avgScore >= 2.5) return "B";
  if (avgScore >= 1.5) return "C";
  return "D";
}

function summarizeVotes(votes: VoteRecord[]): VoteDistribution {
  const distribution: VoteDistribution = {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    totalVotes: votes.length,
    avgScore: null,
  };

  if (votes.length === 0) {
    return distribution;
  }

  let totalScore = 0;
  for (const vote of votes) {
    distribution[vote.tier] += 1;
    totalScore += tierScore(vote.tier);
  }

  distribution.avgScore = totalScore / votes.length;
  return distribution;
}

function createFakeStore() {
  let tick = 1_000;
  const nextTick = () => ++tick;

  const session: SessionDoc = {
    _id: "session-1",
    hostUserId: "user-1",
    slug: "stream-session",
    title: "Stream Session",
    status: "draft",
    currentStagedItemId: undefined,
    voteWindowOpen: false,
    updatedAt: nextTick(),
  };

  const hostUser = {
    _id: "user-1",
    twitchUserId: "host-123",
    twitchDisplayName: "Host",
  };

  const items = new Map<string, SessionItem>([
    [
      "item-1",
      {
        _id: "item-1",
        label: "Item One",
        imageUrl: "/placeholder.svg",
        status: "pool",
        orderIndex: 0,
      },
    ],
    [
      "item-2",
      {
        _id: "item-2",
        label: "Item Two",
        imageUrl: "/placeholder.svg",
        status: "pool",
        orderIndex: 1,
      },
    ],
  ]);

  let streamerPlacements: TierPlacement[] = [];
  let communityPlacements: TierPlacement[] = [];
  let votes: VoteRecord[] = [];
  const participation = new Map<string, ParticipationRecord>();

  return {
    async getSessionBySlug(sessionSlug: string) {
      return sessionSlug === session.slug ? { ...session } : null;
    },
    async getUserById(userId: string) {
      return userId === hostUser._id ? { ...hostUser } : null;
    },
    async listItemsBySession() {
      return [...items.values()].sort((left, right) => left.orderIndex - right.orderIndex);
    },
    async listStreamerPlacementsBySession() {
      return streamerPlacements.slice();
    },
    async listCommunityPlacementsBySession() {
      return communityPlacements.slice();
    },
    async distributionByItem(itemId: string) {
      return summarizeVotes(votes.filter((vote) => vote.itemId === itemId));
    },
    async upsertParticipation(input: {
      sessionId: string;
      twitchUserId: string;
      lastVotedAt?: number;
    }) {
      participation.set(`${input.sessionId}:${input.twitchUserId}`, { ...input });
    },
    async updateSessionStatus(input: { sessionId: string; status: SessionDoc["status"] }) {
      assert.equal(input.sessionId, session._id);
      session.status = input.status;
      session.updatedAt = nextTick();
      return { ...session };
    },
    async setStagedItem(input: {
      sessionId: string;
      itemId?: string;
      voteWindowOpen: boolean;
    }) {
      assert.equal(input.sessionId, session._id);
      session.currentStagedItemId = input.itemId;
      session.voteWindowOpen = input.voteWindowOpen;
      session.updatedAt = nextTick();
      return { ...session };
    },
    async updateItemStatus(input: {
      itemId: string;
      status: SessionItem["status"];
    }) {
      const item = items.get(input.itemId);
      assert.ok(item);
      item.status = input.status;
      return { ...item };
    },
    async upsertStreamerPlacement(input: {
      sessionId: string;
      itemId: string;
      tier: Tier;
    }) {
      assert.equal(input.sessionId, session._id);
      streamerPlacements = [
        ...streamerPlacements.filter((placement) => placement.itemId !== input.itemId),
        {
          itemId: input.itemId,
          tier: input.tier,
          position: 0,
        },
      ];
      return streamerPlacements.slice();
    },
    async computeCommunityPlacements(input: { sessionId: string; itemId: string }) {
      assert.equal(input.sessionId, session._id);
      const distribution = summarizeVotes(
        votes.filter((vote) => vote.itemId === input.itemId),
      );
      communityPlacements = [
        ...communityPlacements.filter((placement) => placement.itemId !== input.itemId),
        {
          itemId: input.itemId,
          tier: avgToTier(distribution.avgScore),
          position: 0,
        },
      ];
      return communityPlacements.slice();
    },
    async upsertVote(input: VoteRecord) {
      votes = [
        ...votes.filter(
          (vote) =>
            !(vote.itemId === input.itemId && vote.voterKey === input.voterKey),
        ),
        input,
      ];
    },
  };
}

function onceEvent<T>(
  socket: Socket,
  eventName: string,
  predicate: (payload: T) => boolean = () => true,
): Promise<T> {
  return new Promise((resolve) => {
    const handler = (payload: T) => {
      if (!predicate(payload)) {
        return;
      }

      socket.off(eventName, handler);
      resolve(payload);
    };

    socket.on(eventName, handler);
  });
}

function emitAck<TResponse>(socket: Socket, eventName: string, payload: object): Promise<TResponse> {
  return new Promise((resolve) => {
    socket.emit(eventName, payload, (response: TResponse) => resolve(response));
  });
}

async function connectClient(baseUrl: string): Promise<Socket> {
  const socket = ioClient(baseUrl, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
  });

  await new Promise<void>((resolve, reject) => {
    socket.once("connect", () => resolve());
    socket.once("connect_error", (error) => reject(error));
  });

  return socket;
}

test("createRealtimeServer handles host, viewer, unstage, reconnect, and finalize flow", async (t) => {
  const store = createFakeStore();
  const { httpServer, io } = createRealtimeServer({
    corsOrigin: "*",
    store,
    verifyHostToken: async (token) => {
      assert.equal(token, "host-token");
      return {
        role: "HOST",
        twitchUserId: "host-123",
        sessionSlug: "stream-session",
      };
    },
  });

  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const address = httpServer.address();
  assert.ok(address && typeof address === "object");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  let hostSocket: Socket | null = null;
  let viewerSocket: Socket | null = null;
  let reconnectedViewerSocket: Socket | null = null;

  t.after(async () => {
    hostSocket?.disconnect();
    viewerSocket?.disconnect();
    reconnectedViewerSocket?.disconnect();
    await new Promise<void>((resolve) => io.close(() => resolve()));
    if (httpServer.listening) {
      await new Promise<void>((resolve, reject) =>
        httpServer.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  hostSocket = await connectClient(baseUrl);
  viewerSocket = await connectClient(baseUrl);

  const hostInitialState = onceEvent<{ status: string }>(
    hostSocket,
    "session:state",
    (payload) => payload.status === "draft",
  );
  const hostAuth = await emitAck<{ ok: boolean; data?: { sessionSlug: string } }>(
    hostSocket,
    "host:authenticate",
    { token: "host-token" },
  );
  assert.equal(hostAuth.ok, true);
  await hostInitialState;

  const viewerInitialState = onceEvent<{ status: string }>(
    viewerSocket,
    "session:state",
    (payload) => payload.status === "draft",
  );
  const viewerJoin = await emitAck<{ ok: true; data: { voterKey: string } }>(
    viewerSocket,
    "session:join",
    {
      sessionSlug: "stream-session",
      displayName: "Viewer One",
    },
  );
  assert.equal(viewerJoin.ok, true);
  const voterKey = viewerJoin.data.voterKey;
  await viewerInitialState;

  const liveState = onceEvent<{ status: string }>(
    viewerSocket,
    "session:state",
    (payload) => payload.status === "live",
  );
  await emitAck(hostSocket, "host:start", {});
  await liveState;

  const staged = onceEvent<{ currentStagedItemId: string | null; items: SessionItem[] }>(
    viewerSocket,
    "staging:changed",
    (payload) => payload.currentStagedItemId === "item-1",
  );
  const initialDistribution = onceEvent<{ itemId: string | null; totalVotes: number }>(
    viewerSocket,
    "vote:distribution",
    (payload) => payload.itemId === "item-1",
  );
  await emitAck(hostSocket, "host:stageItem", { itemId: "item-1" });
  const stagedPayload = await staged;
  assert.equal(
    stagedPayload.items.find((item) => item._id === "item-1")?.status,
    "staged",
  );
  assert.equal((await initialDistribution).totalVotes, 0);

  const unstaged = onceEvent<{ currentStagedItemId: string | null; items: SessionItem[] }>(
    viewerSocket,
    "staging:changed",
    (payload) => payload.currentStagedItemId === null,
  );
  await emitAck(hostSocket, "host:unstage", {});
  const unstagedPayload = await unstaged;
  assert.equal(
    unstagedPayload.items.find((item) => item._id === "item-1")?.status,
    "pool",
  );

  const restaged = onceEvent<{ currentStagedItemId: string | null }>(
    viewerSocket,
    "staging:changed",
    (payload) => payload.currentStagedItemId === "item-1",
  );
  await emitAck(hostSocket, "host:stageItem", { itemId: "item-1" });
  await restaged;

  const votingOpened = onceEvent<{ voteWindowOpen: boolean }>(
    viewerSocket,
    "staging:changed",
    (payload) => payload.voteWindowOpen === true,
  );
  await emitAck(hostSocket, "host:setVoteWindow", { open: true });
  await votingOpened;

  const voteDistribution = onceEvent<{ itemId: string | null; totalVotes: number; A: number }>(
    hostSocket,
    "vote:distribution",
    (payload) => payload.itemId === "item-1" && payload.totalVotes === 1,
  );
  const voteResponse = await emitAck<{
    ok: boolean;
    data?: { totalVotes: number; avgScore: number | null };
  }>(viewerSocket, "vote:cast", {
    itemId: "item-1",
    tier: "A",
    voterKey,
  });
  assert.equal(voteResponse.ok, true);
  assert.equal(voteResponse.data?.totalVotes, 1);
  assert.equal((await voteDistribution).A, 1);

  const hostPresenceAfterDisconnect = onceEvent<{ viewerCount: number }>(
    hostSocket,
    "presence:update",
    (payload) => payload.viewerCount === 1,
  );
  viewerSocket.disconnect();
  await hostPresenceAfterDisconnect;

  reconnectedViewerSocket = await connectClient(baseUrl);
  const reconnectedState = onceEvent<{ currentStagedItemId: string | null }>(
    reconnectedViewerSocket,
    "session:state",
    (payload) => payload.currentStagedItemId === "item-1",
  );
  const reconnectedDistribution = onceEvent<{ itemId: string | null; totalVotes: number }>(
    reconnectedViewerSocket,
    "vote:distribution",
    (payload) => payload.itemId === "item-1" && payload.totalVotes === 1,
  );
  const reconnectJoin = await emitAck<{ ok: true; data: { voterKey: string } }>(
    reconnectedViewerSocket,
    "session:join",
    {
      sessionSlug: "stream-session",
      voterKey,
      displayName: "Viewer One",
    },
  );
  assert.equal(reconnectJoin.data.voterKey, voterKey);
  await reconnectedState;
  await reconnectedDistribution;

  const stagingCleared = onceEvent<{ currentStagedItemId: string | null }>(
    reconnectedViewerSocket,
    "staging:changed",
    (payload) => payload.currentStagedItemId === null,
  );
  const boardsUpdated = onceEvent<BoardsUpdatedPayload>(
    reconnectedViewerSocket,
    "boards:updated",
    (payload) =>
      payload.streamerPlacements.length === 1 &&
      payload.communityPlacements.length === 1,
  );
  await emitAck(hostSocket, "host:finalizePlacement", { tier: "S" });
  await stagingCleared;
  const boardsPayload = await boardsUpdated;
  assert.equal(boardsPayload.streamerPlacements[0]?.tier, "S");
  assert.equal(boardsPayload.communityPlacements[0]?.itemId, "item-1");
  assert.equal(
    boardsPayload.items.find((item) => item._id === "item-1")?.status,
    "placed",
  );

  const completedState = onceEvent<{ status: string }>(
    reconnectedViewerSocket,
    "session:state",
    (payload) => payload.status === "completed",
  );
  await emitAck(hostSocket, "host:complete", {});
  await completedState;
});

test("createRealtimeServer rate limits repeated state requests", async (t) => {
  const { httpServer, io } = createRealtimeServer({
    corsOrigin: "*",
    store: createFakeStore(),
    verifyHostToken: async () => ({
      role: "HOST",
      twitchUserId: "host-123",
      sessionSlug: "stream-session",
    }),
  });

  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  const address = httpServer.address();
  assert.ok(address && typeof address === "object");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  let viewerSocket: Socket | null = null;

  t.after(async () => {
    viewerSocket?.disconnect();
    await new Promise<void>((resolve) => io.close(() => resolve()));
    if (httpServer.listening) {
      await new Promise<void>((resolve, reject) =>
        httpServer.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  viewerSocket = await connectClient(baseUrl);
  await emitAck(viewerSocket, "session:join", {
    sessionSlug: "stream-session",
    displayName: "Viewer One",
  });

  for (let index = 0; index < 8; index += 1) {
    const response: { ok: boolean } = await emitAck<{ ok: boolean }>(
      viewerSocket,
      "session:stateRequest",
      {},
    );
    assert.equal(response.ok, true);
  }

  const rateLimitError = onceEvent<{ code: string; target: string }>(
    viewerSocket,
    "error:toast",
    (payload) => payload.code === "rate_limited",
  );
  const limitedResponse = await emitAck<{ ok: boolean; error?: string }>(
    viewerSocket,
    "session:stateRequest",
    {},
  );
  assert.equal(limitedResponse.ok, false);
  assert.match(limitedResponse.error ?? "", /Too many state requests/i);
  assert.deepEqual(await rateLimitError, {
    code: "rate_limited",
    message: "Too many state requests. Try again in 10s.",
    target: "session",
  });
});

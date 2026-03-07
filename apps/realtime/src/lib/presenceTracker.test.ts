import assert from "node:assert/strict";
import test from "node:test";

import { PresenceTracker } from "./presenceTracker.ts";

test("PresenceTracker tracks joins and recent viewers per session", () => {
  const tracker = new PresenceTracker();

  assert.deepEqual(
    tracker.join({
      sessionSlug: "session-a",
      socketId: "socket-1",
      label: "Viewer One",
    }),
    {
      viewerCount: 1,
      recentJoins: ["Viewer One"],
    },
  );

  assert.deepEqual(
    tracker.join({
      sessionSlug: "session-a",
      socketId: "socket-2",
      label: "Viewer Two",
    }),
    {
      viewerCount: 2,
      recentJoins: ["Viewer Two", "Viewer One"],
    },
  );

  assert.deepEqual(tracker.snapshot("session-a"), {
    viewerCount: 2,
    recentJoins: ["Viewer Two", "Viewer One"],
  });
});

test("PresenceTracker removes sockets and clears an empty session", () => {
  const tracker = new PresenceTracker();

  tracker.join({
    sessionSlug: "session-a",
    socketId: "socket-1",
    label: "Viewer One",
  });

  assert.deepEqual(tracker.leave("socket-1"), {
    sessionSlug: "session-a",
    snapshot: {
      viewerCount: 0,
      recentJoins: [],
    },
  });

  assert.deepEqual(tracker.snapshot("session-a"), {
    viewerCount: 0,
    recentJoins: [],
  });
});

test("PresenceTracker moves sockets between sessions", () => {
  const tracker = new PresenceTracker();

  tracker.join({
    sessionSlug: "session-a",
    socketId: "socket-1",
    label: "Viewer One",
  });

  tracker.join({
    sessionSlug: "session-b",
    socketId: "socket-1",
    label: "Viewer One",
  });

  assert.deepEqual(tracker.snapshot("session-a"), {
    viewerCount: 0,
    recentJoins: [],
  });

  assert.deepEqual(tracker.snapshot("session-b"), {
    viewerCount: 1,
    recentJoins: ["Viewer One"],
  });
});

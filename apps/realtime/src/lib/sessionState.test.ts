import test from "node:test";
import assert from "node:assert/strict";

import { canAcceptVote, isValidTier, resolveVoterKey } from "./sessionState.ts";

test("canAcceptVote returns true only for live open staged item", () => {
  assert.equal(
    canAcceptVote(
      { status: "live", voteWindowOpen: true, currentStagedItemId: "item-1" },
      "item-1",
    ),
    true,
  );

  assert.equal(
    canAcceptVote(
      { status: "live", voteWindowOpen: false, currentStagedItemId: "item-1" },
      "item-1",
    ),
    false,
  );

  assert.equal(
    canAcceptVote(
      { status: "draft", voteWindowOpen: true, currentStagedItemId: "item-1" },
      "item-1",
    ),
    false,
  );

  assert.equal(
    canAcceptVote(
      { status: "live", voteWindowOpen: true, currentStagedItemId: "item-2" },
      "item-1",
    ),
    false,
  );
});

test("isValidTier validates allowed tiers", () => {
  assert.equal(isValidTier("S"), true);
  assert.equal(isValidTier("D"), true);
  assert.equal(isValidTier("F"), false);
});

test("resolveVoterKey uses stable precedence", () => {
  assert.equal(
    resolveVoterKey({
      providedVoterKey: " custom-key ",
      persistedVoterKey: "persisted",
      twitchUserId: "123",
      socketId: "sock-1",
    }),
    "custom-key",
  );

  assert.equal(
    resolveVoterKey({
      persistedVoterKey: "persisted",
      twitchUserId: "123",
      socketId: "sock-1",
    }),
    "persisted",
  );

  assert.equal(
    resolveVoterKey({
      twitchUserId: "123",
      socketId: "sock-1",
    }),
    "twitch:123",
  );

  assert.equal(
    resolveVoterKey({
      socketId: "sock-1",
    }),
    "anon:sock-1",
  );
});

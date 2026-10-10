import assert from "node:assert/strict";
import test from "node:test";
import { validateHostCommand, validateVote } from "./live_rules.ts";

test("host controls require live sessions, a pool item and a valid staged item", () => {
  assert.throws(() => validateHostCommand("stage", { status: "draft" }), /Go live/);
  assert.throws(() => validateHostCommand("stage", { status: "live", currentStagedItemId: "i1" }), /Finish/);
  assert.throws(() => validateHostCommand("stage", { status: "live" }, { _id: "i1", sessionId: "other", status: "pool" }, "s1"), /pool/);
  assert.doesNotThrow(() => validateHostCommand("stage", { status: "live" }, { _id: "i1", sessionId: "s1", status: "pool" }, "s1"));
  assert.throws(() => validateHostCommand("finalize", { status: "live" }), /Stage/);
  assert.throws(() => validateHostCommand("finalize", { status: "live", currentStagedItemId: "i1" }), /Choose/);
  assert.doesNotThrow(() => validateHostCommand("finalize", { status: "live", currentStagedItemId: "i1" }, null, "s1", "S"));
});

test("completed sessions cannot be changed or reopened", () => {
  for (const command of ["start", "complete", "stage", "open", "close", "unstage", "finalize"] as const) {
    assert.throws(() => validateHostCommand(command, { status: "completed" }), /complete/);
  }
});

test("votes are accepted only for the live, staged item while voting is open", () => {
  const state = { status: "live", voteWindowOpen: true, currentStagedItemId: "i1" };
  assert.doesNotThrow(() => validateVote(state, "i1"));
  assert.throws(() => validateVote(state, "other"), /closed/);
  assert.throws(() => validateVote({ ...state, voteWindowOpen: false }, "i1"), /closed/);
  assert.throws(() => validateVote({ ...state, status: "completed" }, "i1"), /closed/);
});

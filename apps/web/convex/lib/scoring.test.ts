import test from "node:test";
import assert from "node:assert/strict";

import { avgToTier, summarizeTierVotes, type Tier } from "./scoring.ts";

test("avgToTier maps exact boundaries", () => {
  assert.equal(avgToTier(4.5), "S");
  assert.equal(avgToTier(3.5), "A");
  assert.equal(avgToTier(2.5), "B");
  assert.equal(avgToTier(1.5), "C");
  assert.equal(avgToTier(1.49), "D");
});

test("avgToTier returns null for empty/invalid values", () => {
  assert.equal(avgToTier(null), null);
  assert.equal(avgToTier(Number.NaN), null);
});

test("summarizeTierVotes computes distribution and average", () => {
  const votes: Tier[] = ["S", "A", "A", "C", "D"];
  const result = summarizeTierVotes(votes);

  assert.deepEqual(result.distribution, { S: 1, A: 2, B: 0, C: 1, D: 1 });
  assert.equal(result.totalVotes, 5);
  assert.equal(result.avgScore, 3.2);
});

test("summarizeTierVotes returns null average for empty votes", () => {
  const result = summarizeTierVotes([]);

  assert.deepEqual(result.distribution, { S: 0, A: 0, B: 0, C: 0, D: 0 });
  assert.equal(result.totalVotes, 0);
  assert.equal(result.avgScore, null);
});

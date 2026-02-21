import test from "node:test";
import assert from "node:assert/strict";

import { upsertAndRenumberPlacements, type PlacementInput } from "./placement.ts";

type Placement = PlacementInput<string>;

test("adds new placement to end of a tier and renumbers", () => {
  const placements: Placement[] = [
    { itemId: "one", tier: "A", position: 0 },
    { itemId: "two", tier: "A", position: 1 },
  ];

  const result = upsertAndRenumberPlacements(placements, {
    itemId: "three",
    tier: "A",
  });

  assert.deepEqual(
    result
      .filter((placement) => placement.tier === "A")
      .sort((a, b) => a.position - b.position),
    [
      { itemId: "one", tier: "A", position: 0 },
      { itemId: "two", tier: "A", position: 1 },
      { itemId: "three", tier: "A", position: 2 },
    ],
  );
});

test("inserts at specific target position and renumbers", () => {
  const placements: Placement[] = [
    { itemId: "one", tier: "B", position: 0 },
    { itemId: "two", tier: "B", position: 1 },
  ];

  const result = upsertAndRenumberPlacements(placements, {
    itemId: "three",
    tier: "B",
    targetPosition: 1,
  });

  assert.deepEqual(
    result
      .filter((placement) => placement.tier === "B")
      .sort((a, b) => a.position - b.position),
    [
      { itemId: "one", tier: "B", position: 0 },
      { itemId: "three", tier: "B", position: 1 },
      { itemId: "two", tier: "B", position: 2 },
    ],
  );
});

test("moves item across tiers and renumbers both tiers", () => {
  const placements: Placement[] = [
    { itemId: "one", tier: "A", position: 0 },
    { itemId: "two", tier: "A", position: 1 },
    { itemId: "three", tier: "C", position: 0 },
  ];

  const result = upsertAndRenumberPlacements(placements, {
    itemId: "two",
    tier: "C",
    targetPosition: 0,
  });

  assert.deepEqual(
    result
      .filter((placement) => placement.tier === "A")
      .sort((a, b) => a.position - b.position),
    [{ itemId: "one", tier: "A", position: 0 }],
  );

  assert.deepEqual(
    result
      .filter((placement) => placement.tier === "C")
      .sort((a, b) => a.position - b.position),
    [
      { itemId: "two", tier: "C", position: 0 },
      { itemId: "three", tier: "C", position: 1 },
    ],
  );
});

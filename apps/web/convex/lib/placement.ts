import type { Tier } from "./scoring.ts";

export type PlacementInput<TItemId extends string = string> = {
  itemId: TItemId;
  tier: Tier;
  position: number;
};

export function upsertAndRenumberPlacements<TItemId extends string>(
  placements: PlacementInput<TItemId>[],
  input: { itemId: TItemId; tier: Tier; targetPosition?: number },
): PlacementInput<TItemId>[] {
  const withoutItem = placements.filter((placement) => placement.itemId !== input.itemId);

  const bucket = withoutItem
    .filter((placement) => placement.tier === input.tier)
    .sort((a, b) => a.position - b.position);

  const boundedPosition = Math.max(
    0,
    Math.min(input.targetPosition ?? bucket.length, bucket.length),
  );

  bucket.splice(boundedPosition, 0, {
    itemId: input.itemId,
    tier: input.tier,
    position: boundedPosition,
  });

  const merged = withoutItem
    .filter((placement) => placement.tier !== input.tier)
    .concat(bucket)
    .sort((a, b) => {
      if (a.tier === b.tier) {
        return a.position - b.position;
      }
      return a.tier.localeCompare(b.tier);
    });

  const byTier = new Map<Tier, PlacementInput<TItemId>[]>();
  for (const placement of merged) {
    const tierPlacements = byTier.get(placement.tier) ?? [];
    tierPlacements.push(placement);
    byTier.set(placement.tier, tierPlacements);
  }

  const normalized: PlacementInput<TItemId>[] = [];
  for (const [tier, tierPlacements] of byTier.entries()) {
    tierPlacements
      .sort((a, b) => a.position - b.position)
      .forEach((placement, position) => {
        normalized.push({
          itemId: placement.itemId,
          tier,
          position,
        });
      });
  }

  return normalized;
}

export type RateLimitPolicy = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();

  check(socketId: string, policy: RateLimitPolicy, now = Date.now()): RateLimitResult {
    const bucketKey = `${socketId}:${policy.key}`;
    const existing = this.buckets.get(bucketKey);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(bucketKey, {
        count: 1,
        resetAt: now + policy.windowMs,
      });
      return { ok: true };
    }

    if (existing.count >= policy.limit) {
      return {
        ok: false,
        retryAfterMs: Math.max(0, existing.resetAt - now),
      };
    }

    existing.count += 1;
    return { ok: true };
  }
}

import assert from "node:assert/strict";
import test from "node:test";

import { FixedWindowRateLimiter } from "./rateLimiter.ts";

test("FixedWindowRateLimiter allows requests within a window", () => {
  const limiter = new FixedWindowRateLimiter();

  assert.deepEqual(
    limiter.check(
      "socket-1",
      {
        key: "vote",
        limit: 2,
        windowMs: 1_000,
      },
      1_000,
    ),
    { ok: true },
  );

  assert.deepEqual(
    limiter.check(
      "socket-1",
      {
        key: "vote",
        limit: 2,
        windowMs: 1_000,
      },
      1_100,
    ),
    { ok: true },
  );
});

test("FixedWindowRateLimiter blocks requests after the limit and resets after the window", () => {
  const limiter = new FixedWindowRateLimiter();
  const policy = {
    key: "state",
    limit: 1,
    windowMs: 500,
  };

  assert.deepEqual(limiter.check("socket-1", policy, 2_000), { ok: true });
  assert.deepEqual(limiter.check("socket-1", policy, 2_100), {
    ok: false,
    retryAfterMs: 400,
  });
  assert.deepEqual(limiter.check("socket-1", policy, 2_600), { ok: true });
});

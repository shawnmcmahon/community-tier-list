# MVP smoke test

## Validation recorded on 2026-10-09

The browser test used the production Next.js build against the actual hosted Convex deployment. An isolated smoke-test host used a short-lived Auth.js cookie generated with the real local secret; this tests application authorization without adding a login bypass. It does **not** complete a real Twitch user/password/consent round trip.

Checks passed:
- Dashboard form creates a session and navigates to its host page.
- Nine manually added items synchronize; the ninth item is stageable.
- Independent anonymous Chrome contexts vote by button and keyboard.
- Two voters produce two votes; changing S to A keeps two votes, with A=1, D=1, average=2.5.
- Closing voting disables controls; server-side closed-session writes are rejected.
- Finalizing gives the streamer an S placement and the audience a B placement.
- An unvoted item gets no fabricated community rank.
- Unstage/restage, offline/online reconnect, reload, and personal-board persistence work.
- Completing closes voting and preserves final boards after reload.
- Presence deduplicates identities, cleans up closing browsers, and expires lost connections within its 90-second lease.
- Mobile at 390×844 has no horizontal overflow; traditional tier colors and neutral surfaces were visually inspected.
- Anonymous host commands (401), invalid tiers (400), cross-origin writes (403), and forged direct Convex mutations are rejected.
- Root checks: typecheck, lint, 26 tests, optimized Next.js build.

Screenshots and private browser state are under ignored `output/playwright/`. Never commit authentication state.

## Repeat the core browser flow

1. Start `npm run dev:convex` and `npm run dev:web` with the matching server secret configured.
2. Sign in with Twitch and create a session.
3. Add at least nine labels and share the link with two separate anonymous browser contexts.
4. Go live; stage the ninth item; open voting.
5. Vote S in one viewer and D using keyboard 5 in the other. Change the first vote to A. Expect two votes and a B community result.
6. Close voting; verify viewers cannot vote. Finalize the host's choice as S.
7. Stage/unstage another item, interrupt and restore a viewer's network, then confirm updated state and the personal board.
8. Finalize an unvoted item; it must not acquire an invented community rank.
9. Complete, reload, and verify final boards. Close browsers and allow up to 90 seconds for lost connections to expire.
10. Check at mobile width and tab through buttons/forms.

For a local isolated host fixture, run `node scripts/prepare-e2e.mjs http://localhost:3100` and load the private `output/playwright/host-state.json` with Playwright CLI. `scripts/check-smoke.mjs` verifies the intermediate cloud tally and rejected writes; `scripts/verify-smoke.mjs` verifies completion and cleanup for the recorded scenario.

## TierMaker import

Try an invalid/non-template URL and verify a readable validation error. Try a direct `https://tiermaker.com/create/...` template. If Cloudflare blocks it, verify the manual-label fallback remains usable. Parser tests cover imports, duplicate images, invalid URLs, and bot-challenge pages. Live imports cannot bypass TierMaker's bot protection.

## Live deployment check

Repeat the same host/viewer flow at [the production app](https://community-tier-list-web.vercel.app) before retiring Lightsail. Production validation and executed resource retirement are recorded in [the deployment runbook](../deployment/convex-realtime.md).

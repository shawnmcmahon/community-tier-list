# Phase 6 Handoff — What You Need To Do

Code and docs for the MVP are in place. Complete these steps when you are ready to run locally or in production.

## Local (about 15 minutes)

1. `npm install` at repo root
2. Copy `apps/web/.env.example` → `apps/web/.env.local` and fill secrets (see `getting-started.md`)
3. For **local** realtime, set in `apps/web/.env.local`:
   - `NEXT_PUBLIC_REALTIME_URL=http://localhost:3001`
   - `CORS_ORIGIN=http://localhost:3000`
4. Run three terminals: `npm run dev:convex`, `npm run dev:web`, `npm run dev:realtime`
5. Walk through `docs/testing/phase5-phase6-smoke-test.md`

## Production (when ready)

| Service | Action |
|---------|--------|
| **Convex** | Ensure deployment matches `NEXT_PUBLIC_CONVEX_URL`; run `npm run convex:deploy` after backend changes |
| **Vercel** | Root dir `apps/web`; set env vars from `getting-started.md`; Twitch callback URL for prod domain |
| **Lightsail** | Follow `docs/deployment/lightsail-realtime.md`; `CORS_ORIGIN` must match Vercel URL exactly (no trailing `/`) |
| **Twitch** | OAuth redirect URIs for localhost + production |

## Already configured in your workspace

Your `apps/web/.env.local` points realtime at production (`realtime.communitytierlist.com`). That is fine for testing prod realtime while developing web locally; switch to localhost URLs when testing the full stack locally.

## MVP complete when

- [ ] Local smoke test passes
- [ ] Production smoke test passes (optional until deploy)
- [ ] Demo script (`docs/demo/mvp-demo-script.md`) run once end-to-end

Phase 7 (AI template generator) is intentionally out of scope.

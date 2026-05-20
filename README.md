# Community Tier Lists

Realtime tier list voting for Twitch streamers. Hosts create sessions, stage items, let viewers vote live with S/A/B/C/D tiers, and compare streamer placements against the community board.

Project plan reference: `docs/plans/community-tier-lists-mvp.plan.md`

## Apps

- `apps/web`: Next.js 15 frontend, Auth.js Twitch login, API routes, Convex-backed session data
- `apps/realtime`: Socket.IO server for presence, voting, host controls, and board updates

## Local Development

1. Install dependencies from the repo root:

```bash
npm install
```

2. Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in the required values (see `docs/setup/getting-started.md`).

3. Start Convex, web, and realtime in **three terminals** from the repo root:

```bash
npm run dev:convex
npm run dev:web
npm run dev:realtime
```

Run `npm run dev:convex` from the repo root (not bare `npx convex dev` at the root). Convex functions live under `apps/web/convex`.

## Environment Variables

### Shared

- `NEXT_PUBLIC_CONVEX_URL`
- `HOST_JWT_SECRET`

### Web

- `NEXT_PUBLIC_REALTIME_URL`
- `AUTH_SECRET`
- `AUTH_TWITCH_ID`
- `AUTH_TWITCH_SECRET`

### Realtime

- `PORT`
- `CORS_ORIGIN`

## Deployment

### Web On Vercel

- Set the Vercel project root directory to `apps/web`.
- Use `apps/web/vercel.json`.
- Configure:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `NEXT_PUBLIC_REALTIME_URL`
  - `HOST_JWT_SECRET`
  - `AUTH_SECRET`
  - `AUTH_TWITCH_ID`
  - `AUTH_TWITCH_SECRET`

### Realtime On AWS Lightsail

- Use `apps/realtime/Dockerfile`.
- Use the Lightsail deployment files in `apps/realtime/deploy/lightsail/`.
- Follow `docs/deployment/lightsail-realtime.md`.
- Configure:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `HOST_JWT_SECRET`
  - `CORS_ORIGIN`
  - `REALTIME_DOMAIN`

## Verification

- Setup guide: `docs/setup/getting-started.md`
- Smoke test runbook: `docs/testing/phase5-phase6-smoke-test.md`
- Demo walkthrough: `docs/demo/mvp-demo-script.md`

## Notes

- TierMaker imports are server-side only and can be blocked by TierMaker's Cloudflare challenge. The host UI falls back to manual item entry with a clear error.
- The realtime server exposes `GET /health` for deployment checks and reverse-proxy health verification.

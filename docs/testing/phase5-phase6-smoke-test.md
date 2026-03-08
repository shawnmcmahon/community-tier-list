# Phase 5 And 6 Smoke Test

This runbook covers the TierMaker import work from phase 5 and the deployment/polish work from phase 6.

## Prerequisites

- Copy `.env.example` to `.env.local` at the repo root.
- Set valid values for:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `NEXT_PUBLIC_REALTIME_URL`
  - `HOST_JWT_SECRET`
  - `AUTH_SECRET`
  - `AUTH_TWITCH_ID`
  - `AUTH_TWITCH_SECRET`
- Install dependencies with `npm install`.

## Local Startup

Open three terminals from the repo root:

```bash
npm run dev:web
npm run dev:realtime
npx convex dev
```

Confirm:

- web responds at `http://localhost:3000`
- realtime health check responds at `http://localhost:3001/health`
- Convex is running and serving the configured deployment URL

## Phase 5 Test: TierMaker Import

1. Sign in with Twitch and open the dashboard.
2. Create a new session and open the host session page.
3. In `Host Controls`, paste a direct TierMaker `https://tiermaker.com/create/...` URL.
4. Click `Import TierMaker`.
5. Verify:
   - a success notice appears
   - imported items show up in the pool
   - the item count increases
6. Try an invalid URL such as `https://example.com/foo`.
7. Verify a clear error is shown.
8. Try a non-create TierMaker URL such as `https://tiermaker.com/categories/anime`.
9. Verify a clear validation error is shown.
10. If TierMaker serves a Cloudflare challenge, verify the host sees the fallback message telling them to use manual labels.

## Phase 6 Test: Realtime And Deployment Readiness

1. With a host session open, click `Go Live`.
2. Open the same session in a second browser or incognito window as a viewer.
3. Stage an item, open voting, and cast votes from the viewer.
4. Verify:
   - the vote distribution updates live
   - the viewer count changes
   - staging changes sync between windows
5. Finalize the item into a tier and verify both boards update.
6. Complete the session and verify the status changes to `completed`.

## Production Config Check

### AWS Lightsail Realtime

- Follow `docs/deployment/lightsail-realtime.md`.
- Create one small Ubuntu Lightsail instance.
- Attach a static IP.
- Open ports `22`, `80`, and `443`.
- Point a DNS record such as `realtime.yourdomain.com` to that instance.
- Configure:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `HOST_JWT_SECRET`
  - `CORS_ORIGIN=https://your-web-app.vercel.app`
  - `REALTIME_DOMAIN=realtime.yourdomain.com`
- Deploy with:

```bash
docker compose -f apps/realtime/deploy/lightsail/docker-compose.yml up -d --build
```

- Verify `https://realtime.yourdomain.com/health` returns `{ "ok": true }`.

### Vercel Web

- Create a Vercel project with root directory `apps/web`.
- Add env vars:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `NEXT_PUBLIC_REALTIME_URL`
  - `HOST_JWT_SECRET`
  - `AUTH_SECRET`
  - `AUTH_TWITCH_ID`
  - `AUTH_TWITCH_SECRET`
- Deploy the branch.
- Verify login, dashboard load, session creation, and live voting against the Lightsail-hosted realtime URL.

## Accessibility Checks

- Navigate the dashboard and host controls by keyboard only.
- Confirm the TierMaker input is focusable and labeled.
- Confirm error and success states are announced and visually obvious.
- Confirm status badges and connection notices remain readable at 200% zoom.

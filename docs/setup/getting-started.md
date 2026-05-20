# Getting Started

Use this guide to run Community Tier Lists locally or deploy the MVP stack (Vercel + Convex + Lightsail realtime).

## Prerequisites

- Node.js 20+
- npm 10+
- A [Convex](https://convex.dev) account
- A [Twitch developer application](https://dev.twitch.tv/console/apps) for OAuth

## Local development

### 1. Install

From the repository root:

```bash
npm install
```

### 2. Environment

Copy the web env template:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/web/.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL (`https://….convex.cloud`) |
| `CONVEX_DEPLOYMENT` | Set automatically after `npm run dev:convex` links a project (`dev:…`) |
| `HOST_JWT_SECRET` | Shared secret for host JWTs (generate a long random string) |
| `AUTH_SECRET` | Auth.js secret (generate a long random string) |
| `AUTH_TWITCH_ID` / `AUTH_TWITCH_SECRET` | Twitch OAuth client credentials |
| `NEXT_PUBLIC_REALTIME_URL` | `http://localhost:3001` for local dev |
| `CORS_ORIGIN` | `http://localhost:3000` for local dev (no trailing slash) |

For local dev, use the localhost values above. Do not point `CORS_ORIGIN` at production unless you are testing production web against local realtime.

The realtime server loads env from, in order:

1. Repo root `.env.local` (optional)
2. `apps/realtime/.env.local` (optional)
3. `apps/web/.env.local` (recommended single source of truth)

### 3. Link Convex

From the repo root:

```bash
npm run dev:convex
```

Log in if prompted and link the `community-tier-list` project (or create one). Leave this terminal running so functions stay synced.

**Do not** run bare `npx convex dev` from the repo root; Convex functions are under `apps/web/convex`.

### 4. Start web and realtime

In two more terminals from the repo root:

```bash
npm run dev:web
npm run dev:realtime
```

Verify:

- Web: http://localhost:3000
- Realtime health: http://localhost:3001/health
- Sign in with Twitch → dashboard loads without a Convex “function not found” error

### 5. Smoke test

Follow `docs/testing/phase5-phase6-smoke-test.md`.

## Production deployment checklist

You will configure these in hosting dashboards (not committed to git).

### Convex

- Deployment URL → `NEXT_PUBLIC_CONVEX_URL` on web and realtime
- `npm run convex:deploy` from repo root when promoting function changes

### Vercel (web)

- **Root directory:** `apps/web`
- Env vars: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_REALTIME_URL`, `HOST_JWT_SECRET`, `AUTH_SECRET`, `AUTH_TWITCH_ID`, `AUTH_TWITCH_SECRET`, `AUTH_URL` (production URL), `AUTH_TRUST_HOST=true`
- Twitch OAuth redirect: `https://<your-vercel-domain>/api/auth/callback/twitch`

### Lightsail (realtime)

See `docs/deployment/lightsail-realtime.md`.

- `NEXT_PUBLIC_CONVEX_URL`
- `HOST_JWT_SECRET` (same value as Vercel)
- `CORS_ORIGIN` = exact production web origin (no trailing slash), e.g. `https://your-app.vercel.app`
- `NEXT_PUBLIC_REALTIME_URL` on Vercel = your public realtime URL (e.g. `https://realtime.yourdomain.com`)

### Twitch

- OAuth redirect URLs for localhost and production
- Client ID and secret in `apps/web/.env.local` (local) and Vercel (production)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Dashboard 500: function `sessions:listDashboardByHost` not found | Run `npm run dev:convex` or deploy Convex functions |
| `npx convex dev` 404 with `///` in URL | Run `npm run dev:convex` from repo root instead |
| Realtime cannot reach Convex | Check `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local` |
| CORS errors in browser | Match `CORS_ORIGIN` to the web origin exactly; remove trailing slashes |
| Twitch login fails | Set `AUTH_URL`, redirect URI in Twitch console, and `AUTH_TRUST_HOST=true` locally |

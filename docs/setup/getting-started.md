# Getting started

Use Node.js 24 and npm. The active stack is Next.js/Vercel and hosted Convex.

1. Run `npm ci` at the root.
2. Copy `apps/web/.env.example` to `apps/web/.env.local`.
3. Configure `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`, `HOST_JWT_SECRET`, `AUTH_SECRET`, `AUTH_TWITCH_ID`, and `AUTH_TWITCH_SECRET`.
4. Run `npm run dev:convex` from the root and link the appropriate project. Convex functions live in `apps/web/convex`.
5. In `apps/web`, set the same server-only secret using `npx convex env set HOST_JWT_SECRET`; enter its value through the CLI prompt. Do not print it or commit it.
6. Run `npm run dev:web` in another terminal. Open http://localhost:3000.

Register Twitch's callback as `http://localhost:3000/api/auth/callback/twitch` for local development and the equivalent HTTPS production URL for deployment. The provider requests only OpenID identity claims (display name and picture), without email or chat scopes.

No separate realtime process is needed. Old Socket.IO deployment files are retained for recovery, not the active setup.

For production, use the existing Vercel project with root `apps/web`. Set the web secrets and deployment URL there, set the matching Convex secret, deploy Convex to the **same deployment the app actually uses**, then deploy the web app. Avoid accidentally targeting a different development or production database. Vercel production and preview environments must both have the needed variables.

Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build`. See the [smoke test](../testing/phase5-phase6-smoke-test.md) and [migration runbook](../deployment/convex-realtime.md).

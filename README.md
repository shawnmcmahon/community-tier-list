# Community Tier Lists

Live tier-list voting for Twitch streamers. Hosts create a session, add items, share a link, and compare their rankings with the audience. Viewers can vote without signing in.

## Current architecture

- **Next.js 15 / Vercel:** pages, Twitch Auth.js login, and authenticated request-based API functions.
- **Convex:** durable sessions, atomic host/vote mutations, compact live tallies, native subscriptions, and expiring presence leases.
- **No always-on realtime server is required.** The legacy Socket.IO workspace is retained for recovery/reference, but the web app no longer connects to it.

The classic palette runs from red S through orange A, amber B, yellow C, and green D on neutral charcoal boards.

## Development

Use Node.js 24. From the repository root:

```sh
npm ci
```

Copy `apps/web/.env.example` to `apps/web/.env.local`, configure Twitch and Convex, and set the same `HOST_JWT_SECRET` in the web environment and Convex deployment. See [setup](docs/setup/getting-started.md).

Start two terminals:

```sh
npm run dev:convex
npm run dev:web
```

## Checks

```sh
npm run typecheck
npm test
npm run lint
npm run build
```

GitHub Actions runs these checks on pull requests and main. Browser verification is documented in [the smoke-test runbook](docs/testing/phase5-phase6-smoke-test.md).

## Deployment and cost

Keep the existing Vercel project root at `apps/web` and deploy Convex functions to the deployment in `NEXT_PUBLIC_CONVEX_URL`. Server secrets must never use a `NEXT_PUBLIC_` prefix.

[Migration and recovery instructions](docs/deployment/convex-realtime.md) describe replacement verification and retirement of the dedicated $5/month Lightsail instance. A merged PR alone does not stop cloud charges.

TierMaker imports are optional and can encounter a Cloudflare challenge. Manual labels remain available, with a clear import error. The AI template generator and Twitch chat voting remain outside this MVP.

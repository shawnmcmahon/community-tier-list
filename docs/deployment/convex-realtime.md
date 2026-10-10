# Convex realtime migration

## Active infrastructure

| Component | Resource | Purpose |
| --- | --- | --- |
| Web/API | Vercel `community-tier-list-web`, root `apps/web` | Next.js pages, Twitch Auth.js, request-based server functions |
| Data/realtime | `clean-oriole-790.convex.cloud` | Existing database, native subscriptions, atomic mutations, presence |
| Twitch | Existing OAuth application | Host identity; OpenID display name/picture only |
| AWS compute being retired | `community-tier-list-realtime-prod`, us-west-2a, `nano_3_0` | Former Socket.IO service |
| Dedicated AWS IP being retired | `StaticIp-1`, `54.71.224.88` | Attached only to the former realtime instance |

The existing Vercel production configuration points to the named **development** Convex deployment. This migration deliberately preserves that database rather than silently creating an empty production one. A later production-deployment transition requires an explicit data migration.

The web app uses separate subscriptions for session/boards, compact vote tallies, and presence. Host controls and votes are serialized atomically by Convex. Public browser mutations cannot bypass the server-only shared secret. Next.js verifies Auth.js ownership and cookie-based voter identity before forwarding writes. Host commands also verify ownership in Convex.

Presence renews every 45 seconds in visible tabs, leaves best-effort on navigation, and expires after 90 seconds. Renewals are bounded to one per connection per 10 seconds and five connections per viewer/session. There is no permanent polling process or VM. Anonymous cookie resets can create a new identity; this remains link-based casual voting, not an identity-verified election.

## Cost evidence (2026-10-09)

AWS inventory identified the Oregon 512 MB instance and its dedicated attached static IP. The AWS GetBundles API reports $5/month for `nano_3_0`. September 2026 Cost Explorer reported **$4.8384 before tax** for `USW2-BundleUsage:0.5GB`; this was the only discovered Oregon Lightsail instance. It is a service/usage attribution, not a resource-tagged invoice.

Retiring it removes the **$5/month full-month fixed compute charge**, or **$60/year**, calculated by script. The attached IP is included in the bundle; a detached Lightsail static IP can become billable and must be released.

The replacement adds no AWS compute or IP resources. Expected incremental fixed AWS hosting cost is **$0/month after retirement**. The Vercel API verified the existing team is on an active Hobby plan. Vercel and Convex remain usage-dependent; zero incremental cost assumes the existing plans' included quotas cover this personal app. Domain registration, unrelated/shared AWS resources, and account-level plans are outside this instance estimate. It is not a promise of zero cost at arbitrary audience sizes.

Current sources: [AWS Lightsail pricing](https://aws.amazon.com/lightsail/pricing/), [Convex pricing](https://www.convex.dev/pricing), [Convex React subscriptions](https://docs.convex.dev/client/react/overview). Re-check quotas before large public sessions.

## Deployment and retirement

1. Export the current Convex database **and file storage** before changing the backend.
2. Save the current web environment privately, outside Git.
3. Set the same `HOST_JWT_SECRET` in Convex and the Vercel web environments. Never expose it through browser variables.
4. Deploy the native backend to the exact deployment used by Vercel.
5. Deploy a web preview, run host/viewer checks, then deploy/promote the verified revision to production.
6. Verify anonymous voting, host authorization, reconnects, saved boards, mobile layout, and expiry against the live replacement.
7. Only then delete the dedicated Lightsail instance and release `StaticIp-1`. Verify no project snapshots or extra disks remain. Do not touch Chess Lobby, shared hosted zones, or unrelated services.

Current retirement status is recorded in the deployment completion record below. Until both delete/release operations succeed, the fixed charge has not been eliminated.

## Recovery

The pre-migration source is commit `f2f8c4213efe8df09667e0aab4f9c3f72847a193`. Legacy Socket.IO source and its deployment files are retained. Existing data lives in Convex, not on the realtime VM. The VM's system disk contains deploy/runtime configuration; there are no project-owned additional disks or snapshots in the audited inventory.

Private backups were saved under `C:/Users/shawn/Documents/Backups/community-tier-list/2026-10-09/`:
- `convex-before-migration.zip` includes database and file storage.
- `web-environment.env` contains the existing web configuration and secrets; keep it private.
- `aws-before-retirement.json` records the instance, ports, bundle, IP, disks, and snapshot inventory.

Prefer reverting a faulty web change while retaining the native backend. Restoring the old Socket.IO architecture requires recreating the instance/IP, deploying compatible backend functions from the old source, restoring its runtime configuration, and pointing a working DNS name to the new IP. The original realtime hostname did not resolve during this audit. A database snapshot import would overwrite newer data; never do that as a routine rollback.

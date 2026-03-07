---
name: Community Tier Lists MVP
overview: Full engineering plan for a pnpm monorepo "Community Tier Lists" app - a realtime tier list voting platform for Twitch streamers, built with Next.js, Convex, Socket.IO, and Auth.js, deployed to Vercel + Fly.io.
source: C:\Users\shawn\.cursor\plans\community_tier_lists_mvp_56a63a2e.plan.md
current_focus: Phase 4 - Realtime Server + WebSockets
todos:
  - id: phase1
    content: "Phase 1 - Foundation + Premium UI: monorepo scaffold, five design concepts, homepage routes"
    status: pending
  - id: phase2
    content: "Phase 2 - Data Model + Auth: Convex schema, mutations/queries, Auth.js + Twitch OAuth, host JWT"
    status: pending
  - id: phase3
    content: "Phase 3 - Dashboard + Session Management UI: real dashboard, create-session dialog, creator + viewer pages"
    status: pending
  - id: phase4
    content: "Phase 4 - Realtime Server + WebSockets: Socket.IO server, all handlers, client hooks, wiring"
    status: in_progress
  - id: phase5
    content: "Phase 5 - TierMaker Import: API route, UI form, failure handling"
    status: pending
  - id: phase6
    content: "Phase 6 - Deployment + Polish: Fly.io + Vercel deploy, smoke test, accessibility, README, demo script"
    status: pending
isProject: false
---

# Community Tier Lists - MVP Engineering Plan

This file preserves the external planning doc in-repo for reference. It is a normalized copy of the original plan.

## Summary

- Monorepo apps: `apps/web`, `apps/realtime`, `packages/shared`
- Backend data: Convex tables for users, sessions, items, votes, placements, and participation
- Realtime: Socket.IO for joining sessions, live voting, host controls, staging, board updates, and presence
- Auth: Auth.js with Twitch plus short-lived host JWTs
- Import: TierMaker import is optional and server-side only
- Deploy: Vercel for web, Fly.io for realtime, Convex for data/functions

## Fast MVP Execution Sequence

### Phase 1 - Foundation + Premium UI

- `1.1` Initialize pnpm monorepo
- `1.2` Scaffold `apps/web`
- `1.3` Configure shadcn/ui, Framer Motion, and fonts
- `1.4` Scaffold shared types and scoring utilities
- `1.5` Build concept 1 at `/1`
- `1.6` Build concept 2 at `/2`
- `1.7` Build concept 3 at `/3`
- `1.8` Build concept 4 at `/4`
- `1.9` Build concept 5 at `/5`
- `1.10` Choose the default homepage concept for `/`
- `1.11` Build `/privacy`

### Phase 2 - Data Model + Auth

- `2.1` Initialize Convex schema
- `2.2` Deploy Convex schema
- `2.3` Implement user and session queries/mutations
- `2.4` Implement item queries/mutations
- `2.5` Implement streamer placement mutations
- `2.6` Implement vote aggregation and community placement writes
- `2.7` Implement participation queries/mutations
- `2.8` Configure Auth.js with Twitch
- `2.9` Build auth-gated dashboard layout
- `2.10` Build `POST /api/host-token`
- `2.11` Add unit tests for scoring and placements

### Phase 3 - Dashboard + Session Management UI

- `3.1` Build the real dashboard page
- `3.2` Build the create-session dialog
- `3.3` Build the creator session page
- `3.4` Wire creator actions to Convex
- `3.5` Build the viewer page shell at `/s/{slug}`

### Phase 4 - Realtime Server + WebSockets

- `4.1` Scaffold `apps/realtime`
- `4.2` Implement JWT verification middleware
- `4.3` Implement per-socket rate limiting
- `4.4` Implement session room join/leave plus snapshot on join
- `4.5` Implement host handlers: start, stageItem, unstage, finalizePlacement, complete
- `4.6` Implement viewer voting with upsert, in-memory tally, and broadcast
- `4.7` Implement presence tracking and broadcasts
- `4.8` Write Socket.IO client hooks in `apps/web`
- `4.9` Wire the viewer page to live socket events
- `4.10` Wire the creator page to live socket events
- `4.11` Run a multi-client integration test

### Phase 5 - TierMaker Import

- `5.1` Build `POST /api/tiermaker-import`
- `5.2` Build the TierMaker import form
- `5.3` Handle failure states
- `5.4` Test against known TierMaker URLs

### Phase 6 - Deployment + Polish

- `6.1` Write the `apps/realtime` Dockerfile
- `6.2` Deploy realtime server to Fly.io
- `6.3` Deploy the web app to Vercel
- `6.4` Run an end-to-end smoke test
- `6.5` Verify CORS, JWT auth, and rate limiting in production
- `6.6` Run an accessibility pass
- `6.7` Update the README
- `6.8` Prepare a short demo script

## Phase 4 Realtime Notes

- Client events: `session:join`, `session:stateRequest`, `vote:cast`, `host:start`, `host:stageItem`, `host:unstage`, `host:finalizePlacement`, `host:complete`
- Server events: `session:state`, `presence:update`, `staging:changed`, `vote:distribution`, `boards:updated`, `error:toast`
- Invariants:
  - votes only count for the currently staged item while voting is open
  - only one staged item may exist at a time
  - the server is the source of truth
  - host-only events require a valid JWT
  - vote upserts are idempotent per voter and item

## Future Backlog

### Viewer Identity And Voter Roster

- Add a host-visible participant roster for everyone who has voted in a session.
- Support both anonymous link voters and logged-in Twitch viewers in the same roster.
- Persist a display label for anonymous voters so the host can distinguish participants during the session.
- Add session-level queries for:
  - current participants
  - voters by item
  - votes by voter identity
- Extend realtime presence payloads to include stable participant identifiers and display labels.
- Add a host dashboard panel for:
  - all active participants
  - participants who voted on the current item
  - participant identity source: anonymous link or Twitch login
- Add privacy and product rules before release:
  - whether anonymous voters are shown as generated names or masked ids
  - whether hosts can inspect per-item votes or only participation state
  - whether Twitch chat-linked voters are shown by Twitch display name
- Add tests covering mixed anonymous and Twitch participants, reconnect behavior, and roster accuracy after re-votes/disconnects.

### Marketing Exploration

- Future idea captured in `docs/plans/future-marketing-ideas.md`:
  - experiment with a Twitch channel where AI personas or models vote on tier lists, debate each other, roast each other, and interact with viewers to showcase the product
  - evaluate cost, moderation, and scheduling constraints before treating it as an execution track

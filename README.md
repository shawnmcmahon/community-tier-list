# Community Tier Lists

A realtime tier list voting platform for Twitch streamers. Hosts create tier list sessions, stage items for their audience, and viewers vote in real time via S/A/B/C/D tiers. Built with Next.js, Convex, Socket.IO, and Auth.js.

## Monorepo Structure

- **apps/web** — Next.js 15 App Router frontend (Tailwind, shadcn/ui, Framer Motion)
- **apps/realtime** — Socket.IO server for realtime voting and session management
- **packages/shared** — Shared types, scoring utilities, validation schemas, design tokens

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` and fill in the values — see the file for documentation of each variable.

# MVP handoff

The active application uses Vercel request-based functions and Convex subscriptions. The separate Lightsail Socket.IO server has been replaced in the application. See [the deployment runbook](../deployment/convex-realtime.md) for the audited resource and retirement status.

Core flow: Twitch host sign-in → create a named session → add/import items → share the session link → go live → stage an item → open/close voting → finalize streamer and audience rankings → complete and reload the saved results.

Anonymous viewers need only the link. Their identity uses an HTTP-only cookie; their personal board persists in localStorage. Presence deduplicates tabs and expires disconnected clients within 90 seconds. Hidden tabs renew when visible again.

The familiar red/orange/amber/yellow/green tier palette, accessible create form, full item pool, image fallback, mobile results layout, and server-side authorization are in place.

See [recorded validation](../testing/phase5-phase6-smoke-test.md). The AI template generator and Twitch chat integration remain future work.

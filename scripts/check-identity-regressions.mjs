// Integration regression against a configured local or production web app and
// its Convex deployment. Creates an isolated, clearly named fixture account.
// No application auth bypass; never print secrets or signed cookies.
import fs from "node:fs";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { parse } from "dotenv";
import { encode } from "next-auth/jwt";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const origin = process.argv[2] ?? "http://localhost:3100";
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) && origin !== "https://community-tier-list-web.vercel.app") throw new Error("Use the project's production app or localhost.");
const env = parse(fs.readFileSync(process.argv[3] ?? "apps/web/.env.local"));
const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const secret = env.HOST_JWT_SECRET;
const twitchUserId = `ctl-smoke-identity-${Date.now()}`;
const userId = await client.mutation(makeFunctionReference("users:upsertFromAuth"), { serverSecret: secret, twitchUserId, twitchDisplayName: "Identity regression host", role: "creator" });
const secure = origin.startsWith("https:");
const salt = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
const token = await encode({ token: { sub: userId, name: "Identity regression host", twitchUserId }, secret: env.AUTH_SECRET, salt, maxAge: 900 });
const host = { cookie: `${salt}=${token}` };
const viewer = { cookie: "" };
async function post(actor, path, body) {
  const response = await fetch(origin + path, { method: "POST", headers: { "content-type": "application/json", origin, cookie: actor.cookie }, body: JSON.stringify(body) });
  const payload = await response.json();
  assert.equal(response.status, 200, JSON.stringify(payload));
  return { payload, response };
}
const created = (await post(host, "/api/sessions", { title: `Identity Regression ${Date.now()}` })).payload;
const slug = created.slug;
const session = await client.query(makeFunctionReference("sessions:getBySlug"), { slug });
const item = (await post(host, "/api/session-items", { sessionSlug: slug, labels: ["Identity test item"] })).payload.items[0];
const command = (command, extra = {}) => post(host, "/api/live", { slug, action: "host", command, ...extra });
await command("start"); await command("stage", { itemId: item._id }); await command("open");

// A real browser installs the HTML response's cookie before hydration. Then its
// very first presence/vote requests overlap and cannot overwrite that identity.
const html = await fetch(origin + "/s/" + slug);
assert.equal(html.status, 200);
const setCookie = html.headers.getSetCookie().find(value => value.startsWith("ctl-viewer="));
assert.ok(setCookie, "Session HTML must establish anonymous identity before scripts run");
assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=Lax/i);
if (secure) assert.match(setCookie, /Secure/i);
viewer.cookie = setCookie.split(";")[0];
const connectionId = randomUUID();
const overlapping = await Promise.all([
  post(viewer, "/api/live", { slug, action: "presence", connectionId, leave: false }),
  post(viewer, "/api/live", { slug, action: "vote", itemId: item._id, tier: "S" }),
]);
for (const { response } of overlapping) assert.ok(!response.headers.getSetCookie().some(value => value.startsWith("ctl-viewer=")), "Concurrent responses must not replace identity");
await new Promise(resolve => setTimeout(resolve, 600));
await post(viewer, "/api/live", { slug, action: "vote", itemId: item._id, tier: "A" });
assert.deepEqual(await client.query(makeFunctionReference("live:distribution"), { slug }), { S: 0, A: 1, B: 0, C: 0, D: 0, totalVotes: 1, avgScore: 4 });
assert.equal((await client.query(makeFunctionReference("live:presence"), { slug })).viewerCount, 1);
const refreshed = await fetch(origin + "/s/" + slug, { headers: { cookie: viewer.cookie } });
assert.ok(!refreshed.headers.getSetCookie().some(value => value.startsWith("ctl-viewer=")), "Reload must retain the established identity");

// Seed the former raw Twitch participation row. Returning via the new API must
// preserve it, and also repair a duplicate left by the old prefixed lookup.
const count = () => client.query(makeFunctionReference("participation:countBySession"), { sessionId: session._id });
await client.mutation(makeFunctionReference("participation:upsert"), { serverSecret: secret, sessionId: session._id, twitchUserId, lastVotedAt: 111 });
const oldRow = (await client.query(makeFunctionReference("participation:historyByTwitchUser"), { twitchUserId }))[0];
assert.equal(await count(), 2);
await post(host, "/api/live", { slug, action: "presence", connectionId: randomUUID(), leave: false });
assert.equal(await count(), 2, "Returning Twitch participant must not count twice");
await client.mutation(makeFunctionReference("participation:upsert"), { serverSecret: secret, sessionId: session._id, twitchUserId: `twitch:${twitchUserId}`, lastVotedAt: 222 });
assert.equal(await count(), 3);
await post(host, "/api/live", { slug, action: "presence", connectionId: randomUUID(), leave: false });
assert.equal(await count(), 2, "Existing prefixed duplicate must be reconciled");
const history = await client.query(makeFunctionReference("participation:historyByTwitchUser"), { twitchUserId });
assert.equal(history.length, 1); assert.equal(history[0]._id, oldRow._id);
assert.equal(history[0].joinedAt, oldRow.joinedAt); assert.equal(history[0].lastVotedAt, 222);
assert.deepEqual(await client.query(makeFunctionReference("participation:historyByTwitchUser"), { twitchUserId: `twitch:${twitchUserId}` }), []);
await command("close"); await command("finalize", { tier: "S" }); await command("complete");
console.log(JSON.stringify({ result: "PASS", origin, slug, checks: ["cookie before hydration", "overlapping first presence/vote", "one voter after revote", "stable reload", "legacy participant not duplicated", "prefixed duplicate reconciled", "joined/voted metadata preserved"] }));

import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const env = parse(fs.readFileSync("apps/web/.env.local"));
const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const fixture = JSON.parse(fs.readFileSync("output/playwright/fixture.json"));
const sessions = await client.query(makeFunctionReference("sessions:listByHost"), { hostTwitchUserId: fixture.twitchUserId });
const slug = sessions.at(-1)?.slug;
assert.ok(slug, "Smoke session must exist");
const distribution = await client.query(makeFunctionReference("live:distribution"), { slug });
assert.equal(distribution.totalVotes, 2);
assert.equal(distribution.A, 1);
assert.equal(distribution.D, 1);
assert.equal(distribution.avgScore, 2.5);
const snapshot = await client.query(makeFunctionReference("live:snapshot"), { slug });
fixture.slug = slug;
fixture.stagedItemId = snapshot.currentStagedItemId;
fs.writeFileSync("output/playwright/fixture.json", JSON.stringify(fixture));
fs.writeFileSync("output/playwright/live-vote-result.json", JSON.stringify(distribution));
console.log("PASS: actual cloud tally has exactly two voters, A=1, D=1, average=2.5 after revoting.");

for (const [name, body, expected] of [
  ["unauthenticated host", { action: "host", slug, command: "complete" }, 401],
  ["invalid tier", { action: "vote", slug, itemId: snapshot.currentStagedItemId, tier: "X" }, 400],
]) {
  const response = await fetch(`${fixture.origin}/api/live`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  assert.equal(response.status, expected, name); console.log(`PASS: ${name} rejected (${expected}).`);
}
const csrf = await fetch(`${fixture.origin}/api/live`, { method: "POST", headers: { "content-type": "application/json", origin: "https://untrusted.example" }, body: JSON.stringify({ action: "host", slug, command: "complete" }) });
assert.equal(csrf.status, 403); console.log("PASS: cross-origin write rejected (403).");
await assert.rejects(client.mutation(makeFunctionReference("live:command"), { serverSecret: "invalid", slug, hostTwitchUserId: fixture.twitchUserId, command: "complete" }), /Unauthorized/);
console.log("PASS: forged direct Convex host mutation rejected.");

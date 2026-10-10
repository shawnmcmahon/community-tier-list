// Create a dedicated smoke-test host and a short-lived local browser session.
// This uses Auth.js's real cookie format; there is no application auth bypass.
import fs from "node:fs";
import path from "node:path";
import { parse } from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { encode } from "next-auth/jwt";

const origin = process.argv[2] ?? "http://localhost:3100";
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) throw new Error("Local browser fixtures are restricted to localhost.");
const env = parse(fs.readFileSync("apps/web/.env.local"));
const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const twitchUserId = `ctl-smoke-${Date.now()}`;
const userId = await client.mutation(makeFunctionReference("users:upsertFromAuth"), { serverSecret: env.HOST_JWT_SECRET, twitchUserId, twitchDisplayName: "Smoke test host", role: "creator" });
const token = await encode({ token: { sub: userId, name: "Smoke test host", twitchUserId, twitchDisplayName: "Smoke test host" }, secret: env.AUTH_SECRET, salt: "authjs.session-token", maxAge: 3600 });
fs.mkdirSync("output/playwright", { recursive: true });
const output = path.resolve("output/playwright");
fs.writeFileSync(path.join(output, "host-state.json"), JSON.stringify({ cookies: [{ name: "authjs.session-token", value: token, domain: "localhost", path: "/", expires: Math.floor(Date.now()/1000)+3600, httpOnly: true, secure: false, sameSite: "Lax" }], origins: [] }));
fs.writeFileSync(path.join(output, "fixture.json"), JSON.stringify({ twitchUserId, userId, origin }));
console.log(`Created isolated smoke host and private auth state in ${output}.`);

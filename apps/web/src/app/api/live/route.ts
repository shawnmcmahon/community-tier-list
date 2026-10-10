import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import { auth } from "@/lib/auth";
import { getServerConvexClient, getServerSecret } from "@/lib/convex-server";
import { TIERS } from "@/lib/mock-data";
import type { Id } from "../../../../convex/_generated/dataModel";

const commands = ["start", "complete", "stage", "unstage", "open", "close", "finalize"] as const;

export async function POST(request: Request) {
  // All cookie-authenticated writes must originate from this app.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
  if (!body || typeof body !== "object" || typeof body.slug !== "string" || body.slug.length > 100) {
    return NextResponse.json({ error: "A session is required." }, { status: 400 });
  }
  try {
    const convex = getServerConvexClient();
    const serverSecret = getServerSecret();
    const session = await auth();
    const twitchUserId = session?.user?.twitchUserId;
    const cookieStore = await cookies();
    let anonymousId = cookieStore.get("ctl-viewer")?.value;
    if (!anonymousId || !/^[a-f0-9-]{36}$/.test(anonymousId)) {
      anonymousId = randomUUID();
      cookieStore.set("ctl-viewer", anonymousId, { httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
    const voterKey = twitchUserId ? `twitch:${twitchUserId}` : `anon:${anonymousId}`;
    if (body.action === "presence") {
      if (typeof body.connectionId !== "string" || !/^[a-f0-9-]{36}$/.test(body.connectionId) || typeof body.leave !== "boolean") {
        return NextResponse.json({ error: "Invalid presence request." }, { status: 400 });
      }
      await convex.mutation(api.live.heartbeat, { serverSecret, slug: body.slug, voterKey, connectionId: body.connectionId, leave: body.leave, displayName: session?.user?.twitchDisplayName ?? "Guest" });
    } else if (body.action === "vote") {
      if (typeof body.itemId !== "string" || !TIERS.includes(body.tier as typeof TIERS[number])) return NextResponse.json({ error: "Choose an item and tier." }, { status: 400 });
      await convex.mutation(api.live.vote, { serverSecret, slug: body.slug, voterKey, itemId: body.itemId as Id<"items">, tier: body.tier as typeof TIERS[number] });
    } else if (body.action === "host") {
      if (!twitchUserId) return NextResponse.json({ error: "Sign in to host a session." }, { status: 401 });
      if (!commands.includes(body.command as typeof commands[number]) || (body.itemId !== undefined && typeof body.itemId !== "string") || (body.tier !== undefined && !TIERS.includes(body.tier as typeof TIERS[number]))) {
        return NextResponse.json({ error: "Invalid host action." }, { status: 400 });
      }
      await convex.mutation(api.live.command, { serverSecret, slug: body.slug, hostTwitchUserId: twitchUserId, command: body.command as typeof commands[number], ...(body.itemId ? { itemId: body.itemId as Id<"items"> } : {}), ...(body.tier ? { tier: body.tier as typeof TIERS[number] } : {}) });
    } else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof ConvexError && typeof error.data === "string" ? error.data : "Unable to update this session. Please retry.";
    return NextResponse.json({ error: message }, { status: message === "Forbidden" ? 403 : 400 });
  }
}

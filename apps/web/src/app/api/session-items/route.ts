import { NextResponse } from "next/server";

import * as apiModule from "../../../../convex/_generated/api.js";
import { auth } from "@/lib/auth";
import { getServerConvexClient } from "@/lib/convex-server";
import type { SessionItem } from "@/lib/live-session";

const { api } = apiModule;

type CreateItemsBody = {
  sessionSlug?: string;
  labels?: string[];
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    const twitchUserId = session?.user?.twitchUserId;

    if (!twitchUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: CreateItemsBody;
    try {
      body = (await request.json()) as CreateItemsBody;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const sessionSlug = body.sessionSlug?.trim();
    if (body.labels !== undefined && !Array.isArray(body.labels)) {
      return NextResponse.json({ error: "labels must be an array" }, { status: 400 });
    }
    const labels = (body.labels ?? []).map((label) => label.trim()).filter(Boolean);

    if (!sessionSlug) {
      return NextResponse.json({ error: "sessionSlug is required" }, { status: 400 });
    }

    if (labels.length === 0) {
      return NextResponse.json({ error: "At least one label is required" }, { status: 400 });
    }

    const convex = getServerConvexClient();
    const sessionDoc = await convex.query((api as any).sessions.getBySlug, {
      slug: sessionSlug,
    });

    if (!sessionDoc) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const hostUser = await convex.query((api as any).users.getById, {
      userId: sessionDoc.hostUserId,
    });

    if (!hostUser || hostUser.twitchUserId !== twitchUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await convex.mutation((api as any).items.createBatch, {
      sessionId: sessionDoc._id,
      items: labels.map((label) => ({
        label,
        imageUrl: "/placeholder.svg",
        source: "url_paste",
      })),
    });

    const items = (await convex.query((api as any).items.listBySession, {
      sessionId: sessionDoc._id,
    })) as SessionItem[];

    return NextResponse.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add items";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

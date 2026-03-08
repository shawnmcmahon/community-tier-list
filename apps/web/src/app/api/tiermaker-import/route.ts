import { NextResponse } from "next/server";

import * as apiModule from "../../../../convex/_generated/api.js";
import { auth } from "@/lib/auth";
import { getServerConvexClient } from "@/lib/convex-server";
import type { SessionItem } from "@/lib/live-session";
import { fetchTierMakerImport, TierMakerImportError } from "@/lib/tiermaker";

const { api } = apiModule;

type TierMakerImportBody = {
  sessionSlug?: string;
  tiermakerUrl?: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    const twitchUserId = session?.user?.twitchUserId;

    if (!twitchUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: TierMakerImportBody;
    try {
      body = (await request.json()) as TierMakerImportBody;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const sessionSlug = body.sessionSlug?.trim();
    const tiermakerUrl = body.tiermakerUrl?.trim();

    if (!sessionSlug) {
      return NextResponse.json({ error: "sessionSlug is required" }, { status: 400 });
    }

    if (!tiermakerUrl) {
      return NextResponse.json({ error: "tiermakerUrl is required" }, { status: 400 });
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

    const imported = await fetchTierMakerImport(tiermakerUrl);
    if (imported.items.length > 250) {
      return NextResponse.json(
        { error: "TierMaker imports are limited to 250 items per request." },
        { status: 400 },
      );
    }

    await convex.mutation((api as any).items.createBatch, {
      sessionId: sessionDoc._id,
      items: imported.items.map((item) => ({
        label: item.label,
        imageUrl: item.imageUrl,
        source: "tiermaker_import",
      })),
    });

    const items = (await convex.query((api as any).items.listBySession, {
      sessionId: sessionDoc._id,
    })) as SessionItem[];

    return NextResponse.json({
      items,
      importedCount: imported.items.length,
      importTitle: imported.title,
      sourceUrl: imported.normalizedUrl,
    });
  } catch (error) {
    if (error instanceof TierMakerImportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error ? error.message : "Unable to import from TierMaker.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

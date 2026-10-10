import { NextResponse } from "next/server";

import * as apiModule from "../../../../convex/_generated/api.js";
import { auth } from "@/lib/auth";
import { getServerConvexClient, getServerSecret } from "@/lib/convex-server";

const { api } = apiModule;

type CreateSessionRequestBody = {
  title?: string;
  slug?: string;
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await auth();
  const twitchUserId = session?.user?.twitchUserId;

  if (!twitchUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateSessionRequestBody;
  try {
    body = (await request.json()) as CreateSessionRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 120 || (body.slug !== undefined && typeof body.slug !== "string")) {
    return NextResponse.json({ error: "Use a session title between 1 and 120 characters." }, { status: 400 });
  }

  const convex = getServerConvexClient();
  try {
    const created = await convex.mutation((api as any).sessions.create, {
      serverSecret: getServerSecret(),
    hostTwitchUserId: twitchUserId,
    title,
    slug: body.slug?.trim() || undefined,
  });

    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Unable to create this session. Include a letter or number in the title and retry." }, { status: 400 });
  }
}

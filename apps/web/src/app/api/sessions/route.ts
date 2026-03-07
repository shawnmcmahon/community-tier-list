import { NextResponse } from "next/server";

import { api } from "../../../../convex/_generated/api";
import { auth } from "@/lib/auth";
import { getServerConvexClient } from "@/lib/convex-server";

type CreateSessionRequestBody = {
  title?: string;
  slug?: string;
};

export async function POST(request: Request) {
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

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const convex = getServerConvexClient();
  const created = await convex.mutation((api as any).sessions.create, {
    hostTwitchUserId: twitchUserId,
    title,
    slug: body.slug?.trim() || undefined,
  });

  return NextResponse.json(created);
}

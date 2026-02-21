import { NextResponse } from "next/server";

import { api } from "../../../../convex/_generated/api";
import { auth } from "@/lib/auth";
import { getServerConvexClient } from "@/lib/convex-server";
import { signHostJwt } from "@/lib/host-jwt";

type HostTokenRequestBody = {
  sessionSlug?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  const twitchUserId = session?.user?.twitchUserId;

  if (!twitchUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: HostTokenRequestBody;
  try {
    body = (await request.json()) as HostTokenRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.sessionSlug) {
    return NextResponse.json({ error: "sessionSlug is required" }, { status: 400 });
  }

  const convex = getServerConvexClient();

  const sessionDoc = await convex.query((api as any).sessions.getBySlug, {
    slug: body.sessionSlug,
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

  const token = await signHostJwt({
    twitchUserId,
    sessionSlug: body.sessionSlug,
    role: "HOST",
  });

  return NextResponse.json({ token });
}

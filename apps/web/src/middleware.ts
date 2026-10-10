import { NextResponse, type NextRequest } from "next/server";
import { anonymousViewerId, VIEWER_COOKIE } from "./lib/viewer-identity";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Install identity on the HTML response, before hydration can start presence
  // and voting concurrently. Neither API response can overwrite it with a new ID.
  if (!anonymousViewerId(request.cookies.get(VIEWER_COOKIE)?.value)) {
    response.cookies.set(VIEWER_COOKIE, crypto.randomUUID(), {
      httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:",
      path: "/", maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = { matcher: "/s/:path*" };

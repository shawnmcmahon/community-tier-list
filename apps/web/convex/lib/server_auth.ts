import { ConvexError } from "convex/values";

// Only the Next.js server knows this secret. Browser clients subscribe to public
// snapshots; writes go through server routes that verify Twitch/cookie identity.
export function requireServerSecret(secret: string) {
  const expected = process.env.HOST_JWT_SECRET;
  if (!expected || secret !== expected) {
    throw new ConvexError("Unauthorized");
  }
}

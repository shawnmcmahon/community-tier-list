import { ConvexHttpClient } from "convex/browser";

let cachedClient: ConvexHttpClient | null = null;

export function getServerSecret(): string {
  const secret = process.env.HOST_JWT_SECRET;
  if (!secret) throw new Error("HOST_JWT_SECRET is required");
  return secret;
}

export function getServerConvexClient(): ConvexHttpClient {
  const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!deploymentUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  }

  if (!cachedClient) {
    cachedClient = new ConvexHttpClient(deploymentUrl);
  }

  return cachedClient;
}

import { ConvexHttpClient } from "convex/browser";

let cachedClient: ConvexHttpClient | null = null;

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

import * as apiModule from "../../../convex/_generated/api.js";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { auth } from "@/lib/auth";
import { getServerConvexClient } from "@/lib/convex-server";
import type { SessionSummary } from "@/lib/live-session";

const { api } = apiModule;

export default async function DashboardPage() {
  const session = await auth();
  const twitchUserId = session?.user?.twitchUserId;

  if (!twitchUserId) {
    return <DashboardClient sessions={[]} />;
  }

  const convex = getServerConvexClient();
  const sessions = (await convex.query((api as any).sessions.listDashboardByHost, {
    hostTwitchUserId: twitchUserId,
  })) as SessionSummary[];

  return <DashboardClient sessions={sessions} />;
}

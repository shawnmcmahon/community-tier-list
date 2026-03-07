import { notFound } from "next/navigation";

import * as apiModule from "../../../../convex/_generated/api.js";
import { LiveSessionClient } from "@/components/session/LiveSessionClient";
import { auth } from "@/lib/auth";
import { getServerConvexClient } from "@/lib/convex-server";
import { emptyVoteDistribution, type SessionItem, type TierPlacement, type VoteDistribution } from "@/lib/live-session";

const { api } = apiModule;

type SessionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { slug } = await params;
  const convex = getServerConvexClient();
  const viewerSession = await auth();

  const sessionDoc = await convex.query((api as any).sessions.getBySlug, {
    slug,
  });

  if (!sessionDoc) {
    notFound();
  }

  const [items, streamerPlacements, communityPlacements, hostUser, distribution, participationCount] =
    await Promise.all([
      convex.query((api as any).items.listBySession, {
        sessionId: sessionDoc._id,
      }) as Promise<SessionItem[]>,
      convex.query((api as any).streamerPlacements.listBySession, {
        sessionId: sessionDoc._id,
      }) as Promise<TierPlacement[]>,
      convex.query((api as any).communityPlacements.listBySession, {
        sessionId: sessionDoc._id,
      }) as Promise<TierPlacement[]>,
      convex.query((api as any).users.getById, {
        userId: sessionDoc.hostUserId,
      }) as Promise<{ twitchDisplayName?: string; twitchUserId?: string } | null>,
      sessionDoc.currentStagedItemId
        ? (convex.query((api as any).votes.distributionByItem, {
            itemId: sessionDoc.currentStagedItemId,
          }) as Promise<VoteDistribution>)
        : Promise.resolve(emptyVoteDistribution()),
      convex.query((api as any).participation.countBySession, {
        sessionId: sessionDoc._id,
      }) as Promise<number>,
    ]);

  const canHost =
    Boolean(viewerSession?.user?.twitchUserId) &&
    viewerSession?.user?.twitchUserId === hostUser?.twitchUserId;

  return (
    <LiveSessionClient
      sessionSlug={sessionDoc.slug}
      initialTitle={sessionDoc.title}
      hostDisplayName={hostUser?.twitchDisplayName}
      initialStatus={sessionDoc.status}
      initialVoteWindowOpen={sessionDoc.voteWindowOpen}
      initialCurrentStagedItemId={sessionDoc.currentStagedItemId ?? null}
      initialViewerCount={participationCount}
      initialItems={items}
      initialStreamerPlacements={streamerPlacements}
      initialCommunityPlacements={communityPlacements}
      initialDistribution={distribution}
      canHost={canHost}
      viewerTwitchUserId={viewerSession?.user?.twitchUserId}
      viewerDisplayName={viewerSession?.user?.twitchDisplayName}
    />
  );
}

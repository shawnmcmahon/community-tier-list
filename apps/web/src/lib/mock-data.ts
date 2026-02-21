export const TIERS = ["S", "A", "B", "C", "D"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_CONFIG: Record<
  Tier,
  { label: string; color: string; bg: string; border: string }
> = {
  S: {
    label: "S Tier",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  A: {
    label: "A Tier",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  B: {
    label: "B Tier",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
  C: {
    label: "C Tier",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  D: {
    label: "D Tier",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
  },
};

export interface MockSession {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "live" | "completed";
  itemCount: number;
  viewerCount: number;
  createdAt: string;
}

export interface MockItem {
  id: string;
  label: string;
  imageUrl: string;
  tier?: Tier;
}

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: "1",
    slug: "best-fps-2025",
    title: "Best FPS Games of 2025",
    status: "live",
    itemCount: 24,
    viewerCount: 1247,
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    slug: "top-anime-openings",
    title: "Top Anime Openings",
    status: "completed",
    itemCount: 32,
    viewerCount: 3891,
    createdAt: "1 day ago",
  },
  {
    id: "3",
    slug: "fast-food-tier-list",
    title: "Fast Food Chains Ranked",
    status: "draft",
    itemCount: 18,
    viewerCount: 0,
    createdAt: "3 days ago",
  },
  {
    id: "4",
    slug: "programming-languages",
    title: "Programming Languages",
    status: "completed",
    itemCount: 20,
    viewerCount: 5621,
    createdAt: "1 week ago",
  },
];

export const MOCK_ITEMS: MockItem[] = [
  { id: "1", label: "Valorant", imageUrl: "/placeholder.svg" },
  { id: "2", label: "CS2", imageUrl: "/placeholder.svg" },
  { id: "3", label: "Apex Legends", imageUrl: "/placeholder.svg" },
  { id: "4", label: "Overwatch 2", imageUrl: "/placeholder.svg" },
  { id: "5", label: "Call of Duty", imageUrl: "/placeholder.svg" },
  { id: "6", label: "Rainbow Six", imageUrl: "/placeholder.svg" },
  { id: "7", label: "Fortnite", imageUrl: "/placeholder.svg" },
  { id: "8", label: "PUBG", imageUrl: "/placeholder.svg" },
  { id: "9", label: "Halo Infinite", imageUrl: "/placeholder.svg" },
  { id: "10", label: "Destiny 2", imageUrl: "/placeholder.svg" },
  { id: "11", label: "Battlefield", imageUrl: "/placeholder.svg" },
  { id: "12", label: "Titanfall 2", imageUrl: "/placeholder.svg" },
];

export const MOCK_PLACED_ITEMS: MockItem[] = [
  { id: "1", label: "Valorant", imageUrl: "/placeholder.svg", tier: "S" },
  { id: "2", label: "CS2", imageUrl: "/placeholder.svg", tier: "S" },
  { id: "3", label: "Apex Legends", imageUrl: "/placeholder.svg", tier: "A" },
  { id: "4", label: "Overwatch 2", imageUrl: "/placeholder.svg", tier: "A" },
  { id: "5", label: "Call of Duty", imageUrl: "/placeholder.svg", tier: "B" },
  { id: "6", label: "Rainbow Six", imageUrl: "/placeholder.svg", tier: "B" },
  { id: "7", label: "Fortnite", imageUrl: "/placeholder.svg", tier: "C" },
  { id: "8", label: "PUBG", imageUrl: "/placeholder.svg", tier: "C" },
  { id: "9", label: "Halo Infinite", imageUrl: "/placeholder.svg", tier: "D" },
];

export const MOCK_VOTE_DISTRIBUTION = {
  S: 342,
  A: 518,
  B: 289,
  C: 156,
  D: 43,
};

export const FEATURES = [
  {
    title: "Real-Time Voting",
    description:
      "Your audience votes live as you stage each item. See the community's opinion form in real time.",
    icon: "vote",
  },
  {
    title: "Streamer + Community Boards",
    description:
      "Two tier boards side by side — your picks vs. what your chat thinks. Spark the debate.",
    icon: "layout",
  },
  {
    title: "Instant Setup",
    description:
      "Import from TierMaker or upload images. Go live in under a minute with a shareable link.",
    icon: "zap",
  },
  {
    title: "No Sign-Up for Viewers",
    description:
      "Viewers vote anonymously — no account needed. Just share the link and let them weigh in.",
    icon: "users",
  },
  {
    title: "Keyboard Shortcuts",
    description:
      "Viewers can vote with 1-5 keys or S/A/B/C/D. Fast, accessible, stream-friendly.",
    icon: "keyboard",
  },
  {
    title: "Live Presence",
    description:
      "See how many viewers are in your session in real time. Build hype with your community.",
    icon: "activity",
  },
];

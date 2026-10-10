import type { Tier } from "./scoring.ts";

export type HostCommand = "start" | "complete" | "stage" | "unstage" | "open" | "close" | "finalize";

export function validateHostCommand(
  command: HostCommand,
  session: { status: string; currentStagedItemId?: string },
  item?: { _id: string; sessionId: string; status: string } | null,
  sessionId?: string,
  tier?: Tier,
) {
  if (session.status === "completed") throw new Error("This session is complete.");
  if (command === "start" && session.status !== "draft") throw new Error("Session is already live.");
  if (["stage", "open", "close", "finalize", "unstage"].includes(command) && session.status !== "live") {
    throw new Error("Go live before staging items or voting.");
  }
  if (command === "stage") {
    if (session.currentStagedItemId) throw new Error("Finish or unstage the active item first.");
    if (!item || item.sessionId !== sessionId || item.status !== "pool") throw new Error("Choose an item from this session's pool.");
  }
  if (["open", "close", "finalize", "unstage"].includes(command) && !session.currentStagedItemId) {
    throw new Error("Stage an item first.");
  }
  if (command === "finalize" && !tier) throw new Error("Choose a tier.");
}

export function validateVote(session: { status: string; voteWindowOpen: boolean; currentStagedItemId?: string }, itemId: string) {
  if (session.status !== "live" || !session.voteWindowOpen || session.currentStagedItemId !== itemId) {
    throw new Error("Voting is closed for this item.");
  }
}

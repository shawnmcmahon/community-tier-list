export type PresenceSnapshot = {
  viewerCount: number;
  recentJoins: string[];
};

type JoinPresenceInput = {
  sessionSlug: string;
  socketId: string;
  label: string;
};

export class PresenceTracker {
  private readonly socketToSession = new Map<string, string>();
  private readonly sessions = new Map<string, Map<string, string>>();
  private readonly recentJoinsBySession = new Map<string, string[]>();

  join({ sessionSlug, socketId, label }: JoinPresenceInput): PresenceSnapshot {
    const previousSessionSlug = this.socketToSession.get(socketId);
    if (previousSessionSlug && previousSessionSlug !== sessionSlug) {
      this.leave(socketId);
    }

    let sessionSockets = this.sessions.get(sessionSlug);
    if (!sessionSockets) {
      sessionSockets = new Map<string, string>();
      this.sessions.set(sessionSlug, sessionSockets);
    }

    sessionSockets.set(socketId, label);
    this.socketToSession.set(socketId, sessionSlug);

    const recentJoins = [label, ...(this.recentJoinsBySession.get(sessionSlug) ?? [])].slice(0, 5);
    this.recentJoinsBySession.set(sessionSlug, recentJoins);

    return {
      viewerCount: sessionSockets.size,
      recentJoins,
    };
  }

  leave(socketId: string): { sessionSlug: string; snapshot: PresenceSnapshot } | null {
    const sessionSlug = this.socketToSession.get(socketId);
    if (!sessionSlug) {
      return null;
    }

    this.socketToSession.delete(socketId);

    const sessionSockets = this.sessions.get(sessionSlug);
    if (!sessionSockets) {
      return {
        sessionSlug,
        snapshot: { viewerCount: 0, recentJoins: [] },
      };
    }

    sessionSockets.delete(socketId);

    if (sessionSockets.size === 0) {
      this.sessions.delete(sessionSlug);
      this.recentJoinsBySession.delete(sessionSlug);
      return {
        sessionSlug,
        snapshot: { viewerCount: 0, recentJoins: [] },
      };
    }

    return {
      sessionSlug,
      snapshot: {
        viewerCount: sessionSockets.size,
        recentJoins: [...(this.recentJoinsBySession.get(sessionSlug) ?? [])],
      },
    };
  }

  snapshot(sessionSlug: string): PresenceSnapshot {
    return {
      viewerCount: this.sessions.get(sessionSlug)?.size ?? 0,
      recentJoins: [...(this.recentJoinsBySession.get(sessionSlug) ?? [])],
    };
  }
}

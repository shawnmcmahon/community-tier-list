"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";

import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, type SessionSummary } from "@/lib/live-session";

const statusColor: Record<string, string> = {
  live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-emerald-500/10",
  draft: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  completed: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30 shadow-cyan-500/10",
};

type DashboardClientProps = {
  sessions: SessionSummary[];
};

export function DashboardClient({ sessions }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);

  const totalVotes = sessions.reduce((sum, session) => sum + session.voteCount, 0);
  const totalViewers = sessions.reduce((sum, session) => sum + session.viewerCount, 0);
  const completedSessions = sessions.filter((session) => session.status === "completed").length;
  const liveSessions = sessions.filter((session) => session.status === "live").length;

  function handleCreateSession() {
    const title = window.prompt("Session title");
    if (!title?.trim()) {
      return;
    }

    setCreateError(null);
    startTransition(async () => {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setCreateError(payload?.error ?? "Unable to create session");
        return;
      }

      const payload = (await response.json()) as { slug: string };
      startTransition(() => {
        router.push(`/s/${payload.slug}`);
        router.refresh();
      });
    });
  }

  return (
    <div className="min-h-screen bg-black">
      <Nav variant="dark" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-gray-500">Manage your tier list sessions</p>
          </div>
          <Button
            size="lg"
            className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 font-bold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-500/20 hover:from-fuchsia-500 hover:to-pink-500"
            disabled={isPending}
            onClick={handleCreateSession}
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isPending ? "Creating..." : "New Session"}
          </Button>
        </div>

        {createError ? (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {createError}
          </div>
        ) : null}

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: "Total Sessions",
              value: sessions.length.toLocaleString(),
              sub: `${completedSessions} completed`,
              accent: "text-fuchsia-400",
            },
            {
              label: "Total Votes",
              value: totalVotes.toLocaleString(),
              sub: `${liveSessions} live now`,
              accent: "text-cyan-400",
            },
            {
              label: "Total Viewers",
              value: totalViewers.toLocaleString(),
              sub: `${sessions.filter((session) => session.viewerCount > 0).length} active sessions`,
              accent: "text-amber-400",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 transition-colors hover:border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <span className="text-sm font-medium uppercase tracking-wider text-gray-500">
                {stat.label}
              </span>
              <div className={`mt-2 text-3xl font-black ${stat.accent}`}>{stat.value}</div>
              <p className="mt-1 text-xs text-gray-600">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Your Sessions
          </h2>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 px-6 py-10 text-center text-gray-500">
              No sessions yet. Create your first one to start wiring in items and live voting.
            </div>
          ) : null}

          {sessions.map((session, i) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
            >
              <Link href={`/s/${session.slug}`}>
                <div className="group cursor-pointer rounded-xl border border-gray-800 bg-gray-900/60 transition-all hover:border-fuchsia-500/30 hover:bg-gray-900">
                  <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 transition-all group-hover:border-fuchsia-500/30 group-hover:from-fuchsia-900/40 group-hover:text-fuchsia-400 group-hover:to-pink-900/40">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white transition-colors group-hover:text-fuchsia-400">
                          {session.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.itemCount} items &middot; {formatRelativeDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-4">
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-bold tabular-nums text-gray-300">
                          {session.viewerCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {session.status === "live" ? "watching" : "participated"}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase shadow-sm ${statusColor[session.status]}`}>
                        {session.status === "live" ? "● " : null}
                        {session.status}
                      </span>
                      <svg className="h-5 w-5 text-gray-600 transition-colors group-hover:text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer variant="dark" />
    </div>
  );
}

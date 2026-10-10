"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, type SessionSummary } from "@/lib/live-session";

const statusColor: Record<string, string> = {
  live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-emerald-500/10",
  draft: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-emerald-500/10",
};

type DashboardClientProps = {
  sessions: SessionSummary[];
};

export function DashboardClient({ sessions }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");

  const totalVotes = sessions.reduce((sum, session) => sum + session.voteCount, 0);
  const totalViewers = sessions.reduce((sum, session) => sum + session.viewerCount, 0);
  const completedSessions = sessions.filter((session) => session.status === "completed").length;
  const liveSessions = sessions.filter((session) => session.status === "live").length;

  function handleCreateSession() {
    if (!title.trim()) {
      return;
    }

    setCreateError(null);
    startTransition(async () => {
      try {
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
        setCreateOpen(false);
        router.push(`/s/${payload.slug}`);
        router.refresh();
      });
      } catch {
        setCreateError("Unable to create this session. Please retry.");
      }
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
            className="rounded-xl bg-amber-300 font-bold uppercase tracking-wider text-gray-950 hover:bg-amber-200"
            disabled={isPending}
            onClick={() => { setCreateError(null); setCreateOpen(true); }}
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isPending ? "Creating..." : "New Session"}
          </Button>
        </div>

        <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-700 bg-gray-900 p-6 text-white shadow-2xl">
              <Dialog.Title className="text-2xl font-bold">Create a session</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-300">Give your tier list a name. You can add items before going live.</Dialog.Description>
              <form onSubmit={event => { event.preventDefault(); handleCreateSession(); }} className="mt-6 space-y-4">
                <label className="block text-sm font-semibold" htmlFor="session-title">Session title</label>
                <input id="session-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={120} required placeholder="The great food debate" className="h-11 w-full rounded-lg border border-gray-600 bg-gray-950 px-3 text-white" />
                {createError ? <p role="alert" className="text-sm text-red-300">{createError}</p> : null}
                <div className="flex justify-end gap-2">
                  <Dialog.Close asChild><Button type="button" variant="secondary">Cancel</Button></Dialog.Close>
                  <Button disabled={isPending || !title.trim()} className="bg-amber-200 text-gray-950 hover:bg-amber-100" type="submit">{isPending ? "Creating..." : "Create session"}</Button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

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
              accent: "text-amber-400",
            },
            {
              label: "Total Votes",
              value: totalVotes.toLocaleString(),
              sub: `${liveSessions} live now`,
              accent: "text-emerald-400",
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
              Your first tier list starts here. Create a session, add items, then invite your community.
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
                <div className="group cursor-pointer rounded-xl border border-gray-800 bg-gray-900/60 transition-all hover:border-amber-500/30 hover:bg-gray-900">
                  <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 transition-all group-hover:border-amber-500/30 group-hover:from-amber-900/40 group-hover:text-amber-400 group-hover:to-orange-900/40">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white transition-colors group-hover:text-amber-400">
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
                      <svg className="h-5 w-5 text-gray-600 transition-colors group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

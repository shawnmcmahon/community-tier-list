"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_SESSIONS } from "@/lib/mock-data";

const statusVariant = {
  live: "live" as const,
  draft: "draft" as const,
  completed: "completed" as const,
};

export function DashboardMockSection() {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your command center
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Manage all your tier list sessions from a clean, focused dashboard.
          </p>
        </div>

        <motion.div
          className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="font-semibold text-slate-900">Your Sessions</h3>
              <p className="text-sm text-slate-500">
                {MOCK_SESSIONS.length} total sessions
              </p>
            </div>
            <Button size="sm">+ New Session</Button>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_SESSIONS.map((session, i) => (
              <motion.div
                key={session.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {session.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {session.itemCount} items &middot; {session.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {session.status === "live" && (
                    <span className="text-sm text-slate-500">
                      {session.viewerCount.toLocaleString()} viewers
                    </span>
                  )}
                  {session.status === "completed" && (
                    <span className="text-sm text-slate-500">
                      {session.viewerCount.toLocaleString()} participated
                    </span>
                  )}
                  <Badge variant={statusVariant[session.status]}>
                    {session.status === "live" && "● "}
                    {session.status.charAt(0).toUpperCase() +
                      session.status.slice(1)}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

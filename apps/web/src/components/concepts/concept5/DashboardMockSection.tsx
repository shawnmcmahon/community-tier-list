"use client";

import { motion } from "framer-motion";
import { MOCK_SESSIONS } from "@/lib/mock-data";

export function DashboardMockSection() {
  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl px-8">
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-sm text-emerald-500">$</span>
          <span className="font-mono text-sm text-zinc-300">
            sessions --list --format=table
          </span>
        </motion.div>

        <motion.div
          className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden font-mono text-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-[1fr_100px_100px_100px] gap-4 px-5 py-3 border-b border-zinc-800 text-xs text-zinc-600 uppercase">
            <span>Title</span>
            <span className="text-right">Items</span>
            <span className="text-right">Viewers</span>
            <span className="text-right">Status</span>
          </div>
          {MOCK_SESSIONS.map((session, i) => {
            const statusColor = {
              live: "text-emerald-400",
              draft: "text-zinc-600",
              completed: "text-blue-400",
            };
            return (
              <motion.div
                key={session.id}
                className="grid grid-cols-[1fr_100px_100px_100px] gap-4 items-center px-5 py-3.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: 0.15 + i * 0.05 }}
              >
                <div>
                  <span className="text-zinc-200">{session.title}</span>
                  <span className="text-zinc-700 ml-2 text-xs">
                    {session.createdAt}
                  </span>
                </div>
                <span className="text-right text-zinc-400 tabular-nums">
                  {session.itemCount}
                </span>
                <span className="text-right text-zinc-400 tabular-nums">
                  {session.viewerCount > 0
                    ? session.viewerCount.toLocaleString()
                    : "—"}
                </span>
                <span
                  className={`text-right font-bold uppercase text-xs ${statusColor[session.status]}`}
                >
                  {session.status}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

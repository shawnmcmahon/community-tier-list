"use client";

import { motion } from "framer-motion";
import { MOCK_SESSIONS } from "@/lib/mock-data";

export function DashboardMockSection() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="mx-auto max-w-5xl px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Mission{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Control
          </span>
        </motion.h2>

        <motion.div
          className="rounded-2xl border border-gray-800 bg-gray-900/80 backdrop-blur overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Active Sessions
            </span>
            <span className="text-xs text-gray-500">
              {MOCK_SESSIONS.length} total
            </span>
          </div>
          {MOCK_SESSIONS.map((session, i) => {
            const statusColor = {
              live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
              draft: "text-gray-400 bg-gray-400/10 border-gray-400/30",
              completed:
                "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
            };
            return (
              <motion.div
                key={session.id}
                className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
              >
                <div>
                  <p className="font-bold text-white">{session.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {session.itemCount} items &middot; {session.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {session.viewerCount > 0 && (
                    <span className="text-sm text-gray-400 tabular-nums">
                      {session.viewerCount.toLocaleString()}
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${statusColor[session.status]}`}
                  >
                    {session.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

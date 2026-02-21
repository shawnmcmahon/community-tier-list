"use client";

import { motion } from "framer-motion";
import { MOCK_SESSIONS } from "@/lib/mock-data";

export function DashboardMockSection() {
  return (
    <section className="py-24 border-t border-stone-200">
      <div className="mx-auto max-w-4xl px-8">
        <motion.h2
          className="font-serif text-3xl font-light text-stone-900 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Your sessions, at a glance
        </motion.h2>

        <motion.div
          className="border border-stone-200 rounded-none overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-[1fr_auto_auto] text-xs text-stone-400 uppercase tracking-widest px-6 py-3 border-b border-stone-200 bg-stone-50">
            <span>Title</span>
            <span className="w-24 text-right">Viewers</span>
            <span className="w-24 text-right">Status</span>
          </div>
          {MOCK_SESSIONS.map((session, i) => (
            <motion.div
              key={session.id}
              className="grid grid-cols-[1fr_auto_auto] items-center px-6 py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
            >
              <div>
                <p className="text-stone-900">{session.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {session.itemCount} items &middot; {session.createdAt}
                </p>
              </div>
              <span className="w-24 text-right text-sm text-stone-500 tabular-nums">
                {session.viewerCount > 0
                  ? session.viewerCount.toLocaleString()
                  : "\u2014"}
              </span>
              <span className="w-24 text-right">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                    session.status === "live"
                      ? "bg-emerald-50 text-emerald-700"
                      : session.status === "completed"
                        ? "bg-stone-100 text-stone-600"
                        : "bg-stone-50 text-stone-400"
                  }`}
                >
                  {session.status}
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

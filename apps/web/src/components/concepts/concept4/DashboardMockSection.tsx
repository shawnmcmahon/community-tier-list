"use client";

import { motion } from "framer-motion";
import { MOCK_SESSIONS } from "@/lib/mock-data";

const statusStyle = {
  live: "bg-emerald-100 text-emerald-700 border-emerald-300",
  draft: "bg-stone-100 text-stone-500 border-stone-300",
  completed: "bg-violet-100 text-violet-700 border-violet-300",
};

export function DashboardMockSection() {
  return (
    <section className="py-24 bg-orange-50/50">
      <div className="mx-auto max-w-5xl px-8">
        <motion.h2
          className="text-3xl font-extrabold text-rose-900 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Your Collection
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {MOCK_SESSIONS.map((session, i) => (
            <motion.div
              key={session.id}
              className="rounded-3xl border-2 border-rose-200 bg-white p-6 hover:shadow-lg hover:border-rose-300 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 text-xl">
                  {["🎮", "🎵", "🍔", "💻"][i]}
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle[session.status]}`}
                >
                  {session.status}
                </span>
              </div>
              <h3 className="font-bold text-rose-900 text-lg">
                {session.title}
              </h3>
              <p className="text-sm text-rose-400 mt-1">
                {session.itemCount} items &middot; {session.createdAt}
              </p>
              {session.viewerCount > 0 && (
                <p className="text-sm text-rose-500 mt-2 font-medium">
                  {session.viewerCount.toLocaleString()}{" "}
                  {session.status === "live" ? "watching" : "participated"}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MOCK_SESSIONS } from "@/lib/mock-data";

const statusColor: Record<string, string> = {
  live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-emerald-500/10",
  draft: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  completed: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30 shadow-cyan-500/10",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      <Nav variant="dark" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-gray-500">
              Manage your tier list sessions
            </p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:from-fuchsia-500 hover:to-pink-500 shadow-lg shadow-fuchsia-500/20 rounded-xl font-bold uppercase tracking-wider"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Session
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Sessions", value: "4", sub: "2 completed", color: "from-fuchsia-500/20 to-pink-500/20", accent: "text-fuchsia-400" },
            { label: "Total Votes", value: "10,759", sub: "+1,247 today", color: "from-cyan-500/20 to-blue-500/20", accent: "text-cyan-400" },
            { label: "Total Viewers", value: "5,138", sub: "1,247 active now", color: "from-amber-500/20 to-orange-500/20", accent: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 hover:border-gray-700 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`text-3xl font-black mt-2 ${stat.accent}`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Your Sessions
          </h2>
          <div className="flex items-center gap-2">
            {["All", "Live", "Draft", "Completed"].map((filter) => (
              <button
                key={filter}
                className={`px-3.5 py-1.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                  filter === "All"
                    ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-sm shadow-fuchsia-500/20"
                    : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_SESSIONS.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
            >
              <Link href={`/s/${session.slug}`}>
                <div className="group rounded-xl border border-gray-800 bg-gray-900/60 hover:border-fuchsia-500/30 hover:bg-gray-900 transition-all cursor-pointer">
                  <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-gray-500 group-hover:from-fuchsia-900/40 group-hover:to-pink-900/40 group-hover:border-fuchsia-500/30 group-hover:text-fuchsia-400 transition-all">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white group-hover:text-fuchsia-400 transition-colors truncate">
                          {session.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.itemCount} items &middot; {session.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      {session.viewerCount > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-gray-300 tabular-nums">
                            {session.viewerCount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            {session.status === "live" ? "watching" : "participated"}
                          </p>
                        </div>
                      )}
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border shadow-sm ${statusColor[session.status]}`}>
                        {session.status === "live" && "● "}
                        {session.status}
                      </span>
                      <svg className="h-5 w-5 text-gray-600 group-hover:text-fuchsia-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

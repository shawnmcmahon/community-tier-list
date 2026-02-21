"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-blue-500/10 blur-[120px] rounded-full" />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 font-bold text-sm shadow-lg">
              TL
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-slate-400">
            Sign in to manage your tier list sessions
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <Link href="/dashboard">
            <Button
              size="xl"
              className="w-full bg-[#9146FF] hover:bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
              Continue with Twitch
            </Button>
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mt-6 space-y-3">
            <Link href="/s/best-fps-2025">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20"
              >
                Join a Session as Viewer
              </Button>
            </Link>
          </div>

          <div className="mt-8 rounded-xl bg-white/5 border border-white/5 p-4">
            <h3 className="text-sm font-medium text-white mb-2">
              What we access
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Twitch display name and profile picture
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Twitch user ID (for identity)
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-slate-500">
                  We never access your email, followers, or stream data
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          By signing in, you agree to our{" "}
          <Link href="/privacy" className="text-slate-400 hover:text-white underline underline-offset-4">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00ff06_1px,transparent_1px),linear-gradient(to_bottom,#00ffff06_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] bg-fuchsia-600/15 blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] bg-cyan-600/15 blur-[150px] rounded-full" />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white font-black text-sm shadow-lg shadow-fuchsia-500/20">
              TL
            </div>
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-500">
            Sign in to manage your tier list sessions
          </p>
        </div>

        <div className="rounded-2xl border border-fuchsia-500/20 bg-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-fuchsia-500/5">
          <Link href="/dashboard">
            <Button
              size="xl"
              className="w-full bg-[#9146FF] hover:bg-[#7C3AED] text-white shadow-lg shadow-purple-500/30 rounded-xl font-bold uppercase tracking-wider"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
              Continue with Twitch
            </Button>
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />
            <span className="text-xs text-gray-600 uppercase tracking-wider font-bold">
              or
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </div>

          <div className="mt-6">
            <Link href="/s/best-fps-2025">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-400/40 rounded-xl font-bold uppercase tracking-wider"
              >
                Join a Session as Viewer
              </Button>
            </Link>
          </div>

          <div className="mt-8 rounded-xl bg-white/[0.03] border border-white/5 p-5">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              What we access
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Twitch display name and profile picture
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Twitch user ID (for identity)
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <span className="text-gray-600">
                  We never access your email, followers, or stream data
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our{" "}
          <Link href="/privacy" className="text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-4">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

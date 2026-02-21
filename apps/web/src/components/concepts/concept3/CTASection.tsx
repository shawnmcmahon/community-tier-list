"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 md:p-16 text-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to rank with your community?
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
              Sign in with Twitch, create a session, and share the link. Your
              viewers are one click away from voting.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="xl"
                  className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/s/best-fps-2025">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  Try a Demo
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Free to use &middot; No credit card &middot; Twitch login only
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

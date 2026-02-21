"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-800">
      <div className="mx-auto max-w-3xl px-8 text-center">
        <motion.div
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="font-mono text-emerald-500 text-sm mb-4">
            $ ready to deploy?
          </div>
          <h2 className="font-mono text-3xl sm:text-4xl font-bold text-white">
            init your first session
          </h2>
          <p className="mt-3 text-zinc-500 font-mono text-sm">
            Twitch OAuth, 30-second setup, zero config for viewers.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-emerald-600 text-white hover:bg-emerald-500 rounded-md font-mono font-bold"
              >
                $ get started
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

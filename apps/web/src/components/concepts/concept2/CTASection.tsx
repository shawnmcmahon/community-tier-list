"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-gradient-to-r from-fuchsia-600/20 to-cyan-600/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-8 text-center">
        <motion.h2
          className="text-5xl sm:text-6xl font-black uppercase tracking-tight text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Game{" "}
          <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
            On.
          </span>
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Drop into your first session. Free, fast, and built for streamers.
        </motion.p>
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/dashboard">
            <Button
              size="xl"
              className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:from-fuchsia-500 hover:to-pink-500 shadow-[0_0_40px_rgba(236,72,153,0.3)] rounded-xl text-lg px-12 font-bold uppercase tracking-wider"
            >
              Launch Session
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

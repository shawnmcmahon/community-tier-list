"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-32 border-t border-stone-200">
      <div className="mx-auto max-w-3xl px-8 text-center">
        <motion.h2
          className="font-serif text-4xl sm:text-5xl font-light text-stone-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to create?
        </motion.h2>
        <motion.p
          className="mt-4 text-stone-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Sign in with Twitch and share a link. It takes 30 seconds.
        </motion.p>
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/dashboard">
            <Button
              size="xl"
              className="bg-stone-900 text-white hover:bg-stone-800 rounded-full px-12 font-light tracking-wide"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

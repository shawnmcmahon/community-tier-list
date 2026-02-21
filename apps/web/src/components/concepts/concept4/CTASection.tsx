"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-3xl px-8 text-center">
        <motion.div
          className="rounded-[2rem] bg-gradient-to-br from-orange-100 via-rose-100 to-violet-100 border-2 border-rose-200 p-12 md:p-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-900">
            Ready to start?
          </h2>
          <p className="mt-3 text-rose-600/60">
            Create your first session in under a minute.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button
                size="xl"
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-400 hover:to-rose-400 rounded-2xl shadow-lg shadow-rose-200 font-bold px-12"
              >
                Let&apos;s Go!
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

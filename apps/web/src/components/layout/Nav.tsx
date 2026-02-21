"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavProps {
  variant?: "light" | "dark" | "transparent";
  className?: string;
}

export function Nav({ variant = "light", className }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = variant === "dark";
  const isTransparent = variant === "transparent";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-lg",
        isDark
          ? "border-white/10 bg-slate-950/80 text-white"
          : isTransparent
            ? "border-transparent bg-transparent text-slate-900"
            : "border-slate-200/80 bg-white/80 text-slate-900",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm",
              isDark ? "bg-white text-slate-900" : "bg-slate-900 text-white"
            )}
          >
            TL
          </div>
          <span className="font-semibold tracking-tight text-lg hidden sm:block">
            Community Tier Lists
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/privacy", label: "Privacy" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Concepts:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <Link
                key={n}
                href={`/${n}`}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                )}
              >
                {n}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant={isDark ? "outline" : "ghost"}
              size="sm"
              className={cn(
                isDark &&
                  "border-white/20 text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Sign in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="sm"
              className={cn(
                isDark && "bg-white text-slate-900 hover:bg-slate-100"
              )}
            >
              Get Started
            </Button>
          </Link>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={cn(
            "md:hidden border-t px-6 py-4 space-y-2",
            isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"
          )}
        >
          {[
            { href: "/", label: "Home" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/privacy", label: "Privacy" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-lg",
                isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Link
                key={n}
                href={`/${n}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium border",
                  isDark
                    ? "text-slate-400 border-white/10 hover:bg-white/10"
                    : "text-slate-500 border-slate-200 hover:bg-slate-100"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

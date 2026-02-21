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
          ? "border-gray-800 bg-black/80 text-white"
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
              "flex h-8 w-8 items-center justify-center rounded-lg font-black text-sm",
              isDark
                ? "bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white"
                : "bg-slate-900 text-white"
            )}
          >
            TL
          </div>
          <span className={cn(
            "font-bold tracking-tight text-lg hidden sm:block",
            isDark ? "text-white" : "text-slate-900"
          )}>
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
                  ? "text-gray-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant={isDark ? "outline" : "ghost"}
              size="sm"
              className={cn(
                isDark &&
                  "border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-300 hover:border-fuchsia-400/50"
              )}
            >
              Sign in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="sm"
              className={cn(
                isDark && "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:from-fuchsia-500 hover:to-pink-500 shadow-sm shadow-fuchsia-500/20"
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
            isDark ? "border-gray-800 bg-black" : "border-slate-200 bg-white"
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
                isDark ? "text-gray-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-400" : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "light" | "dark";
  className?: string;
}

export function Footer({ variant = "light", className }: FooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      className={cn(
        "border-t py-12",
        isDark
          ? "border-white/10 bg-slate-950 text-slate-400"
          : "border-slate-200 bg-slate-50 text-slate-500",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md font-bold text-xs",
                isDark ? "bg-white/10 text-white" : "bg-slate-200 text-slate-600"
              )}
            >
              TL
            </div>
            <span className="text-sm font-medium">Community Tier Lists</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-white" : "hover:text-slate-900"
              )}
            >
              Privacy
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-white" : "hover:text-slate-900"
              )}
            >
              Dashboard
            </Link>
          </nav>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Community Tier Lists
          </p>
        </div>
      </div>
    </footer>
  );
}

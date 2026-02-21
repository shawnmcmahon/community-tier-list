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
          ? "border-gray-800 bg-black text-gray-500"
          : "border-slate-200 bg-slate-50 text-slate-500",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md font-black text-xs",
                isDark
                  ? "bg-gradient-to-br from-fuchsia-600/30 to-pink-600/30 text-fuchsia-400"
                  : "bg-slate-200 text-slate-600"
              )}
            >
              TL
            </div>
            <span className={cn(
              "text-sm font-medium",
              isDark ? "text-gray-400" : "text-slate-500"
            )}>
              Community Tier Lists
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-fuchsia-400" : "hover:text-slate-900"
              )}
            >
              Privacy
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-fuchsia-400" : "hover:text-slate-900"
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

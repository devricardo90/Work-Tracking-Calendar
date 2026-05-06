import Link from "next/link";
import { BarChart3, CalendarDays, History, Plus, SquareTerminal, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/calendar", label: "Calendar", key: "calendar", icon: CalendarDays },
  { href: "/history", label: "History", key: "history", icon: History },
  { href: "/summary", label: "Summary", key: "summary", icon: BarChart3 },
  { href: "/profile", label: "Profile", key: "profile", icon: UserRound },
] as const;

type AppShellProps = {
  active: "calendar" | "history" | "summary" | "profile";
  addHref?: string;
  children: ReactNode;
  showAddButton?: boolean;
};

export function AppShell({ active, addHref = "/entries/new", children, showAddButton = true }: AppShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f7f4ed_0%,#f0eadf_48%,#e7dece_100%)] text-stone-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[15rem_1fr]">
        <aside className="relative hidden border-r border-stone-200/80 px-5 py-6 lg:flex lg:flex-col">
          <div className="absolute inset-0 opacity-45 [background-image:repeating-linear-gradient(90deg,rgba(28,25,23,0.045)_0_1px,transparent_1px_28px)]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-2xl bg-stone-950 p-2.5 text-stone-50 shadow-[0_18px_42px_-24px_rgba(0,0,0,0.6)]">
              <SquareTerminal className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-stone-500">WorkLog</p>
              <p className="mt-1 text-xs text-stone-400">Internal workspace</p>
            </div>
          </div>

          <nav className="relative z-10 mt-10 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
                    isActive
                      ? "bg-stone-950 text-stone-50 shadow-[0_18px_32px_-22px_rgba(0,0,0,0.62)]"
                      : "text-stone-500 hover:bg-white/70 hover:text-stone-950",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {showAddButton ? (
            <Link
              href={addHref}
              className="relative z-10 mt-8 flex items-center justify-center gap-2 rounded-2xl border border-stone-950 bg-stone-950 px-4 py-3 text-sm font-semibold text-stone-50 shadow-[0_20px_42px_-26px_rgba(0,0,0,0.66)] transition hover:bg-stone-800"
            >
              <Plus className="size-4" />
              Add Entry
            </Link>
          ) : null}

          <div className="relative z-10 mt-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone-300">Private workspace</p>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:py-7 lg:pb-8 xl:px-10">
          {children}
        </div>
      </div>

      <MobileNav active={active} addHref={addHref} showAddButton={showAddButton} />
    </main>
  );
}

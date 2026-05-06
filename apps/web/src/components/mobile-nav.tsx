import Link from "next/link";
import { BarChart3, CalendarDays, History, Plus, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/history", label: "History", icon: History },
  { href: "/summary", label: "Summary", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

type MobileNavProps = {
  active: "calendar" | "history" | "summary" | "profile";
  addHref?: string;
  showAddButton?: boolean;
};

export function MobileNav({ active, addHref = "/entries/new", showAddButton = true }: MobileNavProps) {
  return (
    <>
      {showAddButton ? (
        <div className="fixed right-5 bottom-24 z-20 sm:right-[calc(50%-11rem)]">
          <Link
            href={addHref}
            className="flex items-center gap-2 rounded-[1.35rem] border border-stone-950/10 bg-stone-900 px-5 py-4 text-sm font-semibold text-stone-50 shadow-[0_22px_46px_-20px_rgba(0,0,0,0.65)] transition hover:scale-[1.02] hover:bg-stone-800"
          >
            <Plus className="size-4" />
            Add Entry
          </Link>
        </div>
      ) : null}

      <nav className="fixed right-0 bottom-0 left-0 z-10 border-t border-stone-200/80 bg-white/88 px-4 pt-3 pb-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-[1.6rem] border border-stone-200/70 bg-white/88 px-3 py-2 shadow-[0_20px_40px_-28px_rgba(50,35,20,0.32)]">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.label.toLowerCase() === active;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-1 rounded-[1rem] px-2 py-2 text-[10px] font-semibold transition",
                  isActive
                    ? "bg-stone-900 text-stone-50 shadow-[0_16px_26px_-20px_rgba(0,0,0,0.55)]"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700",
                )}
              >
                <Icon className={cn("size-5", isActive && "stroke-[2.4]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-24" />
    </>
  );
}

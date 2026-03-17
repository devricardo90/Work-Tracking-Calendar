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
};

export function MobileNav({ active, addHref = "/entries/new" }: MobileNavProps) {
  return (
    <>
      <div className="fixed right-5 bottom-24 z-20 sm:right-[calc(50%-11rem)]">
        <Link
          href={addHref}
          className="flex items-center gap-2 rounded-2xl bg-stone-900 px-5 py-4 text-sm font-semibold text-stone-50 shadow-[0_22px_46px_-20px_rgba(0,0,0,0.65)] transition hover:scale-[1.02] hover:bg-stone-800"
        >
          <Plus className="size-4" />
          Add Entry
        </Link>
      </div>

      <nav className="fixed right-0 bottom-0 left-0 z-10 border-t border-stone-200/80 bg-white/92 px-6 pt-3 pb-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.label.toLowerCase() === active;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 text-[10px] font-semibold transition",
                  isActive ? "text-stone-950" : "text-stone-400 hover:text-stone-700",
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

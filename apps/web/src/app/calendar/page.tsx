import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";

const cells = [
  { day: "", muted: true },
  { day: "", muted: true },
  { day: "1" },
  { day: "2", hours: "8h", dot: true },
  { day: "3", hours: "7h" },
  { day: "4", hours: "8h" },
  { day: "5", muted: true },
  { day: "6", muted: true },
  { day: "7", hours: "9h" },
  { day: "8", active: true, dot: true },
  { day: "9" },
  { day: "10" },
  { day: "11" },
  { day: "12", muted: true },
  { day: "13" },
  { day: "14" },
  { day: "15" },
  { day: "16" },
  { day: "17" },
  { day: "18" },
  { day: "19", muted: true },
  { day: "20", muted: true },
  { day: "21" },
  { day: "22" },
  { day: "23" },
  { day: "24" },
  { day: "25" },
  { day: "26", muted: true },
];

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f8f5_0%,#f1eee9_44%,#e9e4db_100%)] text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-white/82 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <button className="rounded-full p-2 transition hover:bg-stone-100" aria-label="Previous month">
            <ChevronLeft className="size-5 text-stone-600" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">October 2024</h1>
          <button className="rounded-full p-2 transition hover:bg-stone-100" aria-label="Next month">
            <ChevronRight className="size-5 text-stone-600" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-4">
        <Card className="overflow-hidden rounded-[1.5rem] border-stone-200/80 bg-white/90 py-0 shadow-[0_24px_60px_-34px_rgba(50,35,20,0.35)]">
          <CardContent className="p-4">
            <div className="mb-2 grid grid-cols-7">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-stone-100 bg-stone-100">
              {cells.map((cell, index) => (
                <button
                  key={`${cell.day}-${index}`}
                  className={`relative h-16 bg-white p-1 text-left sm:h-20 ${
                    cell.muted ? "bg-stone-50/80" : ""
                  } ${cell.active ? "ring-2 ring-inset ring-stone-900" : ""}`}
                >
                  {cell.day ? (
                    <>
                      <span
                        className={`text-sm ${cell.active ? "font-bold text-stone-950" : cell.muted ? "text-stone-400" : "font-medium text-stone-800"}`}
                      >
                        {cell.day}
                      </span>
                      {cell.hours ? (
                        <span className="absolute top-1 right-1 rounded bg-stone-900/8 px-1 text-[10px] font-bold text-stone-900">
                          {cell.hours}
                        </span>
                      ) : null}
                      {cell.dot ? (
                        <span className="absolute bottom-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-stone-900" />
                      ) : null}
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Card className="rounded-[1.5rem] border-stone-200/80 bg-white/90 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
            <CardContent className="p-5">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
                Total Hours
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-stone-950">168</span>
                <span className="text-sm text-stone-500">hrs</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-stone-200/80 bg-white/90 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
            <CardContent className="p-5">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
                Days Worked
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-stone-950">21</span>
                <span className="text-sm text-stone-500">days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 text-center">
          <Link href="/entries/day-details" className="text-xs font-medium text-stone-500 hover:text-stone-900">
            Open the stitched day-details screen
          </Link>
        </div>

        <div className="mt-3 text-center">
          <Link href="/entries/new" className="text-xs font-medium text-stone-500 hover:text-stone-900">
            Open the stitched add-entry screen
          </Link>
        </div>
      </div>

      <MobileNav active="calendar" />
    </main>
  );
}

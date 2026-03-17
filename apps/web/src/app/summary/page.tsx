"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, LoaderCircle, Mail, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";
import { getEntriesByMonth, toMonthParam, type Entry } from "@/lib/entries";

export default function SummaryPage() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getEntriesByMonth(toMonthParam(currentMonth));

        if (isMounted) {
          setEntries(data.entries);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load monthly summary");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEntries();

    return () => {
      isMounted = false;
    };
  }, [currentMonth]);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
  const workedDays = entries.length;
  const dailyAverage = workedDays ? totalHours / workedDays : 0;

  const initials = useMemo(() => "WH", []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-white/82 px-4 py-4 backdrop-blur">
        <Link
          href="/calendar"
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-stone-100"
        >
          <ArrowLeft className="size-5 text-stone-900" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2 transition hover:bg-stone-100"
            onClick={() => setCurrentMonth((value) => subMonths(value, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4 text-stone-700" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Monthly Summary</h1>
          <button
            className="rounded-full p-2 transition hover:bg-stone-100"
            onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4 text-stone-700" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 pb-28">
        <Card className="mt-4 overflow-hidden rounded-[1.6rem] border-stone-200/80 bg-white/92 py-0 shadow-[0_26px_60px_-36px_rgba(50,35,20,0.36)]">
          <div className="flex items-center gap-4 bg-stone-900/8 px-6 py-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-stone-900 text-xl font-bold text-stone-50">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-400">
                Worker Profile
              </p>
              <p className="text-xl font-bold text-stone-950">Worker Hours User</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-500">
                <CalendarDays className="size-4 text-stone-700" />
                <span>{format(currentMonth, "MMMM yyyy")}</span>
              </div>
            </div>
          </div>
        </Card>

        {errorMessage ? <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card className="rounded-[1.3rem] border-stone-200/80 bg-white/92 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-400">Total Hours</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-stone-950">
                {isLoading ? "..." : `${totalHours.toFixed(1).replace(".0", "")}h`}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.3rem] border-stone-200/80 bg-white/92 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-400">Worked Days</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-stone-950">
                {isLoading ? "..." : workedDays}
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 rounded-[1.3rem] border-stone-200/80 bg-white/92 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-stone-400">Daily Avg</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-stone-950">
                {isLoading ? "..." : `${dailyAverage.toFixed(1).replace(".0", "")}h`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-950">Daily Entries</h2>
            <Link href="/history" className="text-sm font-medium text-stone-700 transition hover:text-stone-950">
              View All
            </Link>
          </div>

          <div className="overflow-hidden rounded-[1.4rem] border border-stone-200/80 bg-white/92 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
            <div className="grid grid-cols-[1.15fr_1fr_auto] gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              <span>Date</span>
              <span>Location</span>
              <span className="text-right">Hours</span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8 text-stone-500">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {entries.length ? (
                  entries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/entries/day-details?date=${entry.workDate}`}
                      className="grid grid-cols-[1.15fr_1fr_auto] gap-2 px-4 py-3 text-sm transition hover:bg-stone-50"
                    >
                      <span className="text-stone-900">{format(new Date(`${entry.workDate}T00:00:00`), "MMM d, yyyy")}</span>
                      <span className="truncate text-stone-500">{entry.location}</span>
                      <span className="text-right font-bold text-stone-950">
                        {entry.hoursWorked.toFixed(1).replace(".0", "")}h
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-stone-500">
                    No entries found for this month.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button className="h-12 w-full rounded-[1.25rem] bg-stone-900 text-sm font-bold text-stone-50 hover:bg-stone-800">
            <FileSpreadsheet className="size-4" />
            Export as PDF
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-[1.25rem] border-2 border-stone-900 bg-transparent text-sm font-bold text-stone-900 hover:bg-stone-100"
          >
            <Mail className="size-4" />
            Send by Email
          </Button>
        </div>
      </div>

      <MobileNav active="summary" />
    </main>
  );
}

"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { isAuthenticationError } from "@/lib/api";
import { ENTRY_STATUS_LABELS, getEntriesByMonth, toDayParam, toMonthParam, type Entry } from "@/lib/entries";

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (monthParam) {
      return new Date(`${monthParam}-01T00:00:00`);
    }

    return startOfMonth(new Date());
  });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!monthParam) {
      return;
    }

    setCurrentMonth(new Date(`${monthParam}-01T00:00:00`));
  }, [monthParam]);

  function navigateToMonth(nextMonth: Date) {
    setCurrentMonth(nextMonth);
    router.push(`/calendar?month=${toMonthParam(nextMonth)}`);
  }

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
          if (isAuthenticationError(error)) {
            router.replace("/login");
            router.refresh();
            return;
          }

          setErrorMessage(error instanceof Error ? error.message : "Could not load entries");
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
  }, [currentMonth, router]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const entriesByDate = useMemo(() => {
    return new Map(entries.map((entry) => [entry.workDate, entry]));
  }, [entries]);

  const totalHours = entries.reduce((sum, entry) => sum + (entry.entryStatus === "worked" ? entry.hoursWorked : 0), 0);
  const daysWorked = entries.filter((entry) => entry.entryStatus === "worked").length;

  return (
    <AppShell
      active="calendar"
      addHref={`/entries/new?date=${toDayParam(new Date())}&month=${toMonthParam(currentMonth)}`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 flex flex-col gap-4 rounded-[1.75rem] border border-white/80 bg-white/78 px-4 py-4 shadow-[0_24px_70px_-48px_rgba(60,40,20,0.42)] backdrop-blur sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-stone-400">Calendar</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
              {format(currentMonth, "MMMM yyyy")}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Review worked days, fill gaps and keep the month ready for export.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white/86 p-1 shadow-sm lg:min-w-48">
          <button
            className="rounded-xl p-2 transition hover:bg-stone-100"
            aria-label="Previous month"
            onClick={() => navigateToMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="size-5 text-stone-600" />
          </button>
          <span className="px-3 text-sm font-semibold text-stone-700">{format(currentMonth, "MMM yyyy")}</span>
          <button
            className="rounded-xl p-2 transition hover:bg-stone-100"
            aria-label="Next month"
            onClick={() => navigateToMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="size-5 text-stone-600" />
          </button>
        </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <Card className="overflow-hidden rounded-[1.5rem] border-stone-200/80 bg-white/92 py-0 shadow-[0_24px_60px_-34px_rgba(50,35,20,0.35)]">
            <CardContent className="p-3 sm:p-4 lg:p-5">
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
                {calendarDays.map((day) => {
                  const dayKey = toDayParam(day);
                  const entry = entriesByDate.get(dayKey);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <Link
                      key={dayKey}
                      href={
                        entry
                          ? `/entries/day-details?date=${dayKey}&month=${toMonthParam(currentMonth)}`
                          : `/entries/new?date=${dayKey}&month=${toMonthParam(currentMonth)}`
                      }
                      className={`relative h-16 bg-white p-1.5 text-left transition hover:bg-stone-50 sm:h-20 lg:h-28 ${
                        isCurrentMonth ? "" : "bg-stone-50/80"
                      } ${isToday ? "ring-2 ring-inset ring-stone-900" : ""}`}
                    >
                      <span
                        className={`text-sm ${
                          isToday
                            ? "font-bold text-stone-950"
                            : isCurrentMonth
                              ? "font-medium text-stone-800"
                              : "text-stone-400"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {entry ? (
                        <>
                          <span
                            className={`absolute top-1.5 right-1.5 rounded px-1 text-[10px] font-bold ${
                              entry.entryStatus === "worked"
                                ? "bg-stone-900/8 text-stone-900"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {entry.entryStatus === "worked" ? `${entry.hoursWorked}h` : ENTRY_STATUS_LABELS[entry.entryStatus]}
                          </span>
                          <span
                            className={`absolute bottom-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full ${
                              entry.entryStatus === "worked" ? "bg-stone-900" : "bg-amber-500"
                            }`}
                          />
                        </>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            {errorMessage ? (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <Card className="rounded-[1.5rem] border-stone-200/80 bg-white/92 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
                <CardContent className="p-5">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
                    Total Hours
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-stone-950">
                      {isLoading ? "..." : totalHours.toFixed(1).replace(".0", "")}
                    </span>
                    <span className="text-sm text-stone-500">hrs</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[1.5rem] border-stone-200/80 bg-white/92 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
                <CardContent className="p-5">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
                    Days Worked
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-stone-950">
                      {isLoading ? "..." : daysWorked}
                    </span>
                    <span className="text-sm text-stone-500">days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[1.5rem] border-stone-200/80 bg-white/92 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
                    Quick Actions
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                    Keep the month updated
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href={`/entries/new?date=${toDayParam(new Date())}&month=${toMonthParam(currentMonth)}`}
                    className="rounded-[1.15rem] border border-stone-950 bg-stone-950 px-4 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                  >
                    Add or update today&apos;s entry
                  </Link>
                  <Link
                    href={`/summary?month=${toMonthParam(currentMonth)}`}
                    className="rounded-[1.15rem] border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Review monthly summary
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

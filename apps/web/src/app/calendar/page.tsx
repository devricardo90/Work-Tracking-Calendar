"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";
import { getEntriesByMonth, toDayParam, toMonthParam, type Entry } from "@/lib/entries";

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
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const entriesByDate = useMemo(() => {
    return new Map(entries.map((entry) => [entry.workDate, entry]));
  }, [entries]);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
  const daysWorked = entries.length;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f8f5_0%,#f1eee9_44%,#e9e4db_100%)] text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-white/82 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <button
            className="rounded-full p-2 transition hover:bg-stone-100"
            aria-label="Previous month"
            onClick={() => navigateToMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="size-5 text-stone-600" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">{format(currentMonth, "MMMM yyyy")}</h1>
          <button
            className="rounded-full p-2 transition hover:bg-stone-100"
            aria-label="Next month"
            onClick={() => navigateToMonth(addMonths(currentMonth, 1))}
          >
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
                    className={`relative h-16 bg-white p-1 text-left sm:h-20 ${
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
                        <span className="absolute top-1 right-1 rounded bg-stone-900/8 px-1 text-[10px] font-bold text-stone-900">
                          {entry.hoursWorked}h
                        </span>
                        <span className="absolute bottom-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-stone-900" />
                      </>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {errorMessage ? (
          <p className="mt-3 text-center text-sm text-red-600">{errorMessage}</p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Card className="rounded-[1.5rem] border-stone-200/80 bg-white/90 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
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

          <Card className="rounded-[1.5rem] border-stone-200/80 bg-white/90 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
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

        <div className="mt-5 text-center">
          <Link
            href={`/entries/day-details?date=${toDayParam(new Date())}`}
            className="text-xs font-medium text-stone-500 hover:text-stone-900"
          >
            Open the day-details route for today
          </Link>
        </div>

        <div className="mt-3 text-center">
          <Link
            href={`/entries/new?date=${toDayParam(new Date())}&month=${toMonthParam(currentMonth)}`}
            className="text-xs font-medium text-stone-500 hover:text-stone-900"
          >
            Open add-entry for the selected workflow
          </Link>
        </div>
      </div>

      <MobileNav active="calendar" />
    </main>
  );
}

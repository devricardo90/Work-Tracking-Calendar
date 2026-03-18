"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { ArrowLeft, ChevronDown, LoaderCircle, Search } from "lucide-react";

import { HistoryMap } from "@/components/history-map";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/mobile-nav";
import { getEntriesByMonth, toMonthParam, type Entry } from "@/lib/entries";

export default function HistoryPage() {
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
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
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
    router.push(`/history?month=${toMonthParam(nextMonth)}`);
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
          setErrorMessage(error instanceof Error ? error.message : "Could not load history");
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

  const locations = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => entry.location))).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesLocation =
        selectedLocation === "all" ? true : entry.location === selectedLocation;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        entry.location.toLowerCase().includes(normalizedQuery) ||
        entry.workDate.includes(normalizedQuery) ||
        format(new Date(`${entry.workDate}T00:00:00`), "MMM d, yyyy")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesLocation && matchesQuery;
    });
  }, [entries, query, selectedLocation]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 bg-[#f6f4ef]/88 px-4 pt-6 pb-3 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/calendar?month=${toMonthParam(currentMonth)}`}
            className="flex size-10 items-center justify-center rounded-full transition hover:bg-stone-200/60"
          >
            <ArrowLeft className="size-5 text-stone-900" />
          </Link>
          <h1 className="pr-10 text-xl font-bold tracking-tight text-stone-950">Search Records</h1>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search by date or location"
            className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-200/40 pr-4 pl-11 text-base"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-stone-900 px-4 text-sm font-medium text-stone-50"
            onClick={() => navigateToMonth(subMonths(currentMonth, 1))}
          >
            Previous
            <ChevronDown className="size-4" />
          </button>
          <button
            className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-stone-300 bg-stone-200/50 px-4 text-sm font-medium text-stone-700"
            onClick={() => setSelectedLocation((value) => (value === "all" ? locations[0] ?? "all" : "all"))}
          >
            {selectedLocation === "all" ? "Location" : selectedLocation}
            <ChevronDown className="size-4" />
          </button>
          <button
            className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-stone-300 bg-stone-200/50 px-4 text-sm font-medium text-stone-700"
            onClick={() => navigateToMonth(addMonths(currentMonth, 1))}
          >
            {format(currentMonth, "MMM yyyy")}
            <ChevronDown className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 pb-28">
        <section className="mt-5">
          <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <Card className="overflow-hidden rounded-[1.4rem] border-stone-200/80 bg-white/92 py-0 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
            {isLoading ? (
              <div className="flex justify-center py-8 text-stone-500">
                <LoaderCircle className="size-6 animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {filteredEntries.length ? (
                  filteredEntries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/entries/day-details?date=${entry.workDate}&month=${toMonthParam(currentMonth)}`}
                      className="flex items-center justify-between px-4 py-4 text-left transition hover:bg-stone-50"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-stone-900">
                          {format(new Date(`${entry.workDate}T00:00:00`), "MMM d, yyyy")}
                        </span>
                        <span className="mt-1 text-sm text-stone-500">{entry.location}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-950">
                          {entry.hoursWorked.toFixed(1).replace(".0", "")}h
                        </span>
                        <p className="text-xs text-stone-400">Work entry</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-stone-500">
                    {errorMessage ?? "No records found for the current filters."}
                  </div>
                )}
              </div>
            )}
          </Card>
        </section>

        <div className="mt-6">
          <HistoryMap entries={filteredEntries} />
        </div>
      </div>

      <MobileNav active="history" />
    </main>
  );
}

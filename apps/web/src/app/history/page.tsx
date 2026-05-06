"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, LoaderCircle, Search } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { HistoryMap } from "@/components/history-map";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isAuthenticationError } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENTRY_STATUS_LABELS, getEntriesByMonth, toMonthParam, type Entry } from "@/lib/entries";

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
          if (isAuthenticationError(error)) {
            router.replace("/login");
            router.refresh();
            return;
          }

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
  }, [currentMonth, router]);

  const locations = useMemo(() => {
    return Array.from(
      new Set(entries.map((entry) => entry.location).filter((location): location is string => Boolean(location))),
    ).sort();
  }, [entries]);

  useEffect(() => {
    if (selectedLocation !== "all" && !locations.includes(selectedLocation)) {
      setSelectedLocation("all");
    }
  }, [locations, selectedLocation]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesLocation =
        selectedLocation === "all" ? true : entry.location === selectedLocation;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        (entry.location ?? "").toLowerCase().includes(normalizedQuery) ||
        entry.workDate.includes(normalizedQuery) ||
        ENTRY_STATUS_LABELS[entry.entryStatus].toLowerCase().includes(normalizedQuery) ||
        format(new Date(`${entry.workDate}T00:00:00`), "MMM d, yyyy")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesLocation && matchesQuery;
    });
  }, [entries, query, selectedLocation]);

  const filteredHours = filteredEntries.reduce(
    (sum, entry) => sum + (entry.entryStatus === "worked" ? entry.hoursWorked : 0),
    0,
  );

  return (
    <AppShell active="history" addHref={`/entries/new?month=${toMonthParam(currentMonth)}`}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-5 rounded-[1.75rem] border border-white/80 bg-white/78 px-4 py-4 shadow-[0_24px_70px_-48px_rgba(60,40,20,0.42)] backdrop-blur sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-stone-400">History</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">Search Records</h1>
              <p className="mt-1 text-sm text-stone-500">
                Filter real entries for {format(currentMonth, "MMMM yyyy")} by date, status or saved work site.
              </p>
            </div>

            <Link
              href={`/calendar?month=${toMonthParam(currentMonth)}`}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Back to calendar
            </Link>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search by date or location"
                className="h-12 rounded-[1.1rem] border-stone-200 bg-white pr-4 pl-11 text-base"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                className="flex h-12 shrink-0 items-center gap-2 rounded-[1.1rem] bg-stone-900 px-4 text-sm font-medium text-stone-50"
                onClick={() => navigateToMonth(subMonths(currentMonth, 1))}
                type="button"
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <div className="min-w-44">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-12 w-full rounded-[1.1rem] border-stone-200 bg-white px-4 text-sm font-medium text-stone-700">
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                className="flex h-12 shrink-0 items-center gap-2 rounded-[1.1rem] border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700"
                onClick={() => navigateToMonth(addMonths(currentMonth, 1))}
                type="button"
              >
                Next
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </header>

        <Card className="rounded-[1.5rem] border-stone-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(242,236,228,0.95))] shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
          <div className="grid grid-cols-3 gap-3 p-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">Results</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-stone-950">{filteredEntries.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">Hours</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-stone-950">
                {filteredHours.toFixed(1).replace(".0", "")}h
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">Filter</p>
              <p className="mt-1 truncate text-sm font-semibold text-stone-700">
                {selectedLocation === "all" ? "All sites" : selectedLocation}
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section>
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
                        className="grid gap-3 px-4 py-4 text-left transition hover:bg-stone-50 sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-900">
                            {format(new Date(`${entry.workDate}T00:00:00`), "MMM d, yyyy")}
                          </span>
                          <span className="mt-1 text-sm text-stone-500">
                            {entry.location ?? ENTRY_STATUS_LABELS[entry.entryStatus]}
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-bold text-stone-950">
                            {entry.entryStatus === "worked"
                              ? `${entry.hoursWorked.toFixed(1).replace(".0", "")}h`
                              : ENTRY_STATUS_LABELS[entry.entryStatus]}
                          </span>
                          <p className="text-xs text-stone-400">
                            {entry.entryStatus === "worked" ? "Worked day" : "Non-working day"}
                          </p>
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

          <div className="lg:sticky lg:top-7">
            <HistoryMap entries={filteredEntries} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

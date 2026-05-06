"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Clock3, FileText, LoaderCircle, MapPinned, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, isAuthenticationError } from "@/lib/api";
import { deleteEntry, ENTRY_STATUS_LABELS, getEntryByDate, type Entry } from "@/lib/entries";
import { Button } from "@/components/ui/button";
import { HistoryMap } from "@/components/history-map";
import { AppShell } from "@/components/app-shell";

export default function DayDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workDate = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const returnMonth = searchParams.get("month") ?? workDate.slice(0, 7);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEntry() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getEntryByDate(workDate);

        if (isMounted) {
          setEntry(response.entry);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isAuthenticationError(error)) {
          router.replace("/login");
          router.refresh();
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setEntry(null);
          setErrorMessage("No entry was found for this date.");
        } else {
          setErrorMessage(error instanceof Error ? error.message : "Could not load entry details");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEntry();

    return () => {
      isMounted = false;
    };
  }, [router, workDate]);

  const parsedDate = parseISO(`${workDate}T00:00:00`);

  async function handleDelete() {
    if (!entry || isDeleting) {
      return;
    }

    const confirmed = window.confirm("Delete this work entry?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteEntry(entry.id);
      router.push(`/calendar?month=${returnMonth}`);
      router.refresh();
    } catch (error) {
      if (isAuthenticationError(error)) {
        router.replace("/login");
        router.refresh();
        return;
      }

      setErrorMessage(error instanceof Error ? error.message : "Could not delete entry");
      setIsDeleting(false);
    }
  }

  return (
    <AppShell active="calendar" addHref={`/entries/new?date=${workDate}&month=${returnMonth}`} showAddButton={false}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="rounded-[1.75rem] border border-stone-200/80 bg-white/88 p-4 shadow-[0_24px_60px_-38px_rgba(50,35,20,0.4)] sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href={`/calendar?month=${returnMonth}`}
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-900 transition hover:bg-stone-100"
                aria-label="Back to calendar"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Day Details</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                  {format(parsedDate, "EEEE")}
                </h1>
                <p className="mt-1 text-sm font-medium text-stone-500 sm:text-base">
                  {format(parsedDate, "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {entry ? (
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-2xl border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 hover:bg-stone-100"
                >
                  <Link href={`/entries/new?date=${workDate}&month=${returnMonth}`}>
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-10 rounded-2xl bg-stone-950 px-4 text-sm font-semibold text-stone-50 hover:bg-stone-800"
                >
                  <Link href={`/entries/new?date=${workDate}&month=${returnMonth}`}>Update Entry</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-[1.75rem] border border-stone-200/80 bg-white/80 text-stone-500">
            <LoaderCircle className="size-6 animate-spin" />
          </div>
        ) : null}

        {errorMessage && !isLoading ? (
          <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-6 text-center shadow-[0_24px_60px_-40px_rgba(50,35,20,0.36)]">
            <p className="text-sm text-stone-600">{errorMessage}</p>
            <Button asChild className="mt-4 rounded-2xl bg-stone-950 text-stone-50 hover:bg-stone-800">
              <Link href={`/entries/new?date=${workDate}&month=${returnMonth}`}>Create entry for this day</Link>
            </Button>
          </section>
        ) : null}

        {entry ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="space-y-5">
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_26px_64px_-40px_rgba(50,35,20,0.38)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Day Status</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                      {ENTRY_STATUS_LABELS[entry.entryStatus]}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      {entry.entryStatus === "worked"
                        ? `${entry.hoursWorked.toFixed(1).replace(".0", "")} working hours recorded`
                        : "This day is stored without counting as a worked day."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-stone-700">
                    <Clock3 className="size-7" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-stone-100 bg-stone-50/70 p-4">
                    <div className="flex items-center gap-2 text-stone-400">
                      <MapPinned className="size-4" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Primary Location</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-700">
                      {entry.location ?? "No location was stored for this non-working day."}
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-stone-100 bg-stone-50/70 p-4">
                    <div className="flex items-center gap-2 text-stone-400">
                      <FileText className="size-4" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Notes</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-700">
                      {entry.notes?.trim() ? entry.notes : "No notes were added for this entry."}
                    </p>
                  </div>
                </div>
              </section>

              {entry.location ? (
                <section className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/92 shadow-[0_26px_64px_-40px_rgba(50,35,20,0.38)]">
                  <HistoryMap entries={[entry]} title="Current Work Location" subtitle={format(parsedDate, "MMMM d, yyyy")} />
                </section>
              ) : null}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-7 lg:self-start">
              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_24px_58px_-40px_rgba(50,35,20,0.34)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Day Summary</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[1.25rem] border border-stone-100 bg-stone-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Hours</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                      {entry.hoursWorked.toFixed(1).replace(".0", "")}h
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-stone-100 bg-stone-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Entry</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">1</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_24px_58px_-40px_rgba(50,35,20,0.34)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Actions</p>
                <div className="mt-4 space-y-3">
                  <Button asChild className="h-11 w-full rounded-2xl bg-stone-950 text-stone-50 hover:bg-stone-800">
                    <Link href={`/entries/new?date=${workDate}&month=${returnMonth}`}>
                      <Pencil className="size-4" />
                      Edit Entry
                    </Link>
                  </Button>
                  <button
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                    {isDeleting ? "Deleting..." : "Delete Entry"}
                  </button>
                </div>
              </section>

              <Link
                href={`/calendar?month=${returnMonth}`}
                className="block text-center text-sm font-semibold text-stone-500 underline-offset-4 transition hover:text-stone-950 hover:underline"
              >
                Back to calendar
              </Link>
            </aside>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

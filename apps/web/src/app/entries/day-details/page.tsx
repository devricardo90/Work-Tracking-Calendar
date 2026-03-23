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
import { Card, CardContent } from "@/components/ui/card";
import { HistoryMap } from "@/components/history-map";
import { MobileNav } from "@/components/mobile-nav";

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f6f4ef]/85 px-4 pt-6 pb-3 backdrop-blur">
        <Link
          href={`/calendar?month=${returnMonth}`}
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-stone-200/60"
        >
          <ArrowLeft className="size-5 text-stone-900" />
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Day Details</h1>
        <div className="size-10" />
      </header>

      <div className="mx-auto w-full max-w-md px-4 pb-28">
        <div className="py-6">
          <h2 className="text-4xl font-bold tracking-tight text-stone-950">
            {format(parsedDate, "EEEE")}
          </h2>
          <p className="text-xl font-medium text-stone-500">{format(parsedDate, "MMMM d, yyyy")}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10 text-stone-500">
            <LoaderCircle className="size-6 animate-spin" />
          </div>
        ) : null}

        {errorMessage && !isLoading ? (
          <Card className="rounded-[1.6rem] border-stone-200/80 bg-white/92">
            <CardContent className="space-y-4 p-6 text-center">
              <p className="text-sm text-stone-600">{errorMessage}</p>
              <Button asChild className="rounded-[1.25rem] bg-stone-900 text-stone-50 hover:bg-stone-800">
                <Link href={`/entries/new?date=${workDate}&month=${returnMonth}`}>Create entry for this day</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {entry ? (
          <>
            <Card className="mb-6 rounded-[1.6rem] border-stone-200/80 bg-white/92 shadow-[0_26px_60px_-36px_rgba(50,35,20,0.36)]">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-400">
                      Day Status
                    </p>
                    <h3 className="mt-1 text-3xl font-bold tracking-tight text-stone-950">
                      {ENTRY_STATUS_LABELS[entry.entryStatus]}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                      {entry.entryStatus === "worked"
                        ? `${entry.hoursWorked.toFixed(1).replace(".0", "")} working hours recorded`
                        : "This day is stored without counting as a worked day."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-900/8 p-3 text-stone-900">
                    <Clock3 className="size-8" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 text-stone-400">
                      <MapPinned className="size-5" />
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-stone-900">Primary Location</p>
                      <p className="text-sm leading-6 text-stone-500">
                        {entry.location ?? "No location was stored for this non-working day."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 border-t border-stone-100 pt-6">
                    <div className="mt-1 text-stone-400">
                      <FileText className="size-5" />
                    </div>
                    <div className="w-full">
                      <p className="mb-3 font-semibold text-stone-900">Notes</p>
                      <div className="rounded-2xl border border-stone-100 bg-stone-50/80 p-3">
                        <p className="text-sm leading-6 text-stone-700">
                          {entry.notes?.trim() ? entry.notes : "No notes were added for this entry."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {entry.location ? (
              <div className="mb-8">
                <HistoryMap
                  entries={[entry]}
                  title="Current Work Location"
                  subtitle={format(parsedDate, "MMMM d, yyyy")}
                />
              </div>
            ) : null}

            <div className="space-y-4 px-2">
              <Button
                asChild
                variant="outline"
                className="h-12 w-full rounded-[1.25rem] border-2 border-stone-900 bg-transparent font-bold text-stone-900 hover:bg-stone-100"
              >
                <Link href={`/entries/new?date=${workDate}&month=${returnMonth}`}>
                  <Pencil className="size-4" />
                  Edit Entry
                </Link>
              </Button>
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[1.25rem] text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDelete}
                disabled={isDeleting}
                type="button"
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete Entry"}
              </button>
            </div>
          </>
        ) : null}
      </div>

      <MobileNav active="calendar" addHref={`/entries/new?date=${workDate}&month=${returnMonth}`} />
    </main>
  );
}

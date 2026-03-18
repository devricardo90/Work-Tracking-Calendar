"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, LoaderCircle, Mail, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/mobile-nav";
import { ApiError, API_BASE_URL } from "@/lib/api";
import { getEntriesByMonth, toMonthParam, type Entry } from "@/lib/entries";
import { getProfile } from "@/lib/profile";
import { sendMonthlyReportByEmail } from "@/lib/reports";
import { reportRecipientSchema } from "@/lib/validation";

export default function SummaryPage() {
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
  const [profileName, setProfileName] = useState("Worker Hours User");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!monthParam) {
      return;
    }

    setCurrentMonth(new Date(`${monthParam}-01T00:00:00`));
  }, [monthParam]);

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

  useEffect(() => {
    let isMounted = true;

    async function loadRecipientEmail() {
      try {
        const data = await getProfile();

        if (isMounted) {
          setProfileName(data.profile.name);
          setRecipientEmail(data.profile.email);
        }
      } catch {
        if (isMounted) {
          setProfileName("Worker Hours User");
          setRecipientEmail("");
        }
      }
    }

    void loadRecipientEmail();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
  const workedDays = entries.length;
  const dailyAverage = workedDays ? totalHours / workedDays : 0;

  const initials = useMemo(() => "WH", []);

  function navigateToMonth(nextMonth: Date) {
    setCurrentMonth(nextMonth);
    router.push(`/summary?month=${toMonthParam(nextMonth)}`);
  }

  async function handleSendByEmail() {
    if (isSendingEmail) {
      return;
    }

    const parsedRecipient = reportRecipientSchema.safeParse(recipientEmail.trim());

    if (!parsedRecipient.success) {
      setRecipientError(parsedRecipient.error.issues[0]?.message ?? "Enter a valid recipient email address.");
      setFeedbackMessage(null);
      return;
    }

      setIsSendingEmail(true);
      setRecipientError(null);
      setFeedbackMessage(null);
      setErrorMessage(null);

    try {
      const month = toMonthParam(currentMonth);
      const result = await sendMonthlyReportByEmail(month, parsedRecipient.data);
      setFeedbackMessage(`Report sent to ${result.email}.`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_NOT_CONFIGURED") {
        setErrorMessage("SMTP is not configured yet. Fill the email settings in apps/api/.env before testing send by email.");
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Could not send report by email");
      }
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-white/82 px-4 py-4 backdrop-blur">
        <Link
          href={`/calendar?month=${toMonthParam(currentMonth)}`}
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-stone-100"
        >
          <ArrowLeft className="size-5 text-stone-900" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2 transition hover:bg-stone-100"
            onClick={() => navigateToMonth(subMonths(currentMonth, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4 text-stone-700" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Monthly Summary</h1>
          <button
            className="rounded-full p-2 transition hover:bg-stone-100"
            onClick={() => navigateToMonth(addMonths(currentMonth, 1))}
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
              <p className="text-xl font-bold text-stone-950">{profileName}</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-500">
                <CalendarDays className="size-4 text-stone-700" />
                <span>{format(currentMonth, "MMMM yyyy")}</span>
              </div>
            </div>
          </div>
        </Card>

        {errorMessage ? <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p> : null}
        {feedbackMessage ? <p className="mt-4 text-center text-sm text-emerald-700">{feedbackMessage}</p> : null}

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
            <Link href={`/history?month=${toMonthParam(currentMonth)}`} className="text-sm font-medium text-stone-700 transition hover:text-stone-950">
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
                      href={`/entries/day-details?date=${entry.workDate}&month=${toMonthParam(currentMonth)}`}
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
          <Button asChild className="h-12 w-full rounded-[1.25rem] bg-stone-900 text-sm font-bold text-stone-50 hover:bg-stone-800">
            <Link href={`/reports/preview?month=${toMonthParam(currentMonth)}`}>
              <FileSpreadsheet className="size-4" />
              Preview PDF
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full rounded-[1.25rem] border-stone-300 bg-white text-sm font-bold text-stone-900 hover:bg-stone-100">
            <a
              href={`${API_BASE_URL}/reports/monthly.pdf?month=${toMonthParam(currentMonth)}`}
              target="_blank"
              rel="noreferrer"
            >
              Export as PDF
            </a>
          </Button>
          <Card className="rounded-[1.3rem] border-stone-200/80 bg-white/92 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
            <CardContent className="space-y-3 p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Email Report
                </p>
                <p className="text-sm text-stone-600">
                  Send the current monthly report as a PDF attachment.
                </p>
              </div>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(event) => {
                  setRecipientEmail(event.target.value);
                  if (recipientError) {
                    setRecipientError(null);
                  }
                }}
                placeholder="worker@example.com"
                className="h-12 rounded-[1.1rem] border-stone-200 bg-white px-4"
                disabled={isSendingEmail}
              />
              {recipientError ? <p className="text-sm text-red-600">{recipientError}</p> : null}
              <Button
                variant="outline"
                className="h-12 w-full rounded-[1.25rem] border-2 border-stone-900 bg-transparent text-sm font-bold text-stone-900 hover:bg-stone-100"
                onClick={handleSendByEmail}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? <LoaderCircle className="size-4 animate-spin" /> : <Mail className="size-4" />}
                Send by Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav active="summary" />
    </main>
  );
}

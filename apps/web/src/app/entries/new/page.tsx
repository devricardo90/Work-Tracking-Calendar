"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, LoaderCircle, Minus, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addMonths, format, subMonths } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { createEntry, getEntryByDate, toDayParam, updateEntry, type Entry } from "@/lib/entries";
import { getProfile } from "@/lib/profile";

export default function AddEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? toDayParam(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date(`${initialDate}T00:00:00`));
  const [hoursWorked, setHoursWorked] = useState(8);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [entry, setEntry] = useState<Entry | null>(null);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setCurrentMonth(new Date(`${initialDate}T00:00:00`));
  }, [initialDate]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoadingProfile(true);

      try {
        const response = await getProfile();

        if (!isMounted) {
          return;
        }

        setSavedLocations(response.profile.savedLocations);
      } catch {
        if (isMounted) {
          setSavedLocations([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadEntry() {
      setIsLoadingEntry(true);
      setFeedback(null);

      try {
        const response = await getEntryByDate(initialDate);

        if (!isMounted) {
          return;
        }

        setEntry(response.entry);
        setHoursWorked(response.entry.hoursWorked);
        setLocation(response.entry.location);
        setNotes(response.entry.notes ?? "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setEntry(null);
          setHoursWorked(8);
          setLocation("");
          setNotes("");
        } else {
          setFeedback(error instanceof Error ? error.message : "Could not load entry");
        }
      } finally {
        if (isMounted) {
          setIsLoadingEntry(false);
        }
      }
    }

    void loadEntry();

    return () => {
      isMounted = false;
    };
  }, [initialDate]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => `blank-${index}`);
    const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => index + 1);
    return { blanks, days };
  }, [currentMonth]);

  async function handleSave() {
    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        workDate: initialDate,
        hoursWorked,
        location,
        notes,
      };

      const response = entry
        ? await updateEntry(entry.id, payload)
        : await createEntry(payload);

      setEntry(response.entry);
      setFeedback(entry ? "Entry updated successfully." : "Entry created successfully.");
      router.push(`/calendar`);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not save entry");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_48%,#e7e2d8_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-[#f6f4ef]/85 px-4 py-4 backdrop-blur">
          <Link
            href="/calendar"
            className="rounded-full p-2 transition hover:bg-stone-200/60"
            aria-label="Close"
          >
            <X className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Add Work Entry</h1>
          <div className="w-9" />
        </header>

        <div className="flex-1 space-y-7 px-4 py-4">
          <section className="rounded-[1.5rem] border border-stone-200/80 bg-white/90 p-4 shadow-[0_24px_60px_-34px_rgba(50,35,20,0.35)]">
            <div className="mb-4 flex items-center justify-between">
              <button
                className="rounded-full p-2 transition hover:bg-stone-100"
                aria-label="Previous month"
                onClick={() => setCurrentMonth((value) => subMonths(value, 1))}
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="font-semibold text-stone-900">{format(currentMonth, "MMMM yyyy")}</h2>
              <button
                className="rounded-full p-2 transition hover:bg-stone-100"
                aria-label="Next month"
                onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <span key={day} className="py-2">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.blanks.map((blank) => (
                <div key={blank} className="h-10" />
              ))}
              {daysInMonth.days.map((day) => {
                const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const dayParam = toDayParam(dayDate);
                const isSelected = dayParam === initialDate;

                return (
                  <Link
                    key={dayParam}
                    href={`/entries/new?date=${dayParam}`}
                    className={`flex h-10 items-center justify-center rounded-full text-sm transition ${
                      isSelected
                        ? "bg-stone-900 font-bold text-stone-50"
                        : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {day}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-3">
              <Label className="px-1 text-sm font-semibold text-stone-700">Hours Worked</Label>
              <div className="flex items-center gap-4 rounded-[1.5rem] border border-stone-200/80 bg-white/90 p-4 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
                <button
                  className="flex size-11 items-center justify-center rounded-full border border-stone-200 transition hover:bg-stone-100"
                  onClick={() => setHoursWorked((value) => Math.max(0, Number((value - 0.5).toFixed(1))))}
                  type="button"
                >
                  <Minus className="size-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-bold tracking-tight text-stone-950">
                    {hoursWorked.toFixed(1)}
                  </span>
                  <span className="ml-1 text-sm text-stone-400">hrs</span>
                </div>
                <button
                  className="flex size-11 items-center justify-center rounded-full border border-stone-200 transition hover:bg-stone-100"
                  onClick={() => setHoursWorked((value) => Math.min(24, Number((value + 0.5).toFixed(1))))}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={hoursWorked}
                onChange={(event) => setHoursWorked(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="px-1 text-sm font-semibold text-stone-700">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Enter site address"
                className="h-13 rounded-[1.25rem] border-stone-200 bg-white px-4"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {savedLocations.length ? (
                  savedLocations.map((savedLocation) => {
                    const isSelected = savedLocation === location;

                    return (
                      <button
                        key={savedLocation}
                        type="button"
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-stone-50"
                            : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                        }`}
                        onClick={() => setLocation(savedLocation)}
                      >
                        {savedLocation}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-1 text-xs text-stone-500">
                    {isLoadingProfile ? "Loading saved locations..." : "No saved locations yet."}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="px-1 text-sm font-semibold text-stone-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="e.g., Half day at Site A, half at Site B"
                className="rounded-[1.25rem] border-stone-200 bg-white p-4"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </section>
        </div>

        <footer className="space-y-3 border-t border-stone-200/70 bg-[#f6f4ef]/88 px-4 py-4 backdrop-blur">
          {feedback ? <p className="text-center text-sm text-stone-600">{feedback}</p> : null}
          <Button
            className="h-12 w-full rounded-[1.25rem] bg-stone-900 text-sm font-semibold text-stone-50 hover:bg-stone-800"
            onClick={handleSave}
            disabled={isSaving || isLoadingEntry || !location.trim()}
          >
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {entry ? "Update Entry" : "Save Entry"}
          </Button>
          <Button variant="ghost" asChild className="h-12 w-full rounded-[1.25rem] text-stone-600 hover:bg-stone-100">
            <Link href="/calendar">
            Cancel
            </Link>
          </Button>
          <div className="text-center">
            <Link href="/calendar" className="text-xs font-medium text-stone-500 hover:text-stone-900">
              Back to calendar
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

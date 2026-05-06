"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, LoaderCircle, Minus, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { AppShell } from "@/components/app-shell";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, isAuthenticationError } from "@/lib/api";
import { createEntry, ENTRY_STATUS_LABELS, getEntryByDate, toDayParam, updateEntry, type Entry, type EntryStatus } from "@/lib/entries";
import { geocodeLocation } from "@/lib/maptiler";
import { getProfile } from "@/lib/profile";
import { entryFormSchema, type EntryFormValues } from "@/lib/validation";

export default function AddEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? toDayParam(new Date());
  const returnMonth = searchParams.get("month") ?? initialDate.slice(0, 7);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(`${initialDate}T00:00:00`));
  const [entry, setEntry] = useState<Entry | null>(null);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    mode: "onChange",
    defaultValues: {
      workDate: initialDate,
      entryStatus: "worked",
      hoursWorked: 8,
      location: "",
      notes: "",
    },
  });
  const hoursWorked = form.watch("hoursWorked");
  const location = form.watch("location");
  const entryStatus = form.watch("entryStatus");
  const isWorkedDay = entryStatus === "worked";

  useEffect(() => {
    setCurrentMonth(new Date(`${initialDate}T00:00:00`));
    form.setValue("workDate", initialDate, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [form, initialDate]);

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
      } catch (error) {
        if (isMounted) {
          if (isAuthenticationError(error)) {
            router.replace("/login");
            router.refresh();
            return;
          }

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
  }, [router]);

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
        form.reset({
          workDate: initialDate,
          entryStatus: response.entry.entryStatus,
          hoursWorked: response.entry.hoursWorked,
          location: response.entry.location ?? "",
          notes: response.entry.notes ?? "",
        });
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
          form.reset({
            workDate: initialDate,
            entryStatus: "worked",
            hoursWorked: 8,
            location: "",
            notes: "",
          });
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
  }, [form, initialDate, router]);

  function applyEntryStatus(nextStatus: EntryStatus) {
    form.setValue("entryStatus", nextStatus, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (nextStatus === "worked") {
      form.setValue("hoursWorked", hoursWorked > 0 ? hoursWorked : 8, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    form.setValue("hoursWorked", 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("location", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => `blank-${index}`);
    const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => index + 1);
    return { blanks, days };
  }, [currentMonth]);

  async function handleSave(values: EntryFormValues) {
    setIsSaving(true);
    setFeedback(null);

    try {
      const normalizedLocation = values.entryStatus === "worked" ? values.location.trim() : "";
      const coordinates =
        values.entryStatus === "worked" ? await geocodeLocation(normalizedLocation).catch(() => null) : null;
      const canReuseExistingCoordinates = entry?.location === normalizedLocation;
      const response = entry
        ? await updateEntry(entry.id, {
            ...values,
            location: normalizedLocation,
            latitude: coordinates?.lat ?? (canReuseExistingCoordinates ? entry.latitude : null) ?? null,
            longitude: coordinates?.lng ?? (canReuseExistingCoordinates ? entry.longitude : null) ?? null,
          })
        : await createEntry({
            ...values,
            location: normalizedLocation,
            latitude: coordinates?.lat ?? null,
            longitude: coordinates?.lng ?? null,
          });

      setEntry(response.entry);
      setFeedback(entry ? "Entry updated successfully." : "Entry created successfully.");
      router.replace(`/calendar?month=${returnMonth}`);
      router.refresh();
    } catch (error) {
      if (isAuthenticationError(error)) {
        router.replace("/login");
        router.refresh();
        return;
      }

      if (error instanceof ApiError && error.issues?.length) {
        for (const issue of error.issues) {
          if (issue.path === "hoursWorked" || issue.path === "location" || issue.path === "notes" || issue.path === "workDate") {
            form.setError(issue.path, {
              message: issue.message,
            });
          }
        }
      }

      if (error instanceof ApiError && error.code === "ENTRY_CONFLICT") {
        form.setError("workDate", {
          message: "An entry already exists for this date.",
        });
      }

      setFeedback(error instanceof Error ? error.message : "Could not save entry");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell active="calendar" addHref={`/entries/new?date=${initialDate}&month=${returnMonth}`} showAddButton={false}>
      <form className="mx-auto flex w-full max-w-6xl flex-col gap-5" onSubmit={form.handleSubmit(handleSave)}>
        <header className="rounded-[1.75rem] border border-stone-200/80 bg-white/88 p-4 shadow-[0_24px_60px_-38px_rgba(50,35,20,0.4)] sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href={`/calendar?month=${returnMonth}`}
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-900 transition hover:bg-stone-100"
                aria-label="Close entry form"
              >
                <X className="size-4" />
              </Link>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">
                  {entry ? "Edit Entry" : "New Entry"}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                  Add Work Entry
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                  Preserve the monthly calendar context while recording this day.
                </p>
              </div>
            </div>

            <Link
              href={`/calendar?month=${returnMonth}`}
              className="hidden rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-950 sm:block"
            >
              Back to calendar
            </Link>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <section className="rounded-[1.75rem] border border-stone-800/10 bg-stone-900 p-5 text-stone-50 shadow-[0_30px_70px_-42px_rgba(0,0,0,0.58)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Selected Day</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    {format(new Date(`${initialDate}T00:00:00`), "EEEE, MMM d")}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
                    Register a worked day, a day off or a no-work day without inflating worked totals.
                  </p>
                </div>
                <div className="w-fit rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Entry</p>
                  <p className="mt-1 text-sm font-semibold">
                    {isLoadingEntry ? "Loading..." : entry ? "Updating" : "New"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_26px_64px_-40px_rgba(50,35,20,0.38)] sm:p-6">
              <Label className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Day Status</Label>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-[1.35rem] border border-stone-100 bg-stone-50/80 p-1.5">
                {(["worked", "day-off", "no-work"] as EntryStatus[]).map((status) => {
                  const isSelected = entryStatus === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      className={`min-h-11 rounded-[1.05rem] px-2 text-sm font-semibold transition ${
                        isSelected
                          ? "bg-stone-950 text-stone-50 shadow-[0_18px_32px_-24px_rgba(0,0,0,0.65)]"
                          : "text-stone-500 hover:bg-white hover:text-stone-950"
                      }`}
                      onClick={() => applyEntryStatus(status)}
                    >
                      {ENTRY_STATUS_LABELS[status]}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_26px_64px_-40px_rgba(50,35,20,0.38)] sm:p-6">
              <Label className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Hours Worked</Label>
              <div className="mt-4 flex items-center gap-4">
                <button
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() =>
                    form.setValue("hoursWorked", Math.max(0.5, Number((hoursWorked - 0.5).toFixed(1))), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  type="button"
                  disabled={!isWorkedDay}
                  aria-label="Decrease hours"
                >
                  <Minus className="size-4" />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <span className="text-5xl font-semibold tracking-tight text-stone-950">{hoursWorked.toFixed(1)}</span>
                  <span className="ml-2 text-sm font-medium text-stone-400">hrs</span>
                </div>
                <button
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() =>
                    form.setValue("hoursWorked", Math.min(24, Number((hoursWorked + 0.5).toFixed(1))), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  type="button"
                  disabled={!isWorkedDay}
                  aria-label="Increase hours"
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
                onChange={(event) =>
                  form.setValue("hoursWorked", Number(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isWorkedDay}
              />
              {!isWorkedDay ? (
                <p className="mt-3 text-xs text-stone-500">
                  Non-working days are saved with 0 hours and stay out of worked-day totals.
                </p>
              ) : null}
              {form.formState.errors.hoursWorked ? (
                <p className="mt-3 text-sm text-red-600">{form.formState.errors.hoursWorked.message}</p>
              ) : null}
              {form.formState.errors.workDate ? (
                <p className="mt-3 text-sm text-red-600">{form.formState.errors.workDate.message}</p>
              ) : null}
            </section>

            <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_26px_64px_-40px_rgba(50,35,20,0.38)] sm:p-6">
              <Label htmlFor="location" className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">
                Location
              </Label>
              <div className="mt-4">
                <LocationAutocomplete
                  id="location"
                  placeholder={isWorkedDay ? "Enter site address" : "Not required for non-working days"}
                  value={location}
                  onChange={(nextValue) =>
                    form.setValue("location", nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  onSelect={(nextValue) =>
                    form.setValue("location", nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  disabled={!isWorkedDay}
                />
              </div>
              {form.formState.errors.location ? (
                <p className="mt-3 text-sm text-red-600">{form.formState.errors.location.message}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {isWorkedDay && savedLocations.length ? (
                  savedLocations.map((savedLocation) => {
                    const isSelected = savedLocation === location;

                    return (
                      <button
                        key={savedLocation}
                        type="button"
                        className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? "border-stone-950 bg-stone-950 text-stone-50"
                            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                        }`}
                        onClick={() =>
                          form.setValue("location", savedLocation, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        {savedLocation}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-stone-500">
                    {isWorkedDay
                      ? isLoadingProfile
                        ? "Loading saved locations..."
                        : "No saved locations yet."
                      : "Location is optional for day off and no-work records."}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_26px_64px_-40px_rgba(50,35,20,0.38)] sm:p-6">
              <Label htmlFor="notes" className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">
                Notes
              </Label>
              <Textarea
                id="notes"
                rows={5}
                placeholder="e.g., Half day at Site A, half at Site B"
                className="mt-4 rounded-[1.25rem] border-stone-200 bg-white p-4"
                {...form.register("notes")}
              />
              {form.formState.errors.notes ? (
                <p className="mt-3 text-sm text-red-600">{form.formState.errors.notes.message}</p>
              ) : null}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-7 lg:self-start">
            <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_24px_58px_-40px_rgba(50,35,20,0.34)]">
              <div className="mb-4 flex items-center justify-between">
                <button
                  className="rounded-full p-2 transition hover:bg-stone-100"
                  aria-label="Previous month"
                  onClick={() => setCurrentMonth((value) => subMonths(value, 1))}
                  type="button"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <h2 className="text-sm font-semibold text-stone-900">{format(currentMonth, "MMMM yyyy")}</h2>
                <button
                  className="rounded-full p-2 transition hover:bg-stone-100"
                  aria-label="Next month"
                  onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
                  type="button"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <span key={`${day}-${index}`} className="py-2">
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.blanks.map((blank) => (
                  <div key={blank} className="h-9" />
                ))}
                {daysInMonth.days.map((day) => {
                  const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const dayParam = toDayParam(dayDate);
                  const isSelected = dayParam === initialDate;

                  return (
                    <Link
                      key={dayParam}
                      href={`/entries/new?date=${dayParam}&month=${returnMonth}`}
                      className={`flex h-9 items-center justify-center rounded-full text-sm transition ${
                        isSelected
                          ? "bg-stone-950 font-bold text-stone-50"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {day}
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_24px_58px_-40px_rgba(50,35,20,0.34)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-stone-400">Save Changes</p>
              {feedback ? <p className="mt-3 text-sm text-stone-600">{feedback}</p> : null}
              <Button
                type="submit"
                className="mt-4 h-12 w-full rounded-2xl bg-stone-950 text-sm font-semibold text-stone-50 hover:bg-stone-800"
                disabled={isSaving || isLoadingEntry}
              >
                {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {entry ? "Update Entry" : "Save Entry"}
              </Button>
              <Button
                variant="ghost"
                asChild
                className="mt-2 h-11 w-full rounded-2xl text-stone-600 hover:bg-stone-100 hover:text-stone-950"
              >
                <Link href={`/calendar?month=${returnMonth}`}>Cancel</Link>
              </Button>
            </section>
          </aside>
        </div>
      </form>
    </AppShell>
  );
}

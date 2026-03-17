import Link from "next/link";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const calendarDays = [
  "", "", "", "1", "2", "3", "4",
  "5", "6", "7", "8", "9", "10", "11",
  "12", "13", "14", "15", "16", "17", "18",
  "19", "20", "21", "22", "23", "24", "25",
  "26", "27", "28", "29", "30", "31",
];

export default function AddEntryPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_48%,#e7e2d8_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-[#f6f4ef]/85 px-4 py-4 backdrop-blur">
          <button className="rounded-full p-2 transition hover:bg-stone-200/60" aria-label="Close">
            <X className="size-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Add Work Entry</h1>
          <div className="w-9" />
        </header>

        <div className="flex-1 space-y-7 px-4 py-4">
          <section className="rounded-[1.5rem] border border-stone-200/80 bg-white/90 p-4 shadow-[0_24px_60px_-34px_rgba(50,35,20,0.35)]">
            <div className="mb-4 flex items-center justify-between">
              <button className="rounded-full p-2 transition hover:bg-stone-100" aria-label="Previous month">
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="font-semibold text-stone-900">October 2023</h2>
              <button className="rounded-full p-2 transition hover:bg-stone-100" aria-label="Next month">
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
              {calendarDays.map((day, index) => {
                const isSelected = day === "5";

                if (!day) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                return (
                  <button
                    key={day}
                    className={`flex h-10 items-center justify-center rounded-full text-sm transition ${
                      isSelected
                        ? "bg-stone-900 font-bold text-stone-50"
                        : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-3">
              <Label className="px-1 text-sm font-semibold text-stone-700">Hours Worked</Label>
              <div className="flex items-center gap-4 rounded-[1.5rem] border border-stone-200/80 bg-white/90 p-4 shadow-[0_20px_50px_-36px_rgba(50,35,20,0.32)]">
                <button className="flex size-11 items-center justify-center rounded-full border border-stone-200 transition hover:bg-stone-100">
                  <Minus className="size-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-bold tracking-tight text-stone-950">8.0</span>
                  <span className="ml-1 text-sm text-stone-400">hrs</span>
                </div>
                <button className="flex size-11 items-center justify-center rounded-full border border-stone-200 transition hover:bg-stone-100">
                  <Plus className="size-4" />
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value="8"
                readOnly
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
              />
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
              />
            </div>
          </section>
        </div>

        <footer className="space-y-3 border-t border-stone-200/70 bg-[#f6f4ef]/88 px-4 py-4 backdrop-blur">
          <Button className="h-12 w-full rounded-[1.25rem] bg-stone-900 text-sm font-semibold text-stone-50 hover:bg-stone-800">
            Save Entry
          </Button>
          <Button variant="ghost" className="h-12 w-full rounded-[1.25rem] text-stone-600 hover:bg-stone-100">
            Cancel
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

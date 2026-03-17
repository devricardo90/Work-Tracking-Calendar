import Link from "next/link";
import { ArrowLeft, Clock3, FileText, MapPinned, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";

export default function DayDetailsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f6f4ef]/85 px-4 pt-6 pb-3 backdrop-blur">
        <Link
          href="/calendar"
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-stone-200/60"
        >
          <ArrowLeft className="size-5 text-stone-900" />
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Day Details</h1>
        <div className="size-10" />
      </header>

      <div className="mx-auto w-full max-w-md px-4 pb-28">
        <div className="py-6">
          <h2 className="text-4xl font-bold tracking-tight text-stone-950">Monday</h2>
          <p className="text-xl font-medium text-stone-500">October 23, 2023</p>
        </div>

        <Card className="mb-6 rounded-[1.6rem] border-stone-200/80 bg-white/92 shadow-[0_26px_60px_-36px_rgba(50,35,20,0.36)]">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-400">
                  Total Time
                </p>
                <h3 className="mt-1 text-3xl font-bold tracking-tight text-stone-950">
                  8.5 Hours
                </h3>
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
                  <p className="text-sm leading-6 text-stone-500">Corporate HQ, North Wing</p>
                </div>
              </div>

              <div className="flex gap-4 border-t border-stone-100 pt-6">
                <div className="mt-1 text-stone-400">
                  <FileText className="size-5" />
                </div>
                <div className="w-full">
                  <p className="mb-3 font-semibold text-stone-900">Work Breakdown</p>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-stone-100 bg-stone-50/80 p-3">
                      <p className="text-sm leading-6 text-stone-700">
                        Morning session spent at <span className="font-medium text-stone-950">Site A</span>{" "}
                        for foundation checks and safety audit.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-100 bg-stone-50/80 p-3">
                      <p className="text-sm leading-6 text-stone-700">
                        Afternoon relocated to <span className="font-medium text-stone-950">Site B</span>{" "}
                        for electrical final inspections and sign-offs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 overflow-hidden rounded-[1.6rem] border border-stone-200/80 shadow-[0_24px_50px_-36px_rgba(50,35,20,0.32)]">
          <div className="relative h-44 bg-[linear-gradient(135deg,#e7dfd1_0%,#d5dcee_35%,#dce9de_100%)]">
            <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_20%_30%,rgba(29,40,58,0.12)_0,transparent_28%),radial-gradient(circle_at_75%_32%,rgba(29,40,58,0.16)_0,transparent_22%),radial-gradient(circle_at_45%_75%,rgba(29,40,58,0.12)_0,transparent_24%)]" />
            <div className="absolute inset-x-6 top-1/2 h-[2px] -translate-y-1/2 bg-stone-900/20" />
            <div className="absolute left-[20%] top-[34%] size-4 rounded-full border-4 border-white bg-stone-900 shadow" />
            <div className="absolute right-[22%] bottom-[28%] size-4 rounded-full border-4 border-white bg-stone-900 shadow" />
            <div className="absolute right-4 bottom-4">
              <Button
                variant="outline"
                className="rounded-full border-stone-200 bg-white/90 px-4 text-stone-900 hover:bg-white"
              >
                View Map
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-2">
          <Button
            variant="outline"
            className="h-12 w-full rounded-[1.25rem] border-2 border-stone-900 bg-transparent font-bold text-stone-900 hover:bg-stone-100"
          >
            <Pencil className="size-4" />
            Edit Entry
          </Button>
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-[1.25rem] text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600">
            <Trash2 className="size-4" />
            Delete Entry
          </button>
        </div>
      </div>

      <MobileNav active="calendar" />
    </main>
  );
}

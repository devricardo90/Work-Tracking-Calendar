import Link from "next/link";
import { ArrowLeft, ChevronDown, Map } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/mobile-nav";

const groups = [
  {
    month: "October 2023",
    entries: [
      ["Oct 24, 2023", "San Francisco, CA", "8.5h", "09:00 - 17:30"],
      ["Oct 22, 2023", "Remote", "4.0h", "13:00 - 17:00"],
      ["Oct 21, 2023", "San Francisco, CA", "9.2h", "08:30 - 17:45"],
    ],
  },
  {
    month: "September 2023",
    entries: [
      ["Sep 30, 2023", "Palo Alto, CA", "7.5h", "09:00 - 16:30"],
      ["Sep 28, 2023", "San Francisco, CA", "8.0h", "09:00 - 17:00"],
    ],
  },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 bg-[#f6f4ef]/88 px-4 pt-6 pb-3 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/calendar"
            className="flex size-10 items-center justify-center rounded-full transition hover:bg-stone-200/60"
          >
            <ArrowLeft className="size-5 text-stone-900" />
          </Link>
          <h1 className="pr-10 text-xl font-bold tracking-tight text-stone-950">Search Records</h1>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search by date or location"
            className="h-12 rounded-[1.1rem] border-stone-200 bg-stone-200/40 px-4 text-base"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { label: "Month", active: true },
            { label: "Location" },
            { label: "Project" },
          ].map((filter) => (
            <button
              key={filter.label}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                filter.active
                  ? "bg-stone-900 text-stone-50"
                  : "border border-stone-300 bg-stone-200/50 text-stone-700"
              }`}
            >
              {filter.label}
              <ChevronDown className="size-4" />
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 pb-28">
        {groups.map((group) => (
          <section key={group.month} className="mt-5">
            <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              {group.month}
            </h2>

            <Card className="overflow-hidden rounded-[1.4rem] border-stone-200/80 bg-white/92 py-0 shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
              <div className="divide-y divide-stone-100">
                {group.entries.map(([date, location, hours, time]) => (
                  <button
                    key={`${date}-${location}`}
                    className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-stone-50"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-stone-900">{date}</span>
                      <span className="mt-1 text-sm text-stone-500">{location}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-950">{hours}</span>
                      <p className="text-xs text-stone-400">{time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </section>
        ))}

        <div className="mt-6 overflow-hidden rounded-[1.5rem] shadow-[0_20px_44px_-34px_rgba(50,35,20,0.3)]">
          <div className="relative h-32 bg-[linear-gradient(135deg,#dfe5ec_0%,#ece6dc_55%,#dbe7db_100%)]">
            <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_15%_25%,rgba(29,40,58,0.16)_0,transparent_22%),radial-gradient(circle_at_72%_38%,rgba(29,40,58,0.14)_0,transparent_18%),radial-gradient(circle_at_48%_78%,rgba(29,40,58,0.12)_0,transparent_20%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-stone-900 shadow backdrop-blur">
                <Map className="size-4" />
                View all on map
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileNav active="history" />
    </main>
  );
}

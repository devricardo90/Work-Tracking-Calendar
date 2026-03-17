import Link from "next/link";
import { ArrowLeft, Bell, ChevronRight, Languages, MapPinned, MoreVertical, Pencil, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";

const items = [
  {
    title: "Saved Locations",
    subtitle: "Manage sites",
    icon: MapPinned,
  },
  {
    title: "Language",
    subtitle: "English (US)",
    icon: Languages,
  },
  {
    title: "Notification Settings",
    subtitle: "Push, Email, SMS",
    icon: Bell,
  },
  {
    title: "Security",
    subtitle: "Password and Biometrics",
    icon: Shield,
  },
];

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-white/84 px-6 py-4 backdrop-blur">
        <Link
          href="/calendar"
          className="flex size-10 items-center justify-center rounded-xl transition hover:bg-stone-100"
        >
          <ArrowLeft className="size-5 text-stone-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        <button className="flex size-10 items-center justify-center rounded-xl transition hover:bg-stone-100">
          <MoreVertical className="size-5 text-stone-700" />
        </button>
      </header>

      <div className="mx-auto w-full max-w-md px-6 pb-28">
        <section className="pt-6">
          <Card className="rounded-[1.6rem] border-stone-200/80 bg-stone-50/80 shadow-[0_22px_50px_-36px_rgba(50,35,20,0.32)]">
            <CardContent className="flex flex-col items-center p-6">
              <div className="relative mb-4">
                <div className="flex size-24 items-center justify-center rounded-full border-4 border-white bg-[linear-gradient(135deg,#d8e0e8_0%,#f0ede8_100%)] text-2xl font-bold text-stone-900 shadow-sm">
                  WR
                </div>
                <button className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-stone-50 shadow-sm">
                  <Pencil className="size-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-stone-950">Worker Name</h2>
              <p className="text-sm text-stone-500">worker.name@email.com</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 space-y-4">
          <h3 className="px-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
            Settings
          </h3>

          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  className="flex w-full items-center justify-between rounded-[1.25rem] border border-stone-200/80 bg-white/92 p-4 text-left shadow-[0_18px_40px_-34px_rgba(50,35,20,0.28)] transition hover:bg-stone-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-stone-900/8 text-stone-900">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      <p className="text-xs text-stone-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-stone-400" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <Button className="h-12 w-full rounded-[1.25rem] bg-stone-900 text-sm font-bold text-stone-50 hover:bg-stone-800">
            Save Settings
          </Button>
          <button className="mt-4 w-full py-2 text-sm font-semibold text-rose-500 transition hover:text-rose-600">
            Sign Out
          </button>
        </section>
      </div>

      <MobileNav active="profile" />
    </main>
  );
}

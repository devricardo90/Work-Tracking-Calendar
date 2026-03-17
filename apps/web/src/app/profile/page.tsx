"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Languages,
  LoaderCircle,
  MapPinned,
  MoreVertical,
  Pencil,
  Plus,
  Shield,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileNav } from "@/components/mobile-nav";
import {
  getProfile,
  updateProfile,
  type Profile,
} from "@/lib/profile";
import { signOut } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SettingItem = {
  title: string;
  subtitle: string;
  icon: typeof MapPinned;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [locationDraft, setLocationDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getProfile();

        if (isMounted) {
          setProfile(data.profile);
          setName(data.profile.name);
          setLanguage(data.profile.language);
          setSavedLocations(data.profile.savedLocations);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load profile");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const items: SettingItem[] = useMemo(() => {
    return [
      {
        title: "Saved Locations",
        subtitle: savedLocations.length
          ? `${savedLocations.length} saved`
          : "No saved sites yet",
        icon: MapPinned,
      },
      {
        title: "Language",
        subtitle: language.toUpperCase(),
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
  }, [language, savedLocations]);

  const initials = useMemo(() => {
    if (!name.trim()) {
      return "WH";
    }

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [name]);

  function handleAddLocation() {
    const nextLocation = locationDraft.trim();

    if (!nextLocation) {
      return;
    }

    setSavedLocations((current) => {
      if (current.includes(nextLocation)) {
        return current;
      }

      return [...current, nextLocation];
    });
    setLocationDraft("");
  }

  function handleRemoveLocation(location: string) {
    setSavedLocations((current) => current.filter((item) => item !== location));
  }

  async function handleSave() {
    if (!profile || isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      const response = await updateProfile({
        name,
        email: profile.email,
        language,
        savedLocations,
      });

      setProfile(response.profile);
      setName(response.profile.name);
      setLanguage(response.profile.language);
      setSavedLocations(response.profile.savedLocations);
      setFeedback("Profile saved successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    if (isSaving) {
      return;
    }

    setErrorMessage(null);
    setFeedback(null);

    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not sign out");
    }
  }

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
            <CardContent className="flex min-h-52 flex-col items-center justify-center p-6">
              {isLoading ? (
                <LoaderCircle className="size-6 animate-spin text-stone-500" />
              ) : (
                <>
                  <div className="relative mb-4">
                    <div className="flex size-24 items-center justify-center rounded-full border-4 border-white bg-[linear-gradient(135deg,#d8e0e8_0%,#f0ede8_100%)] text-2xl font-bold text-stone-900 shadow-sm">
                      {initials}
                    </div>
                    <button className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-stone-50 shadow-sm">
                      <Pencil className="size-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-stone-950">{name || "Worker Hours User"}</h2>
                  <p className="text-sm text-stone-500">{profile?.email ?? "worker@example.com"}</p>
                  {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
                  {feedback ? <p className="mt-3 text-sm text-emerald-700">{feedback}</p> : null}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="px-1 text-sm font-semibold text-stone-700">
              Name
            </Label>
            <Input
              id="profile-name"
              className="h-12 rounded-[1.25rem] border-stone-200 bg-white"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="px-1 text-sm font-semibold text-stone-700">Language</Label>
            <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
              <SelectTrigger className="h-12 w-full rounded-[1.25rem] border-stone-200 bg-white px-4">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="saved-location" className="px-1 text-sm font-semibold text-stone-700">
              Saved Locations
            </Label>
            <div className="flex gap-2">
              <Input
                id="saved-location"
                className="h-12 rounded-[1.25rem] border-stone-200 bg-white"
                placeholder="Add a work site"
                value={locationDraft}
                onChange={(event) => setLocationDraft(event.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-[1.25rem] border-stone-200 bg-white px-4"
                onClick={handleAddLocation}
                disabled={isLoading || !locationDraft.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {savedLocations.length ? (
                savedLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/92 px-3 py-2 text-xs font-medium text-stone-700"
                    onClick={() => handleRemoveLocation(location)}
                  >
                    {location}
                    <X className="size-3.5" />
                  </button>
                ))
              ) : (
                <p className="px-1 text-sm text-stone-500">No saved sites yet.</p>
              )}
            </div>
          </div>
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

        {savedLocations.length ? (
          <section className="mt-6">
            <h3 className="mb-3 px-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              Saved Locations
            </h3>
            <div className="flex flex-wrap gap-2">
              {savedLocations.map((location) => (
                <span
                  key={location}
                  className="rounded-full border border-stone-200 bg-white/92 px-3 py-2 text-xs font-medium text-stone-700"
                >
                  {location}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <Button
            className="h-12 w-full rounded-[1.25rem] bg-stone-900 text-sm font-bold text-stone-50 hover:bg-stone-800"
            onClick={handleSave}
            disabled={isLoading || isSaving || !name.trim()}
          >
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Save Settings
          </Button>
          <button
            className="mt-4 w-full py-2 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
            onClick={handleSignOut}
            type="button"
          >
            Sign Out
          </button>
        </section>
      </div>

      <MobileNav active="profile" />
    </main>
  );
}

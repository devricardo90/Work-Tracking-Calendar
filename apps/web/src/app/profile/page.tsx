"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/location-autocomplete";
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
import { profileFormSchema, savedLocationSchema, type ProfileFormValues } from "@/lib/validation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [locationDraft, setLocationDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      language: "en",
      savedLocations: [],
    },
  });
  const name = form.watch("name");
  const language = form.watch("language");
  const savedLocations = form.watch("savedLocations");
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getProfile();

        if (isMounted) {
          setProfile(data.profile);
          form.reset({
            name: data.profile.name,
            language: data.profile.language === "pt-BR" || data.profile.language === "es" ? data.profile.language : "en",
            savedLocations: data.profile.savedLocations,
          });
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
  }, [form]);

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

    form.clearErrors("savedLocations");

    const parsedLocation = savedLocationSchema.safeParse(nextLocation);

    if (!parsedLocation.success) {
      form.setError("savedLocations", {
        message: parsedLocation.error.issues[0]?.message ?? "Invalid location.",
      });
      return;
    }

    const nextLocations = [...savedLocations, parsedLocation.data];
    const parsedLocations = profileFormSchema.shape.savedLocations.safeParse(nextLocations);

    if (!parsedLocations.success) {
      form.setError("savedLocations", {
        message: parsedLocations.error.issues[0]?.message ?? "Invalid saved locations.",
      });
      return;
    }

    form.setValue("savedLocations", parsedLocations.data, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setLocationDraft("");
  }

  function handleRemoveLocation(location: string) {
    form.clearErrors("savedLocations");
    form.setValue(
      "savedLocations",
      savedLocations.filter((item) => item !== location),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function handleLocationDraftKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    handleAddLocation();
  }

  async function handleSave(values: ProfileFormValues) {
    if (!profile || isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      const response = await updateProfile({
        name: values.name,
        email: profile.email,
        language: values.language,
        savedLocations: values.savedLocations,
      });

      setProfile(response.profile);
      form.reset({
        name: response.profile.name,
        language: response.profile.language === "pt-BR" || response.profile.language === "es" ? response.profile.language : "en",
        savedLocations: response.profile.savedLocations,
      });
      setFeedback("Profile saved successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    if (isSaving || isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      await signOut();
      window.location.assign("/login");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not sign out");
      setIsSigningOut(false);
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
        <div className="size-10" />
      </header>

      <form className="mx-auto w-full max-w-md px-6 pb-28" onSubmit={form.handleSubmit(handleSave)}>
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
                    <div className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-stone-50 shadow-sm">
                      <Pencil className="size-4" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-stone-950">{name || "Worker Hours User"}</h2>
                  <p className="text-sm text-stone-500">{profile?.email ?? "worker@example.com"}</p>
                  <div className="mt-4 flex gap-2 text-xs">
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-stone-700">
                      {savedLocations.length} saved location{savedLocations.length === 1 ? "" : "s"}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-stone-700">
                      {language.toUpperCase()}
                    </span>
                  </div>
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
              {...form.register("name")}
              disabled={isLoading}
            />
            {form.formState.errors.name ? (
              <p className="px-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email" className="px-1 text-sm font-semibold text-stone-700">
              Email
            </Label>
            <Input
              id="profile-email"
              className="h-12 rounded-[1.25rem] border-stone-200 bg-stone-100 text-stone-500"
              value={profile?.email ?? ""}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label className="px-1 text-sm font-semibold text-stone-700">Language</Label>
            <Controller
              control={form.control}
              name="language"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <SelectTrigger className="h-12 w-full rounded-[1.25rem] border-stone-200 bg-white px-4">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.language ? (
              <p className="px-1 text-sm text-red-600">{form.formState.errors.language.message}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <Label htmlFor="saved-location" className="px-1 text-sm font-semibold text-stone-700">
              Saved Locations
            </Label>
            <p className="px-1 text-sm text-stone-500">
              These suggestions appear when you add or edit work entries.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <LocationAutocomplete
                  id="saved-location"
                  placeholder="Add a work site"
                  value={locationDraft}
                  onChange={setLocationDraft}
                  onSelect={setLocationDraft}
                  onKeyDown={handleLocationDraftKeyDown}
                  disabled={isLoading}
                />
              </div>
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
            {form.formState.errors.savedLocations ? (
              <p className="px-1 text-sm text-red-600">{form.formState.errors.savedLocations.message}</p>
            ) : null}

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
          {isDirty ? (
            <p className="mb-3 px-1 text-sm text-stone-500">You have unsaved profile changes.</p>
          ) : null}
          <Button
            type="submit"
            className="h-12 w-full rounded-[1.25rem] bg-stone-900 text-sm font-bold text-stone-50 hover:bg-stone-800"
            disabled={isLoading || isSaving || isSigningOut}
          >
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {!isSaving ? <Save className="size-4" /> : null}
            Save Settings
          </Button>
          <Button
            onClick={handleSignOut}
            type="button"
            variant="outline"
            className="mt-4 h-12 w-full rounded-[1.25rem] border-2 border-rose-200 bg-white text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            disabled={isSigningOut}
          >
            {isSigningOut ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </section>
      </form>

      <MobileNav active="profile" />
    </main>
  );
}

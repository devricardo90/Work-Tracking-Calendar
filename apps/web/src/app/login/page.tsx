"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Eye, EyeOff, LoaderCircle, Mail, MapPin, SquareTerminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getGoogleSignInUrl, signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { getAppConfigStatus } from "@/lib/config-status";
import { signInFormSchema, signUpFormSchema, type SignInFormValues, type SignUpFormValues } from "@/lib/validation";

const previewDays = [
  { day: "Mon", value: "Work", active: true },
  { day: "Tue", value: "Work", active: true },
  { day: "Wed", value: "Off", active: false },
  { day: "Thu", value: "Work", active: true },
  { day: "Fri", value: "Done", active: true },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const emailRegistration = isSignUp ? signUpForm.register("email") : signInForm.register("email");
  const passwordRegistration = isSignUp ? signUpForm.register("password") : signInForm.register("password");
  const emailError = isSignUp ? signUpForm.formState.errors.email : signInForm.formState.errors.email;
  const passwordError = isSignUp ? signUpForm.formState.errors.password : signInForm.formState.errors.password;
  const title = isSignUp ? "Create your account" : "Welcome back";
  const subtitle = isSignUp
    ? "Start recording your work days with real monthly data."
    : "Sign in to continue with your saved work history.";

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const config = await getAppConfigStatus();

        if (isMounted) {
          setGoogleEnabled(config.auth.google);
        }
      } catch {
        if (isMounted) {
          setGoogleEnabled(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingConfig(false);
        }
      }
    }

    void loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSignInSubmit(values: SignInFormValues) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await signInWithEmail(values.email, values.password);
      router.replace("/calendar");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUpSubmit(values: SignUpFormValues) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await signUpWithEmail(values.name, values.email, values.password);
      router.replace("/calendar");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f7f4ed_0%,#f0eadf_48%,#e7dece_100%)] text-stone-900">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-[1.04fr_0.96fr]">
        <section className="relative hidden min-h-screen border-r border-stone-200/80 px-8 py-7 lg:flex lg:flex-col xl:px-10">
          <div className="absolute inset-0 opacity-45 [background-image:repeating-linear-gradient(90deg,rgba(28,25,23,0.055)_0_1px,transparent_1px_28px)]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-2xl bg-stone-950 p-2.5 text-stone-50 shadow-[0_18px_42px_-24px_rgba(0,0,0,0.6)]">
              <SquareTerminal className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-stone-500">WorkLog</p>
              <p className="mt-1 text-xs text-stone-400">Real project mode</p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Private work calendar</p>
            <h1 className="mt-4 text-5xl leading-[1] font-semibold tracking-tight text-stone-950 xl:text-6xl">
              Track every working hour with intent.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-stone-600">
              Record daily entries, review monthly totals, and return to saved work locations from one focused workspace.
            </p>

            <div className="mt-7 grid max-w-md grid-cols-3 gap-3 border-t border-stone-300/70 pt-5">
              <div>
                <CalendarDays className="size-4 text-stone-500" />
                <p className="mt-2.5 text-sm font-semibold text-stone-900">Calendar view</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">Daily work status at a glance.</p>
              </div>
              <div>
                <Clock3 className="size-4 text-stone-500" />
                <p className="mt-2.5 text-sm font-semibold text-stone-900">Hour totals</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">Month and history summaries.</p>
              </div>
              <div>
                <MapPin className="size-4 text-stone-500" />
                <p className="mt-2.5 text-sm font-semibold text-stone-900">Locations</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">Saved places for repeat work.</p>
              </div>
            </div>

            <div className="mt-7 rounded-[1.5rem] border border-stone-200/90 bg-white/70 p-3.5 shadow-[0_22px_70px_-46px_rgba(60,40,20,0.55)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">This week</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">Worklog preview</p>
                </div>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                  Month
                </span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {previewDays.map((item) => (
                  <div
                    key={item.day}
                    className={`rounded-2xl border px-2.5 py-3 text-center ${
                      item.active ? "border-stone-200 bg-white" : "border-dashed border-stone-200 bg-stone-50/80"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">{item.day}</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold uppercase tracking-[0.22em]">Private workspace</span>
            <Link href="/" className="font-medium text-stone-500 hover:text-stone-900">
              Back to app entry
            </Link>
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-5 pt-9 pb-6 sm:px-6 lg:px-8 lg:py-7 xl:px-10">
          <div className="mb-8 flex flex-col items-center gap-4 lg:hidden">
            <div className="rounded-[1.35rem] bg-stone-950 p-3 text-stone-50 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.45)]">
              <SquareTerminal className="size-8" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-stone-400">WorkLog</p>
              <h1 className="mt-2 text-[2rem] leading-none font-semibold tracking-tight text-stone-950">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-stone-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 px-5 py-6 shadow-[0_28px_90px_-42px_rgba(60,40,20,0.45)] backdrop-blur sm:max-w-lg sm:px-7 sm:py-7 lg:max-w-[28rem] lg:px-7">
              <div className="mb-5 hidden lg:block">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-stone-400">Account</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">{subtitle}</p>
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-[1.25rem] bg-stone-100 p-1">
                <button
                  type="button"
                  className={`rounded-[1rem] px-4 py-2 text-sm font-semibold transition ${
                    !isSignUp ? "bg-stone-900 text-stone-50 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                  onClick={() => {
                    setIsSignUp(false);
                    setFeedback(null);
                    signUpForm.clearErrors();
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`rounded-[1rem] px-4 py-2 text-sm font-semibold transition ${
                    isSignUp ? "bg-stone-900 text-stone-50 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                  onClick={() => {
                    setIsSignUp(true);
                    setFeedback(null);
                    signInForm.clearErrors();
                  }}
                >
                  Sign Up
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={isSignUp ? signUpForm.handleSubmit(handleSignUpSubmit) : signInForm.handleSubmit(handleSignInSubmit)}
              >
                {isSignUp ? (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="px-1 text-sm font-medium text-stone-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      {...signUpForm.register("name")}
                      placeholder="Alex Worker"
                      className="h-12 rounded-2xl border-stone-200 bg-white px-4 text-sm lg:h-11"
                    />
                    {signUpForm.formState.errors.name ? (
                      <p className="px-1 text-sm text-red-600">{signUpForm.formState.errors.name.message}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email" className="px-1 text-sm font-medium text-stone-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      id="email"
                      type="email"
                      {...emailRegistration}
                      placeholder="alex@company.com"
                      className="h-12 rounded-2xl border-stone-200 bg-white pr-4 pl-11 text-sm lg:h-11"
                    />
                  </div>
                  {emailError ? (
                    <p className="px-1 text-sm text-red-600">{emailError.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="px-1 text-sm font-medium text-stone-700">
                    Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...passwordRegistration}
                      placeholder="********"
                      className="h-12 rounded-2xl border-stone-200 bg-white px-4 pr-12 text-sm lg:h-11"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-stone-400 transition hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {passwordError ? (
                    <p className="px-1 text-sm text-red-600">{passwordError.message}</p>
                  ) : null}
                </div>

                {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}

                <Button
                  className="mt-2 h-12 w-full rounded-2xl bg-stone-900 text-sm font-semibold text-stone-50 shadow-[0_18px_36px_-18px_rgba(0,0,0,0.55)] hover:bg-stone-800 lg:h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-4">
                <Separator className="flex-1 bg-stone-200" />
                <span className="text-[11px] font-semibold tracking-[0.28em] text-stone-400">OR</span>
                <Separator className="flex-1 bg-stone-200" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Sign-in options
                  </p>
                  <Badge variant={googleEnabled ? "secondary" : "outline"}>
                    {isLoadingConfig ? "Checking..." : googleEnabled ? "Google ready" : "Email only"}
                  </Badge>
                </div>

                {googleEnabled ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 lg:h-11"
                  >
                    <a href={getGoogleSignInUrl()}>
                      <span className="flex size-5 items-center justify-center rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#4285F4_0deg,#34A853_130deg,#FBBC05_230deg,#EA4335_320deg,#4285F4_360deg)] text-[10px] font-bold text-white">
                        G
                      </span>
                      Continue with Google
                    </a>
                  </Button>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
                    Google sign-in is not configured in the API environment yet.
                  </div>
                )}
              </div>

              <p className="mt-5 rounded-[1.25rem] bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-500">
                {isSignUp
                  ? "Your account is created directly in the project API and you will enter the calendar right after signup."
                  : googleEnabled
                    ? "Email/password and Google login are available. If you already have a session, this page redirects straight to the calendar."
                    : "Email and password login is active. If you already have a session, this page redirects straight to the calendar."}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-center lg:hidden">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-stone-300">
              WorkLog - Real Project Mode
            </p>
            <Link href="/" className="text-xs font-medium text-stone-500 hover:text-stone-900">
              Back to app entry
            </Link>
          </div>

          <div className="hidden items-center justify-between text-xs text-stone-400 lg:flex">
            <span className="font-bold uppercase tracking-[0.24em]">Private worklog</span>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              <span>Email/password active</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

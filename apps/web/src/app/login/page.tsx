"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, SquareTerminal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getGoogleSignInUrl, signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { signInFormSchema, signUpFormSchema, type SignInFormValues, type SignUpFormValues } from "@/lib/validation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
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
  const activeForm = isSignUp ? signUpForm : signInForm;

  async function handleSignInSubmit(values: SignInFormValues) {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await signInWithEmail(values.email, values.password);
      window.location.assign("/calendar");
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
      window.location.assign("/calendar");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f7f5_0%,#f1eee8_48%,#ebe5db_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-10 pb-6 sm:max-w-lg sm:px-6">
        <div className="flex flex-1 flex-col">
          <div className="mb-10 flex flex-col items-center gap-4 pt-3">
            <div className="rounded-[1.35rem] bg-stone-900 p-3 text-stone-50 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.45)]">
              <SquareTerminal className="size-8" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-stone-400">
                WorkLog
              </p>
              <h1 className="mt-2 text-[2rem] leading-none font-semibold tracking-tight text-stone-950">
                Welcome back
              </h1>
              <p className="mt-3 text-sm leading-6 text-stone-500">
                Enter your details to access your dashboard.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/88 px-5 py-6 shadow-[0_28px_90px_-42px_rgba(60,40,20,0.38)] backdrop-blur">
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
                    className="h-12 rounded-2xl border-stone-200 bg-white px-4 text-sm"
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
                <Input
                  id="email"
                  type="email"
                  {...activeForm.register("email")}
                  placeholder="alex@company.com"
                  className="h-12 rounded-2xl border-stone-200 bg-white px-4 text-sm"
                />
                {activeForm.formState.errors.email ? (
                  <p className="px-1 text-sm text-red-600">{activeForm.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-stone-500 transition hover:text-stone-900"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...activeForm.register("password")}
                    placeholder="********"
                    className="h-12 rounded-2xl border-stone-200 bg-white px-4 pr-12 text-sm"
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
                {activeForm.formState.errors.password ? (
                  <p className="px-1 text-sm text-red-600">{activeForm.formState.errors.password.message}</p>
                ) : null}
              </div>

              {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}

              <Button
                className="mt-3 h-12 w-full rounded-2xl bg-stone-900 text-sm font-semibold text-stone-50 shadow-[0_18px_36px_-18px_rgba(0,0,0,0.55)] hover:bg-stone-800"
                disabled={isSubmitting || !activeForm.formState.isValid}
              >
                {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <Separator className="flex-1 bg-stone-200" />
              <span className="text-[11px] font-semibold tracking-[0.28em] text-stone-400">
                OR
              </span>
              <Separator className="flex-1 bg-stone-200" />
            </div>

            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-2xl border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <a href={getGoogleSignInUrl()}>
                <span className="flex size-5 items-center justify-center rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#4285F4_0deg,#34A853_130deg,#FBBC05_230deg,#EA4335_320deg,#4285F4_360deg)] text-[10px] font-bold text-white">
                  G
                </span>
                Continue with Google
              </a>
            </Button>

            <p className="mt-8 text-center text-sm leading-6 text-stone-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              {" "}
              <button
                type="button"
                className="font-semibold text-stone-950 hover:underline"
                onClick={() => {
                  setIsSignUp((current) => !current);
                  setFeedback(null);
                  signInForm.clearErrors();
                  signUpForm.clearErrors();
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-stone-300">
            WorkLog v4.2.0 - Premium Productivity
          </p>
          <Link href="/" className="text-xs font-medium text-stone-500 hover:text-stone-900">
            Back to project overview
          </Link>
        </div>
      </div>
    </main>
  );
}

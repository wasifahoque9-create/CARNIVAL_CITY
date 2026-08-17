"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

function LoginForm() {
  const {
    login,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect =
    searchParams.get("redirect") || "/";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated
    ) {
      router.replace(redirect);
    }
  }, [
    authLoading,
    isAuthenticated,
    redirect,
    router,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      await login(email, password);

      router.replace(redirect);
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Login failed. Please check your email and password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (
    authLoading ||
    isAuthenticated
  ) {
    return <LoginLoader />;
  }

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f5f6ff]">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#121358]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#F59E0B]/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left visual section */}
        <section className="relative hidden min-h-[650px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#08093b] via-[#121358] to-[#292c82] p-10 text-white shadow-2xl shadow-[#121358]/20 lg:flex lg:flex-col lg:justify-between">
          {/* Grid */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:38px_38px]" />

          {/* Glows */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F59E0B]/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F59E0B]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#F59E0B]" />
              Secure account access
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight">
              Welcome back to
              <span className="block text-[#F59E0B]">
                ShopSphere
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-8 text-white/70">
              Sign in to explore the latest
              gadgets, manage your cart, track
              orders and access your saved
              account information.
            </p>
          </div>

          {/* Visual illustration */}
          <div className="relative z-10 mx-auto mt-10 flex w-full max-w-md items-center justify-center">
            <div className="relative flex h-80 w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="absolute h-56 w-72 rounded-3xl border border-blue-400/30 bg-gradient-to-br from-[#202478] to-[#0d0f4e] shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 p-4">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F59E0B] text-2xl font-black text-white">
                      S
                    </div>

                    <div>
                      <div className="h-3 w-28 rounded-full bg-white/70" />
                      <div className="mt-3 h-2 w-20 rounded-full bg-white/25" />
                    </div>
                  </div>

                  <div className="mt-7 space-y-3">
                    <div className="h-3 rounded-full bg-white/15" />
                    <div className="h-3 w-4/5 rounded-full bg-white/10" />
                    <div className="h-10 rounded-xl bg-[#F59E0B]/90" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-2 right-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-[#F59E0B] text-4xl shadow-xl">
                🔒
              </div>

              <div className="absolute left-6 top-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl backdrop-blur">
                🛒
              </div>

              <div className="absolute right-5 top-12 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl backdrop-blur">
                📦
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="relative z-10 grid grid-cols-3 gap-3">
            <FeatureBox
              icon="🔒"
              title="Secure"
              text="Protected login"
            />

            <FeatureBox
              icon="📦"
              title="Track"
              text="Follow orders"
            />

            <FeatureBox
              icon="⚡"
              title="Fast"
              text="Quick checkout"
            />
          </div>
        </section>

        {/* Right login form */}
        <section className="mx-auto w-full max-w-lg">
          {/* Mobile heading */}
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F59E0B]">
              Secure account access
            </p>

            <h1 className="mt-3 text-4xl font-black text-[#121358]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue to your
              ShopSphere account.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-[#121358]/10">
            {/* Form heading */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-white to-[#f7f7ff] px-6 py-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#121358] text-xl text-[#F59E0B] shadow-lg">
                  🔐
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F59E0B]">
                    Account login
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[#121358]">
                    Sign In
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Welcome back to ShopSphere
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6 sm:p-8"
            >
              {/* Email */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#121358]">
                  Email Address
                </span>

                <span className="relative block">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ✉
                  </span>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
                  />
                </span>
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#121358]">
                  Password
                </span>

                <span className="relative block">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#121358] transition hover:text-[#F59E0B]"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </span>
              </label>

              {/* Remember and forgot */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4 accent-[#F59E0B]"
                  />

                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-[#121358] transition hover:text-[#F59E0B]"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#121358] to-[#292c82] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#121358]/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {submitting ? (
                  <>
                    <span className="relative h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-[#F59E0B]" />
                    <span className="relative">
                      Signing In...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="relative">
                      Sign In Securely
                    </span>

                    <span className="relative transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              {/* Security message */}
              <div className="flex items-start gap-3 rounded-xl border border-[#121358]/10 bg-[#f7f7ff] px-4 py-3">
                <span className="mt-0.5">
                  🛡️
                </span>

                <p className="text-xs leading-5 text-slate-500">
                  Your login details are securely
                  processed through the
                  ShopSphere authentication
                  system.
                </p>
              </div>
            </form>

            {/* Register */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 text-center sm:px-8">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-black text-[#F59E0B] transition hover:text-[#121358]"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type FeatureBoxProps = {
  icon: string;
  title: string;
  text: string;
};

function FeatureBox({
  icon,
  title,
  text,
}: FeatureBoxProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-2 text-sm font-black text-white">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-white/50">
        {text}
      </p>
    </div>
  );
}

function LoginLoader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f6ff]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#121358]/20 border-t-[#F59E0B]" />

        <p className="mt-4 text-sm font-medium text-[#121358]">
          Loading your account...
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<LoginLoader />}
    >
      <LoginForm />
    </Suspense>
  );
}
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function SetPasswordPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    isAuthenticated,
    setPassword,
  } = useAuth();

  const [password, setPasswordValue] =
    useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Page Access Guard
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    /*
     * User must be authenticated first.
     */
    if (!isAuthenticated || !user) {
      router.replace(
        "/login?redirect=/set-password"
      );
      return;
    }

    /*
     * Password is already configured.
     *
     * No reason to remain on this page.
     */
    if (user.password_set) {
      router.replace("/");
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    router,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Submit Password
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      password !== passwordConfirmation
    ) {
      setError(
        "Password confirmation does not match."
      );
      return;
    }

    setSubmitting(true);

    try {
      await setPassword({
        password,
        password_confirmation:
          passwordConfirmation,
      });

      setSuccess(
        "Password created successfully."
      );

      /*
       * AuthContext now contains:
       *
       * password_set = true
       */

      router.replace("/");
    } catch (err) {
      console.error(
        "Set password failed:",
        err
      );

      if (err instanceof ApiError) {
        setError(
          err.message ||
            "Unable to set password."
        );
      } else {
        setError(
          "Unable to set password. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    authLoading ||
    !isAuthenticated ||
    !user ||
    user.password_set
  ) {
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

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f5f6ff] px-4 py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-[#121358]/10">

        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-[#f7f7ff] px-6 py-7 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#121358] text-xl text-[#F59E0B] shadow-lg">
              🔐
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F59E0B]">
                Account Security
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#121358]">
                Create Your Password
              </h1>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6 sm:p-8"
        >
          {/* Information */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
            <p className="text-sm leading-6 text-slate-600">
              You signed in with Google.
              Create a ShopSphere password so
              you can also sign in using your
              email and password.
            </p>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Account
            </p>

            <p className="mt-1 font-bold text-[#121358]">
              {user.email}
            </p>
          </div>

          {/* Password */}
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#121358]">
              New Password
            </span>

            <span className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPasswordValue(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Create a password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-16 text-sm text-slate-800 outline-none transition focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#121358]"
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </span>
          </label>

          {/* Confirmation */}
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[#121358]">
              Confirm Password
            </span>

            <span className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                🔒
              </span>

              <input
                type={
                  showConfirmation
                    ? "text"
                    : "password"
                }
                required
                minLength={8}
                value={
                  passwordConfirmation
                }
                onChange={(event) =>
                  setPasswordConfirmation(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-16 text-sm text-slate-800 outline-none transition focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmation(
                    (current) => !current
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#121358]"
              >
                {showConfirmation
                  ? "Hide"
                  : "Show"}
              </button>
            </span>
          </label>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#121358] to-[#292c82] px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Creating Password..."
              : "Create Password"}
          </button>

          <p className="text-center text-xs leading-5 text-slate-400">
            This password is for your
            ShopSphere account. It does not
            change your Google password.
          </p>
        </form>
      </div>
    </main>
  );
}
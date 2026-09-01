"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6ff]">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-bold text-red-700">Invalid or missing reset link.</p>
          <Link
            href="/forgot-password"
            className="mt-3 inline-block text-sm font-bold text-[#121358] underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6ff] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-black text-[#121358]">Reset Password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter a new password for <span className="font-semibold">{email}</span>
        </p>

        {success ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            Password reset successfully. Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#121358]">
                New Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm text-slate-800 outline-none focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#121358]">
                Confirm New Password
              </span>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm text-slate-800 outline-none focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-[#121358] to-[#292c82] py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
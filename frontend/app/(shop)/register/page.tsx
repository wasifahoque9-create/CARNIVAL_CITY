"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  PackageCheck,
  Zap,
} from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/auth/GoogleButton";
import { useAuth } from "@/lib/auth";
import { ApiError, api } from "@/lib/api";

export default function RegisterPage() {
  const {
    register,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | Registration Form
  |--------------------------------------------------------------------------
  */

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Password Visibility
  |--------------------------------------------------------------------------
  */

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Phone OTP State
  |--------------------------------------------------------------------------
  */

  const [otpSent, setOtpSent] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [otpError, setOtpError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Redirect Already Logged-in Users
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated
    ) {
      router.replace("/");
    }
  }, [
    authLoading,
    isAuthenticated,
    router,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Reset OTP if phone changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setOtpVerified(false);
    setOtpSent(false);
    setOtp("");
    setOtpError("");
  }, [form.phone]);

  /*
  |--------------------------------------------------------------------------
  | Send Phone OTP
  |--------------------------------------------------------------------------
  */

  async function sendOtp() {
    if (!form.phone.trim()) {
      setOtpError(
        "Please enter your phone number."
      );

      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      await api("/auth/send-otp", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          phone: form.phone.trim(),
        }),
      });

      setOtpSent(true);
    } catch (err) {
      setOtpError(
        err instanceof ApiError
          ? err.message
          : "Failed to send verification code."
      );
    } finally {
      setOtpLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Verify Phone OTP
  |--------------------------------------------------------------------------
  */

  async function verifyOtp() {
    if (!otp.trim()) {
      setOtpError(
        "Please enter the verification code."
      );

      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      await api("/auth/verify-otp", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          phone: form.phone.trim(),
          otp: otp.trim(),
        }),
      });

      setOtpVerified(true);
      setOtpError("");
    } catch (err) {
      setOtpError(
        err instanceof ApiError
          ? err.message
          : "Invalid verification code."
      );
    } finally {
      setOtpLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    /*
     * Phone is optional.
     *
     * But if the user enters a phone number,
     * require them to verify it before registration.
     */
    if (
      form.phone.trim() &&
      !otpVerified
    ) {
      setOtpError(
        "Please verify your phone number before creating your account."
      );

      setLoading(false);

      return;
    }

    try {
      await register({
        name: form.name.trim(),
        email: form.email
          .trim()
          .toLowerCase(),

        phone:
          form.phone.trim() || "",

        password: form.password,

        password_confirmation:
          form.password_confirmation,
      });

      /*
       * register() is part of the auth context.
       *
       * If it stores the token returned by Laravel,
       * isAuthenticated becomes true and the
       * useEffect above redirects to "/".
       *
       * Therefore we do NOT also push "/login" here.
       */
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.errors
      ) {
        const mappedErrors:
          Record<string, string> = {};

        Object.entries(
          err.errors
        ).forEach(
          ([field, messages]) => {
            if (
              Array.isArray(messages) &&
              messages.length > 0
            ) {
              mappedErrors[field] =
                messages[0];
            }
          }
        );

        setFieldErrors(
          mappedErrors
        );

        if (
          Object.keys(mappedErrors)
            .length === 0
        ) {
          setError(
            err.message ||
              "Registration failed."
          );
        }
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Registration failed."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Authentication Loading Screen
  |--------------------------------------------------------------------------
  */

  if (
    authLoading ||
    isAuthenticated
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        Loading...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* Grid Background */}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}

        <div className="flex flex-col justify-center px-8 lg:px-20">

          <h1 className="text-6xl font-bold leading-tight">
            Create your <br />

            <span className="text-orange-400">
              ShopSphere
            </span>{" "}
            <br />

            account
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-400">
            Join thousands of tech
            lovers and enjoy a seamless
            shopping experience.
          </p>

          <div className="mt-12 max-w-md space-y-5">

            {/* Secure */}

            <div className="rounded-2xl border border-purple-500/20 bg-white/5 p-5 backdrop-blur-lg">

              <div className="flex gap-4">

                <Shield className="text-purple-400" />

                <div>
                  <h3 className="font-semibold">
                    Secure & Safe
                  </h3>

                  <p className="text-sm text-gray-400">
                    Enterprise-grade
                    security.
                  </p>
                </div>

              </div>
            </div>

            {/* Orders */}

            <div className="rounded-2xl border border-blue-500/20 bg-white/5 p-5 backdrop-blur-lg">

              <div className="flex gap-4">

                <PackageCheck className="text-blue-400" />

                <div>
                  <h3 className="font-semibold">
                    Track Orders
                  </h3>

                  <p className="text-sm text-gray-400">
                    Real-time order
                    updates.
                  </p>
                </div>

              </div>
            </div>

            {/* Checkout */}

            <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-5 backdrop-blur-lg">

              <div className="flex gap-4">

                <Zap className="text-yellow-400" />

                <div>
                  <h3 className="font-semibold">
                    Fast Checkout
                  </h3>

                  <p className="text-sm text-gray-400">
                    Quick and easy
                    payment.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center justify-center px-8 py-12">

          <div className="w-full max-w-xl rounded-[30px] border border-purple-500/20 bg-gradient-to-br from-[#0a1025] to-[#111b3f] p-8 shadow-[0_0_40px_rgba(128,0,255,0.15)]">

            {/* Header */}

            <div className="mb-8 flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-white/5">

                <User className="text-purple-400" />

              </div>

              <div>

                <p className="text-sm uppercase tracking-[4px] text-purple-400">
                  CREATE ACCOUNT
                </p>

                <h2 className="text-4xl font-bold">
                  Join ShopSphere
                </h2>

                <p className="text-gray-400">
                  Fill in your details
                  to get started
                </p>

              </div>

            </div>

            {/* Google Registration */}

            <GoogleButton />

            {/* Divider */}

            <div className="my-8 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-gray-500">
                OR
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>

            {/* Registration Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* Full Name */}

              <div>

                <label className="mb-3 block text-lg font-medium text-white">
                  Full Name
                </label>

                <Input
                  required
                  value={form.name}
                  placeholder="Enter your full name"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name:
                        e.target.value,
                    })
                  }
                  error={
                    fieldErrors.name
                  }
                />

              </div>

              {/* Email */}

              <div>

                <label className="mb-3 block text-lg font-medium text-white">
                  Email
                </label>

                <Input
                  type="email"
                  required
                  value={form.email}
                  placeholder="Enter your email"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target.value,
                    })
                  }
                  error={
                    fieldErrors.email
                  }
                />

              </div>

              {/* Phone */}

              <div>

                <label className="mb-3 block text-lg font-medium text-white">
                  Phone (Optional)
                </label>

                <Input
                  type="tel"
                  value={form.phone}
                  disabled={
                    otpVerified
                  }
                  placeholder="Enter your phone number (e.g. 01712345678)"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone:
                        e.target.value,
                    })
                  }
                  error={
                    fieldErrors.phone ||
                    otpError
                  }
                />

                {form.phone &&
                  !otpVerified && (

                    <div className="mt-3 space-y-3">

                      {!otpSent ? (

                        <Button
                          type="button"
                          loading={
                            otpLoading
                          }
                          onClick={
                            sendOtp
                          }
                        >
                          Send verification
                          code
                        </Button>

                      ) : (

                        <div className="flex gap-3">

                          <Input
                            value={otp}
                            placeholder="Enter 6-digit code"
                            onChange={(
                              e
                            ) =>
                              setOtp(
                                e.target
                                  .value
                              )
                            }
                          />

                          <Button
                            type="button"
                            loading={
                              otpLoading
                            }
                            onClick={
                              verifyOtp
                            }
                          >
                            Verify
                          </Button>

                        </div>

                      )}

                    </div>

                  )}

                {otpVerified && (

                  <p className="mt-2 text-sm text-green-400">
                    ✓ Phone number
                    verified
                  </p>

                )}

              </div>

              {/* Password */}

              <div>

                <label className="mb-3 block text-lg font-medium text-white">
                  Password
                </label>

                <div className="relative">

                  <Input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    value={
                      form.password
                    }
                    placeholder="Create a strong password"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password:
                          e.target
                            .value,
                      })
                    }
                    error={
                      fieldErrors.password
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>
              </div>

              {/* Confirm Password */}

              <div>

                <label className="mb-3 block text-lg font-medium text-white">
                  Confirm Password
                </label>

                <div className="relative">

                  <Input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    required
                    value={
                      form.password_confirmation
                    }
                    placeholder="Confirm your password"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password_confirmation:
                          e.target
                            .value,
                      })
                    }
                    error={
                      fieldErrors
                        .password_confirmation
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* General Error */}

              {error && (

                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">

                  <p className="text-sm text-red-400">
                    {error}
                  </p>

                </div>

              )}

              {/* Submit */}

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-white"
              >
                Create Account →
              </Button>

            </form>

            {/* Login */}

            <div className="mt-8 rounded-xl border border-purple-500/20 p-5 text-center">

              <p className="text-gray-400">

                Already have an
                account?{" "}

                <Link
                  href="/login"
                  className="font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Sign In
                </Link>

              </p>

            </div>

            {/* Terms */}

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">

              By creating an account,
              you agree to our Terms of
              Service and Privacy
              Policy.

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
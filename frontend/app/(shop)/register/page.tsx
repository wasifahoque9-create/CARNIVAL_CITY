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
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      await register(form);
      alert("Registration successful. Please log in.");
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mappedErrors: Record<string, string> = {};

        Object.entries(err.errors).forEach(([field, messages]) => {
          mappedErrors[field] = messages[0];
        });

        setFieldErrors(mappedErrors);
      } else {
        setError(
          err instanceof ApiError ? err.message : "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white relative overflow-hidden">

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center px-8 lg:px-20">

          <h1 className="text-6xl font-bold leading-tight">
            Create your <br />
            <span className="text-orange-400">ShopSphere</span> <br />
            account
          </h1>

          <p className="mt-6 text-gray-400 text-lg max-w-lg leading-8">
            Join thousands of tech lovers and enjoy a seamless shopping
            experience.
          </p>

          <div className="mt-12 space-y-5 max-w-md">

            <div className="rounded-2xl border border-purple-500/20 bg-white/5 backdrop-blur-lg p-5">
              <div className="flex gap-4">
                <Shield className="text-purple-400" />
                <div>
                  <h3 className="font-semibold">Secure & Safe</h3>
                  <p className="text-gray-400 text-sm">
                    Enterprise-grade security.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-white/5 backdrop-blur-lg p-5">
              <div className="flex gap-4">
                <PackageCheck className="text-blue-400" />
                <div>
                  <h3 className="font-semibold">Track Orders</h3>
                  <p className="text-gray-400 text-sm">
                    Real-time order updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-white/5 backdrop-blur-lg p-5">
              <div className="flex gap-4">
                <Zap className="text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Fast Checkout</h3>
                  <p className="text-gray-400 text-sm">
                    Quick and easy payment.
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
                <h2 className="text-4xl font-bold">Join ShopSphere</h2>
                <p className="text-gray-400">
                  Fill in your details to get started
                </p>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">

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
                      name: e.target.value,
                    })
                  }
                  error={fieldErrors.name}
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
                      email: e.target.value,
                    })
                  }
                  error={fieldErrors.email}
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
                  placeholder="Enter your phone number"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  error={fieldErrors.phone}
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-3 block text-lg font-medium text-white">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  value={form.password}
                  placeholder="Create a strong password"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  error={fieldErrors.password}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-3 block text-lg font-medium text-white">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  required
                  value={form.password_confirmation}
                  placeholder="Confirm your password"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password_confirmation: e.target.value,
                    })
                  }
                  error={fieldErrors.password_confirmation}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-white"
              >
                Create Account →
              </Button>

            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-gray-500">OR</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {/* Login */}
            <div className="rounded-xl border border-purple-500/20 p-5 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
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
              By creating an account, you agree to our Terms of Service
              and Privacy Policy.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
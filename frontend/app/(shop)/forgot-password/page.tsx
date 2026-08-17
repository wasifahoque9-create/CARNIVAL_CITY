"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Card, { CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { authApi, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await authApi.forgotPassword({ email });
      setMessage(res.message || "If that email exists, a reset link has been sent.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
      <Card className="w-full" padding="lg">
        <CardHeader
          title="Forgot Password"
          subtitle="Enter your email and we'll send reset instructions"
        />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-primary hover:text-secondary">
            ← Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function GoogleButton() {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      setError("Google didn't return a credential. Please try again.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await googleLogin(response.credential);
      router.replace("/");
    } catch (err) {
      console.error("Google sign-in failed", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Google sign-in failed. Please try again.")}
          theme="filled_black"
          shape="pill"
          text="signin_with"
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Signing you in…</p>
      )}

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

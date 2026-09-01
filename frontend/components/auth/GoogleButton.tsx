"use client";

import { useState } from "react";
import {
  CredentialResponse,
  GoogleLogin,
} from "@react-oauth/google";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function GoogleButton() {
  const router = useRouter();

  const { googleLogin } = useAuth();

  const [error, setError] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  async function handleSuccess(
    response: CredentialResponse
  ) {
    /*
     * Google did not return an ID token.
     */
    if (!response.credential) {
      setError(
        "Google didn't return a credential. Please try again."
      );

      return;
    }

    /*
     * Prevent multiple login requests.
     */
    if (loading) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      /*
       * response.credential is Google's ID token.
       *
       * useAuth().googleLogin() sends:
       *
       * POST /api/auth/google
       *
       * {
       *   id_token: response.credential
       * }
       */

      const { user } = await googleLogin(
        response.credential
      );

      /*
       * password_set is now the source of truth.
       *
       * New Google user:
       *
       * password_set = false
       *
       * Existing Google user without a local password:
       *
       * password_set = false
       *
       * Existing user with a real local password:
       *
       * password_set = true
       */

      if (!user.password_set) {
        router.replace("/set-password");
        return;
      }

      /*
       * Password has already been configured.
       */
      router.replace("/");
    } catch (err) {
      console.error(
        "Google sign-in failed:",
        err
      );

      if (err instanceof ApiError) {
        setError(
          err.message ||
            "Google sign-in failed. Please try again."
        );
      } else {
        setError(
          "Google sign-in failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    setLoading(false);

    setError(
      "Google sign-in was cancelled or failed. Please try again."
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={
          loading
            ? "pointer-events-none opacity-60"
            : ""
        }
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleGoogleError}
          theme="filled_black"
          shape="pill"
          text="continue_with"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />

          <p className="text-sm text-gray-400">
            Signing you in with Google...
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
        >
          <p className="text-center text-sm text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

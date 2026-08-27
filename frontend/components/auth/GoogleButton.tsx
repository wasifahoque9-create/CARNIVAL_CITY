// components/auth/GoogleButton.tsx
"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function GoogleButton() {
  const router = useRouter();

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return;

    const res = await api<{ token: string }>("/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: response.credential }),
    });

    localStorage.setItem("token", res.token);
    router.replace("/");
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google sign-in failed")}
        theme="filled_black"
        shape="pill"
        width="100%"
      />
    </div>
  );
}
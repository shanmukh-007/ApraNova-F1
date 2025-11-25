"use client";

import { useEffect } from "react";
import { clearTokens, getRefreshToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient"; // axios client with token injection

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      try {
        const refreshToken = getRefreshToken();

        // Only call backend logout if user has refresh token
        if (refreshToken) {
          await apiClient.post("/users/logout/", { refresh: refreshToken });
        }
      } catch (err) {
        console.error("Backend logout failed:", err);
      } finally {
        // Always clear tokens locally, even if backend call fails
        clearTokens();
        router.replace("/login");
      }
    }

    handleLogout();
  }, [router]);

  return (
    <main className="min-h-svh flex items-center justify-center">
      <div>
        <h2 className="text-lg font-medium">Logging you out…</h2>
      </div>
    </main>
  );
}

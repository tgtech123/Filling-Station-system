"use client"

import AuthShell, { AuthCard } from "@/sections/login/AuthShell";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const API = process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    if (!token) {
      setError("Reset token is missing");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Password reset failed");
      }

      const data = await res.json();
      setMessage(data.message || "Password changed successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <h1 className="text-[1.4rem] font-bold tracking-tight text-[#1c1b1a] dark:text-white [@media(min-height:760px)]:text-[1.6rem]">Create Password</h1>
      <p className="mt-1 text-[0.8rem] text-gray-500 dark:text-gray-400 [@media(min-height:760px)]:mt-1.5 [@media(min-height:760px)]:text-sm">
        Enter a strong password for your account
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex w-full flex-col gap-3 [@media(min-height:760px)]:mt-6 [@media(min-height:760px)]:gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[0.8rem] font-semibold text-gray-700 dark:text-gray-300">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="********"
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            style={{ letterSpacing: "0.5em" }}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[0.8rem] font-semibold text-gray-700 dark:text-gray-300">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            style={{ letterSpacing: "0.5em" }}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm -mt-1">{error}</p>}
        {message && (
          <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-2.5">
            <p className="text-sm text-green-800 font-medium">{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-11 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save and Login"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ChangePassword() {
  return (
    <AuthShell>
      {/* The fallback wears the same card, so the page does not flash a bare
          line of text over the photograph before the form arrives. */}
      <Suspense
        fallback={
          <AuthCard>
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">
              Loading…
            </div>
          </AuthCard>
        }
      >
        <ChangePasswordForm />
      </Suspense>
    </AuthShell>
  );
}

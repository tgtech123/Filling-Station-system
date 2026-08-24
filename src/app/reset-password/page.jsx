"use client"

import AuthShell, { AuthCard } from "@/sections/login/AuthShell";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    const SAFE_MSG = "Check your mail! An email will be sent to you if your email exists. Redirecting to login...";
    try {
      const API = process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";
      await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMessage(SAFE_MSG);
    } catch {
      setMessage(SAFE_MSG);
    } finally {
      setLoading(false);
      setError(null);
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <h1 className="text-[1.4rem] font-bold tracking-tight text-[#1c1b1a] dark:text-white [@media(min-height:760px)]:text-[1.6rem]">Reset Password</h1>
        <p className="mt-1 text-[0.8rem] text-gray-500 dark:text-gray-400 [@media(min-height:760px)]:mt-1.5 [@media(min-height:760px)]:text-sm">
          Enter your email to receive a reset link
        </p>

          <form className="mt-4 flex w-full flex-col gap-3 [@media(min-height:760px)]:mt-6 [@media(min-height:760px)]:gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[0.8rem] font-semibold text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                placeholder="username123@gmail.com"
                className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium -mt-1">{error}</p>
            )}
            {message && (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5">
                <p className="text-sm text-yellow-800 font-medium">{message}</p>
              </div>
            )}

            <button
              onClick={handleResetPassword}
              type="submit"
              disabled={loading}
              className="mt-1 flex h-11 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>

            <p className="flex justify-center text-sm font-semibold text-gray-500 mt-1">
              Have an account?{" "}
              <Link href="/login" className="text-blue-600 ml-2 cursor-pointer hover:text-blue-950">
                Login Here
              </Link>
            </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

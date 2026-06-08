"use client"

import LoginTwo from "@/sections/LoginTwo";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="w-full flex items-center justify-center bg-gray-50 px-4 py-10 lg:py-0 lg:h-screen lg:overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl px-8 py-10 flex flex-col items-start">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#323130]">Reset Password</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500">Enter your email to receive a reset link</p>

          <form className="flex flex-col gap-4 mt-8 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-[#323130]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                placeholder="username123@gmail.com"
                className="pl-3 border-[1.6px] rounded-lg h-[43px] w-full focus:border-blue-600 outline-none text-sm"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium -mt-1">{error}</p>
            )}
            {message && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3">
                <p className="text-sm text-yellow-800 font-medium">{message}</p>
              </div>
            )}

            <button
              onClick={handleResetPassword}
              type="submit"
              disabled={loading}
              className="bg-blue-600 flex justify-center items-center rounded-lg font-semibold text-white h-[45px] hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
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
        </div>
      </div>

      <div className="hidden md:flex w-full h-full">
        <LoginTwo />
      </div>
    </div>
  );
}

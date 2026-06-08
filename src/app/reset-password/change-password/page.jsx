"use client"

import LoginTwo from "@/sections/LoginTwo";
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
    <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl px-8 py-10 flex flex-col items-start">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#323130]">Create Password</h1>
      <p className="mt-2 text-sm sm:text-base text-gray-500">Enter a strong password for your account</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 w-full">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-[#323130]">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="********"
            className="pl-3 border-[1.6px] rounded-lg h-[43px] w-full focus:border-blue-600 outline-none"
            style={{ letterSpacing: "0.5em" }}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-[#323130]">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            className="pl-3 border-[1.6px] rounded-lg h-[43px] w-full focus:border-blue-600 outline-none"
            style={{ letterSpacing: "0.5em" }}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm -mt-1">{error}</p>}
        {message && (
          <div className="bg-green-50 border border-green-300 rounded-lg px-4 py-3">
            <p className="text-sm text-green-800 font-medium">{message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 flex justify-center items-center rounded-lg font-semibold text-white h-[45px] hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Saving..." : "Save and Login"}
        </button>
      </form>
    </div>
  );
}

export default function ChangePassword() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="w-full flex items-center justify-center bg-gray-50 px-4 py-10 lg:py-0 lg:h-screen lg:overflow-y-auto">
        <Suspense fallback={
          <div className="w-full max-w-md flex items-center justify-center">
            <p>Loading...</p>
          </div>
        }>
          <ChangePasswordForm />
        </Suspense>
      </div>

      <div className="hidden md:flex w-full h-full">
        <LoginTwo />
      </div>
    </div>
  );
}

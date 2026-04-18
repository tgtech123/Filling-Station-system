"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [step, setStep] = useState("loading");
  // loading | setup | success | invalid

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stationName, setStationName] = useState("");

  useEffect(() => {
    if (!token) {
      setStep("invalid");
      return;
    }
    setStep("setup");
  }, [token]);

  const handleAccept = async () => {
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/branches/accept-invite`,
        { token, password }
      );

      const { token: authToken, user, station } = response.data;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(user));

      setStationName(station.name);
      setStep("success");

      setTimeout(() => {
        router.push("/dashboard/manager");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Flourish Station</h1>
        </div>

        {/* Loading */}
        {step === "loading" && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading your invitation...</p>
          </div>
        )}

        {/* Invalid */}
        {step === "invalid" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This invitation link is invalid or has expired. Please ask your manager to send a new invite.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        )}

        {/* Setup password */}
        {step === "setup" && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Accept Your Invitation
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Set up your password to access your branch dashboard
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up account...
                  </>
                ) : (
                  "Accept & Access Dashboard"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome aboard! 🎉
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              You are now the Branch Manager of
            </p>
            <p className="font-bold text-blue-600 text-lg mb-4">{stationName}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Redirecting to your dashboard...
            </p>
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        )}
      </div>
    </div>
  );
}

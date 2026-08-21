"use client";
import { API_URL } from "@/lib/config";
import React, { useState, useEffect } from "react";
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import { ImSpinner3 } from "react-icons/im";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LoginTwo from "../LoginTwo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import usePlatformStore from "@/store/usePlatformStore";

const Login = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // 2FA OTP step
  const [otpStep, setOtpStep] = useState(false);
  const [otpUserId, setOtpUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const upgraded = searchParams.get("upgraded") === "true";
  const upgradedPlan = searchParams.get("plan") || "";
  const idleLogout = searchParams.get("reason") === "idle";

  const { settings, fetchPublicSettings } = usePlatformStore();

  useEffect(() => {
    fetchPublicSettings();
    // Prefill from a previous "Remember me" login
    try {
      const savedEmail = localStorage.getItem("rememberedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  // Persist/forget the email according to the checkbox at the moment of login
  const applyRememberedEmail = () => {
    try {
      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      else localStorage.removeItem("rememberedEmail");
    } catch {}
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // rememberMe extends the session from 24h to 30 days server-side
        body: JSON.stringify({ email, password, rememberMe }),
      });

      // console.log("res", res.json())

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();

      // 2FA: backend requires OTP before issuing token
      if (data.requiresOtp) {
        setOtpUserId(data.userId);
        setOtpStep(true);
        return;
      }

      applyRememberedEmail();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage(data.message);
      setSuccess(true);
      // navigate based on role
      if (data.user?.role === "admin") {
        router.push("/admin");
      } else if (data.user?.role === "manager") {
        router.push("/dashboard/manager");
      } else if (data.user?.role === "accountant") {
        router.push("/dashboard/accountant");
      } else if (data.user?.role === "cashier") {
        router.push("/dashboard/cashier");
      } else if (data.user?.role === "supervisor") {
        router.push("/dashboard/supervisor");
      } else if (data.user?.role === "attendant") {
        router.push("/dashboard/attendant");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const routeByRole = (user) => {
    if (user?.role === "admin") router.push("/admin");
    else if (user?.role === "manager") router.push("/dashboard/manager");
    else if (user?.role === "accountant") router.push("/dashboard/accountant");
    else if (user?.role === "cashier") router.push("/dashboard/cashier");
    else if (user?.role === "supervisor") router.push("/dashboard/supervisor");
    else if (user?.role === "attendant") router.push("/dashboard/attendant");
    else router.push("/dashboard");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Relay the login form's "Remember me" — the real token is issued here
        body: JSON.stringify({ userId: otpUserId, otp, rememberMe }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Verification failed");
      }
      const data = await res.json();
      applyRememberedEmail();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      routeByRole(data.user);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[minmax(0,1fr)_1.15fr] lg:overflow-hidden">
      {/* Left - Form Section */}
      <div className="flex w-full items-center justify-center bg-white px-5 py-10 dark:bg-gray-900 sm:px-8 lg:h-screen lg:overflow-y-auto">
        <div className="flex w-full max-w-[23rem] flex-col items-center rounded-lg border border-neutral-200/80 bg-white px-6 py-7 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_40px_-16px_rgba(16,24,40,0.25)] dark:border-2 dark:border-white dark:bg-gray-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_45px_-12px_rgba(255,255,255,0.22)]">
          <div className="mb-7 flex gap-5 self-start">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft size={20} className="hidden lg:block" />
              <ArrowLeft
                size={20}
                className="block rounded-md border border-neutral-300 p-1 lg:hidden"
              />
              <h1 className="hidden text-sm font-semibold text-gray-500 dark:text-gray-400 lg:block">Back home</h1>
            </Link>
          </div>

          <h1 className="w-full text-center text-[1.6rem] font-bold tracking-tight text-[#1c1b1a] dark:text-white sm:text-[1.75rem]">
              Welcome Back!  
           {/* <span> {settings?.platformName || "FuelDesk"} </span> */}
          </h1>
          <p className="mt-1.5 w-full text-center text-sm text-gray-500 dark:text-gray-400">
            Login to access your customized station dashboard
          </p>

          {idleLogout && (
            <div className="w-full mt-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
              <p className="text-amber-700 font-semibold text-sm">
                Session expired due to inactivity
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                You were logged out after 40 minutes of inactivity. Please log
                in again.
              </p>
            </div>
          )}

          {upgraded && (
            <div className="w-full mt-4 mb-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <p className="text-green-700 font-semibold text-sm">
                🎉{" "}
                {upgradedPlan
                  ? `Your ${upgradedPlan} plan is now active!`
                  : "Your plan has been upgraded!"}
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                Log in below to access your upgraded dashboard.
              </p>
            </div>
          )}

          {otpStep ? (
            /* ── OTP verification screen ── */
            <div className="mt-7 flex w-full flex-col gap-4">
              <div className="text-center mb-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-900/30 dark:ring-blue-900">
                  <ShieldCheck size={22} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-[#1c1b1a] dark:text-white">
                  Check your email
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a 6-digit code to your email address. Enter it below
                  to continue.
                </p>
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 text-[0.8rem] font-semibold text-gray-700 dark:text-gray-300">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="h-12 w-full rounded-lg border border-neutral-300 bg-white text-center text-xl font-bold tracking-[0.4em] outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
              </div>

              {otpError && <p className="bg-red-50 border border-red-300 text-red-700 text-sm text-center rounded-md px-3 py-2">{otpError}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {otpLoading && <ImSpinner3 className="animate-spin h-4 w-4" />}
                {otpLoading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                onClick={() => {
                  setOtpStep(false);
                  setOtp("");
                  setOtpError(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 text-center underline"
              >
                ← Back to login
              </button>
            </div>
          ) : (
            /* ── Normal login form ── */
            <form
              onSubmit={handleLogin}
              className="mt-7 flex w-full flex-col gap-4"
            >
              {/* Email */}
              <div className="relative flex flex-col">
                <label className="mb-1.5 text-[0.8rem] font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username123@gmail.com"
                  className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative flex flex-col">
                <label className="mb-1.5 text-[0.8rem] font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-neutral-300 bg-white pl-3.5 pr-11 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
                <div
                  onClick={handleShowPassword}
                  className="absolute right-3 top-[2.05rem] cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </div>
              </div>

              {error && (
                <p className="bg-red-50 border border-red-300 text-red-700 text-sm text-center rounded-md px-3 py-2">{error}</p>
              )}
              {message && (
                <p className="bg-green-50 border border-green-300 text-green-700 text-sm text-center rounded-md px-3 py-2">{message}</p>
              )}

              {/* Remember Me — 30-day session + prefilled email next visit */}
              <div className="flex items-center gap-3">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="remember-me" className="font-semibold text-sm cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {(loading || success) && <ImSpinner3 className="animate-spin h-4 w-4" />}
                {success ? "Redirecting..." : loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Forgot Password */}
              <p className="flex justify-center text-[0.8rem] font-medium text-gray-500 dark:text-gray-400">
                Forgotten Password?{" "}
                <Link
                  href="/reset-password"
                  className="text-blue-600 ml-2 cursor-pointer hover:text-blue-950"
                >
                  Reset Here
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Right - Full Image Section (No Scroll) */}
      <div className="relative hidden h-full w-full lg:block">
        <LoginTwo />
      </div>
    </div>
  );
};

export default Login;

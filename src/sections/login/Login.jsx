"use client";
import { API_URL } from "@/lib/config";
import React, { useState, useEffect } from "react";
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import { ImSpinner3 } from "react-icons/im";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LoginTwo from "../LoginTwo";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import usePlatformStore from "@/store/usePlatformStore";

const Login = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
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
  }, []);

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
        body: JSON.stringify({ email, password }),
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
        body: JSON.stringify({ userId: otpUserId, otp }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Verification failed");
      }
      const data = await res.json();
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
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-screen lg:overflow-hidden">
      {/* Left - Form Section */}
      <div className="w-full flex items-center justify-center bg-white dark:bg-gray-900 px-4 py-10 lg:py-0 lg:h-screen lg:overflow-y-auto border-2 border-neutral-500 shadow-md">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex gap-5 mb-6 lg:mb-16 self-start">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft size={28} className="hidden lg:block" />
              <ArrowLeft
                size={28}
                className="lg:hidden block border-2 border-neutral-300 p-1 rounded-sm"
              />
              <h1 className="hidden lg:block">Back home</h1>
            </Link>
          </div>

          <Image
            src={settings?.logoUrl || "/fueldesk-logo.png"}
            alt="Logo"
            width={300}
            height={200}
            className="w-60 sm:w-50 lg:w-[18rem] mr-auto h-auto rounded-md"
            unoptimized={!!(settings?.logoUrl)}
          />

          <h1 className="text-[1.875rem] sm:text-[2.5rem] lg:text-[2.875rem] font-bold text-[#323130] text-center mr-auto mt-2">
            Login to {settings?.platformName || "FuelDesk"}
          </h1>
          <p className="text-[1rem] mr-auto sm:text-[0.78rem] text-gray-500 text-center mt-1">
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
            <div className="flex flex-col gap-4 mt-6 w-full">
              <div className="text-center mb-2">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={28} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-[#323130]">
                  Check your email
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a 6-digit code to your email address. Enter it below
                  to continue.
                </p>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-[#323130] mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="border-[1.6px] rounded-md h-[50px] w-full focus:border-blue-600 outline-none text-center text-2xl tracking-[0.5em] font-bold"
                  autoFocus
                />
              </div>

              {otpError && <p className="text-red-500 text-sm">{otpError}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="flex items-center justify-center gap-2 bg-blue-600 rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
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
              className="flex flex-col gap-4 mt-6 w-full"
            >
              {/* Email */}
              <div className="relative flex flex-col">
                <label className="text-sm font-bold text-[#323130]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username123@gmail.com"
                  className="pl-4 border-2 rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative flex flex-col">
                <label className="text-sm font-bold text-[#323130]">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-4 border-2 rounded-md w-full h-[43px] outline-none focus:border-blue-600"
                  required
                />
                <div
                  onClick={handleShowPassword}
                  className="absolute top-[1.875rem] right-3 text-neutral-400 cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-start">{error}</p>
              )}
              {message && (
                <p className="text-green-500 text-sm text-start">{message}</p>
              )}

              {/* Remember Me */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="text-blue-600 accent-blue-600 focus:ring-0"
                />
                <label className="font-semibold text-sm">Remember me?</label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="flex items-center justify-center gap-2 bg-blue-600 rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {(loading || success) && <ImSpinner3 className="animate-spin h-4 w-4" />}
                {success ? "Redirecting..." : loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Forgot Password */}
              <p className="flex justify-center text-sm font-semibold text-gray-500">
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
      <div className="hidden lg:block w-full h-full">
        <LoginTwo />
      </div>
    </div>
  );
};

export default Login;

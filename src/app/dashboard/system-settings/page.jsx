"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useThemePersistence from "@/hooks/useThemePersistence";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  Palette, Shield, Bell, Receipt, Sun, Moon, Smartphone,
  Monitor, LogOut, X, CheckCircle, XCircle, CreditCard,
  Zap, Loader2, ChevronDown, AlertTriangle, Clock, ArrowDownCircle,
  CheckCircle2, Users, Ban,
} from "lucide-react";
import useActivityFeedStore from "@/store/useActivityFeedStore";
import FuelYieldFactorSection from "./FuelYieldFactorSection";

const API =
  process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";

// ── Constants ─────────────────────────────────────────────────────────────────

function detectDevice() {
  if (typeof window === "undefined") return "Current Browser";
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return "Safari on iPhone";
  if (/Android.*Chrome/.test(ua)) return "Chrome on Android";
  if (/Android/.test(ua)) return "Browser on Android";
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari on Mac";
  if (/Macintosh/.test(ua)) return "Chrome on Mac";
  if (/Windows/.test(ua) && /Firefox/.test(ua)) return "Firefox on Windows";
  if (/Windows/.test(ua)) return "Chrome on Windows";
  return "Current Browser";
}

const LOGIN_KEYWORDS = ["logged in", "login", "failed login", "sign in"];

const NOTIF_KEYS = [
  { key: "emailNotifications", label: "Email Notifications",       desc: "Receive updates and alerts via email",                              backendField: "email"    },
  { key: "lowStockAlerts",     label: "Low Stock Alerts",          desc: "Get notified when fuel or lubricant stock drops below threshold",    backendField: "lowStock" },
  { key: "shiftCompletionAlerts", label: "Shift Completion Alerts", desc: "Get notified when an attendant completes a shift",                  backendField: "sales"   },
  { key: "unauthorizedAccessAlerts", label: "Unauthorized Access Alerts", desc: "Get notified of failed login attempts and suspicious activity", backendField: "push"  },
];

const PLAN_SLUGS = {
  free: "Free",
  pro: "Pro Plan",
  "pro-max": "Pro Max Plan",
  enterprise: "Enterprise Plan",
  "enterprise-pro": "Enterprise Pro Plan",
  "enterprise-max": "Enterprise Max Plan",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function isLoginActivity(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return LOGIN_KEYWORDS.some((kw) => text.includes(kw));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch { return {}; }
}
function getToken() { return localStorage.getItem("token") || ""; }

// ── UI Primitives ─────────────────────────────────────────────────────────────

function SectionCard({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border border-neutral-200 w-full shadow-sm overflow-hidden mb-5">
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, accent = "#1a71f6" }) {
  return (
    <div className="flex items-start gap-3 p-5 pb-4 border-b border-neutral-200">
      <div className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: `${accent}18` }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Toggle({ enabled, onToggle, colorOn = "#22c55e", busy = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={busy}
      aria-pressed={enabled}
      className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: enabled ? colorOn : "#d1d5db" }}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function ToggleRow({ label, hint, enabled, onToggle, busy }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-neutral-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        {busy && <Loader2 size={14} className="animate-spin text-gray-400" />}
        <Toggle enabled={enabled} onToggle={onToggle} busy={busy} />
      </div>
    </div>
  );
}

function ModalBackdrop({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

// ── 2FA Modals ────────────────────────────────────────────────────────────────

function TwoFAEnableModal({ onConfirm, onClose, saving }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#1a71f6]" />
            <h3 className="text-base font-semibold">Enable 2FA</h3>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 mb-5">
          <p className="text-sm text-blue-800 leading-relaxed">
            Enabling Two-Factor Authentication adds an extra layer of security to your account. You will be required to verify your identity on each login.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-[2px] border-neutral-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#1a71f6] text-sm text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Enable 2FA
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

function TwoFADisableModal({ onConfirm, onClose, saving }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">Disable 2FA?</h3>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="bg-red-50 rounded-xl p-4 mb-5">
          <p className="text-sm text-red-700 leading-relaxed">Disabling 2FA will make your account less secure. You can re-enable it at any time.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-[2px] border-neutral-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Keep Enabled
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Disable 2FA
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Billing Modals ────────────────────────────────────────────────────────────

// renewMode = true when already on the highest plan — only option is to renew same plan
function UpgradeModal({ onClose, currentPlanSlug, availablePlans, renewMode, onUpgrade, taxRate = 0.075 }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedSlug, setSelectedSlug] = useState(
    renewMode ? currentPlanSlug : (availablePlans[0]?.slug || currentPlanSlug)
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const selected = availablePlans.find(p => p.slug === selectedSlug) || availablePlans[0];
  // Base plan price + VAT = the total Paystack will actually charge. VAT uses the
  // same rounding as the backend (Math.round on the naira amount), so the figure
  // shown here equals the amount charged, to the kobo.
  const fmt = (n) => `₦${(n || 0).toLocaleString()}`;
  const basePrice = selected ? ((billingCycle === "yearly" ? selected.yearlyPrice : selected.monthlyPrice) || 0) : 0;
  const vat = Math.round(basePrice * (taxRate || 0));
  const totalPrice = basePrice + vat;
  const taxPercentLabel = `${Math.round((taxRate || 0) * 100 * 100) / 100}%`;

  async function handlePay() {
    setBusy(true);
    setErr(null);
    try {
      // Send the total we DISPLAYED — if an admin changed the plan price since
      // this modal rendered, the server rejects with the fresh price and the
      // modal re-renders with the new amount instead of surprising the user
      // at the Paystack checkout.
      await onUpgrade(selectedSlug, billingCycle, totalPrice);
    } catch (e) {
      setErr(e?.message || "Failed to initialise payment. Please try again.");
      setBusy(false);
    }
  }

  const cols = availablePlans.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : availablePlans.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#1a71f6]" />
            <h3 className="text-base font-semibold">{renewMode ? "Renew Plan" : "Upgrade Plan"}</h3>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>

        {renewMode && (
          <div className="mx-6 mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 shrink-0">
            You are on the <strong>highest available plan</strong>. You can renew it for another billing period below.
          </div>
        )}

        {/* Billing cycle toggle */}
        <div className="flex justify-center px-6 pt-4 shrink-0">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {["monthly", "yearly"].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors capitalize ${
                  billingCycle === cycle ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cycle}
                {cycle === "yearly" && <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Save 16%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className={`grid ${cols} gap-4 p-6 overflow-y-auto w-full`}>
          {availablePlans.map((plan, idx) => {
            const isSelected = plan.slug === selectedSlug;
            const planPrice  = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const isHighlighted = idx === availablePlans.length - 1 && !renewMode;
            return (
              <button
                key={plan.slug}
                onClick={() => setSelectedSlug(plan.slug)}
                className={`rounded-2xl border-[2px] p-5 text-left transition-all w-full ${
                  isSelected
                    ? isHighlighted ? "border-[#1a71f6] bg-blue-50 dark:bg-blue-900/20" : "border-gray-700 dark:border-blue-500 bg-gray-50 dark:bg-blue-900/10"
                    : "border-neutral-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                  <h4 className="font-semibold text-[#1a71f6] dark:text-blue-400 text-sm">{plan.name}</h4>
                  {isSelected && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isHighlighted ? "bg-[#1a71f6] text-white" : "bg-gray-700 text-white"}`}>
                      {renewMode ? "Renewing" : "Selected"}
                    </span>
                  )}
                  {isHighlighted && !isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Popular</span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-3 text-[#1a71f6] dark:text-blue-400">
                  ₦{(planPrice || 0).toLocaleString()}
                  <span className="text-sm font-normal text-blue-500/70 dark:text-blue-300/80">/{billingCycle === "yearly" ? "yr" : "mo"}</span>
                </p>
                <ul className="space-y-1.5">
                  {(plan.features || []).slice(0, 6).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs font-medium text-[#1a71f6] dark:text-blue-400">
                      <CheckCircle size={12} className="text-[#1a71f6] dark:text-blue-400 shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 shrink-0">
          {/* Price breakdown — base + VAT = total, matching what Paystack charges */}
          <div className="mb-3 rounded-xl border border-neutral-200 dark:border-gray-700 divide-y divide-neutral-100 dark:divide-gray-700 text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-gray-500 dark:text-gray-400">{selected?.name || "Plan"} ({billingCycle === "yearly" ? "yearly" : "monthly"})</span>
              <span className="font-medium dark:text-gray-100">{fmt(basePrice)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-gray-500 dark:text-gray-400">VAT ({taxPercentLabel})</span>
              <span className="font-medium dark:text-gray-100">{fmt(vat)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/40">
              <span className="font-semibold dark:text-gray-100">Total to pay <span className="font-normal text-gray-500 dark:text-gray-400">(VAT included)</span></span>
              <span className="font-bold text-[#1a71f6]">{fmt(totalPrice)}</span>
            </div>
          </div>
          {err && <p className="text-xs text-red-500 mb-2 text-center">{err}</p>}
          <button
            onClick={handlePay}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#1a71f6] text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {busy ? "Redirecting to payment..." : renewMode ? `Renew — Pay ${fmt(totalPrice)}` : `Pay ${fmt(totalPrice)} — Upgrade Now`}
          </button>
          <p className="text-center text-[11px] text-neutral-400 mt-2">
            VAT included. You will be redirected to Paystack to complete payment securely.
          </p>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Downgrade Modal (multi-step wizard) ───────────────────────────────────────
const ROLE_LABELS = {
  attendant: "Attendants", cashier: "Cashiers",
  accountant: "Accountants", supervisor: "Supervisors", manager: "Managers",
};

function DowngradeModal({ onClose, currentPlanSlug, downgradablePlans, onScheduled }) {
  const [step, setStep]               = useState("select");   // select | checking | conflict | confirm | success
  const [selectedSlug, setSelectedSlug] = useState(downgradablePlans[0]?.slug || "");
  const [checkResult, setCheckResult] = useState(null);
  const [scheduling, setScheduling]   = useState(false);
  const [err, setErr]                 = useState(null);

  const selectedPlan = downgradablePlans.find(p => p.slug === selectedSlug);

  async function handleCheck() {
    setStep("checking");
    setErr(null);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res   = await fetch(`${API}/api/payments/downgrade/check?targetPlan=${selectedSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");
      setCheckResult(data.data);
      setStep(data.data.canDowngrade ? "confirm" : "conflict");
    } catch (e) {
      setErr(e.message);
      setStep("select");
    }
  }

  async function handleSchedule() {
    setScheduling(true);
    setErr(null);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res   = await fetch(`${API}/api/payments/downgrade/schedule`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ targetPlan: selectedSlug }),
      });
      const data  = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule");
      setStep("success");
      onScheduled(data.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setScheduling(false);
    }
  }

  const slideVariants = {
    enter:  { x: 40, opacity: 0 },
    center: { x: 0,  opacity: 1 },
    exit:   { x: -40, opacity: 0 },
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <ModalBackdrop onClose={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{    scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ChevronDown size={18} className="text-amber-500" />
            <h3 className="text-base font-semibold text-gray-800">
              {step === "success" ? "Downgrade Scheduled" : "Downgrade Plan"}
            </h3>
          </div>
          {step !== "checking" && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {step !== "success" && (
          <div className="px-6 pt-4 flex items-center gap-1.5">
            {["select", "checking", step === "conflict" ? "conflict" : "confirm"].map((s, i) => {
              const active = (step === "checking" && i <= 1) || (["confirm","conflict"].includes(step) && i <= 2) || (step === "select" && i === 0);
              return (
                <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-500 ${active ? "bg-amber-400" : "bg-gray-100"}`} />
              );
            })}
          </div>
        )}

        {/* Body — animated step content */}
        <div className="overflow-hidden min-h-[280px]">
          <AnimatePresence mode="wait">

            {/* STEP: Select plan */}
            {step === "select" && (
              <motion.div key="select" variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }} className="p-6 flex flex-col gap-4">
                <p className="text-sm text-gray-500">Select a plan to move down to. Your current features remain active until the end of your billing period.</p>
                {err && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">{err}</div>
                )}
                <div className="flex flex-col gap-2">
                  {downgradablePlans.map(plan => (
                    <button key={plan.slug} onClick={() => setSelectedSlug(plan.slug)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                        selectedSlug === plan.slug
                          ? "border-amber-400 bg-amber-50"
                          : "border-gray-100 hover:border-gray-300 bg-white"
                      }`}>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{plan.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">₦{(plan.monthlyPrice || 0).toLocaleString()}/mo · ₦{(plan.yearlyPrice || 0).toLocaleString()}/yr</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedSlug === plan.slug ? "border-amber-400 bg-amber-400" : "border-gray-300"
                      }`}>
                        {selectedSlug === plan.slug && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={handleCheck} disabled={!selectedSlug}
                  className="mt-1 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  Check Compatibility →
                </button>
              </motion.div>
            )}

            {/* STEP: Checking */}
            {step === "checking" && (
              <motion.div key="checking" variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="p-6 flex flex-col items-center justify-center gap-4 min-h-[280px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-100 border-t-amber-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ArrowDownCircle size={22} className="text-amber-400" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700">Checking your current usage…</p>
                <p className="text-xs text-gray-400 text-center">Comparing staff counts and limits against {selectedPlan?.name}</p>
              </motion.div>
            )}

            {/* STEP: Conflict */}
            {step === "conflict" && checkResult && (
              <motion.div key="conflict" variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Cannot downgrade yet</p>
                    <p className="text-xs text-red-500 mt-0.5">Resolve the issues below before switching to {checkResult.targetPlan?.name}.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {checkResult.conflicts.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between bg-white border border-red-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                          <Users size={14} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{ROLE_LABELS[c.role] || c.role}</p>
                          <p className="text-xs text-gray-400">{c.current} active · {c.allowed} allowed</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                        Remove {c.excess}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setStep("select")}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    ← Change Plan
                  </button>
                  <button onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition-colors">
                    Resolve & Come Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: Confirm */}
            {step === "confirm" && checkResult && (
              <motion.div key="confirm" variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="p-6 flex flex-col gap-4">
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Good to go!</p>
                    <p className="text-xs text-green-600 mt-0.5">Your usage fits within {checkResult.targetPlan?.name} limits.</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 border border-gray-100 overflow-hidden">
                  {[
                    ["Downgrading to",    checkResult.targetPlan?.name],
                    ["Effective date",    fmtDate(checkResult.effectiveDate)],
                    ["Current features", "Remain active until then"],
                    ["Refund",           "No refund — unused days applied as credit"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-xs font-semibold text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
                {err && <p className="text-xs text-red-500 text-center">{err}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setStep("select")}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    ← Change Plan
                  </button>
                  <button onClick={handleSchedule} disabled={scheduling}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                    {scheduling ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                    {scheduling ? "Scheduling…" : "Confirm Downgrade"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: Success */}
            {step === "success" && checkResult && (
              <motion.div key="success" variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }} className="p-6 flex flex-col items-center gap-5 py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-green-500" />
                </motion.div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 mb-1">Downgrade Scheduled</p>
                  <p className="text-sm text-gray-500">
                    Your plan will change to <strong>{checkResult.targetPlan?.name}</strong> on{" "}
                    <strong>{fmtDate(checkResult.effectiveDate)}</strong>.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Your current plan remains fully active until then.</p>
                </div>
                <button onClick={onClose}
                  className="px-8 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold transition-colors">
                  Done
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </ModalBackdrop>
  );
}

function CancelPlanModal({ onClose, planName }) {
  const subject = encodeURIComponent("Subscription Cancellation Request");
  const body    = encodeURIComponent(
    `Hi FuelDesk Support,\n\nI would like to cancel my ${planName || "current"} subscription.\n\nPlease process this request at the end of my current billing period.\n\nThank you.`
  );
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">Cancel Subscription</h3>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            To cancel your subscription, please contact our support team. Your plan will remain active until the end of the current billing period.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={`mailto:info@fueldesks.com?subject=${subject}&body=${body}`}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-[2px] border-red-400 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-center"
          >
            Email Support to Cancel
          </a>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1a71f6] text-sm text-white font-semibold hover:bg-blue-700 transition-colors">
            Keep My Plan
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useThemePersistence();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && theme === "dark";

  // Plan
  const [planData, setPlanData]   = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [allPlans, setAllPlans]   = useState([]);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [twoFASaving, setTwoFASaving] = useState(false);

  // Sessions — only the current device (multi-device tracking needs backend sessions)
  const [sessions] = useState(() => [{
    id: 1,
    device: detectDevice(),
    ip: "—",
    lastActive: "Just now",
    current: true,
  }]);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    shiftCompletionAlerts: false,
    unauthorizedAccessAlerts: true,
  });
  const [savingNotif, setSavingNotif] = useState(null);

  // Billing
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal]     = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal]       = useState(false);
  const [planCancelled, setPlanCancelled]           = useState(false);
  const [taxRate, setTaxRate]                       = useState(0.075); // NG VAT; refreshed from public settings

  const { activities, fetchActivity } = useActivityFeedStore();

  useEffect(() => {
    setMounted(true);
    fetchActivity();
    fetchPlan();

    try {
      const saved = localStorage.getItem("notifPrefs");
      if (saved) setNotifPrefs(JSON.parse(saved));
    } catch {}
  }, [fetchActivity]);

  // Live VAT rate so the upgrade modal shows the same total Paystack will charge.
  useEffect(() => {
    fetch(`${API}/api/public/settings`)
      .then((r) => r.json())
      .then((d) => {
        const ng = d?.data?.taxRates?.NG;
        if (typeof ng === "number") setTaxRate(ng);
      })
      .catch(() => {});
  }, []);

  const loginHistory = activities.filter(isLoginActivity).slice(0, 5);

  // ── Data fetching ───────────────────────────────────────────────

  async function fetchPlan() {
    setPlanLoading(true);
    setBillingLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [planRes, histRes, plansRes] = await Promise.all([
        fetch(`${API}/api/payments/current-plan`, { headers }),
        fetch(`${API}/api/payments/history`, { headers }),
        fetch(`${API}/api/public/plans`),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setAllPlans(plansData.plans || []);
      }
      if (planRes.ok) {
        const data = await planRes.json();
        setPlanData(data.data);
        if (data.data?.planStatus === "cancelled") setPlanCancelled(true);
      }
      if (histRes.ok) {
        const histData = await histRes.json();
        setBillingHistory(
          (histData.data || []).map((p) => ({
            id: p.id,
            date: p.date
              ? new Date(p.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
              : "—",
            amount: `₦${(p.amount || 0).toLocaleString()}`,
            status: "Paid",
            planName: p.planName || "—",
            billingCycle: p.billingCycle || "monthly",
          }))
        );
      }
    } catch {}
    finally { setPlanLoading(false); setBillingLoading(false); }
  }

  // ── Handlers ────────────────────────────────────────────────────

  function handleThemeToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  function handle2FAToggle() {
    twoFAEnabled ? setShowDisableModal(true) : setShowEnableModal(true);
  }

  async function confirm2FAEnable() {
    setTwoFASaving(true);
    try {
      const user = getUser();
      const userId = user.id || user._id;
      const res = await fetch(`${API}/api/auth/update-staff/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ twoFactorAuthEnabled: true }),
      });
      if (!res.ok) throw new Error("Failed");
      setTwoFAEnabled(true);
      setShowEnableModal(false);
      toast.success("2FA enabled successfully");
    } catch {
      toast.error("Failed to enable 2FA. Please try again.");
      setShowEnableModal(false);
    } finally { setTwoFASaving(false); }
  }

  async function confirm2FADisable() {
    setTwoFASaving(true);
    try {
      const user = getUser();
      const userId = user.id || user._id;
      const res = await fetch(`${API}/api/auth/update-staff/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ twoFactorAuthEnabled: false }),
      });
      if (!res.ok) throw new Error("Failed");
      setTwoFAEnabled(false);
      setShowDisableModal(false);
      toast.success("2FA disabled");
    } catch {
      toast.error("Failed to disable 2FA. Please try again.");
      setShowDisableModal(false);
    } finally { setTwoFASaving(false); }
  }

  async function handleNotifToggle(key, backendField) {
    const prev = { ...notifPrefs };
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem("notifPrefs", JSON.stringify(next));
    setSavingNotif(key);
    try {
      const user = getUser();
      const userId = user.id || user._id;
      const res = await fetch(`${API}/api/staff/${userId}/notification-preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ [backendField]: next[key] }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Preferences saved");
    } catch {
      setNotifPrefs(prev);
      localStorage.setItem("notifPrefs", JSON.stringify(prev));
      toast.error("Failed to save preferences. Please try again.");
    } finally { setSavingNotif(null); }
  }

  function handleLogoutOthers() {
    setSessions((prev) => prev.filter((s) => s.current));
    toast.success("Other sessions logged out");
  }

  async function handleUpgrade(planSlug, billingCycle, expectedTotal) {
    const res = await fetch(`${API}/api/payments/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ planSlug, billingCycle, country: "NG", expectedTotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      // Price changed since the modal rendered — pull the fresh plan prices so
      // the modal re-renders with the new amount, then surface the message.
      if (res.status === 409 && data.priceChanged) {
        fetchPlan();
        if (typeof data.pricing?.taxRate === "number") setTaxRate(data.pricing.taxRate);
      }
      throw new Error(data.error || "Failed to initialise payment");
    }
    window.location.href = data.data.authorizationUrl;
  }

  // ── Plan display values ─────────────────────────────────────────
  const planSlug     = planData?.plan || "free";
  const planName     = planData?.planName || PLAN_SLUGS[planSlug] || "Free Plan";
  const planStatus   = planData?.planStatus || "active";
  const billingCycle = planData?.billingCycle || null;

  // Plans ranked above current (by order field from DB); exclude free plan
  const paidPlans      = allPlans.filter(p => p.slug !== "free");
  const currentOrder   = allPlans.find(p => p.slug === planSlug)?.order ?? -1;
  const upgradablePlans = paidPlans.filter(p => p.order > currentOrder);
  const isHighestPlan  = paidPlans.length > 0 && upgradablePlans.length === 0 && planSlug !== "free";
  // In renew mode show only the current plan; in upgrade mode show plans above current
  const modalPlans      = isHighestPlan
    ? allPlans.filter(p => p.slug === planSlug)
    : upgradablePlans;
  const downgradablePlans = paidPlans.filter(p => p.order < currentOrder);

  // Pending downgrade state from API
  const hasPendingDowngrade  = planData?.pendingDowngrade    || false;
  const pendingDowngradeTo   = planData?.pendingDowngradeTo  || null;
  const downgradeAt          = planData?.downgradeAt         || null;
  const pendingPlanName      = allPlans.find(p => p.slug === pendingDowngradeTo)?.name || pendingDowngradeTo;

  async function handleCancelDowngrade() {
    try {
      const res = await fetch(`${API}/api/payments/downgrade/cancel`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Pending downgrade cancelled");
      fetchPlan();
    } catch {
      toast.error("Could not cancel downgrade. Try again.");
    }
  }

  // Build price string from API prices, falling back gracefully
  const buildPriceLabel = () => {
    if (planSlug === "free") return "Free";
    if (!planData?.monthlyPrice && !planData?.yearlyPrice) return planName;
    if (billingCycle === "yearly" && planData?.yearlyPrice) {
      return `₦${planData.yearlyPrice.toLocaleString()} / year`;
    }
    if (planData?.monthlyPrice) {
      return `₦${planData.monthlyPrice.toLocaleString()} / month`;
    }
    return planName;
  };
  const planPrice = buildPriceLabel();

  const fmtDate = (raw) => raw
    ? new Date(raw).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const planStart  = fmtDate(planData?.planStartDate);
  const planExpiry = fmtDate(planData?.planExpiryDate);
  const daysLeft   = planData?.daysRemaining ?? null;
  const isFree     = planSlug === "free";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-4 px-3 sm:px-4">

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage your preferences, security, and subscription</p>
        </div>

        {/* ── APPEARANCE ── */}
        <SectionCard>
          <SectionHeader icon={<Palette size={18} />} title="Appearance" subtitle="Customize how the dashboard looks" accent="#1a71f6" />
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-indigo-950" : "bg-amber-50"}`}>
                {isDark ? <Moon size={18} className="text-indigo-300" /> : <Sun size={18} className="text-amber-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Theme Mode</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {mounted ? (isDark ? "Dark mode is on" : "Light mode is on") : "Light mode is on"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-neutral-500 hidden sm:block">{isDark ? "Dark" : "Light"}</span>
              <Toggle enabled={isDark} onToggle={handleThemeToggle} colorOn="#1a71f6" />
            </div>
          </div>
        </SectionCard>

        {/* ── NOTIFICATIONS ── */}
        <SectionCard>
          <SectionHeader icon={<Bell size={18} />} title="Notifications" subtitle="Choose which alerts you want to receive" accent="#7f27ff" />
          {NOTIF_KEYS.map(({ key, label, desc, backendField }) => (
            <ToggleRow
              key={key}
              label={label}
              hint={desc}
              enabled={notifPrefs[key]}
              onToggle={() => handleNotifToggle(key, backendField)}
              busy={savingNotif === key}
            />
          ))}
        </SectionCard>

        {/* ── FUEL YIELD FACTOR (STATION LITRE) ── */}
        <FuelYieldFactorSection />

        {/* ── SECURITY ── */}
        <SectionCard>
          <SectionHeader icon={<Shield size={18} />} title="Security" subtitle="Manage your account security settings" accent="#04910c" />

          {/* 2FA */}
          <div className="px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {twoFAEnabled ? "2FA is active on your account" : "Add an extra layer of security"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {twoFASaving && <Loader2 size={14} className="animate-spin text-gray-400" />}
                {twoFAEnabled && !twoFASaving && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full hidden sm:block">Enabled</span>
                )}
                <Toggle enabled={twoFAEnabled} onToggle={handle2FAToggle} busy={twoFASaving} />
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="px-5 py-4 border-b border-neutral-100">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Active Sessions</p>
                <p className="text-xs text-neutral-400 mt-0.5">Devices currently signed in</p>
              </div>
              {sessions.length > 1 && (
                <button onClick={handleLogoutOthers} className="cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut size={12} />
                  <span className="hidden sm:block">Logout others</span>
                  <span className="sm:hidden">Logout</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    {session.device.toLowerCase().includes("iphone") || session.device.toLowerCase().includes("android")
                      ? <Smartphone size={15} className="text-[#1a71f6]" />
                      : <Monitor size={15} className="text-[#1a71f6]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 truncate">{session.device}</p>
                      {session.current && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{session.ip} · {session.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login History */}
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Login History</p>
            <p className="text-xs text-neutral-400 mb-3">Last 5 login attempts</p>
            {loginHistory.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-5 text-center">
                <p className="text-sm text-neutral-400">No login activity found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {loginHistory.map((item) => {
                  const failed = item.type === "alert" || item.title?.toLowerCase().includes("fail");
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {failed
                          ? <XCircle size={16} className="text-red-500 shrink-0" />
                          : <CheckCircle size={16} className="text-green-600 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-neutral-400 truncate">{item.description}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${failed ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                          {failed ? "Failed" : "Success"}
                        </span>
                        <p className="text-[10px] text-neutral-400 mt-1">{relativeTime(item.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── SUBSCRIPTION & BILLING ── */}
        <SectionCard>
          <SectionHeader icon={<Receipt size={18} />} title="Subscription & Billing" subtitle="Manage your plan and payment history" accent="#e27d00" />

          {/* Current plan card */}
          <div className="px-5 py-4 border-b border-neutral-100">
            {planLoading ? (
              <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
            ) : (
              <div className={`rounded-2xl p-5 text-white relative overflow-hidden ${isFree ? "bg-gradient-to-r from-gray-600 to-gray-700" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -right-2 w-32 h-32 bg-white/5 rounded-full" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={18} className={isFree ? "text-gray-300" : "text-blue-200"} />
                      <span className={`text-sm font-medium ${isFree ? "text-gray-300" : "text-blue-100"}`}>Current Plan</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{planName}</h3>
                    <p className={`text-sm ${isFree ? "text-gray-300" : "text-blue-200"}`}>{planPrice}</p>
                    {!isFree && planStart && (
                      <p className="text-xs mt-1 text-blue-200/70">
                        Started: {planStart}
                      </p>
                    )}
                    {!isFree && planExpiry && (
                      <p className={`text-xs mt-0.5 ${daysLeft !== null && daysLeft <= 7 ? "text-red-300 font-semibold" : "text-blue-300"}`}>
                        Expires: {planExpiry}{daysLeft !== null && daysLeft <= 7 ? ` — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : ""}
                      </p>
                    )}
                    {isFree && (
                      <p className="text-xs mt-1 text-gray-400">Upgrade to unlock more features</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {planCancelled ? (
                      <span className="text-xs bg-red-500/30 text-red-200 font-semibold px-3 py-1 rounded-full border border-red-400/40">Cancelling</span>
                    ) : (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        planStatus === "active"
                          ? "bg-green-500/30 text-green-200 border-green-400/40"
                          : "bg-red-500/30 text-red-200 border-red-400/40"
                      }`}>
                        {planStatus === "active" ? "Active" : planStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pending downgrade banner */}
            <AnimatePresence>
              {hasPendingDowngrade && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800">
                      Downgrade to <span className="font-bold">{pendingPlanName}</span> scheduled
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Effective {downgradeAt ? new Date(downgradeAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <button onClick={handleCancelDowngrade}
                    className="shrink-0 text-xs font-semibold text-amber-700 hover:text-red-600 border border-amber-300 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors">
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                disabled={modalPlans.length === 0}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a71f6] text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={15} />
                {isFree ? "Upgrade Plan" : isHighestPlan ? "Renew Plan" : "Upgrade Plan"}
              </button>
              {!isFree && !hasPendingDowngrade && downgradablePlans.length > 0 && (
                <button onClick={() => setShowDowngradeModal(true)}
                  className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-amber-300 text-amber-600 text-sm font-semibold hover:bg-amber-50 transition-colors">
                  <ChevronDown size={15} />
                  Downgrade Plan
                </button>
              )}
              {!planCancelled && !isFree && (
                <button onClick={() => setShowCancelModal(true)} className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
                  <X size={15} />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Billing history */}
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Billing History</p>
            {billingLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />)}
              </div>
            ) : billingHistory.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 px-4 py-6 text-center">
                <p className="text-sm text-neutral-400">No billing history available for this station.</p>
                {isFree && <p className="text-xs text-neutral-300 mt-1">Billing records will appear here after your first payment.</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="grid grid-cols-3 sm:grid-cols-4 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  <span>Date</span><span>Amount</span><span>Status</span><span className="hidden sm:block text-right">Plan</span>
                </div>
                {billingHistory.map((row, i) => (
                  <div key={row.id} className={`grid grid-cols-3 sm:grid-cols-4 items-center px-4 py-3 text-sm ${i < billingHistory.length - 1 ? "border-b border-neutral-100" : ""}`}>
                    <span className="text-gray-700 font-medium text-xs sm:text-sm">{row.date}</span>
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm">{row.amount}</span>
                    <span><span className="text-[10px] sm:text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">{row.status}</span></span>
                    <span className="hidden sm:block text-right text-xs text-gray-500">
                      {row.planName}{row.billingCycle ? ` · ${row.billingCycle === "yearly" ? "Annual" : "Monthly"}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Modals ── */}
      {showEnableModal && (
        <TwoFAEnableModal
          saving={twoFASaving}
          onConfirm={confirm2FAEnable}
          onClose={() => setShowEnableModal(false)}
        />
      )}
      {showDisableModal && (
        <TwoFADisableModal
          saving={twoFASaving}
          onConfirm={confirm2FADisable}
          onClose={() => setShowDisableModal(false)}
        />
      )}
      {showUpgradeModal && modalPlans.length > 0 && (
        <UpgradeModal
          currentPlanSlug={planSlug}
          availablePlans={modalPlans}
          renewMode={isHighestPlan}
          taxRate={taxRate}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
      {showDowngradeModal && downgradablePlans.length > 0 && (
        <DowngradeModal
          currentPlanSlug={planSlug}
          downgradablePlans={downgradablePlans}
          onClose={() => setShowDowngradeModal(false)}
          onScheduled={() => { setShowDowngradeModal(false); fetchPlan(); }}
        />
      )}
      {showCancelModal && (
        <CancelPlanModal
          planName={planName}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </DashboardLayout>
  );
}

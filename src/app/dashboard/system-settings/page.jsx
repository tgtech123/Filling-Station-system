"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useThemePersistence from "@/hooks/useThemePersistence";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  Palette, Shield, Bell, Receipt, Sun, Moon, Smartphone,
  Monitor, LogOut, X, CheckCircle, XCircle, CreditCard,
  Zap, Download,
} from "lucide-react";
import useActivityFeedStore from "@/store/useActivityFeedStore";

// ── Constants ─────────────────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  { id: 1, device: "Chrome on Windows", ip: "102.88.34.21", lastActive: "Just now", current: true },
  { id: 2, device: "Safari on iPhone",  ip: "197.211.58.44", lastActive: "2 hrs ago",  current: false },
  { id: 3, device: "Firefox on MacOS",  ip: "41.58.100.12",  lastActive: "Yesterday",  current: false },
];

const BILLING_HISTORY = [
  { id: 1, date: "Apr 1, 2026",  amount: "₦14,900", status: "Paid" },
  { id: 2, date: "Mar 1, 2026",  amount: "₦14,900", status: "Paid" },
  { id: 3, date: "Feb 1, 2026",  amount: "₦14,900", status: "Paid" },
];

const LOGIN_KEYWORDS = ["logged in", "login", "failed login", "sign in"];

const NOTIF_KEYS = [
  {
    key: "emailNotifications",
    label: "Email Notifications",
    desc: "Receive updates and alerts via email",
  },
  {
    key: "lowStockAlerts",
    label: "Low Stock Alerts",
    desc: "Get notified when fuel or lubricant stock drops below threshold",
  },
  {
    key: "shiftCompletionAlerts",
    label: "Shift Completion Alerts",
    desc: "Get notified when an attendant completes a shift",
  },
  {
    key: "unauthorizedAccessAlerts",
    label: "Unauthorized Access Alerts",
    desc: "Get notified of failed login attempts and suspicious activity",
  },
];

// ── Small helpers ─────────────────────────────────────────────────────────────

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

// ── Shared UI primitives ──────────────────────────────────────────────────────

function SectionCard({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 w-full p-10 shadow-sm overflow-hidden mb-5">
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, accent = "#1a71f6" }) {
  return (
    <div className="flex items-start gap-3 p-5 pb-4 border-b border-neutral-200">
      <div
        className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{ background: `${accent}18` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Toggle({ enabled, onToggle, colorOn = "#22c55e" }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={enabled}
      className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: enabled ? colorOn : "#d1d5db" }}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function ToggleRow({ label, hint, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-neutral-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{hint}</p>}
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
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

function TwoFAEnableModal({ onConfirm, onClose }) {
  const [code, setCode] = useState("");
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#1a71f6]" />
            <h3 className="text-base font-semibold">Enable 2FA</h3>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-center mb-5">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center text-blue-400 text-xs text-center px-3 leading-relaxed">
            QR Code<br />Placeholder<br /><span className="text-[10px] text-blue-300">scan with auth app</span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mb-3 text-center">Enter the 6-digit code from your authenticator app</p>
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full h-12 text-center text-2xl tracking-[0.5em] border-[2px] border-neutral-300 rounded-xl focus:border-[#1a71f6] outline-none mb-4 font-mono"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-[2px] border-neutral-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            onClick={() => code.length === 6 && onConfirm()}
            disabled={code.length !== 6}
            className="flex-1 py-2.5 rounded-xl bg-[#1a71f6] text-sm text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

function TwoFADisableModal({ onConfirm, onClose }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">Disable 2FA?</h3>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="bg-red-50 rounded-xl p-4 mb-5">
          <p className="text-sm text-red-700 leading-relaxed">Disabling 2FA will make your account less secure. You can re-enable it at any time.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-[2px] border-neutral-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Keep Enabled</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm text-white font-semibold hover:bg-red-700 transition-colors">Disable 2FA</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Billing Modals ────────────────────────────────────────────────────────────

const PRO_FEATURES = ["Up to 5 staff accounts", "Fuel & lubricant tracking", "Sales & cash reports", "Export reports (PDF/CSV)", "Activity logs", "Email support"];
const MAX_FEATURES = ["Unlimited staff accounts", "Everything in Pro", "AI-powered insights", "Custom report builder", "Priority 24/7 support", "Multi-branch support", "API access"];

function UpgradeModal({ onClose }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#1a71f6]" />
            <h3 className="text-base font-semibold">Compare Plans</h3>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          {/* Pro */}
          <div className="rounded-2xl border-[2px] border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-800">Pro Plan</h4>
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Current</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">₦14,900<span className="text-sm font-normal text-neutral-400">/mo</span></p>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
          {/* Max */}
          <div className="rounded-2xl border-[2px] border-[#1a71f6] bg-gradient-to-b from-blue-50 to-white p-5 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-xs bg-[#1a71f6] text-white font-semibold px-2 py-0.5 rounded-full">Recommended</div>
            <h4 className="font-semibold text-gray-800 mb-1">Max Plan</h4>
            <p className="text-2xl font-bold text-[#1a71f6] mb-4">₦29,900<span className="text-sm font-normal text-neutral-400">/mo</span></p>
            <ul className="space-y-2">
              {MAX_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={14} className="text-[#1a71f6] shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#1a71f6] text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            Contact Support to Upgrade
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

function CancelPlanModal({ onConfirm, onClose }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">Cancel Subscription?</h3>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            Are you sure you want to cancel? You will lose access to all Pro features at the end of your current billing period.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1a71f6] text-sm text-white font-semibold hover:bg-blue-700 transition-colors">Keep Plan</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl border-[2px] border-red-400 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">Yes, Cancel</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useThemePersistence();
  const [mounted, setMounted] = useState(false);

  // ── Appearance
  const isDark = mounted && theme === "dark";

  // ── 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  // ── Sessions
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  // ── Notification prefs (persisted to localStorage)
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    shiftCompletionAlerts: false,
    unauthorizedAccessAlerts: true,
  });

  // ── Billing
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [planCancelled, setPlanCancelled] = useState(false);

  // ── Activity feed
  const { activities, fetchActivity } = useActivityFeedStore();

  useEffect(() => {
    setMounted(true);
    fetchActivity();
    try {
      const saved = localStorage.getItem("notifPrefs");
      if (saved) setNotifPrefs(JSON.parse(saved));
    } catch {}
  }, [fetchActivity]);

  const loginHistory = activities.filter(isLoginActivity).slice(0, 5);

  // ── Handlers
  function handleThemeToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  function handle2FAToggle() {
    twoFAEnabled ? setShowDisableModal(true) : setShowEnableModal(true);
  }

  function handleNotifToggle(key) {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notifPrefs", JSON.stringify(next));
      toast.success("Preferences saved");
      return next;
    });
  }

  function handleLogoutOthers() {
    setSessions((prev) => prev.filter((s) => s.current));
    toast.success("Other sessions logged out");
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-6 px-3 lg:px-4">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage your preferences, security, and subscription</p>
        </div>

        {/* ── APPEARANCE ──────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={<Palette size={18} />}
            title="Appearance"
            subtitle="Customize how the dashboard looks"
            accent="#1a71f6"
          />
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-indigo-950" : "bg-amber-50"}`}>
                {isDark
                  ? <Moon size={18} className="text-indigo-300" />
                  : <Sun size={18} className="text-amber-500" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Theme Mode</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {mounted ? (isDark ? "Dark mode is on" : "Light mode is on") : "Light mode is on"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-neutral-500 hidden sm:block">
                {isDark ? "Dark" : "Light"}
              </span>
              <Toggle
                enabled={isDark}
                onToggle={handleThemeToggle}
                colorOn="#1a71f6"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── NOTIFICATIONS ───────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={<Bell size={18} />}
            title="Notifications"
            subtitle="Choose which alerts you want to receive"
            accent="#7f27ff"
          />
          {NOTIF_KEYS.map(({ key, label, desc }) => (
            <ToggleRow
              key={key}
              label={label}
              hint={desc}
              enabled={notifPrefs[key]}
              onToggle={() => handleNotifToggle(key)}
            />
          ))}
        </SectionCard>

        {/* ── SECURITY ────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={<Shield size={18} />}
            title="Security"
            subtitle="Manage your account security settings"
            accent="#04910c"
          />

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
                {twoFAEnabled && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full hidden sm:block">
                    Enabled
                  </span>
                )}
                <Toggle enabled={twoFAEnabled} onToggle={handle2FAToggle} />
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
                <button
                  onClick={handleLogoutOthers}
                  className="cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={12} />
                  <span className="hidden sm:block">Logout others</span>
                  <span className="sm:hidden">Logout</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    {session.device.toLowerCase().includes("iphone") || session.device.toLowerCase().includes("android")
                      ? <Smartphone size={15} className="text-[#1a71f6]" />
                      : <Monitor size={15} className="text-[#1a71f6]" />
                    }
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
              <div className="bg-gray-50 rounded-xl px-4 py-5 text-center">
                <p className="text-sm text-neutral-400">No login activity found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {loginHistory.map((item) => {
                  const failed = item.type === "alert" || item.title?.toLowerCase().includes("fail");
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {failed
                          ? <XCircle size={16} className="text-red-500 shrink-0" />
                          : <CheckCircle size={16} className="text-green-600 shrink-0" />
                        }
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

        {/* ── SUBSCRIPTION & BILLING ───────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={<Receipt size={18} />}
            title="Subscription & Billing"
            subtitle="Manage your plan and payment history"
            accent="#e27d00"
          />

          {/* Current plan card */}
          <div className="px-5 py-4 border-b border-neutral-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -right-2 w-32 h-32 bg-white/5 rounded-full" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-blue-200" />
                    <span className="text-sm font-medium text-blue-100">Current Plan</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">Pro Plan</h3>
                  <p className="text-blue-200 text-sm">₦14,900 / month</p>
                  <p className="text-blue-300 text-xs mt-1">Next renewal: May 1, 2026</p>
                </div>
                <div className="shrink-0">
                  {planCancelled ? (
                    <span className="text-xs bg-red-500/30 text-red-200 font-semibold px-3 py-1 rounded-full border border-red-400/40">
                      Cancelling
                    </span>
                  ) : (
                    <span className="text-xs bg-green-500/30 text-green-200 font-semibold px-3 py-1 rounded-full border border-green-400/40">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Plan action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a71f6] text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Zap size={15} />
                Upgrade to Max Plan
              </button>
              {!planCancelled && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  <X size={15} />
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {/* Billing history */}
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Billing History</p>
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>
              {/* Rows */}
              {BILLING_HISTORY.map((row, i) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-4 items-center px-4 py-3 text-sm ${i < BILLING_HISTORY.length - 1 ? "border-b border-neutral-100" : ""}`}
                >
                  <span className="text-gray-700 font-medium text-xs sm:text-sm">{row.date}</span>
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm">{row.amount}</span>
                  <span>
                    <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                      {row.status}
                    </span>
                  </span>
                  <div className="flex justify-end">
                    <button className="cursor-pointer flex items-center gap-1 text-xs font-semibold text-[#1a71f6] hover:text-blue-800 transition-colors">
                      <Download size={13} />
                      <span className="hidden sm:block">Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Modals ── */}
      {showEnableModal && (
        <TwoFAEnableModal
          onConfirm={() => { setTwoFAEnabled(true); setShowEnableModal(false); toast.success("2FA enabled successfully"); }}
          onClose={() => setShowEnableModal(false)}
        />
      )}
      {showDisableModal && (
        <TwoFADisableModal
          onConfirm={() => { setTwoFAEnabled(false); setShowDisableModal(false); toast.success("2FA disabled"); }}
          onClose={() => setShowDisableModal(false)}
        />
      )}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
      {showCancelModal && (
        <CancelPlanModal
          onConfirm={() => { setPlanCancelled(true); setShowCancelModal(false); toast("Subscription cancellation scheduled", { icon: "⚠️" }); }}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </DashboardLayout>
  );
}

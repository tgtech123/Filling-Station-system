"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Star, Save, Loader2, CheckCircle2, AlertCircle, Info, MessageSquare, CreditCard, Zap, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";
import { API_URL } from "@/lib/config";

const PRODUCTS = ["PMS", "AGO", "Kerosene", "Lubricant"];

export default function LoyaltySettingsPage() {
  const { settings, fetchSettings, updateSettings, loading } = useFuelLoyaltyStore();

  const [form, setForm]         = useState(null);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);

  // SMS credits state
  const [smsStatus, setSmsStatus]           = useState(null);
  const [smsLoading, setSmsLoading]         = useState(false);
  const [smsCount, setSmsCount]             = useState(100);
  const [smsInitializing, setSmsInitializing] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        isActive:                settings.isActive,
        pointsPerLitre:          settings.pointsPerLitre,
        litresPerRedemptionPoint: settings.litresPerRedemptionPoint,
        minPointsToRedeem:       settings.minPointsToRedeem,
        pricePerLitre:           { ...settings.pricePerLitre },
      });
    }
  }, [settings]);

  const fetchSmsStatus = async () => {
    setSmsLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/fuel-loyalty/staff/sms-credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSmsStatus(data.data);
    } catch {}
    setSmsLoading(false);
  };

  useEffect(() => { fetchSmsStatus(); }, []);

  // Detect redirect back from Paystack — actively verify and apply credits
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const smsRef = params.get("sms_ref");
    if (!smsRef) return;
    window.history.replaceState({}, "", window.location.pathname);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    fetch(`${API_URL}/api/payments/sms-credits/verify/${smsRef}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          setSmsStatus(data.data);
          setSuccess(`${data.data.credits ? data.data.credits + " SMS" : "SMS"} credits activated successfully!`);
          setTimeout(() => setSuccess(null), 5000);
        } else {
          setError(data.error || "Could not verify payment. Please refresh.");
        }
      })
      .catch(() => setError("Could not verify payment. Please refresh the page."));
  }, []);

  // Instantly save the active toggle — no Save button needed for this field
  const handleToggleActive = async () => {
    const next = !form.isActive;
    setForm(f => ({ ...f, isActive: next }));
    setToggling(true);
    setError(null);
    const result = await updateSettings({ isActive: next });
    setToggling(false);
    if (result.success) {
      setSuccess(next ? "Loyalty program activated" : "Loyalty program deactivated");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setForm(f => ({ ...f, isActive: !next }));
      setError(result.error);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const result = await updateSettings(form);
    setSaving(false);
    if (result.success) {
      setSuccess("Settings saved successfully");
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(result.error);
    }
  };

  const handleSmsPayment = async () => {
    if (smsCount < 1) return;
    setSmsInitializing(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/payments/sms-credits/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerCount: smsCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");
      window.location.href = data.data.authorizationUrl;
    } catch (e) {
      setError(e.message);
      setSmsInitializing(false);
    }
  };

  if (loading.settings && !form) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
    </DashboardLayout>
  );

  // Portal link example
  const stationId = typeof window !== "undefined"
    ? (JSON.parse(localStorage.getItem("user") || "{}").station?._id || "")
    : "";

  const creditsRemaining = smsStatus?.smsCreditBalance ?? 0;
  const smsActive        = smsStatus?.smsLoyaltyEnabled ?? false;
  const lowBalance       = smsActive && creditsRemaining < 20;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/loyalty" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Loyalty Settings</h1>
            <p className="text-sm text-gray-500">Configure points rate and product prices</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {form && (
          <>
            {/* Enable / Disable */}
            <div className={`rounded-2xl border shadow-sm p-5 mb-4 transition-colors ${form.isActive ? "bg-purple-50 border-purple-200" : "bg-white border-gray-100"}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-700">Program Status</p>
                  <p className={`text-xs mt-0.5 font-medium ${form.isActive ? "text-purple-600" : "text-red-500"}`}>
                    {toggling
                      ? "Saving..."
                      : form.isActive
                        ? "Active — customers are earning points"
                        : "Inactive — toggle ON to activate"}
                  </p>
                </div>
                <button
                  onClick={handleToggleActive}
                  disabled={toggling}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 disabled:opacity-70 ${form.isActive ? "bg-purple-600" : "bg-gray-300"}`}
                >
                  {toggling ? (
                    <Loader2 size={14} className="absolute inset-0 m-auto text-white animate-spin" />
                  ) : (
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                  )}
                </button>
              </div>
            </div>

            {/* Points config */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <h2 className="font-bold text-gray-700 mb-4">Points Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Points per Litre</label>
                  <input type="number" value={form.pointsPerLitre}
                    onChange={e => setForm(f => ({ ...f, pointsPerLitre: Number(e.target.value) }))}
                    min="0" step="0.1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  <p className="text-xs text-gray-400 mt-1">Points earned per litre purchased</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Litres per Point (Redeem)</label>
                  <input type="number" value={form.litresPerRedemptionPoint}
                    onChange={e => setForm(f => ({ ...f, litresPerRedemptionPoint: Number(e.target.value) }))}
                    min="0" step="0.01"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  <p className="text-xs text-gray-400 mt-1">Free litres given per point redeemed</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Min Points to Redeem</label>
                  <input type="number" value={form.minPointsToRedeem}
                    onChange={e => setForm(f => ({ ...f, minPointsToRedeem: Number(e.target.value) }))}
                    min="1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>

              <div className="mt-4 bg-purple-50 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-purple-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-purple-700">
                    Example: {form.pointsPerLitre} pt/L means buying 20L earns {(20 * form.pointsPerLitre).toFixed(1)} pts.
                    At {form.litresPerRedemptionPoint} L/pt, {form.minPointsToRedeem} pts redeems for{" "}
                    {(form.minPointsToRedeem * form.litresPerRedemptionPoint).toFixed(1)} L of free fuel.
                  </p>
                </div>
              </div>
            </div>

            {/* Product prices */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <h2 className="font-bold text-gray-700 mb-1">Current Price per Litre</h2>
              <p className="text-xs text-gray-400 mb-4">Used to convert amount (₦) → litres when cashier enters amount. Update when pump prices change.</p>
              <div className="grid grid-cols-2 gap-4">
                {PRODUCTS.map(p => (
                  <div key={p}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{p} (₦/L)</label>
                    <input type="number" value={form.pricePerLitre[p] || ""}
                      onChange={e => setForm(f => ({ ...f, pricePerLitre: { ...f.pricePerLitre, [p]: Number(e.target.value) } }))}
                      min="0" placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Customer portal link */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
              <p className="text-sm font-bold text-blue-700 mb-1">Customer Portal Link</p>
              <p className="text-xs text-gray-500 mb-2">Share this link with customers so they can check their points balance:</p>
              <div className="bg-white rounded-xl border border-blue-200 px-3 py-2 font-mono text-xs text-blue-600 break-all">
                {typeof window !== "undefined" ? window.location.origin : ""}/loyalty?station={stationId}
              </div>
            </div>

            {/* SMS Portal Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={16} className="text-purple-500" />
                <h2 className="font-bold text-gray-700">SMS Portal Notifications</h2>
                {smsActive && (
                  <span className="ml-auto text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">ACTIVE</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Automatically send new customers their loyalty portal link via SMS when enrolled. <strong>₦6 per SMS credit.</strong>
              </p>

              {/* Credit balance badge */}
              {smsLoading ? (
                <div className="flex items-center gap-2 py-2 mb-4">
                  <Loader2 size={14} className="text-gray-400 animate-spin" />
                  <span className="text-xs text-gray-400">Loading credits…</span>
                </div>
              ) : (
                <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 ${
                  !smsActive          ? "bg-gray-50 border border-gray-100" :
                  lowBalance          ? "bg-amber-50 border border-amber-200" :
                                        "bg-green-50 border border-green-200"
                }`}>
                  {lowBalance ? (
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  ) : (
                    <CreditCard size={16} className={smsActive ? "text-green-500 shrink-0" : "text-gray-400 shrink-0"} />
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      {creditsRemaining} SMS credit{creditsRemaining !== 1 ? "s" : ""} remaining
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {!smsActive
                        ? "Purchase credits below to activate SMS notifications"
                        : lowBalance
                        ? "Balance is low — top up to keep notifications running"
                        : "SMS notifications are active and sending"}
                    </p>
                  </div>
                </div>
              )}

              {/* Purchase / top-up form */}
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  {smsActive ? "Top up SMS credits" : "How many customers do you expect?"}
                </label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={smsCount}
                      onChange={e => setSmsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      placeholder="e.g. 200"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    {smsCount > 0 && (
                      <p className="text-xs text-purple-600 font-semibold mt-1">
                        {smsCount} credits × ₦6 = <strong>₦{(smsCount * 6).toLocaleString()}</strong>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSmsPayment}
                    disabled={smsInitializing || smsCount < 1}
                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shrink-0"
                  >
                    {smsInitializing
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Zap size={14} />
                    }
                    {smsActive ? "Top Up" : "Pay & Activate"}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Settings
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

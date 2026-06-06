"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Star, Save, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";
import { API_URL } from "@/lib/config";

const PRODUCTS = ["PMS", "AGO", "Kerosene", "Lubricant"];

export default function LoyaltySettingsPage() {
  const { settings, fetchSettings, updateSettings, loading } = useFuelLoyaltyStore();

  const [form, setForm]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        isActive: settings.isActive,
        pointsPerLitre: settings.pointsPerLitre,
        litresPerRedemptionPoint: settings.litresPerRedemptionPoint,
        minPointsToRedeem: settings.minPointsToRedeem,
        pricePerLitre: { ...settings.pricePerLitre },
      });
    }
  }, [settings]);

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

  if (loading.settings && !form) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
    </DashboardLayout>
  );

  // Portal link example
  const stationId = typeof window !== "undefined"
    ? (JSON.parse(localStorage.getItem("user") || "{}").station?._id || "")
    : "";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-700">Program Status</p>
                  <p className="text-xs text-gray-400 mt-0.5">Enable or disable the loyalty program for this station</p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-purple-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
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

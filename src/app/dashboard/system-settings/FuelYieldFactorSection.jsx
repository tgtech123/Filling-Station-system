"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Gauge, Loader2, Save, ShieldCheck, Info } from "lucide-react";
import useStockReconciliationStore from "@/store/useStockReconciliationStore";
import PumpLinkAuditModal from "@/components/PumpLinkAuditModal";

/**
 * "Station litre" yield factor settings — entered by the manager, never seeded.
 * Station default + optional per-tank overrides, plus a pump-link audit button.
 * Drop into the System Settings page as its own card.
 */
export default function FuelYieldFactorSection() {
  const { settings, settingsLoading, fetchSettings, setStationFactor, setTankFactor } =
    useStockReconciliationStore();

  const [stationInput, setStationInput] = useState("");
  const [savingStation, setSavingStation] = useState(false);
  const [tankInputs, setTankInputs] = useState({}); // tankId → string
  const [savingTank, setSavingTank] = useState(null);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setStationInput(settings.defaultYieldFactor != null ? String(settings.defaultYieldFactor) : "");
      const map = {};
      (settings.tanks || []).forEach((t) => {
        map[t._id] = t.yieldFactor != null ? String(t.yieldFactor) : "";
      });
      setTankInputs(map);
    }
  }, [settings]);

  const validFactor = (v) => {
    const n = Number(v);
    return !isNaN(n) && n >= 0.5 && n <= 1.5;
  };

  async function saveStation() {
    if (!validFactor(stationInput)) {
      toast.error("Enter a factor between 0.50 and 1.50 (e.g. 0.95).");
      return;
    }
    setSavingStation(true);
    try {
      await setStationFactor(Number(stationInput));
      toast.success("Station yield factor saved.");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not save the factor.");
    } finally {
      setSavingStation(false);
    }
  }

  async function saveTank(tankId, clear = false) {
    const raw = tankInputs[tankId];
    if (!clear && !validFactor(raw)) {
      toast.error("Enter a factor between 0.50 and 1.50, or clear it to use the station default.");
      return;
    }
    setSavingTank(tankId);
    try {
      await setTankFactor(tankId, clear ? null : Number(raw));
      toast.success(clear ? "Reverted to station default." : "Tank factor saved.");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not save the tank factor.");
    } finally {
      setSavingTank(null);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border border-neutral-200 w-full shadow-sm overflow-hidden mb-5">
      {/* Header */}
      <div className="flex items-start gap-3 p-5 pb-4 border-b border-neutral-200 dark:border-gray-700">
        <div className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: "#0891b218" }}>
          <Gauge size={18} style={{ color: "#0891b2" }} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold leading-tight dark:text-gray-100">Fuel Yield Factor (Station Litre)</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            The pump-metered litre vs the physical tank litre. Used to reconcile stock and spot excess/shortage.
          </p>
        </div>
      </div>

      {/* Explainer */}
      <div className="mx-5 mt-4 flex items-start gap-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-xl px-4 py-3">
        <Info size={15} className="text-cyan-500 shrink-0 mt-0.5" />
        <p className="text-xs text-cyan-800 dark:text-cyan-200 leading-relaxed">
          Set the factor your station actually measures — e.g. <strong>0.95</strong> means selling 40,000 metered litres
          uses ~38,000 physical litres, leaving ~2,000 in the tank. A tank with its own value overrides the station default.
        </p>
      </div>

      {settingsLoading && !settings ? (
        <div className="flex items-center gap-2 px-5 py-8 text-neutral-400">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* Station default */}
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Station Default</p>
            <p className="text-xs text-neutral-400 mb-3">Applied to every tank that doesn&apos;t set its own factor.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.5"
                inputMode="decimal"
                value={stationInput}
                onChange={(e) => setStationInput(e.target.value)}
                placeholder="e.g. 0.95"
                className="w-32 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2 rounded-lg text-sm"
              />
              <button
                onClick={saveStation}
                disabled={savingStation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a71f6] text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingStation ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
              {settings?.defaultYieldFactor == null && (
                <span className="text-xs text-amber-500 font-medium">Not set yet</span>
              )}
            </div>
          </div>

          {/* Per-tank overrides */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Per-Tank Override</p>
                <p className="text-xs text-neutral-400">Leave blank to use the station default.</p>
              </div>
              <button
                onClick={() => setShowAudit(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1a71f6] border border-[#1a71f6]/40 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <ShieldCheck size={13} />
                Run pump-link audit
              </button>
            </div>

            {(settings?.tanks || []).length === 0 ? (
              <p className="text-sm text-neutral-400">No tanks yet. Add tanks in Product Management first.</p>
            ) : (
              <div className="space-y-2">
                {settings.tanks.map((t) => {
                  const usingDefault = t.yieldFactor == null;
                  return (
                    <div
                      key={t._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-gray-700 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{t.title}</p>
                        <p className="text-xs text-neutral-400">
                          {t.fuelType} ·{" "}
                          {usingDefault ? (
                            <span>
                              using default{" "}
                              <strong>{t.effectiveFactor != null ? t.effectiveFactor : "—"}</strong>
                            </span>
                          ) : (
                            <span className="text-cyan-600">own factor {t.yieldFactor}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.5"
                          max="1.5"
                          inputMode="decimal"
                          value={tankInputs[t._id] ?? ""}
                          onChange={(e) => setTankInputs((m) => ({ ...m, [t._id]: e.target.value }))}
                          placeholder={settings.defaultYieldFactor != null ? String(settings.defaultYieldFactor) : "e.g. 0.96"}
                          className="w-24 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-1.5 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => saveTank(t._id)}
                          disabled={savingTank === t._id}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-600 text-white text-xs font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
                        >
                          {savingTank === t._id ? "…" : "Save"}
                        </button>
                        {!usingDefault && (
                          <button
                            onClick={() => saveTank(t._id, true)}
                            disabled={savingTank === t._id}
                            className="px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-gray-600 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title="Revert to station default"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showAudit && <PumpLinkAuditModal onClose={() => setShowAudit(false)} />}
    </div>
  );
}

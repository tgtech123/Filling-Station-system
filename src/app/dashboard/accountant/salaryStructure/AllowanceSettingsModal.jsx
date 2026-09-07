"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Plus, Lock, Info } from "lucide-react";
import useSalaryStore from "@/store/useSalaryStore";

/**
 * Which allowances this station pays, and which count toward pension.
 *
 * ── The one thing that is not configurable ───────────────────────────────────
 * Housing and transport are locked on and locked pensionable. The Pension
 * Reform Act 2014 defines monthly emolument as whatever the contract says but
 * never less than basic + housing + transport, so a station that could exclude
 * them could configure itself below the statutory minimum — and would only find
 * out when PenCom asked for the arrears. The server enforces this too; the lock
 * here is so nobody wastes time trying.
 *
 * Everything else is a genuine choice, because the Act defers to the contract
 * for anything above that floor.
 */
export default function AllowanceSettingsModal({ onClose, onSaved }) {
  const { allowanceSettings, fetchAllowanceSettings, updateAllowanceSettings, loading } =
    useSalaryStore();

  const [enabled, setEnabled] = useState(false);
  const [types, setTypes] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllowanceSettings?.();
  }, [fetchAllowanceSettings]);

  useEffect(() => {
    if (!allowanceSettings) return;
    setEnabled(allowanceSettings.enabled === true);
    setTypes((allowanceSettings.types || []).map((t) => ({ ...t })));
  }, [allowanceSettings]);

  const patch = (key, field, value) =>
    setTypes((prev) =>
      prev.map((t) => (t.key === key ? { ...t, [field]: value } : t))
    );

  const addCustom = () => {
    const label = newLabel.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!key || types.some((t) => t.key === key)) {
      setError("That allowance already exists.");
      return;
    }
    setError("");
    setTypes((prev) => [
      ...prev,
      { key, label, pensionable: false, statutory: false, active: true, order: prev.length + 1 },
    ]);
    setNewLabel("");
  };

  const save = async () => {
    setError("");
    try {
      await updateAllowanceSettings({
        enabled,
        types: types.map((t) => ({
          key: t.key,
          label: t.label,
          pensionable: t.pensionable,
          active: t.active,
        })),
      });
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not save allowance settings.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Allowance settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              What this station pays on top of basic salary, and what pension is charged on.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Master switch */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#1a71f6]"
            />
            <span>
              <span className="block font-semibold text-sm text-gray-900 dark:text-gray-100">
                Use allowances in payroll
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Off means every staff member is paid a single basic salary and pension is charged on
                that alone — exactly how payroll worked before. Turning it on adds an allowances
                column and charges pension on basic plus the pensionable allowances.
              </span>
            </span>
          </label>
        </div>

        {/* Catalogue */}
        <div className="p-5 space-y-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center pb-1 text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
            <span>Allowance</span>
            <span className="text-center w-16">In use</span>
            <span className="text-center w-20">Pensionable</span>
          </div>

          {types.map((t) => (
            <div
              key={t.key}
              className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-1.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0"
            >
              <span className="text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5 min-w-0">
                <span className="truncate">{t.label}</span>
                {t.statutory && (
                  <span
                    title="Required in the pension base by the Pension Reform Act 2014"
                    className="shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  >
                    <Lock size={9} /> required
                  </span>
                )}
              </span>

              <span className="w-16 text-center">
                <input
                  type="checkbox"
                  checked={t.active}
                  disabled={t.statutory}
                  onChange={(e) => patch(t.key, "active", e.target.checked)}
                  className="w-4 h-4 accent-[#1a71f6] disabled:opacity-50"
                />
              </span>

              <span className="w-20 text-center">
                <input
                  type="checkbox"
                  checked={t.pensionable}
                  disabled={t.statutory}
                  onChange={(e) => patch(t.key, "pensionable", e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 disabled:opacity-50"
                />
              </span>
            </div>
          ))}

          {/* A station may pay something this catalogue never anticipated. */}
          <div className="flex gap-2 pt-3">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Add another allowance…"
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={addCustom}
              className="px-3 py-2 rounded-lg border-2 border-[#1a71f6] text-[#1a71f6] text-sm font-semibold flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        <p className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-400 flex gap-2">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>
            Housing and transport cannot be switched off or excluded from pension — the Pension
            Reform Act 2014 puts them in the base. Mark another allowance pensionable only if your
            employment contracts define it as part of monthly emolument.
          </span>
        </p>

        {error && <p className="px-5 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="p-5 pt-0 flex gap-2">
          <button
            onClick={save}
            disabled={loading?.allowances}
            className="flex-1 py-3 rounded-xl bg-[#1a71f6] text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading?.allowances && <Loader2 size={15} className="animate-spin" />}
            Save settings
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

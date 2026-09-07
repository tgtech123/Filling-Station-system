"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Loader2, ShieldCheck, Info } from "lucide-react";
import useSalaryStore from "@/store/useSalaryStore";
import { EMPLOYEE_PENSION_RATE, EMPLOYER_PENSION_RATE } from "./payrollMath";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

/**
 * What one staff member is paid under each allowance.
 *
 * Saved against the STAFF record, not this month's payroll — so it prefills
 * every month from here on rather than being retyped, exactly the way basic
 * salary already behaves. The open draft picks the new figures up as soon as
 * payroll is reloaded.
 *
 * The pension consequence is shown live, because that is the reason the screen
 * exists: an allowance marked pensionable moves what the station owes the PFA,
 * and the accountant should see it move before they save rather than discover
 * it in the remittance.
 */
export default function AllowanceModal({ entry, onClose, onSaved }) {
  const { allowanceTypes, allowanceSettings, saveStaffAllowances, loading } = useSalaryStore();

  const active = useMemo(
    () => (allowanceTypes || []).filter((t) => t.active).sort((a, b) => a.order - b.order),
    [allowanceTypes]
  );

  // Prefilled from what this month's row already carries; anything not yet set
  // starts blank rather than at a presumptuous zero.
  const [amounts, setAmounts] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const seed = {};
    for (const a of entry?.allowances || []) seed[a.key] = a.amount;
    setAmounts(seed);
  }, [entry]);

  const basic = Number(entry?.basicSalary) || 0;

  const totals = useMemo(() => {
    let total = 0;
    let pensionable = 0;
    for (const t of active) {
      const v = Number(amounts[t.key]) || 0;
      if (v <= 0) continue;
      total += v;
      if (t.pensionable) pensionable += v;
    }
    const base = basic + pensionable;
    return {
      total,
      pensionable,
      base,
      employee: Math.round(base * EMPLOYEE_PENSION_RATE),
      employer: Math.round(base * EMPLOYER_PENSION_RATE),
    };
  }, [amounts, active, basic]);

  const disabled = allowanceSettings && allowanceSettings.enabled === false;

  const save = async () => {
    setError("");
    const payload = active
      .map((t) => ({ key: t.key, amount: Number(amounts[t.key]) || 0 }))
      .filter((a) => a.amount > 0);
    try {
      const res = await saveStaffAllowances(entry.staff, payload);
      onSaved?.(res);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not save the allowances.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Allowances</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {entry?.firstName} {entry?.lastName} · basic {fmt(basic)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        {disabled ? (
          <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
            Allowances are switched off for this station. Turn them on in payroll settings before
            entering any figures.
          </div>
        ) : (
          <>
            <div className="p-5 space-y-3">
              {active.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No allowances are switched on yet. Enable the ones this station pays in payroll
                  settings.
                </p>
              )}

              {active.map((t) => (
                <div key={t.key} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-100 block truncate">
                      {t.label}
                    </label>
                    <span
                      className={`text-[11px] ${
                        t.pensionable
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {t.pensionable ? "Counts toward pension" : "Not pensionable"}
                      {t.statutory ? " · required by law" : ""}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={amounts[t.key] ?? ""}
                    placeholder="0"
                    onChange={(e) =>
                      setAmounts((a) => ({ ...a, [t.key]: e.target.value }))
                    }
                    className="w-32 shrink-0 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
              ))}
            </div>

            {/* The reason the screen exists — what this does to the remittance. */}
            <div className="mx-5 mb-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-4 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={15} className="text-blue-600 dark:text-blue-300" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Pension base (monthly emolument)
                </span>
              </div>
              <div className="space-y-1 text-gray-700 dark:text-gray-200">
                <div className="flex justify-between">
                  <span>Basic salary</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{fmt(basic)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pensionable allowances</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {fmt(totals.pensionable)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-900 pt-1 mt-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Pension is charged on
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-300">
                    {fmt(totals.base)}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Employee 8% · Employer 10%</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {fmt(totals.employee)} · {fmt(totals.employer)}
                  </span>
                </div>
                {totals.total !== totals.pensionable && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                    {fmt(totals.total - totals.pensionable)} of allowances is paid but sits outside
                    the pension base.
                  </p>
                )}
              </div>
            </div>

            <p className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-400 flex gap-2">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>
                Saved against this staff member, so it prefills every month from now on. Reload
                payroll to see the open draft pick it up.
              </span>
            </p>

            {error && <p className="px-5 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="p-5 pt-0 flex gap-2">
              <button
                onClick={save}
                disabled={loading?.allowances || active.length === 0}
                className="flex-1 py-3 rounded-xl bg-[#1a71f6] text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading?.allowances && <Loader2 size={15} className="animate-spin" />}
                Save allowances
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

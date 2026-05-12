"use client";
import { useState, useEffect } from "react";
import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";

export default function FilterModal({
  onClose,
  suppliers = [],
  paymentMethods = [],
  selectedSuppliers = [],
  selectedPayments = [],
  onApply,
  onReset,
}) {
  const [localSuppliers, setLocalSuppliers] = useState(selectedSuppliers);
  const [localPayments, setLocalPayments]   = useState(selectedPayments);

  useEffect(() => {
    setLocalSuppliers(selectedSuppliers);
    setLocalPayments(selectedPayments);
  }, [selectedSuppliers, selectedPayments]);

  const toggleSupplier = (s) =>
    setLocalSuppliers((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const togglePayment = (p) =>
    setLocalPayments((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const totalSelected = localSuppliers.length + localPayments.length;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <SlidersHorizontal size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">Filter Records</h2>
              {totalSelected > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {totalSelected} filter{totalSelected !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6">

          {/* ── Supplier section ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Supplier
              </h3>
              {localSuppliers.length > 0 && (
                <button
                  onClick={() => setLocalSuppliers([])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {suppliers.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
                No supplier data available
              </p>
            ) : (
              <div className="space-y-1">
                {suppliers.map((s) => {
                  const checked = localSuppliers.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSupplier(s)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        checked
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {checked && <Check size={11} className="text-white" />}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                        {s}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* ── Payment Method section ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment Method
              </h3>
              {localPayments.length > 0 && (
                <button
                  onClick={() => setLocalPayments([])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
                No payment data available
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((p) => {
                  const checked = localPayments.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePayment(p)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-colors ${
                        checked
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {checked && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {p}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sticky footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => { setLocalSuppliers([]); setLocalPayments([]); onReset?.(); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={() => onApply?.(localSuppliers, localPayments)}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Check size={14} />
            Apply{totalSelected > 0 ? ` (${totalSelected})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
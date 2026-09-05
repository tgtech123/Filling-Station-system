"use client";
import React, { useState, useEffect } from "react";
import { Banknote, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import useSalaryStore from "@/store/useSalaryStore";
import { extractApiError } from "@/lib/config";

const BANKS = [
  "Access Bank", "Citibank", "Ecobank", "Fidelity Bank", "First Bank",
  "First City Monument Bank (FCMB)", "Guaranty Trust Bank (GTB)",
  "Heritage Bank", "Jaiz Bank", "Keystone Bank", "Polaris Bank",
  "Stanbic IBTC Bank", "Sterling Bank", "Union Bank", "United Bank for Africa (UBA)",
  "Unity Bank", "Wema Bank", "Zenith Bank",
];

export default function ManagerSalaryCard({ staffId, readOnly = false, label = null }) {
  const { fetchSalaryConfig, configureSalary, loading } = useSalaryStore();

  const [form, setForm] = useState({
    basicSalary: "",
    payType: "Monthly",
    taxPercentage: "",
    acctNo: "",
    acctName: "",
    bankName: "",
  });
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!staffId) return;
    setFetching(true);
    fetchSalaryConfig(staffId)
      .then((data) => {
        setForm({
          basicSalary: data.amount > 0 ? String(data.amount) : "",
          payType: data.payType || "Monthly",
          taxPercentage: data.taxPercentage > 0 ? String(data.taxPercentage) : "",
          acctNo: data.bankDetails?.acctNo || "",
          acctName: data.bankDetails?.acctName || "",
          bankName: data.bankDetails?.bankName || "",
        });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [staffId]);

  const handleSave = async () => {
    setSaved(false);
    setError(null);
    if (!form.basicSalary || Number(form.basicSalary) <= 0) {
      setError("Basic salary is required and must be greater than 0");
      return;
    }
    try {
      await configureSalary(staffId, {
        basicSalary: Number(form.basicSalary),
        payType: form.payType,
        taxPercentage: Number(form.taxPercentage) || 0,
        bankDetails: { acctNo: form.acctNo, acctName: form.acctName, bankName: form.bankName },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(extractApiError(err) || "Failed to save. Please try again.");
    }
  };

  if (fetching) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-3 text-gray-400 text-sm shadow-sm">
        <Loader2 size={16} className="animate-spin" />
        Loading salary configuration...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
          <Banknote size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {label || "Salary & Bank Details"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configured salary will be included in the accountant&apos;s monthly payroll draft
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Salary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Basic Salary (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              disabled={readOnly}
              value={form.basicSalary}
              onChange={(e) => setForm((f) => ({ ...f, basicSalary: e.target.value }))}
              placeholder="e.g. 150000"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Pay Frequency
            </label>
            <select
              disabled={readOnly}
              value={form.payType}
              onChange={(e) => setForm((f) => ({ ...f, payType: e.target.value }))}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              disabled={readOnly}
              value={form.taxPercentage}
              onChange={(e) => setForm((f) => ({ ...f, taxPercentage: e.target.value }))}
              placeholder="e.g. 7.5"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Bank details */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Bank Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={form.acctNo}
                onChange={(e) => setForm((f) => ({ ...f, acctNo: e.target.value }))}
                placeholder="10-digit account no."
                maxLength={10}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Account Name
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={form.acctName}
                onChange={(e) => setForm((f) => ({ ...f, acctName: e.target.value }))}
                placeholder="e.g. John Doe"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Bank Name
              </label>
              <select
                disabled={readOnly}
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="">Select bank...</option>
                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
            <CheckCircle size={15} />
            Salary configuration saved. It will appear in the next payroll draft.
          </div>
        )}

        {!readOnly && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave}
              disabled={loading.saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {loading.saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {loading.saving ? "Saving..." : "Save Salary Config"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

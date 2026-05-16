"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSalaryStore from "@/store/useSalaryStore";
import {
  ChevronLeft, ChevronRight, Search, Filter, Download, Printer,
  FileText, Send, Save, CheckCircle, Clock, AlertCircle, ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { saveAs } from "file-saver";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;
const pct = (n) => `${Number(n || 0)}%`;

const calcEntry = (e, pensionEnabled = true) => {
  const basic = Number(e.basicSalary) || 0;
  const ba = e.bonusAmounts || {};
  const mst = Number(ba.monthlySalesTarget) || 0;
  const zd  = Number(ba.zeroDiscrepancies)  || 0;
  const tp  = Number(ba.topPerformer)       || 0;
  const totalBonus      = mst + zd + tp;
  const taxAmount       = Math.round(basic * (Number(e.taxPercentage) || 0) / 100);
  const shortage        = Number(e.shortage) || 0;
  const employeePension = pensionEnabled ? Math.round(basic * 0.08) : 0;
  const employerPension = pensionEnabled ? Math.round(basic * 0.10) : 0;
  return {
    ...e,
    bonusAmounts: { monthlySalesTarget: mst, zeroDiscrepancies: zd, topPerformer: tp },
    totalBonus,
    taxAmount,
    employeePension,
    employerPension,
    shortage,
    salaryToPay: Math.max(0, basic + totalBonus - taxAmount - employeePension - shortage),
  };
};

const monthLabel = (m) => {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("default", {
    month: "long", year: "numeric",
  });
};

const prevMonth = (m) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const nextMonth = (m) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300", Icon: Clock },
    submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", Icon: Send },
    validated: { label: "Validated", cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", Icon: CheckCircle },
  };
  const { label, cls, Icon } = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <Icon size={13} /> {label}
    </span>
  );
};

// ── Editable cell ─────────────────────────────────────────────────────────────
const EditCell = ({ value, onChange, type = "text", min = 0, className = "" }) => (
  <input
    type={type}
    inputMode={type === "number" ? "numeric" : undefined}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    min={min}
    className={`w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600
      bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      placeholder-gray-300 ${className}`}
  />
);

// ── Export helpers ────────────────────────────────────────────────────────────
const buildRows = (entries) =>
  entries.map((e) => ({
    "Staff ID":           e.staffCode,
    "Name":               `${e.firstName} ${e.lastName}`,
    "Role":               e.role,
    "Basic Salary":       e.basicSalary,
    "Shift":              e.shiftType || "-",
    "Pay Type":           e.payType || "Monthly",
    "Monthly Sales ₦":   e.bonusAmounts?.monthlySalesTarget ?? 0,
    "Zero Disc. ₦":      e.bonusAmounts?.zeroDiscrepancies ?? 0,
    "Top Performer ₦":   e.bonusAmounts?.topPerformer ?? 0,
    "Total Bonus":        e.totalBonus ?? 0,
    "Tax %":              e.taxPercentage ?? 0,
    "Tax Amt":            e.taxAmount ?? 0,
    "Employee Pension (8%)":  e.employeePension ?? 0,
    "Employer Pension (10%)": e.employerPension ?? 0,
    "Shortage":           e.shortage ?? 0,
    "Salary to Pay":      e.salaryToPay ?? 0,
    "Acct No":            e.bankDetails?.acctNo || "",
    "Acct Name":          e.bankDetails?.acctName || "",
    "Bank":               e.bankDetails?.bankName || "",
  }));

const exportCSV = (entries, month) => {
  const csv = Papa.unparse(buildRows(entries));
  saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `salary-${month}.csv`);
};

const exportPDF = (entries, month) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
  doc.setFontSize(14);
  doc.text(`Salary Structure — ${monthLabel(month)}`, 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [[
      "Staff ID","Name","Role","Basic","Shift","Pay Type",
      "Monthly Sales ₦","Zero Disc. ₦","Top Performer ₦",
      "Tax%","Tax₦",
      "Employee Pension (8%)","Employer Pension (10%)",
      "Shortage","Salary to Pay",
      "Acct No","Acct Name","Bank",
    ]],
    body: entries.map((e) => [
      e.staffCode,
      `${e.firstName} ${e.lastName}`,
      e.role,
      fmt(e.basicSalary),
      e.shiftType || "-",
      e.payType || "Monthly",
      fmt(e.bonusAmounts?.monthlySalesTarget),
      fmt(e.bonusAmounts?.zeroDiscrepancies),
      fmt(e.bonusAmounts?.topPerformer),
      pct(e.taxPercentage),
      fmt(e.taxAmount),
      fmt(e.employeePension),
      fmt(e.employerPension),
      fmt(e.shortage),
      fmt(e.salaryToPay),
      e.bankDetails?.acctNo || "",
      e.bankDetails?.acctName || "",
      e.bankDetails?.bankName || "",
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [0, 128, 255], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`salary-${month}.pdf`);
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SalaryStructurePage() {
  const router = useRouter();
  const { draft, loading, error, fetchDraft, saveDraft, submitDraft } = useSalaryStore();
  const [month, setMonth] = useState(currentMonth());
  const [localEntries, setLocalEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterBy, setFilterBy] = useState("id");
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [pensionEnabled, setPensionEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("salaryPensionEnabled");
    return saved === null ? true : saved === "true";
  });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Persist pension toggle
  useEffect(() => {
    localStorage.setItem("salaryPensionEnabled", String(pensionEnabled));
    setLocalEntries((prev) => prev.map((e) => calcEntry(e, pensionEnabled)));
  }, [pensionEnabled]);

  // Load draft whenever month changes
  useEffect(() => {
    fetchDraft(month).catch(() => {});
  }, [month]);

  // Sync localEntries from store — also restore pensionEnabled from the draft
  useEffect(() => {
    if (draft?.entries) {
      // If the draft carries a stored pensionEnabled value, sync the local toggle to it
      if (typeof draft.pensionEnabled === "boolean" && draft.pensionEnabled !== pensionEnabled) {
        setPensionEnabled(draft.pensionEnabled);
        localStorage.setItem("salaryPensionEnabled", String(draft.pensionEnabled));
      }
      setLocalEntries(draft.entries.map((e) => calcEntry(e, draft.pensionEnabled ?? pensionEnabled)));
      setDirty(false);
    }
  }, [draft?._id, draft?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEditable = draft?.status === "draft";

  // Update a field in an entry row
  const updateField = useCallback((idx, field, value) => {
    setLocalEntries((prev) => {
      const next = [...prev];
      const entry = { ...next[idx] };

      if (field.startsWith("ba.")) {
        const key = field.slice(3);
        entry.bonusAmounts = { ...entry.bonusAmounts, [key]: Number(value) };
      } else if (field.startsWith("bd.")) {
        const key = field.slice(3);
        entry.bankDetails = { ...entry.bankDetails, [key]: value };
      } else {
        entry[field] = value;
      }

      next[idx] = calcEntry(entry, pensionEnabled);
      return next;
    });
    setDirty(true);
  }, [pensionEnabled]);

  // Unique roles for filter dropdown
  const roles = useMemo(
    () => ["all", ...new Set((draft?.entries || []).map((e) => e.role))],
    [draft?.entries]
  );

  // Filter entries
  const filtered = useMemo(() => {
    if (!localEntries.length) return [];
    let rows = localEntries;
    if (filterRole !== "all") rows = rows.filter((e) => e.role === filterRole);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((e) => {
        if (filterBy === "id")   return e.staffCode.toLowerCase().includes(q);
        if (filterBy === "name") return `${e.firstName} ${e.lastName}`.toLowerCase().includes(q);
        if (filterBy === "role") return e.role.toLowerCase().includes(q);
        return (
          e.staffCode.toLowerCase().includes(q) ||
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q)
        );
      });
    }
    return rows;
  }, [localEntries, search, filterRole, filterBy]);

  const totalPayroll = useMemo(
    () => localEntries.reduce((s, e) => s + (e.salaryToPay || 0), 0),
    [localEntries]
  );

  const handleSave = async () => {
    if (!draft) return;
    try {
      await saveDraft(draft._id, localEntries, pensionEnabled);
      showToast("Draft saved successfully");
      setDirty(false);
    } catch {
      showToast("Failed to save draft", "error");
    }
  };

  const handleSubmit = async () => {
    if (!draft) return;
    if (dirty) {
      showToast("Please save changes before submitting", "warning");
      return;
    }
    if (!confirm("Submit this salary structure to the manager for validation?")) return;
    try {
      await submitDraft(draft._id);
      showToast("Submitted to manager successfully");
    } catch {
      showToast("Failed to submit", "error");
    }
  };

  const handlePrint = () => window.print();

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading.draft && !draft) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="text-sm">Loading salary structure…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
          toast.type === "error"   ? "bg-red-500 text-white" :
          toast.type === "warning" ? "bg-amber-500 text-white" :
                                     "bg-green-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/accountant")}
              title="Back to Dashboard"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Salary Structure
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Prepare monthly payroll for all staff
              </p>
            </div>
          </div>

          {/* Month navigator */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
            <button
              onClick={() => setMonth(prevMonth(month))}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 min-w-[130px] text-center">
              {monthLabel(month)}
            </span>
            <button
              onClick={() => setMonth(nextMonth(month))}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Status + summary row */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {draft && <StatusBadge status={draft.status} />}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-100">{localEntries.length}</span> staff
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            Total payroll:
            <span className="font-bold text-blue-600 dark:text-blue-400">{fmt(totalPayroll)}</span>
          </div>
          {dirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <AlertCircle size={13} /> Unsaved changes
            </span>
          )}
        </div>

        {/* Pension toggle */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setPensionEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              pensionEnabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
            role="switch"
            aria-checked={pensionEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                pensionEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Pension Contribution (PenCom)
            </span>
            <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
              pensionEnabled
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}>
              {pensionEnabled ? "Enabled — 8% employee / 10% employer" : "Disabled — ₦0 recorded"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {isEditable && (
            <>
              <button
                onClick={handleSave}
                disabled={loading.saving || !dirty}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Save size={15} />
                {loading.saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading.submitting || dirty}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Send size={15} />
                {loading.submitting ? "Submitting…" : "Submit to Manager"}
              </button>
            </>
          )}
          <button
            onClick={() => exportCSV(localEntries, month)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-colors"
          >
            <Download size={15} /> CSV
          </button>
          <button
            onClick={() => exportPDF(localEntries, month)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-colors"
          >
            <FileText size={15} /> PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-colors"
          >
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* ── Search & Filter ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by ${filterBy}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by field */}
          <div className="relative">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter size={15} /> Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 top-12 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-3 w-52 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Search by</p>
                {["id", "name", "role"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600">
                    <input
                      type="radio"
                      name="filterBy"
                      value={opt}
                      checked={filterBy === opt}
                      onChange={() => { setFilterBy(opt); setShowFilter(false); }}
                      className="accent-blue-600"
                    />
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </label>
                ))}
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase pt-2">Filter by Role</p>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* Group headers */}
              <tr className="bg-gray-700 dark:bg-gray-900 text-white text-xs">
                <th colSpan={6} className="px-3 py-2 text-left border-r border-gray-600">Staff Info</th>
                <th colSpan={3} className="px-3 py-2 text-center border-r border-gray-600">Bonuses</th>
                <th colSpan={2} className="px-3 py-2 text-center border-r border-gray-600">PAYE Tax</th>
                <th colSpan={2} className="px-3 py-2 text-center border-r border-gray-600 bg-indigo-700">Pension (PenCom)</th>
                <th colSpan={2} className="px-3 py-2 text-center border-r border-gray-600">Deductions</th>
                <th colSpan={3} className="px-3 py-2 text-center">Bank Details</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 text-xs">
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Staff ID</th>
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap min-w-[130px]">Name</th>
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Role</th>
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Basic Salary</th>
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Shift</th>
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap border-r border-gray-200 dark:border-gray-600">Pay Type</th>
                {/* Bonuses */}
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Monthly Sales<br/><span className="text-gray-400 font-normal text-[10px]">₦ amt</span></th>
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Zero Disc.<br/><span className="text-gray-400 font-normal text-[10px]">₦ amt</span></th>
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap border-r border-gray-200 dark:border-gray-600">Top Performer<br/><span className="text-gray-400 font-normal text-[10px]">₦ amt</span></th>
                {/* PAYE Tax */}
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Tax %</th>
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap border-r border-gray-200 dark:border-gray-600">Tax ₦</th>
                {/* Pension */}
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                  Employee<br/><span className="font-normal text-[10px]">8% of basic</span>
                </th>
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap border-r border-gray-200 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                  Employer<br/><span className="font-normal text-[10px]">10% of basic</span>
                </th>
                {/* Deductions + Net Pay */}
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap">Shortage ₦</th>
                <th className="px-3 py-3 text-center font-semibold whitespace-nowrap border-r border-gray-200 dark:border-gray-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">Salary to Pay</th>
                {/* Bank */}
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Acct No.</th>
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Acct Name</th>
                <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Bank Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={18} className="text-center py-12 text-gray-400 dark:text-gray-500">
                    {loading.draft ? "Loading…" : "No staff found"}
                  </td>
                </tr>
              ) : (
                filtered.map((entry, fIdx) => {
                  // Find real index in localEntries
                  const realIdx = localEntries.findIndex(
                    (e) => e.staffCode === entry.staffCode && e.staff === entry.staff
                  );
                  const idx = realIdx >= 0 ? realIdx : fIdx;

                  return (
                    <tr key={entry.staffCode + idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      {/* Staff Info */}
                      <td className="px-3 py-3 font-mono text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">
                        {entry.staffCode}
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {entry.firstName} {entry.lastName}
                      </td>
                      <td className="px-3 py-3">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium text-[10px]">
                          {entry.role}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {fmt(entry.basicSalary)}
                      </td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {entry.shiftType || "—"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          (entry.payType || "Monthly") === "Weekly"
                            ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        }`}>
                          {entry.payType || "Monthly"}
                        </span>
                      </td>

                      {/* Monthly Sales Target — direct ₦ amount */}
                      <td className="px-3 py-2 text-center">
                        {isEditable ? (
                          <EditCell
                            type="number" min={0}
                            value={entry.bonusAmounts?.monthlySalesTarget ?? 0}
                            onChange={(v) => updateField(idx, "ba.monthlySalesTarget", v)}
                            className="w-28 text-center"
                          />
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                            {fmt(entry.bonusAmounts?.monthlySalesTarget)}
                          </span>
                        )}
                      </td>

                      {/* Zero Discrepancies — direct ₦ amount */}
                      <td className="px-3 py-2 text-center">
                        {isEditable ? (
                          <EditCell
                            type="number" min={0}
                            value={entry.bonusAmounts?.zeroDiscrepancies ?? 0}
                            onChange={(v) => updateField(idx, "ba.zeroDiscrepancies", v)}
                            className="w-28 text-center"
                          />
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                            {fmt(entry.bonusAmounts?.zeroDiscrepancies)}
                          </span>
                        )}
                      </td>

                      {/* Top Performer — direct ₦ amount */}
                      <td className="px-3 py-2 text-center border-r border-gray-100 dark:border-gray-700">
                        {isEditable ? (
                          <EditCell
                            type="number" min={0}
                            value={entry.bonusAmounts?.topPerformer ?? 0}
                            onChange={(v) => updateField(idx, "ba.topPerformer", v)}
                            className="w-28 text-center"
                          />
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                            {fmt(entry.bonusAmounts?.topPerformer)}
                          </span>
                        )}
                      </td>

                      {/* Tax % */}
                      <td className="px-3 py-2 text-center">
                        {isEditable ? (
                          <EditCell
                            type="number" min={0}
                            value={entry.taxPercentage ?? 0}
                            onChange={(v) => updateField(idx, "taxPercentage", Number(v))}
                            className="w-16 text-center"
                          />
                        ) : pct(entry.taxPercentage)}
                      </td>
                      <td className="px-3 py-2 text-center text-red-500 dark:text-red-400 font-medium whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                        {fmt(entry.taxAmount)}
                      </td>

                      {/* Pension — auto-computed, read-only */}
                      <td className="px-3 py-2 text-center font-medium whitespace-nowrap bg-indigo-50/60 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300">
                        {fmt(entry.employeePension)}
                      </td>
                      <td className="px-3 py-2 text-center font-medium whitespace-nowrap border-r border-gray-100 dark:border-gray-700 bg-indigo-50/60 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300">
                        {fmt(entry.employerPension)}
                      </td>

                      {/* Shortage */}
                      <td className="px-3 py-2 text-center">
                        {isEditable ? (
                          <EditCell
                            type="number" min={0}
                            value={entry.shortage ?? 0}
                            onChange={(v) => updateField(idx, "shortage", Number(v))}
                            className="w-24 text-center"
                          />
                        ) : fmt(entry.shortage)}
                      </td>

                      {/* Salary to Pay */}
                      <td className="px-3 py-2 text-center border-r border-gray-100 dark:border-gray-700 bg-emerald-50/60 dark:bg-emerald-900/10">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm whitespace-nowrap">
                          {fmt(entry.salaryToPay)}
                        </span>
                      </td>

                      {/* Bank Details */}
                      <td className="px-3 py-2">
                        {isEditable ? (
                          <EditCell
                            value={entry.bankDetails?.acctNo || ""}
                            onChange={(v) => updateField(idx, "bd.acctNo", v)}
                            className="w-32"
                          />
                        ) : <span className="text-gray-700 dark:text-gray-300">{entry.bankDetails?.acctNo || "—"}</span>}
                      </td>
                      <td className="px-3 py-2">
                        {isEditable ? (
                          <EditCell
                            value={entry.bankDetails?.acctName || ""}
                            onChange={(v) => updateField(idx, "bd.acctName", v)}
                            className="w-32"
                          />
                        ) : <span className="text-gray-700 dark:text-gray-300">{entry.bankDetails?.acctName || "—"}</span>}
                      </td>
                      <td className="px-3 py-2">
                        {isEditable ? (
                          <EditCell
                            value={entry.bankDetails?.bankName || ""}
                            onChange={(v) => updateField(idx, "bd.bankName", v)}
                            className="w-32"
                          />
                        ) : <span className="text-gray-700 dark:text-gray-300">{entry.bankDetails?.bankName || "—"}</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Totals footer */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-700 dark:bg-gray-900 text-white font-bold text-xs">
                  <td colSpan={3} className="px-3 py-3">Totals</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {fmt(filtered.reduce((s, e) => s + (e.basicSalary || 0), 0))}
                  </td>
                  <td />{/* Shift */}
                  <td className="border-r border-gray-600" />{/* Pay Type */}
                  <td className="px-3 py-3 text-center text-green-300 whitespace-nowrap">
                    {fmt(filtered.reduce((s, e) => s + (e.bonusAmounts?.monthlySalesTarget || 0), 0))}
                  </td>
                  <td className="px-3 py-3 text-center text-green-300 whitespace-nowrap">
                    {fmt(filtered.reduce((s, e) => s + (e.bonusAmounts?.zeroDiscrepancies || 0), 0))}
                  </td>
                  <td className="px-3 py-3 text-center text-green-300 whitespace-nowrap border-r border-gray-600">
                    {fmt(filtered.reduce((s, e) => s + (e.bonusAmounts?.topPerformer || 0), 0))}
                  </td>
                  <td />
                  <td className="px-3 py-3 text-center text-red-300 whitespace-nowrap border-r border-gray-600">
                    {fmt(filtered.reduce((s, e) => s + (e.taxAmount || 0), 0))}
                  </td>
                  {/* Pension totals */}
                  <td className="px-3 py-3 text-center text-indigo-300 whitespace-nowrap bg-indigo-900/30">
                    {fmt(filtered.reduce((s, e) => s + (e.employeePension || 0), 0))}
                  </td>
                  <td className="px-3 py-3 text-center text-indigo-300 whitespace-nowrap border-r border-gray-600 bg-indigo-900/30">
                    {fmt(filtered.reduce((s, e) => s + (e.employerPension || 0), 0))}
                  </td>
                  <td className="px-3 py-3 text-center text-red-300 whitespace-nowrap border-r border-gray-600">
                    {fmt(filtered.reduce((s, e) => s + (e.shortage || 0), 0))}
                  </td>
                  <td className="px-3 py-3 text-center text-emerald-300 whitespace-nowrap border-r border-gray-600 bg-emerald-900/30">
                    {fmt(filtered.reduce((s, e) => s + (e.salaryToPay || 0), 0))}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Calculation Formula</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
          <strong>Tax (PAYE)</strong> is calculated on Basic Salary (before bonuses). &nbsp;
          <strong>Pension</strong> is optional — use the toggle above to enable or disable it for your company.
          When enabled: Employee = 8% of Basic (deducted from staff pay, remitted to PenCom); Employer = 10% of Basic (business cost). &nbsp;
          <strong>Salary to Pay</strong> = Basic + Bonuses − Tax − Employee Pension − Shortage. &nbsp;
          MST = Monthly Sales Target &nbsp;|&nbsp; ZD = Zero Discrepancies &nbsp;|&nbsp; TP = Top Performer
        </p>
      </div>
    </div>
  );
}

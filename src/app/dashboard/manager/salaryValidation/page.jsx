"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useSalaryStore from "@/store/useSalaryStore";
import {
  CheckCircle, Clock, Send, Download, FileText, Printer,
  Eye, ShieldCheck, AlertCircle, X, ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { saveAs } from "file-saver";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const monthLabel = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("default", {
    month: "long", year: "numeric",
  });
};

const dateStr = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    submitted: { label: "Awaiting Validation", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", Icon: Clock },
    validated: { label: "Validated",            cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", Icon: CheckCircle },
  };
  const { label, cls, Icon } = map[status] ?? map.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <Icon size={12} /> {label}
    </span>
  );
};

// ── Salary Detail View ────────────────────────────────────────────────────────
const DetailView = ({ record, onClose, onValidate, validating }) => {
  const printRef = useRef(null);
  if (!record) return null;

  const station   = record.station;
  const entries   = record.entries || [];
  const totalPayroll = entries.reduce((s, e) => s + (e.salaryToPay || 0), 0);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=1100,height=700");
    win.document.write(`
      <html><head><title>Salary Report — ${monthLabel(record.month)}</title>
      <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { padding: 20px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: left; }
        th { background: #1d4ed8; color: white; font-weight: 600; }
        tr:nth-child(even) { background: #f8fafc; }
        .header-block { border-bottom: 2px solid #1d4ed8; padding-bottom: 12px; margin-bottom: 16px; }
        .total-row { background: #1e293b !important; color: white; font-weight: bold; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    doc.setFontSize(16);
    doc.text(`Salary Report — ${monthLabel(record.month)}`, 14, 16);
    doc.setFontSize(9);
    if (station?.name) doc.text(station.name, 14, 23);
    if (station?.address) doc.text(station.address, 14, 28);
    doc.text(`Prepared by: ${record.preparedByName}  |  Status: ${record.status}`, 14, 34);
    if (record.validatedByName) doc.text(`Validated by: ${record.validatedByName}  on ${dateStr(record.validatedAt)}`, 14, 39);

    autoTable(doc, {
      startY: 45,
      head: [["Staff ID","Name","Role","Basic","Shift","Monthly Sales ₦","Zero Disc. ₦","Top Performer ₦","Tax%","Tax₦","Shortage","Salary to Pay","Acct No","Acct Name","Bank"]],
      body: entries.map((e) => [
        e.staffCode,
        `${e.firstName} ${e.lastName}`,
        e.role,
        fmt(e.basicSalary),
        e.shiftType || "-",
        fmt(e.bonusAmounts?.monthlySalesTarget),
        fmt(e.bonusAmounts?.zeroDiscrepancies),
        fmt(e.bonusAmounts?.topPerformer),
        `${e.taxPercentage ?? 0}%`,
        fmt(e.taxAmount),
        fmt(e.shortage),
        fmt(e.salaryToPay),
        e.bankDetails?.acctNo || "",
        e.bankDetails?.acctName || "",
        e.bankDetails?.bankName || "",
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      foot: [["","TOTAL","",fmt(entries.reduce((s,e)=>s+(e.basicSalary||0),0)),"",fmt(entries.reduce((s,e)=>s+(e.bonusAmounts?.monthlySalesTarget||0),0)),fmt(entries.reduce((s,e)=>s+(e.bonusAmounts?.zeroDiscrepancies||0),0)),fmt(entries.reduce((s,e)=>s+(e.bonusAmounts?.topPerformer||0),0)),"",fmt(entries.reduce((s,e)=>s+(e.taxAmount||0),0)),fmt(entries.reduce((s,e)=>s+(e.shortage||0),0)),fmt(totalPayroll),"","",""]],
      footStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    });
    doc.save(`salary-${record.month}.pdf`);
  };

  const exportCSV = () => {
    const rows = entries.map((e) => ({
      "Staff ID": e.staffCode,
      Name: `${e.firstName} ${e.lastName}`,
      Role: e.role,
      "Basic Salary": e.basicSalary,
      Shift: e.shiftType || "-",
      "Monthly Sales ₦": e.bonusAmounts?.monthlySalesTarget ?? 0,
      "Zero Disc. ₦":    e.bonusAmounts?.zeroDiscrepancies ?? 0,
      "Top Performer ₦": e.bonusAmounts?.topPerformer ?? 0,
      "Tax %": e.taxPercentage ?? 0,
      "Tax Amt": e.taxAmount ?? 0,
      Shortage: e.shortage ?? 0,
      "Salary to Pay": e.salaryToPay ?? 0,
      "Acct No": e.bankDetails?.acctNo || "",
      "Acct Name": e.bankDetails?.acctName || "",
      Bank: e.bankDetails?.bankName || "",
    }));
    const csv = Papa.unparse(rows);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `salary-${record.month}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-700 to-indigo-800">
          <div className="flex items-center gap-4">
            {(station?.logoUrl || station?.logo) && (
              <img
                src={station.logoUrl || station.logo}
                alt="logo"
                className="h-10 w-auto object-contain rounded-lg bg-white p-1"
              />
            )}
            <div>
              <h2 className="text-white font-bold text-lg">
                {station?.name || "Salary Review"} — {monthLabel(record.month)}
              </h2>
              <div className="mt-1">
                <StatusBadge status={record.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors">
              <Download size={13} /> CSV
            </button>
            <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors">
              <FileText size={13} /> PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors">
              <Printer size={13} /> Print
            </button>
            {record.status === "submitted" && (
              <button
                onClick={() => onValidate(record._id)}
                disabled={validating}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors shadow-lg"
              >
                <ShieldCheck size={14} />
                {validating ? "Validating…" : "Validate & Approve"}
              </button>
            )}
            <button onClick={onClose} className="ml-1 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable body */}
        <div className="overflow-y-auto flex-1 p-6" ref={printRef}>
          {/* Meta */}
          <div className="flex flex-wrap gap-5 mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 header-block">
            {station?.address && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{station.address}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Prepared by</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{record.preparedByName}</p>
              {record.submittedAt && <p className="text-xs text-gray-400">{dateStr(record.submittedAt)}</p>}
            </div>
            {record.validatedByName && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Validated by</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{record.validatedByName}</p>
                <p className="text-xs text-gray-400">{dateStr(record.validatedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Payroll</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalPayroll)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Staff Count</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{entries.length}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="px-3 py-2.5 text-left">Staff ID</th>
                  <th className="px-3 py-2.5 text-left">Name</th>
                  <th className="px-3 py-2.5 text-left">Role</th>
                  <th className="px-3 py-2.5 text-right">Basic</th>
                  <th className="px-3 py-2.5 text-left">Shift</th>
                  <th className="px-3 py-2.5 text-right">Monthly Sales ₦</th>
                  <th className="px-3 py-2.5 text-right">Zero Disc. ₦</th>
                  <th className="px-3 py-2.5 text-right">Top Performer ₦</th>
                  <th className="px-3 py-2.5 text-center">Tax %</th>
                  <th className="px-3 py-2.5 text-right">Tax ₦</th>
                  <th className="px-3 py-2.5 text-right">Shortage</th>
                  <th className="px-3 py-2.5 text-right bg-emerald-800">Salary to Pay</th>
                  <th className="px-3 py-2.5 text-left">Acct No</th>
                  <th className="px-3 py-2.5 text-left">Acct Name</th>
                  <th className="px-3 py-2.5 text-left">Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {entries.map((e, i) => (
                  <tr key={i} className={`hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-700/20"}`}>
                    <td className="px-3 py-2.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">{e.staffCode}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{e.firstName} {e.lastName}</td>
                    <td className="px-3 py-2.5 capitalize text-gray-600 dark:text-gray-300">{e.role}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{fmt(e.basicSalary)}</td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{e.shiftType || "—"}</td>
                    <td className="px-3 py-2.5 text-right text-green-600 dark:text-green-400">{fmt(e.bonusAmounts?.monthlySalesTarget)}</td>
                    <td className="px-3 py-2.5 text-right text-green-600 dark:text-green-400">{fmt(e.bonusAmounts?.zeroDiscrepancies)}</td>
                    <td className="px-3 py-2.5 text-right text-green-600 dark:text-green-400">{fmt(e.bonusAmounts?.topPerformer)}</td>
                    <td className="px-3 py-2.5 text-center">{e.taxPercentage ?? 0}%</td>
                    <td className="px-3 py-2.5 text-right text-red-500 dark:text-red-400">{fmt(e.taxAmount)}</td>
                    <td className="px-3 py-2.5 text-right text-red-500 dark:text-red-400">{fmt(e.shortage)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/10 whitespace-nowrap">{fmt(e.salaryToPay)}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{e.bankDetails?.acctNo || "—"}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{e.bankDetails?.acctName || "—"}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{e.bankDetails?.bankName || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-800 dark:bg-gray-900 text-white font-bold text-xs">
                  <td colSpan={3} className="px-3 py-2.5">TOTAL</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">{fmt(entries.reduce((s,e)=>s+(e.basicSalary||0),0))}</td>
                  <td />
                  <td className="px-3 py-2.5 text-right text-green-300 whitespace-nowrap">{fmt(entries.reduce((s,e)=>s+(e.bonusAmounts?.monthlySalesTarget||0),0))}</td>
                  <td className="px-3 py-2.5 text-right text-green-300 whitespace-nowrap">{fmt(entries.reduce((s,e)=>s+(e.bonusAmounts?.zeroDiscrepancies||0),0))}</td>
                  <td className="px-3 py-2.5 text-right text-green-300 whitespace-nowrap">{fmt(entries.reduce((s,e)=>s+(e.bonusAmounts?.topPerformer||0),0))}</td>
                  <td />
                  <td className="px-3 py-2.5 text-right text-red-300 whitespace-nowrap">{fmt(entries.reduce((s,e)=>s+(e.taxAmount||0),0))}</td>
                  <td className="px-3 py-2.5 text-right text-red-300 whitespace-nowrap">{fmt(entries.reduce((s,e)=>s+(e.shortage||0),0))}</td>
                  <td className="px-3 py-2.5 text-right text-emerald-300 bg-emerald-900/40 whitespace-nowrap">{fmt(totalPayroll)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SalaryValidationPage() {
  const { pendingDrafts, historyDetail, loading, error, fetchPending, fetchRecord, validateDraft, clearDetail } =
    useSalaryStore();
  const router = useRouter();
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchPending().catch(() => {});
  }, []);

  const handleView = async (id) => {
    await fetchRecord(id).catch(() => {});
  };

  const handleValidate = async (id) => {
    if (!confirm("Validate and approve this salary structure? This action cannot be undone.")) return;
    try {
      await validateDraft(id);
      showToast("Salary structure validated successfully");
      fetchPending().catch(() => {});
    } catch {
      showToast("Failed to validate. Please try again.", "error");
    }
  };

  if (loading.pending && pendingDrafts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="text-sm">Loading salary submissions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/manager")}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Validation</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Review and validate salary drafts submitted by the accountant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {pendingDrafts.filter((d) => d.status === "submitted").length}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Pending</p>
            </div>
            <div className="text-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {pendingDrafts.filter((d) => d.status === "validated").length}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">Validated</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Submissions list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Month</th>
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Prepared by</th>
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Submitted on</th>
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-5 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">Validated on</th>
              <th className="px-5 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {pendingDrafts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 dark:text-gray-500">
                  No salary submissions yet
                </td>
              </tr>
            ) : (
              pendingDrafts.map((draft) => (
                <tr
                  key={draft._id}
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                  onClick={() => handleView(draft._id)}
                >
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-gray-100">
                    {monthLabel(draft.month)}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{draft.preparedByName}</td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{dateStr(draft.submittedAt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={draft.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {draft.status === "validated" ? dateStr(draft.validatedAt) : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleView(draft._id); }}
                        disabled={loading.detail}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                      >
                        <Eye size={13} /> Review
                      </button>
                      {draft.status === "submitted" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleValidate(draft._id); }}
                          disabled={loading.validating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                        >
                          <ShieldCheck size={13} /> Validate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {historyDetail && (
        <DetailView
          record={historyDetail}
          onClose={clearDetail}
          onValidate={handleValidate}
          validating={loading.validating}
        />
      )}
    </div>
  );
}

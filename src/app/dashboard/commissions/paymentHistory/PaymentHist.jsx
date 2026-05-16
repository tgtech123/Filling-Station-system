'use client'
import React, { useState, useEffect, useCallback } from "react";
import { paymentColumns, getPaymentData } from "./PaymentHistoryData";
import TableTwo from "@/components/TableTwo";
import exportToExcel from "@/hooks/ExportToExcel";
import { FiDownload } from "react-icons/fi";
import { Calculator, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Pagination from "@/components/Pagination";
import SearchBar from "@/hooks/SearchBar";
import useCommissionStore from "@/store/useCommissionStore";

const MONTHS = [
  { value: 1,  label: "January"   }, { value: 2,  label: "February"  },
  { value: 3,  label: "March"     }, { value: 4,  label: "April"     },
  { value: 5,  label: "May"       }, { value: 6,  label: "June"      },
  { value: 7,  label: "July"      }, { value: 8,  label: "August"    },
  { value: 9,  label: "September" }, { value: 10, label: "October"   },
  { value: 11, label: "November"  }, { value: 12, label: "December"  },
];

const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - i);

const STATUS_OPTIONS = [
  { value: "",        label: "All Status"  },
  { value: "Pending", label: "Pending"     },
  { value: "Paid",    label: "Paid"        },
];

const PaymentHist = () => {
  const [searchTerm,  setSearchTerm]  = useState("");
  const [month,       setMonth]       = useState(currentMonth);
  const [year,        setYear]        = useState(currentYear);
  const [statusFilter,setStatusFilter]= useState("");

  // Confirm-before-pay modal state
  const [confirmPay,  setConfirmPay]  = useState(null); // { id, staffName }

  // Calculate result toast
  const [calcToast,   setCalcToast]   = useState(null); // { type: 'success'|'error', msg }

  const {
    paymentHistory, pagination, loading, errors,
    fetchPaymentHistory, calculateCommissions, markPaymentAsPaid,
  } = useCommissionStore();

  // ── Fetch whenever filters change ────────────────────────────────────────
  const doFetch = useCallback((page = 1) => {
    const params = { page, limit: 10, month, year };
    if (statusFilter) params.status = statusFilter;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    fetchPaymentHistory(params);
  }, [month, year, statusFilter, searchTerm, fetchPaymentHistory]);

  useEffect(() => { doFetch(1); }, [month, year, statusFilter]);

  // Search is debounced — fires 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => doFetch(1), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Calculate commissions for selected month/year ────────────────────────
  const handleCalculate = async () => {
    try {
      const res = await calculateCommissions(month, year);
      const count = res?.data?.payments ?? 0;
      const mLabel = MONTHS.find(m => m.value === month)?.label;
      setCalcToast({ type: 'success', msg: `${count} commission record${count !== 1 ? 's' : ''} calculated for ${mLabel} ${year}.` });
      doFetch(1);
    } catch {
      setCalcToast({ type: 'error', msg: errors.calculating || 'Failed to calculate commissions.' });
    }
    setTimeout(() => setCalcToast(null), 5000);
  };

  // ── Mark as paid ─────────────────────────────────────────────────────────
  const handleMarkPaid = async () => {
    if (!confirmPay) return;
    try {
      await markPaymentAsPaid(confirmPay.id);
      setConfirmPay(null);
    } catch {
      setConfirmPay(null);
    }
  };

  // ── Table data ────────────────────────────────────────────────────────────
  const tableData = getPaymentData(paymentHistory);

  const handleExport = () => {
    exportToExcel(tableData, paymentColumns, `PaymentHistory_${month}_${year}`);
  };

  const monthLabel = MONTHS.find(m => m.value === month)?.label || "";

  return (
    <div className="mt-5 px-2 sm:px-4 lg:px-6 space-y-4">

      {/* ── Toast ── */}
      {calcToast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          calcToast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {calcToast.type === 'success'
            ? <CheckCircle2 size={16} className="shrink-0" />
            : <XCircle size={16} className="shrink-0" />}
          {calcToast.msg}
        </div>
      )}

      {/* ══ ROW 1 — Period selection + action buttons ══════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4">

        {/* Left: period pickers with labels */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Select Period
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 min-w-[130px]"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Generate + Export */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Actions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCalculate}
              disabled={loading.calculating}
              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors whitespace-nowrap"
            >
              <Calculator size={16} />
              {loading.calculating ? "Generating…" : `Generate — ${monthLabel} ${year}`}
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#0080FF] text-white font-semibold rounded-xl hover:bg-blue-700 text-sm transition-colors"
            >
              Export <FiDownload size={16} />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 leading-snug">
            "Generate" reads completed shifts for the selected month and creates commission records.
          </p>
        </div>
      </div>

      {/* ══ ROW 2 — Search + status filter ══════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Search Staff
          </p>
          <div className="w-full sm:w-72">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name or role…"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Filter by Status
          </p>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 min-w-[140px]"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Empty-state guidance ── */}
      {!loading.paymentHistory && !paymentHistory?.length && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
          <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">
              No commission records for {monthLabel} {year}
            </p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Records are created when you click <strong>Generate — {monthLabel} {year}</strong>.
              That button goes through every completed shift for the month, calculates each
              staff member's commission from their sales, and saves the results here.
              It must be done once per month before you can view or pay anyone.
            </p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading.paymentHistory ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading payment history…</p>
          </div>
        </div>
      ) : errors.paymentHistory ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm text-red-700 font-medium">{errors.paymentHistory}</p>
            <button
              onClick={() => doFetch(1)}
              className="mt-1 text-xs text-red-600 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            {tableData.length > 0 && paymentHistory?.length > 0 ? (
              <TableTwo
                columns={paymentColumns}
                data={tableData}
                onMarkPaid={(id, staffName) => setConfirmPay({ id, staffName })}
                markingPaid={loading.markingPaid}
              />
            ) : (
              <div className="text-center text-gray-400 py-12 text-sm">
                No records for {monthLabel} {year}
                {statusFilter ? ` · ${statusFilter}` : ''}.
              </div>
            )}
          </div>

          {/* Server-side pagination */}
          {pagination.total > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              onPageChange={(p) => doFetch(p)}
              itemsPerPage={pagination.limit}
            />
          )}
        </>
      )}

      {/* ── Mark-as-Paid confirmation modal ── */}
      {confirmPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Confirm Payment</h3>
            <p className="text-sm text-gray-600 mb-6">
              Mark commission for <strong>{confirmPay.staffName}</strong> as <strong>Paid</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPay(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={loading.markingPaid}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading.markingPaid ? "Saving…" : "Confirm Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHist;

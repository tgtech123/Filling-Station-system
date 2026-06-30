"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus, ShieldCheck, Loader2, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Scale, Clock, X,
} from "lucide-react";
import useStockReconciliationStore from "@/store/useStockReconciliationStore";
import NewReconciliationModal from "./NewReconciliationModal";
import PumpLinkAuditModal from "@/components/PumpLinkAuditModal";

const fmtL = (n) => `${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} L`;
const fmtN = (n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—");

function getRole() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return (u.role || "").toLowerCase().trim();
  } catch {
    return "";
  }
}

const RESULT_STYLE = {
  Excess: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Shortage: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Balanced: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};
const STATUS_STYLE = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Rejected: "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

export default function StockReconciliationClient() {
  const {
    settings, fetchSettings,
    reconciliations, pagination, listLoading, fetchReconciliations,
    approveReconciliation, rejectReconciliation,
  } = useStockReconciliationStore();

  const [role, setRole] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [filters, setFilters] = useState({ tankId: "", status: "" });
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const isManager = role === "manager";

  useEffect(() => {
    setRole(getRole());
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    fetchReconciliations({ page, limit: 10, ...(filters.tankId && { tankId: filters.tankId }), ...(filters.status && { status: filters.status }) });
  }, [fetchReconciliations, page, filters]);

  const refresh = () =>
    fetchReconciliations({ page, limit: 10, ...(filters.tankId && { tankId: filters.tankId }), ...(filters.status && { status: filters.status }) });

  const tanks = settings?.tanks || [];
  const notConfigured = settings && settings.configured === false;

  const summary = useMemo(() => {
    const pending = reconciliations.filter((r) => r.approvalStatus === "Pending").length;
    const excess = reconciliations.filter((r) => r.result === "Excess").length;
    const shortage = reconciliations.filter((r) => r.result === "Shortage").length;
    return { pending, excess, shortage };
  }, [reconciliations]);

  async function handleApprove(id) {
    setActioningId(id);
    try {
      await approveReconciliation(id);
      toast.success("Approved — tank stock trued up.");
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not approve.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id, reason) {
    setActioningId(id);
    try {
      await rejectReconciliation(id, reason);
      toast.success("Rejected. Tank stock unchanged.");
      setRejectTarget(null);
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not reject.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Scale className="text-[#0080ff] shrink-0" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stock Reconciliation</h1>
            <p className="text-sm text-neutral-400">Reconcile physical fuel against metered sales using your station litre.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAudit(true)}
            className="flex items-center gap-1.5 border-2 border-[#0080ff] text-[#0080ff] py-2 px-4 rounded-[10px] font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <ShieldCheck size={16} />
            Pump Audit
          </button>
          <button
            onClick={() => setShowNew(true)}
            disabled={tanks.length === 0}
            className="flex items-center gap-1.5 bg-[#1a71f6] text-white py-2 px-4 rounded-[10px] font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            New Reconciliation
          </button>
        </div>
      </div>

      <div>
        {/* Not-configured warning */}
        {notConfigured && (
          <div className="mb-5 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No yield factor is set yet.{" "}
              <Link href="/dashboard/system-settings" className="font-semibold underline">
                Set your station litre in Settings
              </Link>{" "}
              before reconciling.
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Pending approval" value={summary.pending} accent="text-amber-600" />
          <StatCard label="Excess (this page)" value={summary.excess} accent="text-emerald-600" />
          <StatCard label="Shortage (this page)" value={summary.shortage} accent="text-red-600" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={filters.tankId}
            onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, tankId: e.target.value })); }}
            className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 p-2 rounded-lg text-sm"
          >
            <option value="">All tanks</option>
            {tanks.map((t) => (
              <option key={t._id} value={t._id}>{t.title} ({t.fuelType})</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}
            className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 p-2 rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* List */}
        {listLoading ? (
          <div className="flex items-center gap-2 text-neutral-400 py-12 justify-center">
            <Loader2 size={18} className="animate-spin" /> Loading reconciliations…
          </div>
        ) : reconciliations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-200 dark:border-gray-700 py-16 text-center">
            <Scale size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-neutral-400">No reconciliations yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reconciliations.map((r) => (
              <ReconCard
                key={r._id}
                r={r}
                isManager={isManager}
                actioning={actioningId === r._id}
                onApprove={() => handleApprove(r._id)}
                onReject={() => setRejectTarget(r)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-neutral-200 dark:border-gray-700 disabled:opacity-40 dark:text-gray-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-neutral-500 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg border border-neutral-200 dark:border-gray-700 disabled:opacity-40 dark:text-gray-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {showNew && (
        <NewReconciliationModal
          tanks={tanks}
          defaultFactor={settings?.defaultYieldFactor}
          onClose={() => setShowNew(false)}
          onCreated={refresh}
        />
      )}
      {showAudit && <PumpLinkAuditModal onClose={() => setShowAudit(false)} />}
      {rejectTarget && (
        <RejectModal
          target={rejectTarget}
          busy={actioningId === rejectTarget._id}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => handleReject(rejectTarget._id, reason)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-200 dark:border-gray-700 px-4 py-3">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

function ReconCard({ r, isManager, actioning, onApprove, onReject }) {
  const variancePositive = (r.variance || 0) >= 0;
  const varianceColor = r.result === "Shortage" ? "text-red-600" : r.result === "Excess" ? "text-emerald-600" : "text-gray-700 dark:text-gray-200";
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-gray-800 dark:text-gray-100">{r.tankTitle}</h5>
            <span className="text-xs text-neutral-400">{r.fuelType}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RESULT_STYLE[r.result] || ""}`}>{r.result}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[r.approvalStatus] || ""}`}>{r.approvalStatus}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cycle ended {fmtDate(r.cycleEnd)} · factor {r.factorUsed}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${varianceColor}`}>
            {variancePositive ? "+" : ""}{fmtL(r.variance)}
          </p>
          <p className={`text-xs ${varianceColor}`}>
            {variancePositive ? "+" : ""}{fmtN(r.varianceValueNaira)} ({r.variancePercent}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <Cell label="Opening" value={fmtL(r.openingStock)} />
        <Cell label="Delivered" value={fmtL(r.deliveredLitres)} />
        <Cell label="Metered sales" value={fmtL(r.meteredSales)} />
        <Cell label="Expected close" value={fmtL(r.expectedClosingStock)} />
        <Cell label="Actual dip" value={fmtL(r.actualClosingStock)} strong />
        {r.approvalStatus === "Approved" && r.newBookStock != null && (
          <Cell label="Trued up to" value={fmtL(r.newBookStock)} strong />
        )}
      </div>

      {r.notes && <p className="text-xs text-neutral-400 mt-2 italic">“{r.notes}”</p>}

      {/* Manager actions on pending */}
      {isManager && r.approvalStatus === "Pending" && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-gray-700">
          <button
            onClick={onApprove}
            disabled={actioning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actioning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Approve &amp; true up
          </button>
          <button
            onClick={onReject}
            disabled={actioning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            <XCircle size={14} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, strong }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-neutral-400">{label}</p>
      <p className={`${strong ? "font-bold" : "font-medium"} text-gray-800 dark:text-gray-100`}>{value}</p>
    </div>
  );
}

function RejectModal({ target, busy, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold dark:text-gray-100">Reject reconciliation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-xs text-neutral-400 mb-3">
          {target.tankTitle} ({target.fuelType}). Tank stock will not change.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Reason (optional)"
          className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2 rounded-lg text-sm resize-none mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-neutral-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { X, ShieldCheck, AlertTriangle, Loader2, Link2Off, RefreshCw, Fuel } from "lucide-react";
import useStockReconciliationStore from "@/store/useStockReconciliationStore";

/**
 * Read-only data-quality check: flags pumps whose sales can't be tied to a tank,
 * pumps whose product doesn't match their tank, tanks with no pumps, and duplicate
 * pump ids. These are the things that make stock attribution imprecise.
 */
export default function PumpLinkAuditModal({ onClose }) {
  const { audit, auditLoading, fetchAudit } = useStockReconciliationStore();

  useEffect(() => {
    fetchAudit().catch(() => {});
  }, [fetchAudit]);

  const s = audit?.summary;
  const issues = audit?.issues;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#1a71f6]" />
            <h3 className="text-base font-semibold dark:text-gray-100">Pump → Tank Link Audit</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAudit().catch(() => {})}
              className="text-gray-400 hover:text-[#1a71f6] transition-colors"
              title="Re-run audit"
            >
              <RefreshCw size={16} className={auditLoading ? "animate-spin" : ""} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          {auditLoading && !audit ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={28} className="animate-spin text-[#1a71f6]" />
              <p className="text-sm text-neutral-400">Checking pump assignments…</p>
            </div>
          ) : !audit ? (
            <p className="text-sm text-neutral-400 text-center py-8">Couldn&apos;t load the audit.</p>
          ) : (
            <>
              {/* Healthy / issue banner */}
              <div
                className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-5 border ${
                  audit.healthy
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                }`}
              >
                {audit.healthy ? (
                  <ShieldCheck size={18} className="text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                <p className={`text-sm font-medium ${audit.healthy ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`}>
                  {audit.healthy
                    ? "All pumps are correctly linked to tanks."
                    : "Some pumps need attention. Fix these for accurate stock attribution."}
                </p>
              </div>

              {/* Summary chips */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  ["Tanks", s?.tanks],
                  ["Linked pumps", s?.linkedPumps],
                  ["Unlinked", s?.unlinkedPumps, s?.unlinkedPumps > 0],
                  ["Mismatched", s?.mismatchedPumps, s?.mismatchedPumps > 0],
                  ["No pumps", s?.tanksWithoutPumps, s?.tanksWithoutPumps > 0],
                  ["Duplicates", s?.duplicatePumpIds, s?.duplicatePumpIds > 0],
                ].map(([label, val, warn]) => (
                  <div
                    key={label}
                    className={`rounded-xl border px-3 py-2.5 text-center ${
                      warn
                        ? "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
                        : "border-neutral-200 bg-gray-50 dark:bg-gray-700/40 dark:border-gray-700"
                    }`}
                  >
                    <p className={`text-lg font-bold ${warn ? "text-amber-600" : "text-gray-800 dark:text-gray-100"}`}>{val ?? 0}</p>
                    <p className="text-[10px] uppercase tracking-wide text-neutral-400">{label}</p>
                  </div>
                ))}
              </div>

              {/* Issue lists */}
              <IssueGroup
                title="Unlinked pumps"
                icon={<Link2Off size={14} className="text-red-500" />}
                items={issues?.unlinkedPumps}
                render={(p) => (
                  <>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{p.pumpTitle || "Unnamed pump"}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{p.reason}</p>
                    {Array.isArray(p.products) && p.products.length > 0 && (
                      <p className="text-[11px] text-neutral-400 mt-1">Products sold: {p.products.join(", ")}</p>
                    )}
                  </>
                )}
              />
              <IssueGroup
                title="Fuel-type mismatches"
                icon={<AlertTriangle size={14} className="text-amber-500" />}
                items={issues?.mismatchedPumps}
                render={(p) => (
                  <>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {p.pumpTitle || "Pump"} → {p.tankTitle} ({p.tankFuelType})
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{p.reason}</p>
                  </>
                )}
              />
              <IssueGroup
                title="Tanks without pumps"
                icon={<Fuel size={14} className="text-amber-500" />}
                items={issues?.tanksWithoutPumps}
                render={(t) => (
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {t.title} <span className="text-xs font-normal text-neutral-400">({t.fuelType})</span>
                  </p>
                )}
              />
              <IssueGroup
                title="Duplicate pump ids"
                icon={<AlertTriangle size={14} className="text-red-500" />}
                items={issues?.duplicatePumpIds}
                render={(d) => (
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-200">
                    {d.pumpId} <span className="text-xs text-red-500">×{d.occurrences}</span>
                  </p>
                )}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IssueGroup({ title, icon, items, render }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">{title} ({items.length})</p>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
            {render(it)}
          </div>
        ))}
      </div>
    </div>
  );
}

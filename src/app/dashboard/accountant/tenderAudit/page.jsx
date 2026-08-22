"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useShiftTenderStore from "@/store/useShiftTenderStore";
import { useSocket } from "@/hooks/useSocket";
import { Loader2, Eye, Banknote, CreditCard, Landmark, AlertTriangle } from "lucide-react";

/**
 * Every shift's takings, by attendant, split by how they were paid.
 *
 * Read-only, and the route offers nothing else. The point is to be able to ask
 * "what did this person hand over, and who checked it", and to reconcile the
 * cash figure against a drawer and the rest against a statement.
 */

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const nameOf = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim() || "—";

const when = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

const RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "all", label: "Everything" },
];

const rangeToParams = (r) => {
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  if (r === "today") return { from: iso(now), to: iso(now) };
  if (r === "week") {
    const s = new Date(now); s.setDate(now.getDate() - 6);
    return { from: iso(s), to: iso(now) };
  }
  if (r === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: iso(s), to: iso(now) };
  }
  return {};
};

export default function TenderAuditPage() {
  const { audit, loading, fetchAudit } = useShiftTenderStore();
  const [range, setRange] = useState("today");
  const [status, setStatus] = useState("");

  const load = () => fetchAudit({ ...rangeToParams(range), ...(status ? { status } : {}) });

  useEffect(() => { load(); }, [range, status]);

  // A cashier confirming a shift should land here without a reload.
  useSocket({ "tender:confirmed": () => load() });

  const { rows, totals, byProduct, awaiting } = audit;

  return (
    <DashboardLayout>
      <div className="pb-12">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shift Takings Audit</h1>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5">
                <Eye size={11} /> Read only
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              What each attendant handed over, and who confirmed it
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm"
            >
              {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="submitted">Awaiting</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>

        {/* Totals first, and confirmed money only. A declaration nobody has
            checked is a claim, not a receipt. */}
        {totals && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Counted takings</p>
                <p className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                  {naira(totals.total)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totals.shifts} shift{totals.shifts === 1 ? "" : "s"}
                  {awaiting > 0 && ` · ${awaiting} still awaiting confirmation`}
                </p>
                {totals.outstanding > 0 && (
                  <p className="text-xs font-bold text-red-700 mt-1">
                    {naira(totals.outstanding)} short and still owed
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-green-600 flex items-center gap-1">
                    <Banknote size={12} /> Cash
                  </p>
                  <p className="text-sm font-bold tabular-nums">{naira(totals.cash)}</p>
                  <p className="text-[10px] text-gray-400">must be in the drawer</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-blue-600 flex items-center gap-1">
                    <CreditCard size={12} /> POS
                  </p>
                  <p className="text-sm font-bold tabular-nums">{naira(totals.POS)}</p>
                  <p className="text-[10px] text-gray-400">check the terminal</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-purple-600 flex items-center gap-1">
                    <Landmark size={12} /> Transfer
                  </p>
                  <p className="text-sm font-bold tabular-nums">{naira(totals.transfer)}</p>
                  <p className="text-[10px] text-gray-400">check the statement</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The same money cut by what came out of the hose. A pump runs off one
            tank and a tank holds one product, so this needs no tagging by hand. */}
        {byProduct?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {byProduct.map((p) => (
              <div
                key={p.product}
                className="flex-1 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
              >
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{p.product}</p>
                <p className="text-lg font-extrabold tabular-nums text-gray-900 dark:text-white">
                  {naira(p.total)}
                </p>
                <p className="text-[11px] text-gray-400">
                  <span className="text-green-600 font-semibold">{naira(p.cash)}</span> cash ·{" "}
                  <span className="text-blue-600 font-semibold">{naira(p.POS)}</span> POS ·{" "}
                  <span className="text-purple-600 font-semibold">{naira(p.transfer)}</span> transfer
                </p>
              </div>
            ))}
          </div>
        )}

        {loading && rows.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">Nothing in this period.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse text-sm min-w-[800px]">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">Attendant</th>
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">Shift</th>
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Expected</th>
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Cash</th>
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">POS</th>
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Transfer</th>
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right">Total</th>
                  <th className="px-3 py-2.5 border border-gray-200 dark:border-gray-700">Confirmed by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  // The counted figures where they exist, otherwise what was
                  // declared, clearly marked as unconfirmed.
                  const s = r.received || r.declared || {};
                  const isConfirmed = r.status === "confirmed";
                  return (
                    <tr
                      key={r._id}
                      className={r.status === "disputed" ? "bg-amber-50 dark:bg-amber-900/10" : ""}
                    >
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 font-medium">
                        {nameOf(r.attendant)}
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                        {r.shift?.pumpTitle || "—"}
                        <span className="block">{Number(r.shift?.litresSold || 0).toLocaleString()} L</span>
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">
                        {naira(r.expectedAmount)}
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">{naira(s.cash)}</td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">{naira(s.POS)}</td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums">{naira(s.transfer)}</td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-right tabular-nums font-bold">
                        {naira(r.receivedTotal ?? r.declaredTotal)}
                        {r.status === "disputed" && (
                          <span className="block text-[10px] font-bold text-amber-700 flex items-center gap-1 justify-end">
                            <AlertTriangle size={10} /> {naira(Math.abs(r.receivedVariance || 0))} off
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-xs">
                        {isConfirmed || r.status === "disputed" ? (
                          <>
                            {nameOf(r.confirmedBy)}
                            <span className="block text-gray-400">{when(r.confirmedAt)}</span>
                          </>
                        ) : (
                          <span className="text-amber-600 font-semibold">Awaiting</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {rows.some((r) => r.note) && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Notes on differences</p>
            <div className="space-y-1.5">
              {rows.filter((r) => r.note).map((r) => (
                <p key={r._id} className="text-xs text-gray-500">
                  <span className="font-semibold">{nameOf(r.attendant)}:</span> {r.note}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

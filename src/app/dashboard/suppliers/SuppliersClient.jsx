"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Truck,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import useSupplierPayablesStore from "@/store/useSupplierPayablesStore";
import ExportButton from "@/components/ExportButton";

/**
 * What the station owes each supplier, and what is late.
 *
 * One row per document, with the date it was raised, the moment it was recorded
 * and when it falls due. Nothing is aggregated away: an accountant settling a
 * supplier needs to see the individual invoices, because that is what they pay.
 */

const num = (n, dp = 2) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: dp });

const naira = (n) => `₦${num(n)}`;

const iso = (d) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const dateOnly = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "—";

/** Date AND time — "when was this entered" is an audit question. */
const stamp = (v) =>
  v
    ? new Date(v).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATUS = {
  paid: {
    label: "Paid",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  due_not_paid: {
    label: "Due — not paid",
    cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
  not_due: {
    label: "Not due",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  pending: {
    label: "Pending",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
};

const FILTERS = [
  { value: "all", label: "All" },
  // Everything still owing, whatever its state — the question people actually
  // arrive with. The three narrower chips stay for drilling in.
  { value: "unpaid", label: "Unpaid" },
  { value: "due_not_paid", label: "Due — not paid" },
  { value: "not_due", label: "Not due" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

function StatusPill({ status, partiallyPaid }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${s.cls}`}>
        {s.label}
      </span>
      {partiallyPaid && (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
          part paid
        </span>
      )}
    </span>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-xl sm:text-2xl font-bold ${tone || "text-gray-900 dark:text-gray-100"}`}>
        {value}
      </p>
      {sub ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p> : null}
    </div>
  );
}

function SupplierCard({ supplier, open, onToggle }) {
  const t = supplier.totals;
  // Owed first: the page exists to answer what is outstanding. History is the
  // follow-up question, one click away rather than scrolled past.
  const [view, setView] = useState("owed");
  const payments = supplier.payments || [];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start sm:items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {open ? (
              <ChevronDown size={18} className="text-gray-400 shrink-0" />
            ) : (
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            )}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {supplier.supplierName}
            </h3>
            {t.overdue > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 whitespace-nowrap">
                {naira(t.overdue)} overdue
              </span>
            )}
            {supplier.oldestOverdueDays > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 inline-flex items-center gap-1 whitespace-nowrap">
                <Clock size={10} /> {supplier.oldestOverdueDays}d late
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>
              {t.invoiceCount} document{t.invoiceCount === 1 ? "" : "s"}
            </span>
            {supplier.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone size={10} /> {supplier.phone}
              </span>
            )}
            {supplier.email && (
              <span className="inline-flex items-center gap-1">
                <Mail size={10} /> {supplier.email}
              </span>
            )}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Outstanding
          </p>
          <p
            className={`text-lg font-bold ${
              t.overdue > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {naira(t.outstanding)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {naira(t.billed)} billed · {naira(t.paid)} paid
          </p>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 px-4 pt-3">
            {[
              { key: "owed", label: `Owed (${supplier.rows.length})` },
              { key: "paid", label: `Payments (${payments.length})` },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  view === v.key
                    ? "bg-[#0080ff] text-white border-[#0080ff]"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                }`}
              >
                {v.label}
              </button>
            ))}
            {supplier.totalPaidOut > 0 && (
              <span className="ml-auto self-center text-xs text-gray-500 dark:text-gray-400">
                {naira(supplier.totalPaidOut)} paid out to date
              </span>
            )}
          </div>

          {view === "paid" ? (
            payments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                No payments have been recorded for this supplier yet.
              </p>
            ) : (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm min-w-[880px]">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Paid on</th>
                      <th className="text-left font-medium px-3 py-2">Against</th>
                      <th className="text-left font-medium px-3 py-2">Method / ref</th>
                      <th className="text-right font-medium px-3 py-2">Amount</th>
                      <th className="text-right font-medium px-3 py-2">WHT</th>
                      <th className="text-right font-medium px-3 py-2">Net paid</th>
                      <th className="text-left font-medium px-3 py-2">Recorded by</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {payments.map((p) => (
                      <tr
                        key={p.key}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                          p.reversed ? "opacity-60" : ""
                        }`}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {dateOnly(p.paidAt)}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                          {p.against || "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {[p.method, p.reference].filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-right tabular-nums font-semibold ${
                            p.reversed
                              ? "line-through text-gray-400 dark:text-gray-500"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {naira(p.amount)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                          {p.whtWithheld > 0 ? naira(p.whtWithheld) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">
                          {naira(p.netPaid)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {p.recordedBy || "—"}
                          {/* Kept, not hidden: the cash left the bank and came
                              back, and both movements are on the statement. */}
                          {p.reversed && (
                            <span className="block text-[11px] text-rose-600 dark:text-rose-400">
                              reversed{p.reversedAt ? ` ${dateOnly(p.reversedAt)}` : ""}
                              {p.reversalReason ? ` — ${p.reversalReason}` : ""}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
          <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-700 mt-3">
            {[
              { label: "Overdue", v: t.overdue, tone: "text-rose-600 dark:text-rose-400" },
              { label: "Not yet due", v: t.notDue, tone: "" },
              { label: "Pending (no due date)", v: t.pending, tone: "" },
              { label: "Paid to date", v: t.paid, tone: "text-emerald-700 dark:text-emerald-400" },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-gray-900 p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {c.label}
                </p>
                <p className={`font-semibold ${c.tone || "text-gray-900 dark:text-gray-100"}`}>
                  {naira(c.v)}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1020px]">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Reference</th>
                  <th className="text-left font-medium px-3 py-2">Document date</th>
                  <th className="text-left font-medium px-3 py-2">Recorded</th>
                  <th className="text-left font-medium px-3 py-2">Due</th>
                  <th className="text-right font-medium px-3 py-2">Amount</th>
                  <th className="text-right font-medium px-3 py-2">Paid</th>
                  <th className="text-right font-medium px-3 py-2">Outstanding</th>
                  <th className="text-left font-medium px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {supplier.rows.map((r) => (
                  <tr key={r.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2">
                      <span className="text-gray-900 dark:text-gray-100">{r.reference}</span>
                      <span className="block text-[11px] text-gray-400">{r.kind}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {dateOnly(r.documentDate)}
                    </td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[12px]">
                      {stamp(r.recordedAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-gray-600 dark:text-gray-300">{dateOnly(r.dueDate)}</span>
                      {r.daysOverdue > 0 && (
                        <span className="block text-[11px] text-rose-600 dark:text-rose-400">
                          {r.daysOverdue} day{r.daysOverdue === 1 ? "" : "s"} late
                        </span>
                      )}
                      {r.daysOverdue !== null && r.daysOverdue <= 0 && r.status === "not_due" && (
                        <span className="block text-[11px] text-gray-400">
                          in {Math.abs(r.daysOverdue)} day{Math.abs(r.daysOverdue) === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-900 dark:text-gray-100">
                      {naira(r.total)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">
                      {naira(r.amountPaid)}
                      {r.creditApplied > 0 && (
                        <span className="block text-[11px] text-gray-400">
                          +{naira(r.creditApplied)} credit
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums font-semibold ${
                        r.outstanding > 0
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {naira(r.outstanding)}
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill status={r.status} partiallyPaid={r.partiallyPaid} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SuppliersClient() {
  const { payables, loading, error, fetchSupplierPayables } = useSupplierPayablesStore();

  const [asOf, setAsOf] = useState(iso(new Date()));
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState({});

  useEffect(() => {
    fetchSupplierPayables({ asOf, status });
  }, [asOf, status, fetchSupplierPayables]);

  // Open whoever is owed the most that is late — the reason the page was opened.
  useEffect(() => {
    if (!payables?.suppliers?.length) return;
    setOpen((prev) => {
      if (Object.keys(prev).length) return prev;
      const first = payables.suppliers[0];
      return first ? { [first.supplierId || first.supplierName]: true } : {};
    });
  }, [payables]);

  const suppliers = payables?.suppliers || [];
  const totals = payables?.totals;

  const csvColumns = [
    { header: "Supplier" },
    { header: "Reference" },
    { header: "Type" },
    { header: "Document date" },
    { header: "Recorded at" },
    { header: "Due date" },
    { header: "Amount" },
    { header: "Paid" },
    { header: "Credit applied" },
    { header: "Outstanding" },
    { header: "Status" },
    { header: "Days overdue" },
  ];

  const csv = useMemo(
    () =>
      suppliers.flatMap((s) =>
        s.rows.map((r) => [
          s.supplierName,
          r.reference,
          r.kind,
          r.documentDate ? dateOnly(r.documentDate) : "",
          r.recordedAt ? stamp(r.recordedAt) : "",
          r.dueDate ? dateOnly(r.dueDate) : "",
          r.total,
          r.amountPaid,
          r.creditApplied,
          r.outstanding,
          (STATUS[r.status] || {}).label || r.status,
          r.daysOverdue ?? "",
        ])
      ),
    [suppliers]
  );

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <Truck className="text-[#0080ff] shrink-0" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Suppliers</h1>
            <p className="text-sm text-neutral-400">
              What is owed to each supplier, and what has fallen due.
            </p>
          </div>
        </div>
        {csv.length > 0 && (
          <ExportButton data={csv} columns={csvColumns} fileName={`supplier-payables-${asOf}`} />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                status === f.value
                  ? "bg-[#0080ff] text-white border-[#0080ff]"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {f.label}
              {payables?.counts?.[f.value] !== undefined && f.value !== "all" ? (
                <span className="ml-1.5 opacity-70">{payables.counts[f.value]}</span>
              ) : null}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ml-auto">
          {/* Ageing only means anything against a date. Month-end review wants
              the position as it stood then, not as it stands today. */}
          As at
          <input
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg px-3 py-1.5 text-sm"
          />
        </label>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && !payables ? (
        <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Working out what is owed…
        </div>
      ) : !payables ? null : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Stat
              label="Outstanding"
              value={naira(totals.outstanding)}
              sub={`${suppliers.length} supplier${suppliers.length === 1 ? "" : "s"}`}
            />
            <Stat
              label="Due — not paid"
              value={naira(totals.overdue)}
              sub="past the due date"
              tone="text-rose-600 dark:text-rose-400"
            />
            <Stat label="Not yet due" value={naira(totals.notDue)} sub="inside terms" />
            <Stat
              label="Paid out"
              value={naira(payables.paidOut || 0)}
              sub={`${payables.paymentCount || 0} payment${payables.paymentCount === 1 ? "" : "s"} · net of reversals`}
              tone="text-emerald-700 dark:text-emerald-400"
            />
          </div>

          {totals.pending > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 flex items-start gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                {naira(totals.pending)} received but not yet invoiced — owed, with no due date
                stated. It is counted in Outstanding above.
              </span>
            </p>
          )}

          {/* How late the late money is. */}
          {totals.overdue > 0 && (
            <div className="mb-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <p className="px-4 pt-3 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Ageing of what is owed
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-gray-200 dark:bg-gray-700 mt-2">
                {payables.buckets.map((b) => (
                  <div key={b} className="bg-white dark:bg-gray-900 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {b === "current" ? "Not yet due" : `${b} days`}
                    </p>
                    <p
                      className={`font-semibold ${
                        b === "90+" && payables.ageing[b] > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {naira(payables.ageing[b])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {suppliers.map((s) => {
              const key = s.supplierId || s.supplierName;
              return (
                <SupplierCard
                  key={key}
                  supplier={s}
                  open={!!open[key]}
                  onToggle={() => setOpen((p) => ({ ...p, [key]: !p[key] }))}
                />
              );
            })}
          </div>

          {suppliers.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {status === "all"
                ? "Nothing is owed to any supplier."
                : `No documents are ${(STATUS[status] || {}).label?.toLowerCase() || status}.`}
            </div>
          )}

          {payables.notes?.length > 0 && (
            <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                How to read this
              </p>
              {payables.notes.map((n, i) => (
                <p key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex gap-1.5">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <span>{n}</span>
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

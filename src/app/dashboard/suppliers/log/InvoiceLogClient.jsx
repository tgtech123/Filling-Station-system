"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  FileText,
  Search,
  X,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
} from "lucide-react";
import useInvoiceLogStore from "@/store/useInvoiceLogStore";
import ExportButton from "@/components/ExportButton";

/**
 * The supplier invoice register.
 *
 * One line per invoice, paid and unpaid together, looked up by supplier name or
 * invoice number and exported for somebody who is not sitting in front of the
 * app — an auditor, a bank, a partner at a meeting.
 *
 * Deliberately flat. The Suppliers page groups by supplier and answers "who do
 * we owe and how late are we"; this answers "find me invoice INV-0412" and
 * "give me every unpaid invoice for March as a spreadsheet".
 */

const num = (n, dp = 2) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: dp });

const naira = (n) => `₦${num(n)}`;

const dateOnly = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "—";

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

/** The detail behind "Unpaid", kept as a quiet second line. */
const DETAIL = {
  due_not_paid: { label: "overdue", cls: "text-rose-600 dark:text-rose-400" },
  not_due: { label: "within terms", cls: "text-gray-500 dark:text-gray-400" },
  pending: { label: "awaiting invoice", cls: "text-amber-600 dark:text-amber-400" },
  paid: { label: "", cls: "" },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

const COLUMNS = [
  { key: "reference", label: "Invoice no.", sort: null },
  { key: "supplier", label: "Supplier", sort: "supplier" },
  { key: "documentDate", label: "Date", sort: "date" },
  { key: "dueDate", label: "Due", sort: "due" },
  { key: "total", label: "Amount", sort: "amount", right: true },
  { key: "amountPaid", label: "Paid", sort: null, right: true },
  { key: "outstanding", label: "Outstanding", sort: "outstanding", right: true },
  { key: "settlement", label: "Status", sort: null },
];

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

export default function InvoiceLogClient() {
  const { log, loading, error, fetchInvoiceLog, fetchAllForExport } = useInvoiceLogStore();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState({ from: "", to: "" });
  const [sort, setSort] = useState("date");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [exportRows, setExportRows] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const exportRef = useRef(null);

  // Typing fires a request per keystroke otherwise, and this endpoint walks
  // every invoice in the station to build its rows.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const query = useMemo(
    () => ({
      search: debounced || undefined,
      filter,
      from: range.from || undefined,
      to: range.to || undefined,
      sort,
      direction,
    }),
    [debounced, filter, range.from, range.to, sort, direction]
  );

  // Any change to what is being asked for puts the reader back on page 1 —
  // otherwise a search from page 4 lands on an empty page 4 of two results.
  useEffect(() => {
    setPage(1);
    setExportRows(null);
  }, [query]);

  useEffect(() => {
    fetchInvoiceLog({ ...query, page });
  }, [query, page, fetchInvoiceLog]);

  const toggleSort = useCallback(
    (col) => {
      if (!col) return;
      if (sort === col) setDirection((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSort(col);
        // Names read A–Z; money and dates read biggest/newest first.
        setDirection(col === "supplier" ? "asc" : "desc");
      }
    },
    [sort]
  );

  const csvColumns = [
    { header: "Invoice no." },
    { header: "Type" },
    { header: "Supplier" },
    { header: "Document date" },
    { header: "Recorded at" },
    { header: "Due date" },
    { header: "Amount" },
    { header: "Paid" },
    { header: "Credit applied" },
    { header: "Outstanding" },
    { header: "Status" },
    { header: "Detail" },
    { header: "Days overdue" },
  ];

  const toCsv = (rows) =>
    rows.map((r) => [
      r.reference,
      r.kind,
      r.supplierName,
      r.documentDate ? dateOnly(r.documentDate) : "",
      r.recordedAt ? stamp(r.recordedAt) : "",
      r.dueDate ? dateOnly(r.dueDate) : "",
      r.total,
      r.amountPaid,
      r.creditApplied,
      r.outstanding,
      r.settlement,
      (DETAIL[r.status] || {}).label || "",
      r.daysOverdue > 0 ? r.daysOverdue : "",
    ]);

  /**
   * Export covers every matching row, not the page on screen.
   *
   * A spreadsheet headed "page 1 of 9" is not a reference document. The rows
   * are fetched unpaged first, then the real download button is clicked for
   * the reader so it still feels like one action.
   */
  const prepareExport = async () => {
    setPreparing(true);
    try {
      const rows = await fetchAllForExport(query);
      setExportRows(toCsv(rows));
      // Let the button mount with its data before firing it.
      setTimeout(() => exportRef.current?.querySelector("button")?.click(), 0);
    } finally {
      setPreparing(false);
    }
  };

  const rows = log?.rows || [];
  const m = log?.matched;
  const narrowed = log && log.matched.count !== log.grandTotal.count;
  const fileName = `supplier-invoices-${filter}${range.from ? `-${range.from}` : ""}${
    range.to ? `-to-${range.to}` : ""
  }`;

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <FileText className="text-[#0080ff] shrink-0" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Supplier Invoice Log
            </h1>
            <p className="text-sm text-neutral-400">
              Every supplier invoice, paid and unpaid — searchable and exportable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prepareExport}
            disabled={preparing || !rows.length}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#0080ff] text-white disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            {preparing ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {preparing ? "Preparing…" : `Export ${m ? m.count : ""}`}
          </button>
          {/* Mounted only once the full set is loaded; this is what actually
              writes the file, and it is clicked programmatically above. */}
          {exportRows && (
            <span ref={exportRef} className="hidden">
              <ExportButton data={exportRows} columns={csvColumns} fileName={fileName} />
            </span>
          )}
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier name or invoice number…"
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg outline-none focus:border-[#0080ff]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                filter === f.value
                  ? "bg-[#0080ff] text-white border-[#0080ff]"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {f.label}
              {log?.counts?.[f.value] !== undefined && (
                <span className="ml-1.5 opacity-70">{log.counts[f.value]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Invoice dated</span>
        <input
          type="date"
          value={range.from}
          max={range.to || undefined}
          onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg px-3 py-1.5 text-sm"
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          value={range.to}
          min={range.from || undefined}
          onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg px-3 py-1.5 text-sm"
        />
        {(range.from || range.to) && (
          <button
            onClick={() => setRange({ from: "", to: "" })}
            className="text-xs text-[#0080ff] hover:underline"
          >
            Clear dates
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && !log ? (
        <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading the invoice log…
        </div>
      ) : !log ? null : (
        <>
          {/* Totals for what is on screen, not for the whole book. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Stat
              label="Invoices"
              value={num(m.count, 0)}
              sub={`${m.paidCount} paid · ${m.unpaidCount} unpaid`}
            />
            <Stat label="Total billed" value={naira(m.billed)} sub="value of these invoices" />
            <Stat
              label="Paid"
              value={naira(m.paid)}
              tone="text-emerald-700 dark:text-emerald-400"
              sub="settled against them"
            />
            <Stat
              label="Outstanding"
              value={naira(m.outstanding)}
              tone={m.outstanding > 0 ? "text-rose-600 dark:text-rose-400" : ""}
              sub="still owing"
            />
          </div>

          {narrowed && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-start gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                Showing {num(m.count, 0)} of {num(log.grandTotal.count, 0)} invoices.
                The figures above cover this selection only.
              </span>
            </p>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1040px]">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    {COLUMNS.map((c) => (
                      <th
                        key={c.key}
                        className={`font-medium px-3 py-2.5 ${c.right ? "text-right" : "text-left"} ${
                          c.sort ? "cursor-pointer select-none hover:text-gray-900 dark:hover:text-white" : ""
                        }`}
                        onClick={() => toggleSort(c.sort)}
                      >
                        <span
                          className={`inline-flex items-center gap-1 ${
                            c.right ? "flex-row-reverse" : ""
                          }`}
                        >
                          {c.label}
                          {sort === c.sort &&
                            (direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((r) => {
                    const d = DETAIL[r.status] || {};
                    const paid = r.settlement === "Paid";
                    return (
                      <tr key={r.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2">
                          <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                            {r.reference}
                          </span>
                          <span className="block text-[11px] text-gray-400">{r.kind}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {r.supplierName}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {dateOnly(r.documentDate)}
                          <span className="block text-[11px] text-gray-400">
                            {stamp(r.recordedAt)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {dateOnly(r.dueDate)}
                          {r.daysOverdue > 0 && (
                            <span className="block text-[11px] text-rose-600 dark:text-rose-400">
                              {r.daysOverdue}d late
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
                              +{naira(r.creditApplied)} cr
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
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                              paid
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                            }`}
                          >
                            {r.settlement}
                          </span>
                          {r.partiallyPaid && (
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              part paid
                            </span>
                          )}
                          {!paid && d.label && (
                            <span className={`block text-[11px] mt-0.5 ${d.cls}`}>{d.label}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {rows.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                {debounced
                  ? `No invoice matches “${debounced}”.`
                  : "No invoices match this selection."}
              </p>
            )}

            {log.pages > 1 && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Page {log.page} of {log.pages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={log.page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(log.pages, p + 1))}
                    disabled={log.page >= log.pages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-400 flex gap-1.5">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>
              “Unpaid” covers anything still owing — overdue, within terms, or received but
              not yet invoiced; the second line on each row says which. Statuses are derived
              the same way as on the Suppliers page, so the two always agree. The export
              covers every invoice matching the current search and filter, not just this page.
            </span>
          </p>

          {loading && (
            <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
              <Loader2 className="animate-spin" size={12} /> Refreshing…
            </p>
          )}
        </>
      )}
    </div>
  );
}

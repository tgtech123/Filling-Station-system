"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Package,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
} from "lucide-react";
import useStockPositionStore from "@/store/useStockPositionStore";
import ExportButton from "@/components/ExportButton";

/**
 * What the station was holding when the period opened, and what it holds now —
 * in quantity AND in naira, for every product line: lubricants, store goods,
 * fuel in the ground, bulk LPG and cylinder bottles.
 *
 * Manager and accountant see the same screen. The manager reads the top of it
 * ("what did the month start with"); the accountant reads the rest, because an
 * opening stock figure is the first line of a cost-of-sales calculation and has
 * to be defensible line by line — hence the movements beside every balance and
 * the valuation basis printed on each department.
 */

const naira = (n) =>
  `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const qty = (n, unit) => {
  const v = Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (unit === "litre") return `${v} L`;
  if (unit === "kg") return `${v} kg`;
  return v;
};

const iso = (d) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/** Midday, so reading a plain YYYY-MM-DD back never slips a day on the clock. */
const dayLabel = (d) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * The day comes first because the day is the job: stock is opened against
 * yesterday's close every morning and counted again every night. The month and
 * the custom range are for the questions that come up afterwards.
 */
const RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom" },
];

const rangeDates = (r) => {
  const now = new Date();
  if (r === "today") return { from: iso(now), to: iso(now) };
  if (r === "yesterday") {
    const d = new Date(now);
    d.setDate(now.getDate() - 1);
    return { from: iso(d), to: iso(d) };
  }
  if (r === "week") {
    const s = new Date(now);
    s.setDate(now.getDate() - 6);
    return { from: iso(s), to: iso(now) };
  }
  if (r === "lastMonth") {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: iso(s), to: iso(e) };
  }
  if (r === "month") {
    return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
  }
  return { from: iso(now), to: iso(now) };
};

const DEPARTMENT_TONE = {
  lubricant: "text-amber-600 dark:text-amber-400",
  store: "text-emerald-600 dark:text-emerald-400",
  fuel: "text-blue-600 dark:text-blue-400",
  gas: "text-orange-600 dark:text-orange-400",
  cylinder: "text-purple-600 dark:text-purple-400",
};

function Stat({ label, value, sub, strong }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`mt-1 ${
          strong ? "text-xl sm:text-2xl font-bold" : "text-lg font-semibold"
        } text-gray-900 dark:text-gray-100`}
      >
        {value}
      </p>
      {sub ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p> : null}
    </div>
  );
}

function DepartmentCard({ dept, open, onToggle, isToday }) {
  const t = dept.totals;
  const tone = DEPARTMENT_TONE[dept.key] || "text-gray-600";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start sm:items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {open ? (
              <ChevronDown size={18} className="text-gray-400 shrink-0" />
            ) : (
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            )}
            <h3 className={`font-semibold ${tone}`}>{dept.label}</h3>
            {dept.estimatedCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {dept.estimatedCount} estimated
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
            {dept.lines.length} line{dept.lines.length === 1 ? "" : "s"} · valued at{" "}
            {dept.valuationBasis.toLowerCase()}
          </p>
        </div>

        {/* The answer to the question the page was opened to ask. */}
        <div className="text-right shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Opening stock
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {naira(t.openingValue)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {qty(t.openingQty, dept.unit)} {dept.unit === "unit" ? dept.unitLabel : ""}
          </p>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Department movement summary — the arithmetic behind the balance. */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-gray-200 dark:bg-gray-700">
            {[
              { label: "Opening", q: t.openingQty, v: t.openingValue },
              { label: "Stock in", q: t.purchaseQty, v: t.purchaseValue },
              { label: "Sold (at cost)", q: t.salesQty, v: t.salesCost },
              { label: "Adjustments", q: t.adjustmentQty, v: t.adjustmentValue },
              { label: isToday ? "Now" : "Closing", q: t.closingQty, v: t.closingValue },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-gray-900 p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {c.label}
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{naira(c.v)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{qty(c.q, dept.unit)}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[880px]">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Product</th>
                  <th className="text-right font-medium px-3 py-2">Opening qty</th>
                  <th className="text-right font-medium px-3 py-2">Opening value</th>
                  <th className="text-right font-medium px-3 py-2">In</th>
                  <th className="text-right font-medium px-3 py-2">Sold</th>
                  <th className="text-right font-medium px-3 py-2">Adjust</th>
                  <th className="text-right font-medium px-3 py-2">
                    {isToday ? "Qty now" : "Closing qty"}
                  </th>
                  <th className="text-right font-medium px-3 py-2">
                    {isToday ? "Value now" : "Closing value"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {dept.lines.map((l) => (
                  <tr key={String(l._id)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2">
                      <span className="text-gray-900 dark:text-gray-100">{l.productName}</span>
                      {l.estimated && (
                        <span
                          title="Valued at a standing cost, not the cost of this specific stock"
                          className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          est.
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {qty(l.opening.qty, dept.unit)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">
                      {naira(l.opening.value)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {l.purchases.qty ? qty(l.purchases.qty, dept.unit) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">
                      {l.sales.qty ? qty(l.sales.qty, dept.unit) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                      {l.adjustments.qty ? qty(l.adjustments.qty, dept.unit) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {qty(l.closing.qty, dept.unit)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">
                      {naira(l.closing.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {dept.notes?.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              {dept.notes.map((n, i) => (
                <p key={i} className="text-xs text-gray-500 dark:text-gray-400 flex gap-2">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  <span>{n}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OpeningStockClient() {
  const { position, loading, error, fetchStockPosition } = useStockPositionStore();

  const [range, setRange] = useState("today");
  const [custom, setCustom] = useState(rangeDates("today"));
  const [expanded, setExpanded] = useState({});

  const dates = range === "custom" ? custom : rangeDates(range);

  // One day is the case this screen is opened for most mornings, and it reads
  // differently from a month: the balances are a day's open and close, not a
  // period's. Today is still running, so its close is "so far".
  const singleDay = dates.from === dates.to;
  const isToday = singleDay && dates.to === iso(new Date());

  useEffect(() => {
    fetchStockPosition(dates);
    // Refetch on the period only; `dates` is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStockPosition, range, custom.from, custom.to]);

  const departments = position?.departments || [];
  const totals = position?.totals;

  // The first department opens by itself: a report that needs a click before it
  // shows anything is a report nobody reads.
  useEffect(() => {
    if (departments.length && Object.keys(expanded).length === 0) {
      setExpanded({ [departments[0].key]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments.length]);

  const csv = useMemo(() => {
    const rows = [];
    for (const d of departments) {
      for (const l of d.lines) {
        rows.push([
          d.label,
          l.productName,
          d.unitLabel,
          l.opening.qty,
          l.opening.value,
          l.purchases.qty,
          l.purchases.value,
          l.sales.qty,
          l.sales.cost,
          l.adjustments.qty,
          l.closing.qty,
          l.closing.value,
          l.estimated ? "estimated" : "",
        ]);
      }
    }
    return rows;
  }, [departments]);

  const csvColumns = [
    { header: "Department" },
    { header: "Product" },
    { header: "Unit" },
    { header: "Opening qty" },
    { header: "Opening value" },
    { header: "Stock in qty" },
    { header: "Stock in value" },
    { header: "Sold qty" },
    { header: "Cost of sales" },
    { header: "Adjustment qty" },
    { header: "Closing qty" },
    { header: "Closing value" },
    { header: "Basis" },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Package className="text-[#0080ff] shrink-0" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Opening Stock</h1>
            <p className="text-sm text-neutral-400">
              {singleDay
                ? `What every product line was worth at the start of ${dayLabel(dates.from)} — quantity and naira.`
                : "What every product line was worth when the period opened — quantity and naira."}
            </p>
          </div>
        </div>
        {csv.length > 0 && (
          <ExportButton
            data={csv}
            columns={csvColumns}
            fileName={
              singleDay ? `opening-stock-${dates.from}` : `opening-stock-${dates.from}-to-${dates.to}`
            }
          />
        )}
      </div>

      {/* Period */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex gap-1 p-1 rounded-[10px] overflow-x-auto">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-[8px] text-sm whitespace-nowrap transition-colors ${
                range === r.value
                  ? "bg-[#d9edff] dark:bg-blue-900/40 font-semibold text-[#0080ff]"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {range === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={custom.from}
              max={custom.to}
              onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg px-3 py-1.5 text-sm"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={custom.to}
              min={custom.from}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
        )}

        {loading && <Loader2 size={18} className="animate-spin text-[#0080ff]" />}
      </div>

      {/* The morning question, answered before it is asked: today's opening
          figure IS yesterday's closing figure, so a manager comparing the two
          screens is not looking at two different calculations. */}
      {singleDay && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 flex gap-2">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>
            Opening stock for {dayLabel(dates.from)} is the closing balance carried forward from
            the day before — the same figure, not a second calculation.
            {isToday
              ? " Today is still trading, so the closing column is the live balance and settles as the last shift is entered."
              : ""}
          </span>
        </p>
      )}

      {error && (
        <div className="mb-5 flex gap-2 items-start bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl p-3 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Station-wide money. Quantities are deliberately absent: litres, kilos
          and pieces do not share a unit, so a single total would be fiction. */}
      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Stat
            label="Opening stock value"
            value={naira(totals.openingValue)}
            strong
            sub={
              singleDay
                ? `Start of ${dayLabel(dates.from)} — the previous day's closing balance`
                : undefined
            }
          />
          <Stat label="Stock received" value={naira(totals.purchaseValue)} />
          <Stat label="Cost of goods sold" value={naira(totals.salesCost)} />
          <Stat
            // Today is still trading, so its closing figure is the live balance
            // rather than a final one, and it should not claim otherwise.
            label={isToday ? "Stock value now" : "Closing stock value"}
            value={naira(totals.closingValue)}
            strong
            sub={
              isToday
                ? `Today so far · gross profit ${naira(totals.grossProfit)}`
                : `Gross profit ${naira(totals.grossProfit)}`
            }
          />
        </div>
      )}

      {/* Departments */}
      {!loading && departments.length === 0 && !error && (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center">
          <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            Nothing was in stock in this period
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Register products, record a delivery or complete a shift, and the figures appear here.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {departments.map((d) => (
          <DepartmentCard
            key={d.key}
            dept={d}
            isToday={isToday}
            open={!!expanded[d.key]}
            onToggle={() => setExpanded((e) => ({ ...e, [d.key]: !e[d.key] }))}
          />
        ))}
      </div>

      {position?.notes?.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
          {position.notes.map((n, i) => (
            <p key={i} className="text-xs text-gray-500 dark:text-gray-400 flex gap-2">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>{n}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

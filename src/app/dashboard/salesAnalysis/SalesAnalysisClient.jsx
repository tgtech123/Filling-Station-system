"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  BarChart3,
  Trophy,
} from "lucide-react";
import useSalesAnalysisStore from "@/store/useSalesAnalysisStore";
import ExportButton from "@/components/ExportButton";

/**
 * What sold, and what was actually made on it.
 *
 * Fuel and bulk gas are read by product — PMS, AGO, DPK, LPG — with the tanks
 * behind each product available underneath, because a difference between two
 * PMS tanks is a finding. Lubricants, cylinders and the shop are read item by
 * item and ranked, so "Coca-Cola 50cl" sits in its own row with the quantity,
 * the takings, the cost and the profit against it.
 *
 * The figures come from the same movement walk as the opening/closing stock
 * report, so the two screens agree by construction rather than by luck.
 */

/* ────────────────────────────── formatting ────────────────────────────── */

const num = (n, dp = 2) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: dp });

const naira = (n) => `₦${num(n)}`;

/** Compact naira for stat tiles, where the full figure does not fit. */
const nairaShort = (n) => {
  const v = Number(n || 0);
  const a = Math.abs(v);
  if (a >= 1_000_000_000) return `₦${num(v / 1_000_000_000, 2)}b`;
  if (a >= 1_000_000) return `₦${num(v / 1_000_000, 2)}m`;
  if (a >= 100_000) return `₦${num(v / 1_000, 0)}k`;
  return naira(v);
};

const UNIT_SHORT = { litres: "L", kg: "kg", units: "" };

const qtyText = (n, unit) => {
  const v = num(n, 2);
  const short = UNIT_SHORT[unit] ?? unit;
  return short ? `${v} ${short}` : v;
};

/** A margin of null is undefined, not zero — nothing was sold to have a margin on. */
const pct = (n) => (n === null || n === undefined ? "—" : `${num(n, 1)}%`);

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

const SECTION_TONE = {
  fuel: "text-blue-600 dark:text-blue-400",
  gas: "text-purple-600 dark:text-purple-400",
  cylinder: "text-rose-600 dark:text-rose-400",
  lubricant: "text-amber-600 dark:text-amber-400",
  store: "text-emerald-600 dark:text-emerald-400",
};

/* ──────────────────────────── small components ─────────────────────────── */

/**
 * Period-over-period movement.
 *
 * `null` means there is no basis to compare against — the product did not sell
 * last period at all. That is deliberately NOT rendered as a percentage: growth
 * from zero is not a number, and printing one is how a report loses its reader.
 */
function Change({ value, invert = false }) {
  if (value === null || value === undefined) {
    return <span className="text-[11px] text-gray-400 dark:text-gray-500">new</span>;
  }
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-500 dark:text-gray-400">
        <Minus size={11} /> 0%
      </span>
    );
  }
  const up = value > 0;
  // On a cost column, up is bad — so the colour follows meaning, not direction.
  const good = invert ? !up : up;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
        good
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      }`}
    >
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {num(Math.abs(value), 1)}%
    </span>
  );
}

function Stat({ label, value, sub, change, invert, strong, tone }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`mt-1 ${strong ? "text-xl sm:text-2xl font-bold" : "text-lg font-semibold"} ${
          tone || "text-gray-900 dark:text-gray-100"
        }`}
      >
        {value}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        {sub ? <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p> : null}
        {change !== undefined ? <Change value={change} invert={invert} /> : null}
      </div>
    </div>
  );
}

function Pill({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** One ranked product row, with its tank breakdown underneath when it has one. */
function ProductRow({ row, unit, comparing }) {
  const [open, setOpen] = useState(false);
  const hasBreakdown = Array.isArray(row.breakdown) && row.breakdown.length > 1;
  const loss = row.profit < 0;

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 tabular-nums">{row.rank}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            {hasBreakdown ? (
              <button
                onClick={() => setOpen((o) => !o)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
                aria-label={open ? "Hide tanks" : "Show tanks"}
              >
                {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
            ) : null}
            <span className="text-gray-900 dark:text-gray-100">{row.name}</span>
            {row.estimated && <Pill tone="amber">estimated</Pill>}
          </div>
        </td>
        <td className="px-3 py-2 text-right tabular-nums text-gray-900 dark:text-gray-100">
          {qtyText(row.qtySold, unit)}
          {comparing && (
            <div>
              <Change value={row.change?.qtySold} />
            </div>
          )}
        </td>
        <td className="px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">
          {row.avgUnitPrice === null ? "—" : naira(row.avgUnitPrice)}
        </td>
        <td className="px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">
          {row.avgUnitCost === null ? "—" : naira(row.avgUnitCost)}
        </td>
        <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">
          {naira(row.revenue)}
          {comparing && (
            <div>
              <Change value={row.change?.revenue} />
            </div>
          )}
        </td>
        <td className="px-3 py-2 text-right tabular-nums text-gray-600 dark:text-gray-300">
          {naira(row.cost)}
        </td>
        <td
          className={`px-3 py-2 text-right tabular-nums font-semibold ${
            loss ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {naira(row.profit)}
          {comparing && (
            <div className="font-normal">
              <Change value={row.change?.profit} />
            </div>
          )}
        </td>
        <td
          className={`px-3 py-2 text-right tabular-nums ${
            loss ? "text-rose-600 dark:text-rose-400" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {pct(row.margin)}
        </td>
        <td className="px-3 py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
          {pct(row.sharePct)}
        </td>
      </tr>

      {open &&
        row.breakdown.map((b) => (
          <tr key={b.key} className="bg-gray-50/70 dark:bg-gray-800/40 text-[13px]">
            <td className="px-3 py-1.5" />
            <td className="px-3 py-1.5 pl-9 text-gray-600 dark:text-gray-300">{b.name}</td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
              {qtyText(b.qtySold, unit)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
              {b.avgUnitPrice === null ? "—" : naira(b.avgUnitPrice)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
              {b.avgUnitCost === null ? "—" : naira(b.avgUnitCost)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
              {naira(b.revenue)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
              {naira(b.cost)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
              {naira(b.profit)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
              {pct(b.margin)}
            </td>
            <td className="px-3 py-1.5" />
          </tr>
        ))}
    </>
  );
}

function SectionCard({ section, open, onToggle, comparing }) {
  const t = section.totals;
  const tone = SECTION_TONE[section.key] || "text-gray-600 dark:text-gray-300";

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
            <h3 className={`font-semibold ${tone}`}>{section.label}</h3>
            {section.estimatedCount > 0 && (
              <Pill tone="amber">{section.estimatedCount} estimated</Pill>
            )}
            {section.lossMakers.length > 0 && (
              <Pill tone="rose">
                {section.lossMakers.length} below cost
              </Pill>
            )}
            {section.dormant.count > 0 && (
              <Pill>{section.dormant.count} sold nothing</Pill>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
            {section.rows.length} product{section.rows.length === 1 ? "" : "s"} sold ·{" "}
            {qtyText(t.qtySold, section.unitLabel)} {section.unitLabel === "units" ? "units" : ""} ·
            costed at {section.valuationBasis.toLowerCase()}
          </p>
        </div>

        {/* The answer the section was opened to give. */}
        <div className="text-right shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Gross profit
          </p>
          <p
            className={`text-lg font-bold ${
              t.profit < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {naira(t.profit)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {naira(t.revenue)} sold · {pct(t.margin)}
          </p>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* The arithmetic behind the headline. */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-gray-200 dark:bg-gray-700">
            {[
              { label: `Sold (${section.unitLabel})`, v: qtyText(t.qtySold, section.unitLabel), c: section.change?.qtySold },
              { label: "Revenue", v: naira(t.revenue), c: section.change?.revenue },
              { label: "Cost of goods", v: naira(t.cost), c: undefined },
              { label: "Gross profit", v: naira(t.profit), c: section.change?.profit },
              { label: "Margin", v: pct(t.margin), c: undefined },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-gray-900 p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {c.label}
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{c.v}</p>
                {comparing && c.c !== undefined ? <Change value={c.c} /> : null}
              </div>
            ))}
          </div>

          {/* Best by money and best by volume are rarely the same product, and an
              accountant cares which is which. */}
          {section.rows.length > 0 && (
            <div className="flex flex-wrap gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-xs">
              {[
                { k: "Most revenue", r: section.topByRevenue, v: (r) => naira(r.revenue) },
                { k: "Most sold", r: section.topByQty, v: (r) => qtyText(r.qtySold, section.unitLabel) },
                { k: "Most profit", r: section.topByProfit, v: (r) => naira(r.profit) },
              ]
                .filter((x) => x.r)
                .map((x) => (
                  <div key={x.k} className="flex items-center gap-1.5">
                    <Trophy size={13} className="text-amber-500 shrink-0" />
                    <span className="text-gray-500 dark:text-gray-400">{x.k}:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {x.r.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">({x.v(x.r)})</span>
                  </div>
                ))}
            </div>
          )}

          {section.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[980px]">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="text-left font-medium px-3 py-2 w-10">#</th>
                    <th className="text-left font-medium px-3 py-2">Product</th>
                    <th className="text-right font-medium px-3 py-2">Qty sold</th>
                    <th className="text-right font-medium px-3 py-2">Avg price</th>
                    <th className="text-right font-medium px-3 py-2">Avg cost</th>
                    <th className="text-right font-medium px-3 py-2">Revenue</th>
                    <th className="text-right font-medium px-3 py-2">Cost</th>
                    <th className="text-right font-medium px-3 py-2">Profit</th>
                    <th className="text-right font-medium px-3 py-2">Margin</th>
                    <th className="text-right font-medium px-3 py-2">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {section.rows.map((row) => (
                    <ProductRow
                      key={row.key}
                      row={row}
                      unit={section.unitLabel}
                      comparing={comparing}
                    />
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100">
                  <tr>
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {qtyText(t.qtySold, section.unitLabel)}
                    </td>
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2 text-right tabular-nums">{naira(t.revenue)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{naira(t.cost)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{naira(t.profit)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{pct(t.margin)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
              Nothing from this department sold in the selected period.
            </p>
          )}

          {section.lossMakers.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-rose-50/60 dark:bg-rose-900/10">
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Sold below cost
              </p>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                {section.lossMakers
                  .map((r) => `${r.name} (${naira(r.profit)})`)
                  .join(" · ")}
              </p>
              <p className="text-[11px] text-rose-700/70 dark:text-rose-300/70 mt-1">
                Usually a selling price set below the landed cost, or a cost recorded
                against the wrong unit. Worth checking before the period is closed.
              </p>
            </div>
          )}

          {section.dormant.count > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Stocked but sold nothing ({section.dormant.count})
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {section.dormant.names.join(" · ")}
                {section.dormant.count > section.dormant.names.length
                  ? ` … and ${section.dormant.count - section.dormant.names.length} more`
                  : ""}
              </p>
            </div>
          )}

          {section.notes?.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
              {section.notes.map((n, i) => (
                <p
                  key={i}
                  className="text-[11px] text-gray-500 dark:text-gray-400 flex gap-1.5"
                >
                  <Info size={12} className="shrink-0 mt-0.5" />
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

/* ──────────────────────────────── page ─────────────────────────────────── */

export default function SalesAnalysisClient() {
  const { analysis, loading, error, fetchSalesAnalysis } = useSalesAnalysisStore();

  const [range, setRange] = useState("month");
  const [custom, setCustom] = useState(rangeDates("month"));
  const [compare, setCompare] = useState(false);
  const [openSections, setOpenSections] = useState({});

  const dates = useMemo(
    () => (range === "custom" ? custom : rangeDates(range)),
    [range, custom]
  );

  useEffect(() => {
    if (!dates.from || !dates.to) return;
    fetchSalesAnalysis({ from: dates.from, to: dates.to, compare });
  }, [dates.from, dates.to, compare, fetchSalesAnalysis]);

  // Open the biggest earner by default — the reader almost always wants it, and
  // opening everything makes the page unreadable on a phone.
  useEffect(() => {
    if (!analysis?.sections?.length) return;
    setOpenSections((prev) => {
      if (Object.keys(prev).length) return prev;
      const biggest = [...analysis.sections].sort(
        (a, b) => b.totals.revenue - a.totals.revenue
      )[0];
      return biggest ? { [biggest.key]: true } : {};
    });
  }, [analysis]);

  const sections = analysis?.sections || [];
  const totals = analysis?.totals;
  const comparing = !!analysis?.comparedWith;
  const singleDay = dates.from === dates.to;

  /* Export: one flat row per product, department named on each so the file
     stands on its own once it is out of the app. */
  const csvColumns = [
    { header: "Department" },
    { header: "Rank" },
    { header: "Product" },
    { header: "Unit" },
    { header: "Qty sold" },
    { header: "Avg price" },
    { header: "Avg cost" },
    { header: "Revenue" },
    { header: "Cost of goods" },
    { header: "Gross profit" },
    { header: "Margin %" },
    { header: "Share of dept %" },
    { header: "Cost basis" },
  ];

  const csv = useMemo(
    () =>
      sections.flatMap((s) =>
        s.rows.map((r) => [
          s.label,
          r.rank,
          r.name,
          s.unitLabel,
          r.qtySold,
          r.avgUnitPrice ?? "",
          r.avgUnitCost ?? "",
          r.revenue,
          r.cost,
          r.profit,
          r.margin ?? "",
          r.sharePct,
          r.estimated ? "estimated" : "actual",
        ])
      ),
    [sections]
  );

  const toggle = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <BarChart3 className="text-[#0080ff] shrink-0" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sales Analysis
            </h1>
            <p className="text-sm text-neutral-400">
              {singleDay
                ? `What sold on ${dayLabel(dates.from)} and what was made on it.`
                : `What sold between ${dayLabel(dates.from)} and ${dayLabel(dates.to)} and what was made on it.`}
            </p>
          </div>
        </div>
        {csv.length > 0 && (
          <ExportButton
            data={csv}
            columns={csvColumns}
            fileName={
              singleDay
                ? `sales-analysis-${dates.from}`
                : `sales-analysis-${dates.from}-to-${dates.to}`
            }
          />
        )}
      </div>

      {/* Period */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => {
                setRange(r.value);
                if (r.value === "custom") setCustom(dates);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                range === r.value
                  ? "bg-[#0080ff] text-white border-[#0080ff]"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          Compare with previous period
        </label>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && !analysis ? (
        <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Working out what sold…
        </div>
      ) : !analysis ? null : (
        <>
          {comparing && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Compared with {dayLabel(iso(new Date(analysis.comparedWith.from)))} –{" "}
              {dayLabel(iso(new Date(analysis.comparedWith.to)))}, the equivalent stretch
              immediately before this one.
            </p>
          )}

          {/* Station totals. Naira only — litres, kilos and pieces do not add up. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Stat
              label="Revenue"
              value={nairaShort(totals.revenue)}
              sub={naira(totals.revenue)}
              change={comparing ? totals.change?.revenue : undefined}
              strong
            />
            <Stat
              label="Cost of goods"
              value={nairaShort(totals.cost)}
              sub={naira(totals.cost)}
              change={comparing ? totals.change?.cost : undefined}
              invert
              strong
            />
            <Stat
              label="Gross profit"
              value={nairaShort(totals.profit)}
              sub={naira(totals.profit)}
              change={comparing ? totals.change?.profit : undefined}
              tone={
                totals.profit < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }
              strong
            />
            <Stat
              label="Margin"
              value={pct(totals.margin)}
              sub={`over ${analysis.period.days} day${analysis.period.days === 1 ? "" : "s"}`}
              strong
            />
          </div>

          {/* Station-wide best and worst. Money only — a "top product by quantity"
              across departments would rank litres against bottles. */}
          {(analysis.highlights.topRevenue ||
            analysis.highlights.topProfit ||
            analysis.highlights.worstProfit) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                {
                  label: "Biggest earner",
                  h: analysis.highlights.topRevenue,
                  v: (r) => naira(r.revenue),
                  tone: "text-gray-900 dark:text-gray-100",
                },
                {
                  label: "Most profit",
                  h: analysis.highlights.topProfit,
                  v: (r) => naira(r.profit),
                  tone: "text-emerald-700 dark:text-emerald-400",
                },
                {
                  label: "Worst loss",
                  h: analysis.highlights.worstProfit,
                  v: (r) => naira(r.profit),
                  tone: "text-rose-600 dark:text-rose-400",
                },
              ]
                .filter((x) => x.h)
                .map((x) => (
                  <div
                    key={x.label}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {x.label}
                    </p>
                    <p className={`mt-1 font-semibold ${x.tone}`}>{x.h.row.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {x.h.section} · {x.v(x.h.row)} ·{" "}
                      {qtyText(x.h.row.qtySold, x.h.row.unit)}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Departments */}
          <div className="space-y-3">
            {sections.map((s) => (
              <SectionCard
                key={s.key}
                section={s}
                open={!!openSections[s.key]}
                onToggle={() => toggle(s.key)}
                comparing={comparing}
              />
            ))}
          </div>

          {sections.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Nothing sold in this period.
            </div>
          )}

          {/* How to read the figures. */}
          {analysis.notes?.length > 0 && (
            <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                How to read this
              </p>
              {analysis.notes.map((n, i) => (
                <p
                  key={i}
                  className="text-[11px] text-gray-500 dark:text-gray-400 flex gap-1.5"
                >
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <span>{n}</span>
                </p>
              ))}
            </div>
          )}

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

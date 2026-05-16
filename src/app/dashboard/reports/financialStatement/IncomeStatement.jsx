import { useEffect } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import useAccountantStore from "@/store/useAccountantStore";

const COLS = ["Description", "Current Period", "Previous Period", "Variance"];

export default function IncomeStatement() {
  const { incomeStatement, loading, errors, fetchIncomeStatement } = useAccountantStore();

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const pad = (n) => String(n).padStart(2, "0");
    fetchIncomeStatement(
      `${y}-${pad(m + 1)}-01`,
      `${y}-${pad(m + 1)}-${new Date(y, m + 1, 0).getDate()}`
    );
  }, [fetchIncomeStatement]);

  const fc = (v) =>
    Math.abs(Number(v || 0)).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtAmount = (v) => {
    const n = Number(v || 0);
    return n < 0 ? `-₦${fc(n)}` : `₦${fc(n)}`;
  };

  const variance = (curr, prev) => {
    if (prev == null || prev === 0) return "N/A";
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  const cmp = incomeStatement?.comparison;
  // On mobile, hide Previous Period and Variance columns when no comparison is active
  const mobileHideCols = cmp ? [] : [2, 3];

  const revenueRows = () => {
    const d = incomeStatement?.revenue || {};
    const p = cmp?.revenue || {};
    return [
      ["PMS Sales",       fmtAmount(d.pmsSales),       cmp ? fmtAmount(p.pmsSales)       : "—", cmp ? variance(d.pmsSales,      p.pmsSales)      : "—"],
      ["AGO / Diesel",    fmtAmount(d.agoSales),        cmp ? fmtAmount(p.agoSales)       : "—", cmp ? variance(d.agoSales,      p.agoSales)      : "—"],
      ["DPK / Kerosene",  fmtAmount(d.dpkSales),        cmp ? fmtAmount(p.dpkSales)       : "—", cmp ? variance(d.dpkSales,      p.dpkSales)      : "—"],
      ["Lubricant Sales", fmtAmount(d.lubricantSales),  cmp ? fmtAmount(p.lubricantSales) : "—", cmp ? variance(d.lubricantSales,p.lubricantSales): "—"],
      ["TOTAL REVENUE",   fmtAmount(d.totalRevenue),    cmp ? fmtAmount(p.totalRevenue)   : "—", cmp ? variance(d.totalRevenue,  p.totalRevenue)  : "—"],
    ];
  };

  const cogsRows = () => {
    const d = incomeStatement?.costOfGoodsSold || {};
    const p = cmp?.costOfGoodsSold || {};
    return [
      ["Fuel Cost of Sales",       fmtAmount(d.fuelCOGS),      cmp ? fmtAmount(p.fuelCOGS)      : "—", cmp ? variance(d.fuelCOGS,     p.fuelCOGS)     : "—"],
      ["Lubricant Cost of Sales",  fmtAmount(d.lubricantCOGS), cmp ? fmtAmount(p.lubricantCOGS) : "—", cmp ? variance(d.lubricantCOGS,p.lubricantCOGS): "—"],
      ["TOTAL COST OF GOODS SOLD", fmtAmount(d.totalCOGS),     cmp ? fmtAmount(p.totalCOGS)     : "—", cmp ? variance(d.totalCOGS,    p.totalCOGS)    : "—"],
    ];
  };

  const expenseRows = () => {
    const d = incomeStatement?.operatingExpenses || {};
    const p = cmp?.operatingExpenses || {};
    return [
      ["Salaries & Wages",         fmtAmount(d.salariesAndWages),        cmp ? fmtAmount(p.salariesAndWages)        : "—", cmp ? variance(d.salariesAndWages,       p.salariesAndWages)       : "—"],
      ["Utilities",                fmtAmount(d.utilities),               cmp ? fmtAmount(p.utilities)               : "—", cmp ? variance(d.utilities,              p.utilities)              : "—"],
      ["Maintenance & Repairs",    fmtAmount(d.maintenance),             cmp ? fmtAmount(p.maintenance)             : "—", cmp ? variance(d.maintenance,            p.maintenance)            : "—"],
      ["Other Expenses",           fmtAmount(d.otherExpenses),           cmp ? fmtAmount(p.otherExpenses)           : "—", cmp ? variance(d.otherExpenses,          p.otherExpenses)          : "—"],
      ["TOTAL OPERATING EXPENSES", fmtAmount(d.totalOperatingExpenses),  cmp ? fmtAmount(p.totalOperatingExpenses)  : "—", cmp ? variance(d.totalOperatingExpenses, p.totalOperatingExpenses) : "—"],
    ];
  };

  const SummaryLine = ({ label, current, previous, positive }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 rounded-xl mt-2 gap-2 ${positive ? "bg-green-50" : "bg-red-50"}`}>
      <span className="font-semibold text-gray-700 text-sm leading-snug">{label}</span>
      <div className="flex flex-wrap gap-4 sm:gap-8 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Current</p>
          <p className={`font-bold ${positive ? "text-green-700" : "text-red-600"}`}>{fmtAmount(current)}</p>
        </div>
        {cmp && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Previous</p>
            <p className="font-semibold text-gray-600">{fmtAmount(previous)}</p>
          </div>
        )}
        {cmp && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Change</p>
            <p className={`font-semibold ${variance(current, previous).startsWith("+") ? "text-green-600" : "text-red-600"}`}>
              {variance(current, previous)}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading.incomeStatement && !incomeStatement) {
    return (
      <DisplayCard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading income statement…</p>
          </div>
        </div>
      </DisplayCard>
    );
  }

  if (errors.incomeStatement) {
    return (
      <DisplayCard>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Error: {errors.incomeStatement}</p>
          <button
            onClick={() => {
              const today = new Date();
              const y = today.getFullYear();
              const m = today.getMonth();
              const pad = (n) => String(n).padStart(2, "0");
              fetchIncomeStatement(
                `${y}-${pad(m + 1)}-01`,
                `${y}-${pad(m + 1)}-${new Date(y, m + 1, 0).getDate()}`
              );
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </DisplayCard>
    );
  }

  if (!incomeStatement) {
    return (
      <DisplayCard>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">No data available for this period.</p>
        </div>
      </DisplayCard>
    );
  }

  const grossProfit = incomeStatement.grossProfit ?? 0;
  const netProfit   = incomeStatement.netProfit   ?? 0;

  const now = new Date();
  const periodLabel = `${["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][now.getMonth()]} ${now.getFullYear()}`;

  return (
    <DisplayCard>
      <h4 className="text-gray-600 text-lg sm:text-xl font-semibold mb-4">{periodLabel}</h4>

      {/* Mobile hint — only shown when comparison is inactive */}
      {!cmp && (
        <p className="text-[11px] text-gray-400 mb-3 sm:hidden">
          Previous Period &amp; Variance columns visible on wider screens or when Compare is active.
        </p>
      )}

      <div className="space-y-4">
        {/* ── Revenue ── */}
        <div className="border border-[#e7e7e7] rounded-xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h4 className="font-semibold text-gray-600 uppercase text-sm tracking-wide">Revenue</h4>
          </div>
          <Table data={revenueRows()} columns={COLS} highlightedRowIndices={[4]} mobileHideCols={mobileHideCols} />
        </div>

        {/* ── Cost of Goods Sold ── */}
        <div className="border border-[#e7e7e7] rounded-xl overflow-hidden">
          <div className="px-4 pt-4 pb-2 space-y-0.5">
            <h4 className="font-semibold text-gray-600 uppercase text-sm tracking-wide">Cost of Goods Sold (COGS)</h4>
            <p className="text-xs text-gray-400">Fuel = cost procured this period. Lubricant = unit cost × qty sold.</p>
          </div>
          <Table data={cogsRows()} columns={COLS} highlightedRowIndices={[2]} mobileHideCols={mobileHideCols} />
        </div>

        {/* ── Gross Profit ── */}
        <SummaryLine
          label="GROSS PROFIT  (Revenue − COGS)"
          current={grossProfit}
          previous={cmp?.grossProfit}
          positive={grossProfit >= 0}
        />

        {/* ── Operating Expenses ── */}
        <div className="border border-[#e7e7e7] rounded-xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h4 className="font-semibold text-gray-600 uppercase text-sm tracking-wide">Operating Expenses</h4>
          </div>
          <Table data={expenseRows()} columns={COLS} highlightedRowIndices={[4]} mobileHideCols={mobileHideCols} />
        </div>

        {/* ── Net Profit ── */}
        <SummaryLine
          label="NET PROFIT  (Gross Profit − Operating Expenses)"
          current={netProfit}
          previous={cmp?.netProfit}
          positive={netProfit >= 0}
        />
      </div>
    </DisplayCard>
  );
}

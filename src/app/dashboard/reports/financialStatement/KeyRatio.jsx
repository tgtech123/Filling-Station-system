import { useState, useEffect } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import KeyRatioCard from "./KeyRatioCard";
import useAccountantStore from "@/store/useAccountantStore";

export default function KeyRatio() {
  const {
    keyRatios,
    loading,
    errors,
    fetchKeyRatios,
  } = useAccountantStore();

  // Date state for filters
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Fetch initial data (current month)
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];

    setDateRange({ startDate, endDate });
    fetchKeyRatios(startDate, endDate);
  }, [fetchKeyRatios]);

  // Format percentage
  const formatPercentage = (value) => {
    if (!value && value !== 0) return "0.0%";
    return `${Number(value).toFixed(1)}%`;
  };

  // Format ratio
  const formatRatio = (value) => {
    if (!value && value !== 0) return "0.00";
    return Number(value).toFixed(2);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "₦0.00";
    return `₦${Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Prepare Profitability Ratios data
  const getProfitabilityData = () => {
    const data = keyRatios?.profitability || {};
    const columns = ["Profitability Ratio", ""];

    const rows = [
      ["Gross Profit Margin", formatPercentage(data.grossProfitMargin || 0)],
      ["Operating Profit Margin", formatPercentage(data.operatingProfitMargin || 0)],
      ["Net Profit Margin", formatPercentage(data.netProfitMargin || 0)],
      ["Return on Assets", formatPercentage(data.returnOnAssets || 0)],
      ["Return on Equity", formatPercentage(data.returnOnEquity || 0)],
    ];

    return { rows, columns };
  };

  // Prepare Liquidity Ratios data
  const getLiquidityData = () => {
    const data = keyRatios?.liquidity || {};
    const columns = ["Liquidity Ratio", ""];

    const fmtRatioOrNA = (v) => (v === null || v === undefined) ? "N/A" : formatRatio(v);

    const rows = [
      ["Current Ratio", fmtRatioOrNA(data.currentRatio)],
      ["Quick Ratio",   fmtRatioOrNA(data.quickRatio)],
      ["Cash Ratio",    fmtRatioOrNA(data.cashRatio)],
      ["Working Capital", formatCurrency(data.workingCapital || 0)],
    ];

    return { rows, columns };
  };

  // Prepare Efficiency Ratios data
  const getEfficiencyData = () => {
    const data = keyRatios?.efficiency || {};
    const columns = ["Efficiency Ratio", "Value"];
    const na = (v) => (v === null || v === undefined) ? "N/A *" : v;

    const rows = [
      ["Inventory Turnover",   `${formatRatio(data.inventoryTurnover || 0)}x`],
      ["Asset Turnover",       `${formatRatio(data.assetTurnover || 0)}x`],
      ["Receivables Turnover", na(data.receivablesTurnover)],
      ["Day Sales Outstanding",na(data.daySalesOutstanding)],
    ];

    return { rows, columns };
  };

  // Prepare Leverage Ratios data
  const getLeverageData = () => {
    const data = keyRatios?.leverage || {};
    const columns = ["Leverage Ratio", "Value"];
    const naRatio = (v) => (v === null || v === undefined) ? "N/A *" : `${formatRatio(v)}x`;

    const rows = [
      ["Debt-to-Assets",    formatPercentage(data.debtToAssets  || 0)],
      ["Debt-to-Equity",    formatPercentage(data.debtToEquity  || 0)],
      ["Interest Coverage", naRatio(data.interestCoverage)],
      ["Equity Multiplier", naRatio(data.equityMultiplier)],
    ];

    return { rows, columns };
  };

  const profitabilityData = getProfitabilityData();
  const liquidityData = getLiquidityData();
  const efficiencyData = getEfficiencyData();
  const leverageData = getLeverageData();

  // Loading state
  if (loading.keyRatios && !keyRatios) {
    return (
      <DisplayCard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading key ratios...</p>
          </div>
        </div>
      </DisplayCard>
    );
  }

  // Error state
  if (errors.keyRatios) {
    return (
      <DisplayCard>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {errors.keyRatios}</p>
          <button
            onClick={() => {
              if (dateRange.startDate && dateRange.endDate) {
                fetchKeyRatios(dateRange.startDate, dateRange.endDate);
              }
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </DisplayCard>
    );
  }

  // Check which ratios are N/A so we can show the right guidance notes
  const hasNullLiquidity   = keyRatios?.liquidity?.currentRatio === null;
  const hasNullEfficiency  = keyRatios?.efficiency?.receivablesTurnover === null;
  const hasNullLeverage    = keyRatios?.leverage?.interestCoverage === null;

  return (
    <DisplayCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <KeyRatioCard columns={profitabilityData.columns} data={profitabilityData.rows} />
        <KeyRatioCard columns={liquidityData.columns}    data={liquidityData.rows} />
        <KeyRatioCard columns={efficiencyData.columns}   data={efficiencyData.rows} />
        <KeyRatioCard columns={leverageData.columns}     data={leverageData.rows} />
      </div>

      {/* N/A footnotes — only shown when relevant */}
      {(hasNullLiquidity || hasNullEfficiency || hasNullLeverage) && (
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 space-y-1.5">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Why some ratios show N/A</p>
          {hasNullLiquidity && (
            <p className="text-xs text-blue-600">
              <span className="font-semibold">Current / Quick / Cash Ratio</span> — No liabilities have been recorded yet.
              Go to <span className="font-semibold">Liabilities &amp; Equity Register</span> and enter your Accrued Expenses,
              Tax Payable, or mark unpaid supplier deliveries there. Once recorded, these ratios will calculate automatically.
            </p>
          )}
          {hasNullEfficiency && (
            <p className="text-xs text-blue-600">
              <span className="font-semibold">Receivables Turnover &amp; Day Sales Outstanding</span> — This filling station
              operates on cash / POS payments only. There are no credit sales outstanding, so these ratios do not apply.
              This is actually a sign of healthy cash flow.
            </p>
          )}
          {hasNullLeverage && (
            <p className="text-xs text-blue-600">
              <span className="font-semibold">Interest Coverage</span> — Interest expense is not recorded as a separate
              expense category in this system. To compute this ratio, record interest payments as an expense with
              description "Loan interest" in the Expense Manager.
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        <h3 className="my-2 text-lg font-semibold">Report Summary</h3>
        <textarea
          className="w-full hover:border-blue-600 hover:outline-none border-2 border-gray-200 p-2 h-auto rounded-[12px] min-h-[120px]"
          placeholder="Add notes or summary about the key ratios..."
          defaultValue={keyRatios?.summary || ""}
        />
      </div>
    </DisplayCard>
  );
}
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

    const rows = [
      ["Current Ratio", formatRatio(data.currentRatio || 0)],
      ["Quick Ratio", formatRatio(data.quickRatio || 0)],
      ["Cash Ratio", formatRatio(data.cashRatio || 0)],
      ["Working Capital", formatCurrency(data.workingCapital || 0)],
    ];

    return { rows, columns };
  };

  // Prepare Efficiency Ratios data
  const getEfficiencyData = () => {
    const data = keyRatios?.efficiency || {};
    const columns = ["Efficiency Ratio", ""];

    const rows = [
      ["Inventory Turnover", `${formatRatio(data.inventoryTurnover || 0)}x`],
      ["Asset Turnover", `${formatRatio(data.assetTurnover || 0)}x`],
      ["Receivables Turnover", formatPercentage(data.receivablesTurnover || 0)],
      ["Day Sales Outstanding", `${formatRatio(data.daySalesOutstanding || 0)} days`],
    ];

    return { rows, columns };
  };

  // Prepare Leverage Ratios data
  const getLeverageData = () => {
    const data = keyRatios?.leverage || {};
    const columns = ["Leverage Ratio", ""];

    const rows = [
      ["Debt-to-Assets", formatPercentage(data.debtToAssets || 0)],
      ["Debt-to-Equity", formatPercentage(data.debtToEquity || 0)],
      ["Interest Coverage", `${formatRatio(data.interestCoverage || 0)}x`],
      ["Equity Multiplier", `${formatRatio(data.equityMultiplier || 0)}x`],
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

  return (
    <DisplayCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <KeyRatioCard
          columns={profitabilityData.columns}
          data={profitabilityData.rows}
        />
        <KeyRatioCard
          columns={liquidityData.columns}
          data={liquidityData.rows}
        />
        <KeyRatioCard
          columns={efficiencyData.columns}
          data={efficiencyData.rows}
        />
        <KeyRatioCard
          columns={leverageData.columns}
          data={leverageData.rows}
        />
      </div>
      <div>
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
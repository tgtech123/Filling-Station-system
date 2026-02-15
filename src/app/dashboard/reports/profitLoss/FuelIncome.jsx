import React from "react";
import Table from "@/components/Table";

const FuelIncome = ({ profitLossData, loading }) => {
  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0";
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Prepare Monthly Breakdown data from API
  const getMonthlyBreakdownData = () => {
    const monthlyData = profitLossData?.monthlyBreakdown || [];
    
    const columns = ["Date", "Total Revenue", "Total Expenses", "Profit/Loss"];
    
    const rows = monthlyData.map(item => [
      item.date || "N/A",
      `₦${formatCurrency(item.totalRevenue || 0)}`,
      `₦${formatCurrency(item.totalExpenses || 0)}`,
      item.profitLoss >= 0 
        ? `+ ₦${formatCurrency(item.profitLoss)}` 
        : `- ₦${formatCurrency(Math.abs(item.profitLoss))}`,
    ]);

    return { columns, rows };
  };

  const monthlyData = getMonthlyBreakdownData();

  // Loading state
  if (loading && !profitLossData) {
    return (
      <div className="bg-white rounded-xl p-6 mt-4">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading profit & loss data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!monthlyData.rows || monthlyData.rows.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 mt-4">
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">No profit & loss data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 mt-4 grid grid-cols-1 gap-6">
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-neutral-800">
          PROFIT & LOSS BREAKDOWN
        </h1>
        <span className="flex flex-col gap-5 border-[1px] border-neutral-100 p-2 rounded-xl">
          <p className="text-md font-medium text-neutral-600">
            Monthly Breakdown
          </p>
          <Table 
            columns={monthlyData.columns} 
            data={monthlyData.rows} 
            highlightedRowIndices={[]} 
          />
        </span>
      </div>

      {/* Summary Section */}
      {/* <div className="flex flex-col gap-3">
        <h1 className="text-md text-gray-900 font-bold">Period Summary</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Total Revenue Generated</span>
            <span className="text-lg font-semibold text-green-600">
              ₦{formatCurrency(profitLossData?.summary?.totalRevenueGenerated || 0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Total Expenses</span>
            <span className="text-lg font-semibold text-red-600">
              ₦{formatCurrency(profitLossData?.summary?.totalExpenses || 0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Net Profit/Loss</span>
            <span className={`text-lg font-semibold ${
              (profitLossData?.summary?.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(profitLossData?.summary?.profitLoss || 0) >= 0 ? '+' : ''}
              ₦{formatCurrency(profitLossData?.summary?.profitLoss || 0)}
            </span>
          </div>
        </div>
      </div> */}

      <span>
        <h1 className="text-md text-gray-900 font-bold">Report Summary</h1>
        <textarea
          placeholder="Add notes or summary about the profit & loss report..."
          className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 min-h-[100px]"
        />
      </span>
    </div>
  );
};

export default FuelIncome;
import { useEffect, useMemo } from "react";
import Table from "../Table";
import DisplayCard from "./DisplayCard";
import { useAttendantDashboard, useDailyLiveSales } from "@/store/useAttendantDashboardStore";
export default function DailyLiveSales() {
  const { dailyLiveSales, isLoading, error, fetchDailyLiveSales } = useDailyLiveSales();

  useEffect(() => {
    fetchDailyLiveSales();
  }, [fetchDailyLiveSales]);

  // Format currency
  const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return `₦${value.toLocaleString()}`;
    }
    return value;
  };

  // Format date/time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Define columns for the table (array of strings)
  const columns = useMemo(() => [
    'Timestamp',
    'Product Type',
    'Price/Ltr',
    'Litres Sold',
    'Total'
  ], []);

  // Transform API data to array of arrays format
  const tableData = useMemo(() => {
    if (!dailyLiveSales || dailyLiveSales.length === 0) {
      return [];
    }

    return dailyLiveSales.map(sale => [
      formatDateTime(sale.timestamp),
      sale.productType,
      formatCurrency(sale.pricePerLtr),
      `${sale.litresSold} Ltrs`,
      formatCurrency(sale.total)
    ]);
  }, [dailyLiveSales]);

  return (
    <DisplayCard>
      <div className="m-0 p-0 pt-6 max-h-[445px] overflow-y-auto scrollbar-hide">
        <h4 className="mb-2 font-semibold text-gray-500">Daily Live Sales</h4>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-sm text-gray-600">Loading sales data...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
            <button 
              onClick={fetchDailyLiveSales}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tableData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg 
              className="w-12 h-12 mb-3 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <p className="text-sm">No sales data available</p>
          </div>
        )}

        {/* Table with Data */}
        {!isLoading && !error && tableData.length > 0 && (
          <Table columns={columns} data={tableData} />
        )}
      </div>
    </DisplayCard>
  );
}
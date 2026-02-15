"use client";
import { useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useAccountantStore from "@/store/useAccountantStore";

export default function InflowChart({ duration = "today" }) {
  const { cashflow, loading, errors, fetchCashflow } = useAccountantStore();

  useEffect(() => {
    fetchCashflow(duration);
  }, [fetchCashflow, duration]);

  // Prepare chart data from cashflow.inflowBreakdown
  const chartData = cashflow?.inflowBreakdown
    ? [
        { 
          name: "Fuel", 
          value: cashflow.inflowBreakdown.fuel || 0, 
          fill: "#0080FF" 
        },
        { 
          name: "Lubricant", 
          value: cashflow.inflowBreakdown.lubricant || 0, 
          fill: "#FF9900" 
        },
        { 
          name: "Others", 
          value: cashflow.inflowBreakdown.others || 0, 
          fill: "#00C49F" 
        },
      ]
    : [];

  // Calculate total inflow
  const totalInflow = cashflow?.summary?.totalInflow || 0;

  // Format currency
  const formatCurrency = (value) => {
    return `₦${value.toLocaleString()}`;
  };

  // Show loading state
  if (loading.cashflow && !cashflow) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Inflow</h2>
        <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (errors.cashflow) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Inflow</h2>
        <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-800 text-sm">Error: {errors.cashflow}</p>
          <button 
            onClick={() => fetchCashflow(duration)}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!chartData.length || totalInflow === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Inflow</h2>
        <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No inflow data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Inflow</h2>
      <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>

      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="90%"
          barSize={15}
          data={chartData}
        >
          <RadialBar
            minAngle={15}
            label={{ position: "insideStart", fill: "#fff" }}
            background
            clockWise
            dataKey="value"
          />
          <Legend
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <p className="text-center font-bold text-xl mt-4">
        {formatCurrency(totalInflow)}
      </p>
    </div>
  );
}
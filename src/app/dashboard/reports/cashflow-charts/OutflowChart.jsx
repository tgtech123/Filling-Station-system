"use client";
import { useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import useAccountantStore from "@/store/useAccountantStore";

const COLORS = ["#FF9900", "#00C49F", "#0080FF", "#FF6347"];

export default function OutflowChart({ duration = "today" }) {
  const { cashflow, loading, errors, fetchCashflow } = useAccountantStore();

  useEffect(() => {
    fetchCashflow(duration);
  }, [fetchCashflow, duration]);

  // Prepare chart data from cashflow.outflowBreakdown
  const chartData = cashflow?.outflowBreakdown
    ? [
        { 
          name: "Fuel Procurement", 
          value: cashflow.outflowBreakdown.fuelProcurement || 0 
        },
        { 
          name: "Operational Expenses", 
          value: cashflow.outflowBreakdown.operationalExpenses || 0 
        },
        { 
          name: "Staff Salaries", 
          value: cashflow.outflowBreakdown.staffSalaries || 0 
        },
        { 
          name: "Maintenance", 
          value: cashflow.outflowBreakdown.maintenance || 0 
        },
      ].filter(item => item.value > 0) // Only show items with value
    : [];

  // Calculate total outflow
  const totalOutflow = cashflow?.summary?.totalOutflow || 0;

  // Format currency
  const formatCurrency = (value) => {
    return `₦${value.toLocaleString()}`;
  };

  // Show loading state
  if (loading.cashflow && !cashflow) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Outflow</h2>
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
        <h2 className="text-lg font-semibold mb-4">Outflow</h2>
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
  if (!chartData.length || totalOutflow === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Outflow</h2>
        <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No outflow data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Outflow</h2>
      <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>

      <p className="text-center font-bold text-xl mt-4">
        {formatCurrency(totalOutflow)}
      </p>
    </div>
  );
}
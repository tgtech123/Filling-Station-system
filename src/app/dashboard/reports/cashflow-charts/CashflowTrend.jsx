"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import useAccountantStore from "@/store/useAccountantStore";

export default function CashflowTrend() {
  const {
    cashflow,
    loading,
    errors,
    fetchCashflow,
  } = useAccountantStore();

  const [duration, setDuration] = useState("thismonth");

  // Fetch data when duration changes
  useEffect(() => {
    fetchCashflow(duration);
  }, [duration, fetchCashflow]);

  // Format chart data from API
  const getChartData = () => {
    // If no cashflow data or no breakdown, return empty array
    if (!cashflow?.breakdown || !Array.isArray(cashflow.breakdown)) {
      return [];
    }

    // Map API data to chart format
    return cashflow.breakdown.map((item) => ({
      month: item.period || item.month || item.date || "N/A",
      inflow: item.inflow || item.totalInflow || 0,
      outflow: item.outflow || item.totalOutflow || 0,
    }));
  };

  const chartData = getChartData();

  // Handle duration change
  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-700 mb-1">{payload[0].payload.month}</p>
          <p className="text-sm" style={{ color: "#FF9900" }}>
            Inflow: ₦{payload[0].value?.toLocaleString() || 0}
          </p>
          <p className="text-sm" style={{ color: "#0080FF" }}>
            Outflow: ₦{payload[1].value?.toLocaleString() || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading.cashflow && chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Cashflow Trend</h2>
          <select 
            className="border rounded-md px-2 py-1 text-sm"
            value={duration}
            onChange={handleDurationChange}
            disabled
          >
            <option value="thisweek">This week</option>
            <option value="thismonth">This month</option>
            <option value="lastmonth">Last month</option>
            <option value="thisquarter">This quarter</option>
          </select>
        </div>
        <div className="flex items-center justify-center h-[250px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.cashflow) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Cashflow Trend</h2>
          <select 
            className="border rounded-md px-2 py-1 text-sm"
            value={duration}
            onChange={handleDurationChange}
          >
            <option value="thisweek">This week</option>
            <option value="thismonth">This month</option>
            <option value="lastmonth">Last month</option>
            <option value="thisquarter">This quarter</option>
          </select>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Error loading chart: {errors.cashflow}</p>
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

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Cashflow Trend</h2>
          <select 
            className="border rounded-md px-2 py-1 text-sm"
            value={duration}
            onChange={handleDurationChange}
          >
            <option value="thisweek">This week</option>
            <option value="thismonth">This month</option>
            <option value="lastmonth">Last month</option>
            <option value="thisquarter">This quarter</option>
          </select>
        </div>
        <div className="flex items-center justify-center h-[250px]">
          <p className="text-gray-500 text-sm">No cashflow data available for this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Cashflow Trend</h2>
        <select 
          className="border rounded-md px-2 py-1 text-sm"
          value={duration}
          onChange={handleDurationChange}
        >
          <option value="thisweek">This week</option>
          <option value="thismonth">This month</option>
          <option value="lastmonth">Last month</option>
          <option value="thisquarter">This quarter</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF9900" }}></div>
          <span className="text-sm text-gray-600">Inflow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#0080FF" }}></div>
          <span className="text-sm text-gray-600">Outflow</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="inflow" 
            stroke="#FF9900" 
            strokeWidth={2}
            dot={{ fill: "#FF9900", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="outflow" 
            stroke="#0080FF" 
            strokeWidth={2}
            dot={{ fill: "#0080FF", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
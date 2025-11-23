"use client";
import { useFinancialStore } from "@/store/useFinancialStore";
import React, { useEffect, useState } from "react";


const BreakdownPage = () => {
  const {
    revenueBreakdown,
    expenseBreakdown,
    loading,
    errors,
    fetchRevenueBreakdown,
    fetchExpenseBreakdown,
  } = useFinancialStore();

  const [revenueDuration, setRevenueDuration] = useState('today');
  const [expenseDuration, setExpenseDuration] = useState('today');

  const formatCurrency = (value) => `₦${Number(value).toLocaleString()}`;

  // Fetch revenue data when component mounts or duration changes
  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        await fetchRevenueBreakdown(revenueDuration);
      } catch (error) {
        console.error("Error fetching revenue breakdown:", error);
      }
    };

    loadRevenueData();
  }, [revenueDuration, fetchRevenueBreakdown]);

  // Fetch expense data when component mounts or duration changes
  useEffect(() => {
    const loadExpenseData = async () => {
      try {
        await fetchExpenseBreakdown(expenseDuration);
      } catch (error) {
        console.error("Error fetching expense breakdown:", error);
      }
    };

    loadExpenseData();
  }, [expenseDuration, fetchExpenseBreakdown]);

  // Apply default colors to data (backend should provide colors, but this is a fallback)
  const applyDefaultColors = (items) => {
    if (!items || items.length === 0) return [];

    const fallbackColors = ["#FF8C05", "#00B809", "#1A71F6", "#E27D00", "#FF3B30"];
    return items.map((item, i) => ({
      ...item,
      color: item.color || fallbackColors[i % fallbackColors.length],
    }));
  };

  const revenueData = applyDefaultColors(revenueBreakdown);
  const expenseData = applyDefaultColors(expenseBreakdown);

  const createPieChart = (data, isDonut = false) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    const innerRadius = isDonut ? 45 : 0;

    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;

          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);

          const largeArcFlag = angle > 180 ? 1 : 0;

          let pathData;
          if (isDonut) {
            const innerX1 = centerX + innerRadius * Math.cos(startAngleRad);
            const innerY1 = centerY + innerRadius * Math.sin(startAngleRad);
            const innerX2 = centerX + innerRadius * Math.cos(endAngleRad);
            const innerY2 = centerY + innerRadius * Math.sin(endAngleRad);

            pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${innerX2} ${innerY2}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
              "Z",
            ].join(" ");
          } else {
            pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");
          }

          currentAngle = endAngle;

          return <path key={index} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />;
        })}
      </svg>
    );
  };

  return (
    <div className="w-full lg:p-6 bg-white rounded-2xl p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-4 w-full lg:w-[43.0625rem]">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue Breakdown</h2>
              <p className="text-sm text-gray-500">Revenue by duration selected</p>
            </div>
            
            {/* Revenue Duration Filter */}
            <select
              value={revenueDuration}
              onChange={(e) => setRevenueDuration(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="thisweek">This Week</option>
              <option value="thismonth">This Month</option>
              <option value="thisyear">This Year</option>
            </select>
          </div>

          {loading.revenueBreakdown ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : errors.revenueBreakdown ? (
            <div className="flex justify-center items-center h-48">
              <p className="text-red-500">⚠️ {errors.revenueBreakdown}</p>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <p className="text-gray-500">No revenue data available</p>
            </div>
          ) : (
            <div className="lg:flex flex-wrap items-center gap-10">
              <div className="lg:flex-shrink-0 flex-shrink">
                {createPieChart(revenueData)}
              </div>

              <div className="flex flex-col gap-3">
                {revenueData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-8 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full lg:w-[43.0625rem]">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Expense Breakdown</h2>
              <p className="text-sm text-gray-500">Expense by duration selected</p>
            </div>
            
            {/* Expense Duration Filter */}
            <select
              value={expenseDuration}
              onChange={(e) => setExpenseDuration(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="thisweek">This Week</option>
              <option value="thismonth">This Month</option>
              <option value="thisyear">This Year</option>
            </select>
          </div>

          {loading.expenseBreakdown ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : errors.expenseBreakdown ? (
            <div className="flex justify-center items-center h-48">
              <p className="text-red-500">⚠️ {errors.expenseBreakdown}</p>
            </div>
          ) : expenseData.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <p className="text-gray-500">No expense data available</p>
            </div>
          ) : (
            <div className="lg:flex items-center gap-8">
              <div className="flex-shrink-0">
                {createPieChart(expenseData, true)}
              </div>

              <div className="flex flex-col gap-3">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-8 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakdownPage;
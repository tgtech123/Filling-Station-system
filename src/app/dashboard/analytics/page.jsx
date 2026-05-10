"use client";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useAnalyticsStore from "@/store/useAnalyticsStore";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#1a71f6", "#7f27ff", "#e27d00", "#04910c", "#eb2b0b"];

export default function AnalyticsPage() {
  const {
    revenueTrend, staffPerformance,
    fuelBreakdown, comparison,
    loading, fetchAll,
  } = useAnalyticsStore();

  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    fetchAll(period);
  }, [period]);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">

        {/* Header with period selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Deep insights into your station performance
            </p>
          </div>
          <div className="flex gap-2">
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Cards */}
        {comparison && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Revenue",
                thisMonth: comparison.data?.thisMonth?.revenue,
                lastMonth: comparison.data?.lastMonth?.revenue,
                growth: comparison.data?.growth?.revenue,
                format: (v) => `₦${v?.toLocaleString()}`,
              },
              {
                label: "Litres Sold",
                thisMonth: comparison.data?.thisMonth?.litres,
                lastMonth: comparison.data?.lastMonth?.litres,
                growth: comparison.data?.growth?.litres,
                format: (v) => `${v?.toLocaleString()}L`,
              },
              {
                label: "Shifts",
                thisMonth: comparison.data?.thisMonth?.shifts,
                lastMonth: comparison.data?.lastMonth?.shifts,
                growth: comparison.data?.growth?.shifts,
                format: (v) => String(v),
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {card.label} — This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {card.format(card.thisMonth)}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      card.growth >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {card.growth >= 0 ? "▲" : "▼"} {Math.abs(card.growth)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    vs last month ({card.format(card.lastMonth)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueTrend?.data?.fuelRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id.month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [`₦${v.toLocaleString()}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a71f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fuel Breakdown + Staff Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Fuel Breakdown Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Revenue by Fuel Type
            </h2>
            {fuelBreakdown?.data?.breakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={fuelBreakdown.data.breakdown}
                      dataKey="totalRevenue"
                      nameKey="fuelType"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ fuelType, percentage }) =>
                        `${fuelType} ${percentage}%`
                      }
                    >
                      {fuelBreakdown.data.breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {fuelBreakdown.data.breakdown.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: COLORS[i % 5] }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {b.fuelType}
                        </span>
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₦{b.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Staff Performance Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Staff Performance This Month
            </h2>
            {staffPerformance?.data?.staff?.length > 0 ? (
              <>
                {staffPerformance.data.topPerformer && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        Top Performer
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {staffPerformance.data.topPerformer.name}
                        {" — "}
                        ₦{staffPerformance.data.topPerformer.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={staffPerformance.data.staff.slice(0, 5)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(v) => [`₦${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="totalRevenue" fill="#1a71f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                No staff data available
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
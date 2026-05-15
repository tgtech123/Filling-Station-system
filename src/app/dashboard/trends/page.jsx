'use client'
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getTrendsData } from "./trendsData";
import MyStatCard from "@/components/MyStatCard";
import SalesProfitPage from "./SalesProfitPage";
import PaymentCommissionPage from "./PaymentCommissionPage";
import useTrendsStore from "@/store/useTrendsStore";

const DURATIONS = [
  { value: "today",        label: "Today"        },
  { value: "thisweek",     label: "This Week"     },
  { value: "thismonth",    label: "This Month"    },
  { value: "thisquarter",  label: "This Quarter"  },
  { value: "thisyear",     label: "This Year"     },
];

export default function Trends() {
  const [trendsData, setTrendsData] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("thismonth");

  const { kpis, loading, errors, fetchDashboard } = useTrendsStore();

  useEffect(() => {
    fetchDashboard(selectedDuration);
  }, [fetchDashboard, selectedDuration]);

  useEffect(() => {
    setTrendsData(getTrendsData(kpis ?? null));
  }, [kpis]);

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                Trends
              </h1>
              <p className="text-sm text-neutral-500 dark:text-gray-400 mt-0.5">
                Track sales trends, revenue, and operational metrics
              </p>
            </div>

            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {loading.dashboard ? (
            <div className="grid lg:grid-cols-4 grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 animate-pulse border border-gray-100 dark:border-gray-600">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : errors.dashboard ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
              <p className="text-red-700 dark:text-red-400 text-sm">{errors.dashboard}</p>
              <button
                onClick={() => fetchDashboard(selectedDuration)}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 grid-cols-2 gap-5">
              {trendsData.map((item, i) => (
                <MyStatCard
                  key={i}
                  title={item.title}
                  date={item.date}
                  change={item.change}
                  amount={item.amount}
                  changeText={item.changeText}
                  icon={item.icon}
                  trend={item.trend}
                />
              ))}
            </div>
          )}
        </div>

        <SalesProfitPage />
        <PaymentCommissionPage />
      </div>
    </DashboardLayout>
  );
}

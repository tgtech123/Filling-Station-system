'use client'

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ExportButton from "@/components/ExportButton";
import { RxTriangleRight } from "react-icons/rx";
import IncomeCards from "./IncomeCards";
import FuelIncome from "./FuelIncome";
import useAccountantStore from "@/store/useAccountantStore";

const DURATIONS = [
  { value: "today",       label: "Today"        },
  { value: "thisweek",    label: "This Week"     },
  { value: "thismonth",   label: "This Month"    },
  { value: "thisquarter", label: "This Quarter"  },
  { value: "thisyear",    label: "This Year"     },
];

export default function Income() {
  const [duration, setDuration] = useState("thismonth");
  const { fetchIncomeReport } = useAccountantStore();

  // Single authoritative fetch — children only read from the store
  useEffect(() => {
    fetchIncomeReport(duration);
  }, [duration]);

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-1">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">
            Reports
          </h1>
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <p className="text-neutral-400 dark:text-neutral-500 font-medium">Report</p>
            <RxTriangleRight size={20} className="text-neutral-500 dark:text-neutral-400" />
            <p className="text-blue-600 dark:text-blue-400 font-semibold">Income</p>
          </div>
        </div>

        {/* Income section card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-lg sm:text-xl text-gray-700 dark:text-gray-100 font-semibold">
                Income
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and export all generated income
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <ExportButton />
            </div>
          </div>

          <div className="mt-6">
            {/* IncomeCards reads from store — no internal fetch */}
            <IncomeCards />
          </div>
        </div>

        {/* Fuel / Lubricant income tables */}
        <div className="mt-3">
          {/* FuelIncome reads from store — no internal fetch */}
          <FuelIncome />
        </div>

      </div>
    </DashboardLayout>
  );
}

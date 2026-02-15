import React from "react";
import { ArrowUpRightIcon, ArrowDownRightIcon } from "@heroicons/react/24/solid";

const StatCardTwo = ({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  iconBg = "bg-blue-50", 
  iconColor = "text-blue-600", 
  changeColor = "green",
  showChange = true,
  changeLabel = "From last month"
}) => {
  const isPositive = changeColor === "green";
  const isNegative = changeColor === "red";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>

        {showChange && change && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive
                ? "text-green-600"
                : isNegative
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {isPositive && <ArrowUpRightIcon className="h-4 w-4" />}
            {isNegative && <ArrowDownRightIcon className="h-4 w-4" />}
            {change}
          </span>
        )}
      </div>

      <div className="mt-6">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
        {showChange && changeLabel && (
          <p className="mt-2 text-xs text-gray-400">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

export default StatCardTwo;
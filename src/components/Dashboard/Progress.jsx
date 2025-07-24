import React from "react";
import { FiRefreshCcw } from "react-icons/fi";

export const Progress = ({ title = "Sales Target", current = 40, target = 100, unit = "₦" }) => {
  const progressPercent = (current / target) * 100;

  return (
    <div className="min-w-[500px] w-full p-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold text-blue-600">
            {unit}{current.toLocaleString()}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Target</p>
          <p className="text-2xl font-semibold text-gray-800">
            {unit}{target.toLocaleString()}
          </p>
        </div>

        <div className="text-gray-400 text-xl">
          <FiRefreshCcw />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-200 rounded-full relative">
        <div
          className="h-4 bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
};


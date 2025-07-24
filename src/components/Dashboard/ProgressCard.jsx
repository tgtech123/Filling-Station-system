import React from "react";
import { FiRefreshCcw } from "react-icons/fi";

const ProgressCard = ({ title = "Sales Target", current = 0, target = 100, unit = "₦" }) => {
  const progressPercent = (current / target) * 100;

  return (
    <div className="w-full max-w-xl p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-center text-lg font-medium text-gray-800 mb-2">{title}</h2>

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

export default ProgressCard;

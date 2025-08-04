import React from "react";
import { FiRefreshCcw } from "react-icons/fi";

export const Progress = ({ 
  title = "Sales Target", 
  current = 40, 
  target = 100, 
  unit = "₦",
  showIcon = true,
  className = "",
  progressColor = "bg-blue-600",
  currentLabel = "In Progress",
  targetLabel = "Target"
}) => {
  const progressPercent = Math.min((current / target) * 100, 100); // Cap at 100%
  const isOverTarget = current > target;

  return (
    <div className={`w-full p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1">
          <p className="text-sm text-gray-500">{currentLabel}</p>
          <p className={`text-2xl font-semibold ${isOverTarget ? 'text-green-600' : 'text-blue-600'}`}>
            {unit}{current.toLocaleString()}
          </p>
        </div>

        <div className="text-center flex-1">
          <p className="text-sm text-gray-500">{targetLabel}</p>
          <p className="text-2xl font-semibold text-gray-800">
            {unit}{target.toLocaleString()}
          </p>
        </div>

        {showIcon && (
          <div className="text-gray-400 text-xl flex-shrink-0 ml-2">
            <FiRefreshCcw />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-200 rounded-full relative overflow-hidden">
        <div
          className={`h-4 ${isOverTarget ? 'bg-green-600' : progressColor} rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        ></div>
        
        {/* Show overflow indicator if over target */}
        {isOverTarget && (
          <div className="absolute top-0 right-0 h-4 w-2 bg-green-700 opacity-75"></div>
        )}
      </div>

      {/* Progress percentage text */}
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <span>{progressPercent.toFixed(1)}% of target</span>
        {isOverTarget && (
          <span className="text-green-600 font-medium">Target exceeded!</span>
        )}
      </div>
    </div>
  );
};
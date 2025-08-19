// components/StatCard.jsx
import React from "react";
import { TrendingDown , TrendingUp  } from "lucide-react";

const StatCard = ({ 
  title, 
  subtitle, 
  value, 
  icon, 
  trend, 
  trendLabel, 
  color = "text-blue-600" 
}) => {
  return (
    <div className="flex flex-col justify-between bg-white rounded-2xl shadow-sm border p-3 min-w-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex flex-col items-center justify-center">
            <p className="text-[13px] font-bold text-neutral-800">{title}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </span>

        {icon && <span className="text-neutral-800 mt-[-19px] text-2xl">{icon}</span>}
       
      </div>


      {/* Subtitle + Trend */}
      <div className="flex items-center justify-between mt-2">
      {/* Value */}
      <div className="text-2xl font-bold tracking-tight">
        <span className={color}>{value}</span>
      </div>
            {trend && (
            <div className="flex flex-col items-center text-xs">
                {trend > 0 ? (
                <TrendingUp  size={14} className="text-green-500 mr-1" />
                ) : (
                < TrendingDown size={14} className="text-red-500 mr-1" />
                )}
                <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(trend)}%
                </span>
                {trendLabel && <span className="ml-1 text-gray-400">{trendLabel}</span>}
            </div>
            )}

       
      </div>
    </div>
  );
};

export default StatCard;

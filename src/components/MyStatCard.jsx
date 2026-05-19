"use client";
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const MyStatCard = ({ title, date, amount, changeText, icon, trend }) => {
  // Parse trend — handles "+5.2%", "-100%", 0, null, undefined, raw numbers
  const raw = trend !== null && trend !== undefined ? String(trend) : null;
  const numericTrend = raw !== null ? parseFloat(raw.replace(/[^0-9.-]/g, "")) : null;

  const hasValue  = numericTrend !== null && !isNaN(numericTrend);
  const isZero    = !hasValue || numericTrend === 0;
  const isPositive = hasValue && numericTrend > 0;
  const isNegative = hasValue && numericTrend < 0;

  const trendColor = isPositive ? "text-green-600" : isNegative ? "text-red-500" : "text-gray-400";
  const TrendIcon  = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendLabel = isZero ? "0%" : `${isPositive ? "+" : ""}${numericTrend.toFixed(1)}%`;

  const showTrendRow = hasValue || changeText;

  return (
    <div className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl p-4 flex flex-col gap-2 w-full min-w-0 overflow-hidden">

      {/* Icon — watermark */}
      {icon && (
        <div className="absolute top-3 right-3 opacity-20 select-none pointer-events-none">
          {typeof icon === "string" ? (
            <span className="text-2xl text-neutral-700 dark:text-gray-300">{icon}</span>
          ) : (
            <span className="text-neutral-700 dark:text-gray-300">{icon}</span>
          )}
        </div>
      )}

      {/* Title + date */}
      <div className="pr-8 min-w-0">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-gray-200 leading-snug truncate">{title}</h3>
        {date && <p className="text-xs text-gray-400 mt-0.5">{date}</p>}
      </div>

      {/* Amount */}
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400 truncate">{amount}</p>

      {/* Trend row */}
      {showTrendRow && (
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {hasValue && (
            <span className={`shrink-0 flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
              <TrendIcon size={12} />
              {trendLabel}
            </span>
          )}
          {changeText && (
            <span className="text-xs text-gray-400 truncate">{changeText}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MyStatCard;

"use client";
import React from "react";

const MyStatCard = ({ title, date, amount, change, changeText, icon, trend }) => {
  const numericChange = parseFloat(change);
  const isPositive = numericChange > 0;

  return (
    <div className="relative bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex flex-col gap-2 w-full min-w-0 overflow-hidden">

      {/* Icon — watermark style, won't overlap text */}
      {icon && (
        <div className="absolute top-3 right-3 opacity-20 select-none pointer-events-none">
          {typeof icon === "string" ? (
            <span className="text-2xl text-neutral-700">{icon}</span>
          ) : (
            <span className="text-neutral-700">{icon}</span>
          )}
        </div>
      )}

      {/* Title + date */}
      <div className="pr-8 min-w-0">
        <h3 className="text-sm font-semibold text-neutral-700 leading-snug truncate">{title}</h3>
        {date && <p className="text-xs text-gray-400 mt-0.5">{date}</p>}
      </div>

      {/* Amount */}
      <p className="text-lg font-bold text-blue-600 truncate">{amount}</p>

      {/* Change row */}
      {(change || changeText) && (
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {trend && (
            <span className={`shrink-0 ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {trend}
            </span>
          )}
          {change && (
            <span className={`text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {change}
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

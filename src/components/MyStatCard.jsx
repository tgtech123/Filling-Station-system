// src/components/MyStatCard.jsx
"use client";
import React from "react";

const MyStatCard = ({ title, date, amount, change, changeText, icon, trend }) => {

    const numericChange = parseFloat(change);

  return (
   <div className="relative bg-white border-[1px] mt-8 p-4 flex flex-col items-center rounded-xl w-full">
  {/* Icon top-right */}
  <div className="absolute top-3 right-3">
    {typeof icon === "string" ? (
      <span className="text-neutral-800">{icon}</span>
    ) : (
      icon
    )}
  </div>

  {/* Title + date */}
  <div className="flex mb-2 justify-center w-full"> 
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <p className="text-xs text-gray-400">{date}</p>
    </div>
  </div>

  {/* Amount + change */}
  <div className="flex items-center justify-between gap-1 text-sm mb-[-10px]">
    <p className="text-xl font-bold text-blue-600 mt-2">{amount}</p>
    
    <div className="flex flex-col items-center gap-1">
      <span
        className={
          numericChange > 1.5
            ? "text-green-600 font-medium"
            : "text-red-600 font-semibold"
        }
      >
        <p className="flex">
          {trend}
          {change}
        </p>
      </span>
      <span className="text-gray-400 text-[10px]">{changeText}</span>
    </div>
  </div>
</div>

  );
};

export default MyStatCard;

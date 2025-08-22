// src/components/MyStatCard.jsx
"use client";
import React from "react";

const MyStatCard = ({ title, date, amount, change, changeText, icon }) => {
  return (
    <div className="bg-white border-[1px] mt-8 p-4 rounded-xl w-full ">
      <div className="flex items-center justify-between mb-2">
        
        <span className="flex flex-col justify-center items-center">
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            <p className="text-xs text-gray-400">{date}</p>
        </span>
        {/* Render text if icon is string, else render as JSX */}
        {typeof icon === "string" ? (
            <span className="text-gray-800 text-lg ml-1 mb-4">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <div className="flex items-center gap-1 text-sm mb-[-10px]">
        <p className="text-xl font-bold text-blue-600 mt-2">{amount}</p>
        
        <div className="flex flex-col items-center gap-1">
            <span className="text-green-600">{change}</span>
            <span className="text-gray-400 text-[12px]">{changeText}</span>
        </div>
      </div>
    </div>
  );
};

export default MyStatCard;

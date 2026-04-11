"use client";
import React from "react";
import { AlarmClock, Trash2 } from 'lucide-react';
import { IoCheckmarkDoneOutline } from "react-icons/io5";

export default function ShiftApprovalHeader({
  activeTab,
  onTabChange,
  canClearStale,
  clearingStale,
  onClearStaleClick,
  pendingCount
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-3 bg-white dark:bg-gray-800 rounded-xl p-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">Shift Approval</h1>
        <p className="text-neutral-800 dark:text-gray-300 text-xl">Approve submitted shifts and export report</p>

        <div className="border dark:border-gray-700 w-fit p-2 flex gap-2 rounded-xl">
          <button
            onClick={() => onTabChange("pending")}
            className={`px-4 py-2 rounded flex gap-2 ${
              activeTab === "pending"
                ? "text-[#1A71F6] font-semibold bg-[#D9EDFF] dark:bg-blue-900/40"
                : "text-neutral-200 dark:text-gray-500"
            }`}
          >
            <AlarmClock />
            Pending ({pendingCount || 0})
          </button>
          <button
            onClick={() => onTabChange("approved")}
            className={`px-4 py-2 rounded flex gap-2 ${
              activeTab === "approved"
                ? "text-[#1a71f6] font-semibold bg-[#D9EDFF] dark:bg-blue-900/40"
                : "text-neutral-200 dark:text-gray-500"
            }`}
          >
            <IoCheckmarkDoneOutline size={24} />
            Approved
          </button>
        </div>
      </div>

      {canClearStale && (
        <button
          onClick={onClearStaleClick}
          disabled={clearingStale}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={16} />
          {clearingStale ? "Clearing..." : "Clear Stale Shifts"}
        </button>
      )}
    </div>
  );
}
 
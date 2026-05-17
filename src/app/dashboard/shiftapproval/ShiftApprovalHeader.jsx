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
    <div className="mb-3 bg-white dark:bg-gray-800 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Title + tabs */}
        <div className="flex flex-col gap-3 min-w-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-white">
              Shift Approval
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Approve submitted shifts and export report
            </p>
          </div>

          <div className="border dark:border-gray-700 w-fit p-1.5 flex gap-1.5 rounded-xl">
            <button
              onClick={() => onTabChange("pending")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors ${
                activeTab === "pending"
                  ? "text-[#1A71F6] font-semibold bg-[#D9EDFF] dark:bg-blue-900/40"
                  : "text-neutral-400 dark:text-gray-500"
              }`}
            >
              <AlarmClock size={16} />
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </button>
            <button
              onClick={() => onTabChange("approved")}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors ${
                activeTab === "approved"
                  ? "text-[#1a71f6] font-semibold bg-[#D9EDFF] dark:bg-blue-900/40"
                  : "text-neutral-400 dark:text-gray-500"
              }`}
            >
              <IoCheckmarkDoneOutline size={18} />
              Approved
            </button>
          </div>
        </div>

        {/* Clear stale */}
        {canClearStale && (
          <button
            onClick={onClearStaleClick}
            disabled={clearingStale}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start shrink-0"
          >
            <Trash2 size={15} />
            {clearingStale ? "Clearing…" : "Clear Stale"}
          </button>
        )}
      </div>
    </div>
  );
}

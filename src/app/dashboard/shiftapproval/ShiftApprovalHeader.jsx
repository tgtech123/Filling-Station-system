import React from "react";
import { AlarmClock } from 'lucide-react'
import { IoCheckmarkDoneOutline } from "react-icons/io5";

export default function ShiftApprovalHeader({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-4 mb-3 bg-white rounded-xl p-4">
      <div className="flex flex-col gap-3 ">
        <h1 className="text-2xl font-bold text-neutral-800 ">Shift Approval</h1>
        <p className="text-neutral-800 text-xl">Approve submitted shifts and export report</p>

        <div className="border w-fit p-2 flex gap-2 rounded-xl">
          <button
            onClick={() => onTabChange("pending")}
            className={`px-4 py-2 rounded flex gap-2 ${
              activeTab === "pending"
                ? "text-[#1A71F6] font-semibold bg-[#D9EDFF]"
                : "text-neutral-200"
            }`}
            >
            <AlarmClock />
            Pending (3)
          </button>
          <button
            onClick={() => onTabChange("approved")}
            className={`px-4 py-2 rounded flex gap-2 ${
              activeTab === "approved"
                ? "text-[#1a71f6] font-semibold bg-[#D9EDFF]"
                : "text-neutral-200"
            }`} 

          > <IoCheckmarkDoneOutline size={24} />
            Approved
          </button>
        </div>

      </div>


    </div>
  );
}

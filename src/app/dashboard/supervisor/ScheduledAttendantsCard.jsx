"use client";
import React, { act, useState } from "react";
import ScheduledAttendantsTable from "@/components/ScheduledAttendantsTable";
import dayOffScheduleData, {tableCols, scheduleRows} from "./dayOffScheduleData"
const ScheduledAttendantsCard = () => {
  const [activeTab, setActiveTab] = useState("tabOne");

  const columns = ["Morning", "Pump no", "Evening", "Pump no"];

  const data = [
    [{ name: "John Dave", status: "active" }, "1", { name: "Elem Dennis", status: "active" }, "1"],
    [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "3"],
    [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "9"],
    [{ name: "Closed", status: "closed" }, "1", { name: "David Brainherd", status: "inactive" }, "-"],
    [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "4"],
    [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "6"],
  ];

  return (
    <div className="bg-white p-4 rounded-2xl w-full max-w-[34.3125rem]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Scheduled Attendants
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View attendants meant to be on duty
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span> Active
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <span className="h-2.5 w-2.5 bg-neutral-200 rounded-full"></span> Inactive
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <span className="h-2.5 w-2.5 bg-red-500 rounded-full"></span> Closed
            </span>
          </div>
        </div>

        {/* ✅ Both buttons rendered at once */}
        <div className="flex gap-2 items-center justify-between bg-blue-600 rounded-sm p-1 max-w-[9.6875rem] h-[1.8125rem]">
            <button
                id="tabOne"
                className={`flex-1 text-[0.65rem] p-1.5 font-bold rounded-[3px] py-[2px] transition-all duration-200 whitespace-nowrap ${
                activeTab === "tabOne"
                    ? "text-blue-600 bg-white"
                    : "text-white bg-transparent"
                }`}
                onClick={() => setActiveTab("tabOne")}
            >
                One-Day
            </button>

            <button
                id="tabTwo"
                className={`flex-1 text-[0.65rem] font-bold p-1.5 rounded-[3px] py-[2px] transition-all duration-200 whitespace-nowrap ${
                activeTab === "tabTwo"
                    ? "text-blue-600 bg-white"
                    : "text-white bg-transparent"
                }`}
                onClick={() => setActiveTab("tabTwo")}
            >
                Day-Off
            </button>
        </div>

      </div>
            
            {activeTab === "tabOne" &&(
                <ScheduledAttendantsTable columns={columns} data={data} />
            )}
            {activeTab === "tabTwo" &&(
                <ScheduledAttendantsTable columns={dayOffScheduleData.tableCols} data={dayOffScheduleData.scheduleRows} />
            )}
    </div>
  );
};

export default ScheduledAttendantsCard;

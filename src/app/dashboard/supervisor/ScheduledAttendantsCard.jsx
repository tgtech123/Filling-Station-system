// "use client";
// import React, { act, useState } from "react";
// import ScheduledAttendantsTable from "@/components/ScheduledAttendantsTable";
// import dayOffScheduleData, {tableCols, scheduleRows} from "./dayOffScheduleData"
// const ScheduledAttendantsCard = () => {
//   const [activeTab, setActiveTab] = useState("tabOne");

//   const columns = ["Morning", "Pump no", "Evening", "Pump no"];

//   const data = [
//     [{ name: "John Dave", status: "active" }, "1", { name: "Elem Dennis", status: "active" }, "1"],
//     [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "3"],
//     [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "9"],
//     [{ name: "Closed", status: "closed" }, "1", { name: "David Brainherd", status: "inactive" }, "-"],
//     [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "4"],
//     [{ name: "Oboh ThankGod", status: "inactive" }, "-", { name: "Lemuel Samson", status: "closed" }, "6"],
//   ];

//   return (
//     <div className="bg-white p-4 rounded-2xl w-full ">
//       <div className="flex justify-between items-start">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-800">
//             Scheduled Attendants
//           </h2>
//           <p className="text-sm text-gray-500 mt-1">
//             View attendants meant to be on duty
//           </p>

//           <div className="flex items-center gap-3 mt-2 text-xs">
//             <span className="flex items-center gap-1 text-green-600">
//               <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span> Active
//             </span>
//             <span className="flex items-center gap-1 text-gray-400">
//               <span className="h-2.5 w-2.5 bg-neutral-200 rounded-full"></span> Inactive
//             </span>
//             <span className="flex items-center gap-1 text-red-500">
//               <span className="h-2.5 w-2.5 bg-red-500 rounded-full"></span> Closed
//             </span>
//           </div>
//         </div>

//         {/* ✅ Both buttons rendered at once */}
//         <div className="flex gap-2 items-center justify-between bg-blue-600 rounded-sm p-1 max-w-[9.6875rem] h-[1.8125rem]">
//             <button
//                 id="tabOne"
//                 className={`flex-1 text-[0.65rem] p-1.5 font-bold rounded-[3px] py-[2px] transition-all duration-200 whitespace-nowrap ${
//                 activeTab === "tabOne"
//                     ? "text-blue-600 bg-white"
//                     : "text-white bg-transparent"
//                 }`}
//                 onClick={() => setActiveTab("tabOne")}
//             >
//                 One-Day
//             </button>

//             <button
//                 id="tabTwo"
//                 className={`flex-1 text-[0.65rem] font-bold p-1.5 rounded-[3px] py-[2px] transition-all duration-200 whitespace-nowrap ${
//                 activeTab === "tabTwo"
//                     ? "text-blue-600 bg-white"
//                     : "text-white bg-transparent"
//                 }`}
//                 onClick={() => setActiveTab("tabTwo")}
//             >
//                 Day-Off
//             </button>
//         </div>

//       </div>
            
//             {activeTab === "tabOne" &&(
//                 <ScheduledAttendantsTable columns={columns} data={data} />
//             )}
//             {activeTab === "tabTwo" &&(
//                 <ScheduledAttendantsTable columns={dayOffScheduleData.tableCols} data={dayOffScheduleData.scheduleRows} />
//             )}
//     </div>
//   );
// };

// export default ScheduledAttendantsCard;


"use client";
import React, { useState, useEffect } from "react";
import ScheduledAttendantsTable from "@/components/ScheduledAttendantsTable";
import useSupervisorStore from "@/store/useSupervisorStore";
import useShiftTypeStore from "@/store/useShiftTypeStore";

const ScheduledAttendantsCard = () => {
  const [activeTab, setActiveTab] = useState("tabOne");
  const { dashboard, loading, error } = useSupervisorStore();

  // Custom shift types carry a session ("morning"/"evening") that decides
  // which column they land in — same rule the backend schedule view uses.
  const { custom, fetchTypes } = useShiftTypeStore();
  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const isEveningType = (shiftType) => {
    if (shiftType === "One-Day-Evening") return true;
    const def = custom.find(
      (t) => t.name?.toLowerCase() === String(shiftType || "").toLowerCase()
    );
    return def?.session === "evening";
  };

  // Get scheduled attendants from dashboard
  const scheduledAttendants = dashboard?.scheduledAttendants || { today: [], tomorrow: [] };

  // Transform data for One-Day shift (Morning & Evening)
  const oneDayColumns = ["Morning", "Pump no", "Evening", "Pump no"];

  const oneDayData = (() => {
    const today = scheduledAttendants.today || [];

    // Evening = One-Day-Evening or a custom type with session "evening";
    // everything else (built-ins and custom morning types) goes to Morning so
    // no scheduled shift ever disappears from this view.
    const morningShifts = today.filter((att) => !isEveningType(att.shiftType));
    const eveningShifts = today.filter((att) => isEveningType(att.shiftType));

    // Get max length for rows
    const maxLength = Math.max(morningShifts.length, eveningShifts.length);

    // Create rows
    const rows = [];
    for (let i = 0; i < maxLength; i++) {
      const morning = morningShifts[i];
      const evening = eveningShifts[i];

      rows.push([
        morning ? { name: morning.name, status: morning.status } : { name: "-", status: "inactive" },
        morning ? morning.pumpNo : "-",
        evening ? { name: evening.name, status: evening.status } : { name: "-", status: "inactive" },
        evening ? evening.pumpNo : "-",
      ]);
    }

    return rows;
  })();

  // Transform data for Day-Off (Full-Time)
  const dayOffColumns = ["Full-Time", "Pump no"];
  
  const dayOffData = (() => {
    const today = scheduledAttendants.today || [];
    
    // Get day-off/full-time shifts
    const dayOffShifts = today.filter(
      (att) => att.shiftType === "Day-Off" || att.shiftType === "Full-Time"
    );

    return dayOffShifts.map((shift) => [
      { name: shift.name, status: shift.status },
      shift.pumpNo,
    ]);
  })();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Title block */}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">
            Scheduled Attendants
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            View attendants meant to be on duty
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-green-600">
              <span className="h-2 w-2 bg-green-500 rounded-full shrink-0" /> Active
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="h-2 w-2 bg-neutral-300 rounded-full shrink-0" /> Inactive
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="h-2 w-2 bg-red-500 rounded-full shrink-0" /> Closed
            </span>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center bg-blue-600 rounded-lg p-1 shrink-0 min-w-[9rem]">
          <button
            onClick={() => setActiveTab("tabOne")}
            className={`flex-1 text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeTab === "tabOne"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-white"
            }`}
          >
            One-Day
          </button>
          <button
            onClick={() => setActiveTab("tabTwo")}
            className={`flex-1 text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeTab === "tabTwo"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-white"
            }`}
          >
            Day-Off
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading schedule...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <>
            {activeTab === "tabOne" && (
              oneDayData.length > 0 ? (
                <ScheduledAttendantsTable columns={oneDayColumns} data={oneDayData} />
              ) : (
                <div className="text-center py-8 text-gray-500">No scheduled attendants for One-Day shifts</div>
              )
            )}
            {activeTab === "tabTwo" && (
              dayOffData.length > 0 ? (
                <ScheduledAttendantsTable columns={dayOffColumns} data={dayOffData} />
              ) : (
                <div className="text-center py-8 text-gray-500">No scheduled attendants for Day-Off shifts</div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduledAttendantsCard;
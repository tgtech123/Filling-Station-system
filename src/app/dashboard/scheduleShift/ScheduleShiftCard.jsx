// // import CustomSelect from "@/components/CustomSelect";
// import { X } from "lucide-react";

// export default function ScheduleShiftCard({ user, onClose }) {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center p-6 z-50 bg-black/30">
//       <div className="bg-white flex flex-col rounded-xl p-6 w-full sm:overflow-y-auto max-w-[400px] shadow-xl">
//         <header className="flex justify-end mb-4" onClick={onClose}>
//           <X />
//         </header>

//         <div>
//           <h5 className="font-semibold text-lg text-gray-700">
//             Schedule Attendant
//           </h5>
//           <p className="text-sm">
//             Manage {user.name}'s work schedule and shift
//           </p>
//         </div>

//         <div className="mt-4 flex flex-col gap-2">
//           <div>
//             <p className="font-semibold text-sm">Shift type</p>
//             <select className="text-sm w-full p-2 rounded-[8px] text-gray-400 border-2 border-gray-300">
//               <option>New Shift</option>
//               <option>Old Shift</option>
//             </select>
//           </div>

//           <div>
//             <p className="font-semibold text-sm">Start Date</p>
//             <input
//               type="date"
//               className="text-sm w-full p-2 rounded-[8px] text-gray-400 border-2 border-gray-300"
//               placeholder="Start date"
//             />
//           </div>

//           <div>
//             <p className="font-semibold text-sm">End Date</p>
//             <input
//               type="date"
//               className="text-sm w-full p-2 rounded-[8px] text-gray-400 border-2 border-gray-300"
//               placeholder="Start date"
//             />
//           </div>
//         </div>

//         <div className="my-4 pt-4 border-t-1 flex flex-col gap-3 border-gray-300">
//           <h5 className="font-semibold text-md">Recent Changes</h5>
//           <div className="flex justify-between text-xs text-gray-600">
//             <p>
//                 Switched to day-off shift on Dec 15
//             </p>
//             <p>2 days ago</p>
//           </div>
//           <div className="flex justify-between text-xs text-gray-600">
//             <p>
//                 Switched to full-time shift (6am - 10pm) on Dec. 15
//             </p>
//             <p>1 week ago</p>
//           </div>
//            <div className="flex justify-between text-xs text-gray-600">
//             <p>
//                 Switched to day-off shift on Dec 15
//             </p>
//             <p>2 days ago</p>
//           </div>
//         </div>
//       <button onClick={onClose} className="w-full cursor-pointer bg-[#0080ff] text-sm text-white p-2 rounded-[8px]">Save Changes</button>
//       </div>

//     </div>
//   );
// }


"use client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import useSupervisorStore from "@/store/useSupervisorStore";

export default function ScheduleShiftCard({ user, onClose }) {
  const [shiftType, setShiftType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pumpId, setPumpId] = useState("");
  const [availablePumps, setAvailablePumps] = useState([]);

  const { scheduleAttendant, loading, error, pumpPerformance, fetchPumpPerformance } = useSupervisorStore();

  // Fetch pumps on mount
  // useEffect(() => {
  //   fetchPumpPerformance().then((data) => {
  //     if (data?.data?.pumps) {
  //       setAvailablePumps(data.data.pumps);
  //       // Set first pump as default
  //       if (data.data.pumps.length > 0) {
  //         setPumpId(data.data.pumps[0]._id);
  //       }
  //     }
  //   });
  // }, [fetchPumpPerformance]);

  useEffect(() => {
  fetchPumpPerformance().then((data) => {
    console.log('=== PUMP PERFORMANCE DATA ===');
    console.log('Full data:', data);
    console.log('Pumps:', data?.data?.pumps);
    console.log('============================');
    
    if (data?.data?.pumps) {
      setAvailablePumps(data.data.pumps);
      if (data.data.pumps.length > 0) {
        console.log('First pump:', data.data.pumps[0]);
        console.log('Pump ID being set:', data.data.pumps[0]._id);
        setPumpId(data.data.pumps[0]._id);
      }
    }
  });
}, [fetchPumpPerformance]);

  // Shift type options
  const shiftTypes = [
    { 
      value: "One-Day-Morning", 
      label: "One-Day (Morning) - 6AM - 2PM",
      disabled: user.shiftSchedule?.includes("Morning")
    },
    { 
      value: "One-Day-Evening", 
      label: "One-Day (Evening) - 2PM - 10PM",
      disabled: user.shiftSchedule?.includes("Evening")
    },
    { 
      value: "Day-Off", 
      label: "Day-Off - 6AM - 10PM",
      disabled: user.shiftSchedule?.includes("Day-Off")
    },
    { 
      value: "Full-Time", 
      label: "Full-Time - 6AM - 10PM",
      disabled: user.shiftSchedule?.includes("Full")
    },
  ];

  const handleSave = async () => {
    // Validation
    if (!shiftType) {
      alert("Please select a shift type");
      return;
    }
    if (!startDate) {
      alert("Please select a start date");
      return;
    }
    if (!pumpId) {
      alert("Please select a pump");
      return;
    }

    try {
      const data = {
        attendantId: user.id,
        shiftType,
        startDate,
        endDate: endDate || startDate, // If no end date, use start date
        pumpId,
      };

      await scheduleAttendant(data);
      alert("Attendant scheduled successfully!");
      onClose();
    } catch (err) {
      console.error("Error scheduling attendant:", err);
      alert(`Failed to schedule attendant: ${err.message || error}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 z-50 bg-black/30">
      <div className="bg-white flex flex-col rounded-xl p-6 w-full max-h-[90vh] overflow-y-auto max-w-[400px] shadow-xl">
        <header className="flex justify-end mb-4 cursor-pointer" onClick={onClose}>
          <X />
        </header>

        <div>
          <h5 className="font-semibold text-lg text-gray-700">
            Schedule Attendant
          </h5>
          <p className="text-sm text-gray-600">
            Manage {user.name}'s work schedule and shift
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Current: {user.shiftSchedule || "Not scheduled"}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {/* Shift Type */}
          <div>
            <p className="font-semibold text-sm mb-1">Shift Type *</p>
            <select 
              className="text-sm w-full p-2 rounded-[8px] border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
            >
              <option value="">Select shift type</option>
              {shiftTypes.map((type) => (
                <option 
                  key={type.value} 
                  value={type.value}
                  disabled={type.disabled}
                  className={type.disabled ? "text-gray-400 bg-gray-100" : ""}
                >
                  {type.label} {type.disabled ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Pump Selection */}
          <div>
            <p className="font-semibold text-sm mb-1">Assign Pump *</p>
            <select 
              className="text-sm w-full p-2 rounded-[8px] border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              value={pumpId}
              onChange={(e) => setPumpId(e.target.value)}
            >
              <option value="">Select pump</option>
              {availablePumps.map((pump) => (
                <option 
                  key={pump._id} 
                  value={pump._id}
                  disabled={pump.status === "Maintenance"}
                >
                  {pump.pumpTitle} - {pump.fuelType} ({pump.status})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <p className="font-semibold text-sm mb-1">Start Date *</p>
            <input
              type="date"
              className="text-sm w-full p-2 rounded-[8px] border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* End Date */}
          <div>
            <p className="font-semibold text-sm mb-1">End Date (Optional)</p>
            <input
              type="date"
              className="text-sm w-full p-2 rounded-[8px] border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to schedule for one day only
            </p>
          </div>
        </div>

        {/* Recent Changes */}
        <div className="my-4 pt-4 border-t flex flex-col gap-3 border-gray-300">
          <h5 className="font-semibold text-md">Recent Changes</h5>
          
          {user.recentChanges && user.recentChanges.length > 0 ? (
            user.recentChanges.map((change, index) => (
              <div key={index} className="flex justify-between text-xs text-gray-600">
                <p>{change.description}</p>
                <p className="text-gray-400">{change.timeAgo}</p>
              </div>
            ))
          ) : (
            <>
              <div className="flex justify-between text-xs text-gray-600">
                <p>Current shift: {user.shiftSchedule || "Not scheduled"}</p>
                <p className="text-gray-400">Active</p>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <p>No recent changes recorded</p>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={onClose} 
            className="flex-1 cursor-pointer bg-gray-200 text-sm text-gray-700 p-2 rounded-[8px] hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1 cursor-pointer bg-[#0080ff] text-sm text-white p-2 rounded-[8px] hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
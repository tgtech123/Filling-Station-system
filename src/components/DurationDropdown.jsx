
// import { useState } from "react";
// import { ChevronDown } from "lucide-react";

// export default function DurationDropdown() {
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState("Select option");

//   const quickOptions = ["This month", "Last quarter", "This year"];

//   return (
//     <div className="w-full  text-sm">
//       <label className="block text-gray-600 mb-1 font-semibold">Duration</label>

//       {/* Top Select */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex justify-between items-center border border-blue-500 rounded-md px-3 py-2 focus:outline-none"
//       >
//         <span>{selected}</span>
//         <ChevronDown className="h-4 w-4 text-gray-500" />
//       </button>

//       {/* Dropdown */}
//       {open && (
//         <div className="border border-blue-500 rounded-md mt-1 bg-white shadow">
//           {/* From / To */}
//           <div className="flex divide-x divide-blue-500">
//             <select className="w-1/2 p-2 border-b-1 border-blue-500 focus:outline-none">
//               <option>From</option>
//               <option>Jan</option>
//               <option>Feb</option>
//             </select>
//             <select className="w-1/2 p-2 border-b-1 border-blue-500 focus:outline-none">
//               <option>To</option>
//               <option>Mar</option>
//               <option>Apr</option>
//             </select>
//           </div>

//           {/* Quick Options */}
//           <ul className="mt-1">
//             {quickOptions.map((opt) => (
//               <li key={opt}>
//                 <button
//                   onClick={() => {
//                     setSelected(opt);
//                     setOpen(false);
//                   }}
//                   className={`w-full text-left px-3 py-2 hover:bg-blue-100 ${
//                     selected === opt ? "bg-blue-500 text-white" : ""
//                   }`}
//                 >
//                   {opt}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DurationDropdown({ onDateChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Select option");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Quick date range calculators
  const getDateRange = (option) => {
    const today = new Date();
    let start, end;

    switch (option) {
      case "This month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "Last quarter":
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
        const lastQuarterYear = currentQuarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
        start = new Date(lastQuarterYear, lastQuarter * 3, 1);
        end = new Date(lastQuarterYear, (lastQuarter + 1) * 3, 0);
        break;
      case "This year":
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      default:
        return null;
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const handleQuickSelect = (option) => {
    const range = getDateRange(option);
    if (range) {
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      setSelected(option);
      onDateChange?.(range);
    }
    setOpen(false);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    setSelected("Custom Range");
    onDateChange?.({ startDate: newStartDate, endDate });
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    setSelected("Custom Range");
    onDateChange?.({ startDate, endDate: newEndDate });
  };

  const quickOptions = ["This month", "Last quarter", "This year"];

  return (
    <div className="w-full text-sm">
      <label className="block text-gray-600 mb-1 font-semibold">Duration</label>

      {/* Top Select */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border border-blue-500 rounded-md px-3 py-2 focus:outline-none"
      >
        <span className="text-gray-700">
          {startDate && endDate
            ? `${startDate} to ${endDate}`
            : selected}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="border border-blue-500 rounded-md mt-1 bg-white shadow-lg z-10 absolute">
          {/* Date Inputs */}
          <div className="flex divide-x divide-blue-500 p-2 gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-600 block mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1 pl-2">
              <label className="text-xs text-gray-600 block mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate}
                className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Quick Options */}
          <ul className="mt-1">
            {quickOptions.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => handleQuickSelect(opt)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-100 transition-colors ${
                    selected === opt ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

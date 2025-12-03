// import React, { useState, useRef, useEffect } from "react";
// import StartShiftCard from "./StartShiftCard";
// import EndShiftCard from "./EndShiftCard";

// const TableHeader = () => {
//   const [dropdownType, setDropdownType] = useState(null); // null | 'start' | 'end'
//   const [shiftStarted, setShiftStarted] = useState(false);
//   const wrapperRef = useRef();

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
//         setDropdownType(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleStartShift = () => {
//     setShiftStarted(true);
//     setDropdownType(null);
//   };

//   const handleEndShift = () => {
//     setShiftStarted(false);
//     setDropdownType(null);
//   };

//   return (
//     <div className="flex flex-col mb-3 lg:flex-row items-start lg:items-center gap-3 lg:gap-0 justify-between bg-white py-6 px-4 rounded-xl relative">
//       <div>
//         <h1 className="text-2xl font-semibold text-gray-800">Shifts</h1>
//         <p className="text-gray-500 text-sm">Enter meter reading to start your shift</p>
//       </div>

//       <div className="relative" ref={wrapperRef}>
//         <div className="flex gap-2">
//           <button
//             disabled={shiftStarted}
//             onClick={() => setDropdownType("start")}
//             className={`font-semibold px-4 py-2 rounded-lg text-sm ${
//               shiftStarted
//                 ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 text-white"
//             }`}
//           >
//             Start Shift
//           </button>

//           <button
//             disabled={!shiftStarted}
//             onClick={() => setDropdownType("end")}
//             className={`px-4 py-2 rounded-lg text-sm ${
//               shiftStarted
//                 ? "bg-[#0080FF] hover:bg-blue-700 text-white"
//                 : "bg-gray-200 text-gray-500 cursor-not-allowed"
//             }`}
//           >
//             End Shift
//           </button>
//         </div>

//         {/* Conditionally render dropdowns */}
//         {dropdownType === "start" && (
//           <StartShiftCard onClose={() => setDropdownType(null)} onStart={handleStartShift} />
//         )}
//         {dropdownType === "end" && (
//           <EndShiftCard onClose={() => setDropdownType(null)} onEnd={handleEndShift} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default TableHeader;



import React, { useState, useRef, useEffect } from "react";
import StartShiftCard from "./StartShiftCard";
import EndShiftCard from "./EndShiftCard";
import useShiftStore from "@/store/useShiftStore";

const TableHeader = () => {
  const [dropdownType, setDropdownType] = useState(null); // null | 'start' | 'end'
  const wrapperRef = useRef();
  
  const { currentShift, fetchCurrentShift } = useShiftStore();

  // Fetch current shift on mount
  useEffect(() => {
    fetchCurrentShift();
  }, [fetchCurrentShift]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownType(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartShift = () => {
    setDropdownType(null);
  };

  const handleEndShift = () => {
    setDropdownType(null);
  };

  const shiftStarted = !!currentShift; // Check if there's an active shift

  return (
    <div className="flex flex-col mb-3 lg:flex-row items-start lg:items-center gap-3 lg:gap-0 justify-between bg-white py-6 px-4 rounded-xl relative">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Shifts</h1>
        <p className="text-gray-500 text-sm">
          {shiftStarted 
            ? `Active shift: ${currentShift.pumpTitle} - ${currentShift.product}`
            : "Enter meter reading to start your shift"
          }
        </p>
      </div>

      <div className="relative" ref={wrapperRef}>
        <div className="flex gap-2">
          <button
            disabled={shiftStarted}
            onClick={() => setDropdownType("start")}
            className={`font-semibold px-4 py-2 rounded-lg text-sm ${
              shiftStarted
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Start Shift
          </button>

          <button
            disabled={!shiftStarted}
            onClick={() => setDropdownType("end")}
            className={`px-4 py-2 rounded-lg text-sm ${
              shiftStarted
                ? "bg-[#0080FF] hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            End Shift
          </button>
        </div>

        {/* Conditionally render dropdowns */}
        {dropdownType === "start" && (
          <StartShiftCard 
            onClose={() => setDropdownType(null)} 
            onStart={handleStartShift} 
          />
        )}
        {dropdownType === "end" && (
          <EndShiftCard 
            onClose={() => setDropdownType(null)} 
            onEnd={handleEndShift}
            currentShift={currentShift}
          />
        )}
      </div>
    </div>
  );
};

export default TableHeader;
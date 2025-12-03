// import React, { useState } from "react";
// import { GoChevronDown, GoChevronUp } from "react-icons/go";

// const shiftOptions = [
//   { value: "", label: "Select your shift" },
//   { value: "morning", label: "One-Day-Morning (6AM–3PM)" },
//   { value: "evening", label: "One-Day-Evening (3PM–10PM)" },
//   { value: "dayoff", label: "Day-Off" },
//   { value: "fulltime", label: "Full-Time (6AM–10PM)" },
// ];

// const pumpOptions = [
//   { value: "", label: "Select pump" },
//   { value: "1", label: "Pump 1" },
//   { value: "2", label: "Pump 2" },
//   { value: "3", label: "Pump 3" },
//   { value: "4", label: "Pump 4" },
// ];

// const StartShiftCard = ({ onClose, onStart }) => {
//   const [isShiftTypeOpen, setIsShiftTypeOpen] = useState(false);
//   const [selectedShift, setSelectedShift] = useState(shiftOptions[0]);
//   const [isPumpOpen, setIsPumpOpen] = useState(false);
//   const [selectedPump, setSelectedPump] = useState(pumpOptions[0]);
//   const [openingReading, setOpeningReading] = useState("");

//   return (
//     <div className="fixed top-28 right-4 w-[94vw] sm:w-[32rem] max-w-[90vw] md:max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
//       {/* Header */}
//       <div className="flex justify-between items-start mb-5">
//         <div>
//           <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//             Start Shift
//           </h2>
//           <p className="text-xs sm:text-sm text-gray-500">
//             Enter meter reading to start shift
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
//         >
//           ×
//         </button>
//       </div>

//       {/* Form */}
//       <form className="space-y-4">
//         {/* Custom Shift Type */}
//         <div className="relative">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Shift type
//           </label>
//           <button
//             type="button"
//             onClick={() => setIsShiftTypeOpen(!isShiftTypeOpen)}
//             className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center focus:outline-none focus:ring focus:ring-blue-600"
//           >
//             {selectedShift.label}
//             {isShiftTypeOpen ? <GoChevronUp /> : <GoChevronDown />}
//           </button>
//           {isShiftTypeOpen && (
//             <ul className="absolute z-10 mt-1 w-full bg-white  border-[1px] border-blue-600 rounded-md shadow-md max-h-60 overflow-auto">
//               {shiftOptions.map((option) => (
//                 <li
//                   key={option.value}
//                   onClick={() => {
//                     setSelectedShift(option);
//                     setIsShiftTypeOpen(false);
//                   }}
//                   className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-700 hover:text-white hover:rounded-sm hover:mx-1 cursor-pointer"
//                 >
//                   {option.label}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* Custom Pump No */}
//         <div className="relative">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Pump No
//           </label>
//           <button
//             type="button"
//             onClick={() => setIsPumpOpen(!isPumpOpen)}
//             className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center focus:outline-none focus:ring focus:ring-blue-200"
//           >
//             {selectedPump.label}
//             {isPumpOpen ? <GoChevronUp  /> : <GoChevronDown />}
//           </button>
//           {isPumpOpen && (
//             <ul className="absolute z-10 mt-1 w-full bg-white border-[1px] border-blue-600 rounded-md shadow-md max-h-60 overflow-hidden">
//               {pumpOptions.map((option) => (
//                 <li
//                   key={option.value}
//                   onClick={() => {
//                     setSelectedPump(option);
//                     setIsPumpOpen(false);
//                   }}
//                   className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-700 hover:text-white hover:mx-1 hover:rounded-sm hover:shadow-2xl cursor-pointer"
//                 >
//                   {option.label}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* Opening Meter Reading */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Opening meter reading
//           </label>
//           <input
//             type="number"
//             inputMode="numeric"
//             value={openingReading}
//             onChange={(e) => setOpeningReading(e.target.value)}
//             placeholder="Input meter reading"
//             className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
//           />
//         </div>

//         {/* Start Button */}
//         <button
//           type="button"
//           className="w-full bg-blue-600 hover:bg-blue-300 transition-all duration-200 text-white text-sm py-2 rounded-lg font-medium"
//           onClick={onStart}
//         >
//           Start Shift
//         </button>
//       </form>
//     </div>
//   );
// };

// export default StartShiftCard;



import React, { useState, useEffect } from "react";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import useShiftStore from "@/store/useShiftStore";

const shiftOptions = [
  { value: "", label: "Select your shift" },
  { value: "One-Day-Morning", label: "One-Day-Morning (6AM–3PM)" },
  { value: "One-Day-Evening", label: "One-Day-Evening (3PM–10PM)" },
  { value: "Day-Off", label: "Day-Off" },
  { value: "Full-Time", label: "Full-Time (6AM–10PM)" },
];

const StartShiftCard = ({ onClose, onStart }) => {
  const { availablePumps, startShift, loading, fetchActiveShiftsAndPumps } = useShiftStore();
  
  const [isShiftTypeOpen, setIsShiftTypeOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(shiftOptions[0]);
  const [isPumpOpen, setIsPumpOpen] = useState(false);
  const [selectedPump, setSelectedPump] = useState({ value: "", label: "Select pump" });
  const [openingReading, setOpeningReading] = useState("");

  // Fetch available pumps on mount
  useEffect(() => {
    fetchActiveShiftsAndPumps();
  }, [fetchActiveShiftsAndPumps]);

  // Convert available pumps to dropdown format
  const pumpOptions = [
    { value: "", label: "Select pump" },
    ...availablePumps.map(pump => ({
      value: pump._id,
      label: `${pump.title} - ${pump.fuelType} (₦${pump.pricePerLtr}/L)`,
      pump: pump
    }))
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedShift.value) {
      alert("Please select a shift type");
      return;
    }
    if (!selectedPump.value) {
      alert("Please select a pump");
      return;
    }
    if (!openingReading || parseFloat(openingReading) < 0) {
      alert("Please enter a valid opening meter reading");
      return;
    }

    const result = await startShift({
      pumpId: selectedPump.value,
      shiftType: selectedShift.value,
      openingMeterReading: parseFloat(openingReading),
    });

    if (result.success) {
      alert("Shift started successfully!");
      onStart();
      onClose();
    } else {
      alert(result.error || "Failed to start shift");
    }
  };

  return (
    <div className="fixed top-28 right-4 w-[94vw] sm:w-[32rem] max-w-[90vw] md:max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Start Shift
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Enter meter reading to start shift
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Custom Shift Type */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift type
          </label>
          <button
            type="button"
            onClick={() => setIsShiftTypeOpen(!isShiftTypeOpen)}
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center focus:outline-none focus:ring focus:ring-blue-600"
          >
            {selectedShift.label}
            {isShiftTypeOpen ? <GoChevronUp /> : <GoChevronDown />}
          </button>
          {isShiftTypeOpen && (
            <ul className="absolute z-10 mt-1 w-full bg-white border-[1px] border-blue-600 rounded-md shadow-md max-h-60 overflow-auto">
              {shiftOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    setSelectedShift(option);
                    setIsShiftTypeOpen(false);
                  }}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-700 hover:text-white hover:rounded-sm hover:mx-1 cursor-pointer"
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Custom Pump No */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pump No
          </label>
          <button
            type="button"
            onClick={() => setIsPumpOpen(!isPumpOpen)}
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center focus:outline-none focus:ring focus:ring-blue-200"
          >
            {selectedPump.label}
            {isPumpOpen ? <GoChevronUp /> : <GoChevronDown />}
          </button>
          {isPumpOpen && (
            <ul className="absolute z-10 mt-1 w-full bg-white border-[1px] border-blue-600 rounded-md shadow-md max-h-60 overflow-hidden">
              {pumpOptions.length === 1 ? (
                <li className="px-3 py-2 text-sm text-gray-500 text-center">
                  No available pumps
                </li>
              ) : (
                pumpOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => {
                      setSelectedPump(option);
                      setIsPumpOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-700 hover:text-white hover:mx-1 hover:rounded-sm hover:shadow-2xl cursor-pointer"
                  >
                    {option.label}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Opening Meter Reading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opening meter reading
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={openingReading}
            onChange={(e) => setOpeningReading(e.target.value)}
            placeholder="Input meter reading"
            step="0.01"
            min="0"
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Start Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white text-sm py-2 rounded-lg font-medium transition-all duration-200 ${
            loading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-300"
          }`}
        >
          {loading ? "Starting..." : "Start Shift"}
        </button>
      </form>
    </div>
  );
};

export default StartShiftCard;
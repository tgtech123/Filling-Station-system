// import React, { useState, useEffect } from "react";
// import { ChevronDown, ChevronUp } from "lucide-react"; // make sure lucide-react is installed

// const EndShiftCard = ({ onClose, onEnd }) => {
//   const [openingReading, setOpeningReading] = useState('');
//   const [closingReading, setClosingReading] = useState('');
//   const [litresSold, setLitresSold] = useState('');

//   // Shift dropdown states
//   const [shiftOpen, setShiftOpen] = useState(false);
//   const [selectedShift, setSelectedShift] = useState('');

//   // Pump dropdown states
//   const [pumpOpen, setPumpOpen] = useState(false);
//   const [selectedPump, setSelectedPump] = useState('');

//   useEffect(() => {
//     const opening = parseFloat(openingReading);
//     const closing = parseFloat(closingReading);
//     if (!isNaN(opening) && !isNaN(closing) && closing >= opening) {
//       setLitresSold(closing - opening);
//     } else {
//       setLitresSold('');
//     }
//   }, [openingReading, closingReading]);

//   const shiftOptions = [
//     { value: '', label: 'Select shift type' },
//     { value: 'morning', label: 'One-Day-Morning (6AM–3PM)' },
//     { value: 'evening', label: 'One-Day-Evening (3PM–10PM)' },
//     { value: 'dayoff', label: 'Day-Off' },
//     { value: 'fulltime', label: 'Full-Time' },
//   ];

//   const pumpOptions = [
//     { value: '', label: 'Select pump' },
//     { value: '1', label: 'Pump 1' },
//     { value: '2', label: 'Pump 2' },
//     { value: '3', label: 'Pump 3' },
//   ];

//   return (
//     <div className="fixed top-28 right-4 w-[90vw] sm:w-[24rem] bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
//       {/* Header */}
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h2 className="text-lg sm:text-xl font-semibold text-gray-800">End Shift</h2>
//           <p className="text-xs sm:text-sm text-gray-500">Submit meter reading to end shift</p>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-gray-500 hover:text-gray-700 text-4xl leading-none"
//         >
//           ×
//         </button>
//       </div>

//       {/* Form */}
//       <form className="space-y-4">
//         {/* Shift Type */}
//         <div className="relative">
//           <label className="block text-sm font-semibold text-gray-800 mb-1">Shift type</label>
//           <div
//             className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center cursor-pointer"
//             onClick={() => setShiftOpen(!shiftOpen)}
//           >
//             <span>{shiftOptions.find(opt => opt.value === selectedShift)?.label || "Select shift type"}</span>
//             {shiftOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//           </div>
//           {shiftOpen && (
//             <ul className="absolute z-50 bg-white border w-full rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
//               {shiftOptions.map((opt) => (
//                 <li
//                   key={opt.value}
//                   className="px-3 py-2 text-sm hover:bg-blue-700 hover:text-white hover:rounded-sm hover:mx-1 cursor-pointer"
//                   onClick={() => {
//                     setSelectedShift(opt.value);
//                     setShiftOpen(false);
//                   }}
//                 >
//                   {opt.label}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* Pump No */}
//         <div className="relative">
//           <label className="block text-sm font-semibold text-gray-800 mb-1">Pump no</label>
//           <div
//             className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center cursor-pointer"
//             onClick={() => setPumpOpen(!pumpOpen)}
//           >
//             <span>{pumpOptions.find(opt => opt.value === selectedPump)?.label || "Select pump"}</span>
//             {pumpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//           </div>
//           {pumpOpen && (
//             <ul className="absolute z-50 bg-white border w-full rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
//               {pumpOptions.map((opt) => (
//                 <li
//                   key={opt.value}
//                   className="px-3 py-2 text-sm hover:bg-blue-700 hover:text-white hover:rounded-sm hover:mx-1 cursor-pointer"
//                   onClick={() => {
//                     setSelectedPump(opt.value);
//                     setPumpOpen(false);
//                   }}
//                 >
//                   {opt.label}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         {/* Opening Meter Reading */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Opening meter reading</label>
//           <input
//             type="number"
//             inputMode="numeric"
//             value={openingReading}
//             onChange={(e) => setOpeningReading(e.target.value)}
//             placeholder="Enter opening meter reading"
//             className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
//           />
//         </div>

//         {/* Litres Sold */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Litres sold</label>
//           <input
//             type="number"
//             inputMode="numeric"
//             value={litresSold}
//             readOnly
//             placeholder="Auto-calculated"
//             className="w-full bg-gray-100 border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
//           />
//         </div>

//         {/* Closing Meter Reading */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Closing meter reading</label>
//           <input
//             type="number"
//             inputMode="numeric"
//             value={closingReading}
//             onChange={(e) => setClosingReading(e.target.value)}
//             placeholder="Enter closing meter reading"
//             className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
//           />
//         </div>

//         {/* End Shift Button */}
//         <button
//           type="button"
//           className="w-full bg-[#0080FF] hover:bg-blue-200 font-semibold transition-all duration-200 text-white text-sm py-2 rounded-lg "
//           onClick={onEnd}
//         >
//           End Shift
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EndShiftCard;


import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import useShiftStore from "@/store/useShiftStore";

const EndShiftCard = ({ onClose, onEnd, currentShift }) => {
  const { endShift, loading } = useShiftStore();
  
  const [closingReading, setClosingReading] = useState('');
  const [litresSold, setLitresSold] = useState('');

  // Get opening reading from current shift
  const openingReading = currentShift?.openingMeterReading || 0;

  // Auto-calculate litres sold
  useEffect(() => {
    const closing = parseFloat(closingReading);
    if (!isNaN(closing) && closing >= openingReading) {
      setLitresSold((closing - openingReading).toFixed(2));
    } else {
      setLitresSold('');
    }
  }, [closingReading, openingReading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!closingReading || parseFloat(closingReading) < 0) {
      alert("Please enter a valid closing meter reading");
      return;
    }

    if (parseFloat(closingReading) < openingReading) {
      alert("Closing reading cannot be less than opening reading");
      return;
    }

    if (!currentShift?._id) {
      alert("No active shift found");
      return;
    }

    const result = await endShift(currentShift._id, parseFloat(closingReading));

    if (result.success) {
      alert(`Shift ended successfully!\nLitres Sold: ${result.data.litresSold}\nTotal Amount: ₦${result.data.totalAmount?.toLocaleString()}`);
      onEnd();
      onClose();
    } else {
      alert(result.error || "Failed to end shift");
    }
  };

  return (
    <div className="fixed top-28 right-4 w-[90vw] sm:w-[24rem] bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">End Shift</h2>
          <p className="text-xs sm:text-sm text-gray-500">Submit meter reading to end shift</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-4xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Shift Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pump:</span>
            <span className="font-semibold text-gray-800">{currentShift?.pumpTitle || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Product:</span>
            <span className="font-semibold text-gray-800">{currentShift?.product || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shift Type:</span>
            <span className="font-semibold text-gray-800">{currentShift?.shiftType || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price per Litre:</span>
            <span className="font-semibold text-gray-800">₦{currentShift?.pricePerLtr || 0}</span>
          </div>
        </div>

        {/* Opening Meter Reading (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opening meter reading</label>
          <input
            type="number"
            value={openingReading}
            readOnly
            className="w-full bg-gray-100 border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
          />
        </div>

        {/* Closing Meter Reading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Closing meter reading <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={closingReading}
            onChange={(e) => setClosingReading(e.target.value)}
            placeholder="Enter closing meter reading"
            step="0.01"
            min={openingReading}
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be ≥ {openingReading}
          </p>
        </div>

        {/* Litres Sold (Auto-calculated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Litres sold</label>
          <input
            type="text"
            value={litresSold}
            readOnly
            placeholder="Auto-calculated"
            className="w-full bg-gray-100 border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
          />
        </div>

        {/* Expected Amount (if litres sold is calculated) */}
        {litresSold && currentShift?.pricePerLtr && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Total Amount:</span>
              <span className="font-semibold text-green-700">
                ₦{(parseFloat(litresSold) * currentShift.pricePerLtr).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        )}

        {/* End Shift Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold text-white text-sm py-2 rounded-lg transition-all duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0080FF] hover:bg-blue-200"
          }`}
        >
          {loading ? "Ending..." : "End Shift"}
        </button>
      </form>
    </div>
  );
};

export default EndShiftCard;
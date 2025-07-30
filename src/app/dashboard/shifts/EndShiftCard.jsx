import React, { useState, useEffect } from "react";

const EndShiftCard = ({ onClose, onEnd }) => {
  const [openingReading, setOpeningReading] = useState('');
  const [closingReading, setClosingReading] = useState('');
  const [litresSold, setLitresSold] = useState('');

  useEffect(() => {
    const opening = parseFloat(openingReading);
    const closing = parseFloat(closingReading);
    if (!isNaN(opening) && !isNaN(closing) && closing >= opening) {
      setLitresSold(closing - opening);
    } else {
      setLitresSold('');
    }
  }, [openingReading, closingReading]);

  return (
    <div className="fixed top-20 right-4 w-[90vw] sm:w-[24rem] bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">End Shift</h2>
          <p className="text-xs sm:text-sm text-gray-500">Provide details to end your shift</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form className="space-y-4">
        {/* Shift Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shift type</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200">
            <option value="">Select shift type</option>
            <option value="morning">One-Day-Morning (6AM–3PM)</option>
            <option value="evening">One-Day-Evening (3PM–10PM)</option>
            <option value="dayoff">Day-Off</option>
            <option value="fulltime">Full-Time</option>
          </select>
        </div>

        {/* Pump No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pump no</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200">
            <option value="">Select pump</option>
            <option value="1">Pump 1</option>
            <option value="2">Pump 2</option>
            <option value="3">Pump 3</option>
          </select>
        </div>

        {/* Opening Meter Reading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opening meter reading</label>
          <input
            type="number"
            value={openingReading}
            onChange={(e) => setOpeningReading(e.target.value)}
            placeholder="Enter opening meter reading"
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Litres Sold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Litres sold</label>
          <input
            type="number"
            value={litresSold}
            readOnly
            placeholder="Auto-calculated"
            className="w-full bg-gray-100 border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
          />
        </div>

        {/* Closing Meter Reading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Closing meter reading</label>
          <input
            type="number"
            value={closingReading}
            onChange={(e) => setClosingReading(e.target.value)}
            placeholder="Enter closing meter reading"
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        {/* End Shift Button */}
        <button
          type="button"
          className="w-full bg-[#0080FF] hover:bg-blue-500 transition-all duration-200 text-white text-sm py-2 rounded-lg font-medium"
          onClick={onEnd}
        >
          End Shift
        </button>
      </form>
    </div>
  );
};

export default EndShiftCard;

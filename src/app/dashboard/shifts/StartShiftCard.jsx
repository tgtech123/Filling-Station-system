import React from "react";

const StartShiftCard = ({ onClose, onStart }) => {
  return (
    <div className="fixed top-28 right-4 w-[94vw] sm:w-[32rem] max-w-[90vw] md:max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Start Shift</h2>
          <p className="text-xs sm:text-sm text-gray-500">Enter meter reading to start shift</p>
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
            <option value="">Select your shift</option>
            <option value="morning">One-Day-Morning (6AM–3PM)</option>
            <option value="evening">One-Day-Evening (3PM–10PM)</option>
            <option value="dayoff">Day-Off</option>
            <option value="fulltime">Full-Time (6AM–10PM)</option>
          </select>
        </div>

        {/* Pump Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pump No</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200">
            <option value="">Select pump</option>
            <option value="1">Pump 1</option>
            <option value="2">Pump 2</option>
            <option value="3">Pump 3</option>
            <option value="3">Pump 4</option>
          </select>
        </div>

        {/* Opening Meter Reading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opening meter reading</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Input meter reading"
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Start Button */}
        <button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-300 transition-all duration-200 text-white text-sm py-2 rounded-lg font-medium"
          onClick={onStart}
        >
          Start Shift
        </button>
      </form>
    </div>
  );
};

export default StartShiftCard;

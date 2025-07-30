import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
const TableHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-0 justify-between bg-white py-6 px-4 rounded-lg relative">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Shifts</h1>
        <p className="text-gray-500 text-sm">Enter meter reading to start your shift</p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            Start shift
          </button>

          <button className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed">
            End shift
          </button>
        </div>

        {/* Dropdown Card */}
        {showDropdown && (
          <div className="absolute right-0 mt-3 w-[90vw] sm:w-[24rem] bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Start Shift</h2>
                <p className="text-sm text-gray-500">Enter meter reading to start shift</p>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ×
              </button>
            </div>

            <form className="space-y-4">
              {/* Shift Type */}
              <div>
                <label className="block text-sm text-gray-700 font-semibold mb-1">Shift type</label>
                <select className="w-full border rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200">
                  <option value="">Select your shift</option>
                  <option value="morning">One-Day-Morning(6AM-3PM)</option>
                  <option value="morning">One-Day-EVening(3PM-10PM)</option>
                  <option value="evening">Day-Off - Today/Tomorrow</option>
                  <option value="evening">Full-Time (6AM-10PM)</option>
                </select>
              </div>

              {/* Pump Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pump no</label>
                <select className="w-full border rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200">
                  <option value="">Select pump</option>
                  <option value="1">Pump 1</option>
                  <option value="2">Pump 2</option>
                  <option value="3">Pump 3</option>
                </select>
              </div>

              {/* Opening Meter Reading */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Opening meter reading</label>
                <input
                  type="number"
                  placeholder="Input meter reading"
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

                <Link href='/dashboard/shifts/endShift' >
                    <button
                        type="button"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
                        onClick={() => {
                        // handle submit here
                        setShowDropdown(false);
                        }}
                    >
                        Start Shift
                    </button>
                
                </Link>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableHeader;

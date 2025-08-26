'use client'
import React, { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { FiDownload } from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import Filter from "@/components/Filter"; 
import { expenseFilterConfig } from "./filterConfig"; // ✅ import external config

const DurationButton = () => {
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const handleToggleOn = () => {
    setIsToggleOn(!isToggleOn);
  };

  const handleApplyFilter = (filters) => {
    console.log("Applied Filters:", filters);
    setAppliedFilters(filters);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      {/* Duration Dropdown */}
      <div
        onClick={handleToggleOn}
        className="relative flex justify-between items-center gap-3 px-4 py-2 text-neutral-600 font-bold border-2 border-neutral-300 rounded-xl cursor-pointer"
      >
        Duration
        {isToggleOn ? (
          <HiChevronUp className="text-neutral-600" size={24} />
        ) : (
          <HiChevronDown className="text-neutral-600" size={24} />
        )}

        {isToggleOn && (
          <div className="flex flex-col w-56 sm:w-64 bg-white absolute top-12 left-0 shadow-lg rounded-xl border border-neutral-200 z-20">
            {/* From & To */}
            <div className="flex flex-col sm:flex-row justify-between p-2 gap-3">
              <button className="flex-1 flex justify-between items-center px-4 py-2 border-[1.5px] rounded-lg font-medium">
                From
                <HiChevronDown className="text-neutral-600" size={20} />
              </button>
              <button className="flex-1 flex justify-between items-center px-4 py-2 border-[1.5px] rounded-lg font-medium">
                To
                <HiChevronDown className="text-neutral-600" size={20} />
              </button>
            </div>

            <hr className="my-2 mx-2 border-t border-neutral-100" />

            {/* Quick Select */}
            <div className="flex flex-col gap-2 font-light px-2 mb-3">
              {["Today", "This week", "This month", "This quarter"].map(
                (label) => (
                  <span
                    key={label}
                    className="w-full text-left px-2 border border-neutral-200 hover:bg-blue-600 hover:text-white py-1 rounded-lg font-medium cursor-pointer"
                  >
                    {label}
                  </span>
                )
              )}
            </div>

            <hr className="my-2 mx-2 border-t border-neutral-100" />

            <button
              onClick={() => setIsToggleOn(false)}
              className="w-[90%] mx-auto py-2 bg-[#0080FF] hover:bg-blue-700 text-center text-white font-semibold mb-3 rounded-lg"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Custom Filter Button */}
      <div>
        <button
          onClick={() => setShowFilter(true)}
          className="flex gap-3 cursor-pointer font-semibold px-4 py-2 border-2 border-neutral-300 rounded-xl hover:bg-neutral-100"
        >
          Filter
          <IoFilter size={26} />
        </button>
      </div>

      {/* Export Button */}
      <button className="px-4 py-2 flex justify-center items-center gap-2 font-bold bg-[#0080FF] text-white rounded-lg hover:bg-blue-700">
        Export <FiDownload size={20} />
      </button>

      {/* Render Reusable Filter Modal */}
      {showFilter && (
        <Filter
          title="Customize Filter"
          filterConfig={expenseFilterConfig} 
          currentFilters={appliedFilters}
          showReset={false} // you can toggle this depending on the page
          onApplyFilter={handleApplyFilter}
          handleClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
};

export default DurationButton;

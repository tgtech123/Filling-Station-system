'use client'
import React, { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { FiDownload } from "react-icons/fi";
import exportToExcel from "@/hooks/ExportToExcel";
import { rowsData, columnsData } from "./expensesData";
import { IoFilter } from "react-icons/io5";
import Filter from "@/components/Filter";
import { expenseFilterConfig } from "./filterConfig";

const DurationButton = ({ setTableData }) => {
  const [isToggleOn,   setIsToggleOn]   = useState(false);
  const [showFilter,   setShowFilter]   = useState(false);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});

  const getSelectedOptions = (filterObj) => {
    if (!filterObj) return [];
    return Object.keys(filterObj).filter((k) => k !== "all" && filterObj[k] === true);
  };

  const filteredData = rowsData.filter((item) => {
    const q       = searchTerm.trim().toLowerCase();
    const expId   = String(item[1] || "").toLowerCase();
    const cat     = String(item[2] || "").toLowerCase();
    const status  = String(item[6] || "").toLowerCase();

    const matchSearch = !q || expId.includes(q) || cat.includes(q);

    const selStatus = getSelectedOptions(appliedFilters.Status);
    const selCat    = getSelectedOptions(appliedFilters.Category);

    const matchStatus = selStatus.length === 0 || selStatus.some((o) => status.includes(o.toLowerCase()));
    const matchCat    = selCat.length    === 0 || selCat.some((o) => cat.includes(o.toLowerCase()));

    return matchSearch && matchStatus && matchCat;
  });

  React.useEffect(() => {
    if (setTableData) setTableData(filteredData);
  }, [filteredData, setTableData]);

  return (
    <div className="flex items-center gap-2 shrink-0">

      {/* Duration — desktop only */}
      <div className="relative hidden lg:block">
        <button
          onClick={() => setIsToggleOn((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-600 border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Duration
          {isToggleOn ? <HiChevronUp size={18} /> : <HiChevronDown size={18} />}
        </button>

        {isToggleOn && (
          <div className="absolute top-11 left-0 w-64 bg-white shadow-xl rounded-xl border border-neutral-200 z-30 p-3 space-y-3">
            <div className="flex gap-2">
              <button className="flex-1 flex justify-between items-center px-3 py-2 border rounded-lg text-sm font-medium">
                From <HiChevronDown size={16} />
              </button>
              <button className="flex-1 flex justify-between items-center px-3 py-2 border rounded-lg text-sm font-medium">
                To <HiChevronDown size={16} />
              </button>
            </div>
            <hr />
            <div className="space-y-1">
              {["Today", "This week", "This month", "This quarter"].map((label) => (
                <button
                  key={label}
                  className="w-full text-left px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsToggleOn(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Filter */}
      <button
        onClick={() => setShowFilter(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
      >
        <IoFilter size={18} />
        <span className="hidden sm:inline">Filter</span>
      </button>

      {/* Export */}
      <button
        onClick={() => exportToExcel(filteredData, columnsData, "Expenses_Data")}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
      >
        <FiDownload size={18} />
        <span className="hidden sm:inline">Export</span>
      </button>

      {showFilter && (
        <Filter
          title="Customize Filter"
          filterConfig={expenseFilterConfig}
          currentFilters={appliedFilters}
          showReset={false}
          onApplyFilter={(f) => { setAppliedFilters(f); setShowFilter(false); }}
          handleClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
};

export default DurationButton;

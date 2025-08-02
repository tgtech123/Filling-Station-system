import { ListFilter } from "lucide-react";
import React, { useState } from "react";
import { FiSearch, FiDownload } from "react-icons/fi";
import CustomFilter from "./CustomFilter";
import exportToExcel from "@/hooks/ExportToExcel";

export default function CustomSearchBar({ 
  searchTerm  = '', 
  onSearch, 
  exportData, 
  exportColumns, 
  onApplyFilter, 
  currentFilters,
  hasActiveFilters = false 
}) {
  const [showFilter, setShowFilter] = useState(false);

  function handleOpen() {
    setShowFilter(true);
  }

  function handleClose() {
    setShowFilter(false);
  }


  const handleApplyFilter = (filterCriteria) => {
    if (typeof onApplyFilter === 'function') {
      onApplyFilter(filterCriteria);
    }
    handleClose();
  };

  const handleExport = () => {
    if (exportData?.length && exportColumns?.length) {
      exportToExcel(exportData, exportColumns, 'Sales_Report');
    } else {
      alert('No data available for export.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
      <div className="relative w-full sm:max-w-sm">
        <input
          type="text"
          placeholder="Search product"
          value={searchTerm ?? ''}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleOpen} 
          className={`mt-2 sm:mt-0 flex items-center gap-2 border text-sm px-4 py-2 cursor-pointer rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Filter
          <ListFilter size={16} />
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
          )}
        </button>
        
        <button 
          onClick={handleExport} 
          className="mt-2 sm:mt-0 flex items-center gap-2 text-sm bg-[#1a71f6] text-white px-4 py-[10px] cursor-pointer hover:bg-[#1a51f6] rounded-lg transition-colors"
        >
          Export <FiDownload />
        </button>
      </div>

      {showFilter && (
        <CustomFilter 
          handleClose={handleClose} 
          onApplyFilter={handleApplyFilter}
          currentFilters={currentFilters}
        />
      )}
    </div>
  );
}
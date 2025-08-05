import React from 'react';
import { FiSearch, FiDownload } from 'react-icons/fi';
import exportToExcel from '@/hooks/ExportToExcel';

const SearchBar = ({
  searchTerm,
  onSearch,
  exportData,
  exportColumns,
  exportVariant = 'default', // 'default', 'compact', 'outlined', etc.
}) => {
  const handleExport = () => {
    if (exportData?.length && exportColumns?.length) {
      exportToExcel(exportData, exportColumns, 'Shift_Report');
    } else {
      alert('No data available for export.');
    }
  };

  const renderExportButton = () => {
    switch (exportVariant) {
      case 'compact':
        return (
          <button
            onClick={handleExport}
            className="mt-2 sm:mt-0 flex bg-[#0080FF] text-white items-center cursor-pointer gap-2 border border-neutral text-md font-semibold px-5 py-2 rounded-lg hover:bg-blue-700"          >
             Export <FiDownload size={16} />
          </button>
        );
      case 'outlined':
        return (
          <button
            onClick={handleExport}
            className="mt-2 sm:mt-0 flex items-center gap-2 border border-blue-500 text-white bg-[#0080FF] px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Export <FiDownload  size={20} />
          </button>
        );
      case 'default':
      default:
        return (
          <button
            onClick={handleExport}
            className="mt-2 sm:mt-0 flex bg-blue-500 text-white items-center cursor-pointer gap-2 border border-gray-300 text-md font-semibold px-4 py-2 rounded-lg hover:bg-blue-300"
          >
            Export <FiDownload size={20} />
          </button>
        );
    }
  };

  return (
    <div className="flex  flex-col sm:flex-row items-center justify-between gap-2">
      <div className="relative w-full sm:max-w-sm">
        <input
          type="text"
          placeholder="Search product"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <FiSearch className="absolute right-3 mr-3 top-2.5 text-gray-600" />
      </div>

      <div>
        {/* 🔁 Dynamic Export Button */}
        {renderExportButton()}
      </div>
    </div>
  );
};

export default SearchBar;

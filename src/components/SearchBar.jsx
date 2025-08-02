import React from 'react';
import { FiSearch, FiDownload } from 'react-icons/fi';
import  exportToExcel  from '@/hooks/ExportToExcel'; 

const SearchBar = ({ searchTerm, onSearch, exportData, exportColumns }) => {
  const handleExport = () => {
    if (exportData?.length && exportColumns?.length) {
      exportToExcel(exportData, exportColumns, 'Shift_Report');
    } else {
      alert('No data available for export.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
      <div className="relative ml-2 w-full sm:max-w-sm">
        <input
          type="text"
          placeholder="Search product"
          value={searchTerm}
          onChange={e => onSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg py-2 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <FiSearch className="absolute right-3 mr-3 top-2.5 text-gray-600" />
      </div>
      <button
        onClick={handleExport}
        className="mt-2 sm:mt-0 flex items-center cursor-pointer gap-2 border border-gray-300 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
      >
        Export <FiDownload />
      </button>
    </div>
  );
};

export default SearchBar;

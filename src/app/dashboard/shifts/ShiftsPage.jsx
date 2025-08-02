"use client";

import { useState, useMemo } from 'react';
import TableHeader from './TableHeader';
import SearchBar from '@/components/SearchBar';
import Table from '@/components/Table';
import { columns, data as fullData } from './shiftData'; 
import { paginate } from './utils/paginate';
import exportToExcel from '@/hooks/ExportToExcel';
import { GoChevronRight, GoChevronLeft  } from "react-icons/go";


const ITEMS_PER_PAGE = 6;

export default function ShiftsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Filter the data based on the search term
  const filteredData = useMemo(() => {
    if (!Array.isArray(fullData)) return [];
    return fullData.filter(row =>
      row[1]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = paginate(filteredData, page, ITEMS_PER_PAGE);

  const handleNext = () => setPage(prev => Math.min(prev + 1, totalPages));
  const handlePrev = () => setPage(prev => Math.max(prev - 1, 1));

  const handleExport = () => {
    exportToExcel(filteredData, columns, 'Shift_Report');
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] sm:px-6 lg:px-1">
        <TableHeader />
      <div className="max-w-full bg-white p-4 rounded-xl overflow-x-auto">

        <SearchBar
          searchTerm={searchTerm}
          onSearch={(val) => {
            setSearchTerm(val);
            setPage(1); // Reset page when searching
          }}
          exportData={filteredData} // pass the full filtered data
          exportColumns={columns}
        />

        <div className="w-full overflow-x-auto mt-4">
          <Table columns={columns} data={paginatedData || []} />
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 gap-3">
          <p className="text-center sm:text-left text-xs sm:text-sm">
            {page} - {totalPages} of {filteredData.length} items
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
              disabled={page === 1}
            >
              <GoChevronLeft size={20} />

            </button>
            <button
              onClick={handleNext}
              className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
              disabled={page === totalPages}
            >
              <GoChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
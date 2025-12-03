// "use client";

// import { useState, useMemo } from 'react';
// import TableHeader from './TableHeader';
// import SearchBar from '@/components/SearchBar';
// import Table from '@/components/Table';
// import { columns, data as fullData } from './shiftData'; 
// import { paginate } from './utils/paginate';
// import exportToExcel from '@/hooks/ExportToExcel';
// import { GoChevronRight, GoChevronLeft  } from "react-icons/go";


// const ITEMS_PER_PAGE = 6;

// export default function ShiftsPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [page, setPage] = useState(1);

//   // Filter the data based on the search term
//   const filteredData = useMemo(() => {
//     if (!Array.isArray(fullData)) return [];
//     return fullData.filter(row =>
//       row[1]?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [searchTerm]);

//   const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
//   const paginatedData = paginate(filteredData, page, ITEMS_PER_PAGE);

//   const handleNext = () => setPage(prev => Math.min(prev + 1, totalPages));
//   const handlePrev = () => setPage(prev => Math.max(prev - 1, 1));

//   const handleExport = () => {
//     exportToExcel(filteredData, columns, 'Shift_Report');
//   };

//   return (
//     <div className="min-h-screen bg-[#F6F6F6] sm:px-6 lg:px-1">
//         <TableHeader />
//       <div className="max-w-full bg-white p-4 rounded-xl overflow-x-auto">

//         <SearchBar
//           searchTerm={searchTerm}
//           onSearch={(val) => {
//             setSearchTerm(val);
//             setPage(1); // Reset page when searching
//           }}
//           exportData={filteredData} // pass the full filtered data
//           exportColumns={columns}
//           exportVariant='default'
//         />

//         <div className="w-full overflow-x-auto mt-4">
//           <Table columns={columns} data={paginatedData || []} />
//         </div>

//         {/* Pagination */}
//         <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 gap-3">
//           <p className="text-center sm:text-left text-xs sm:text-sm">
//             {page} - {totalPages} of {filteredData.length} items
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={handlePrev}
//               className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
//               disabled={page === 1}
//             >
//               <GoChevronLeft size={20} />

//             </button>
//             <button
//               onClick={handleNext}
//               className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
//               disabled={page === totalPages}
//             >
//               <GoChevronRight size={20} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useMemo, useEffect } from 'react';
import TableHeader from './TableHeader';
import SearchBar from '@/components/SearchBar';
import Table from '@/components/Table';
import { GoChevronRight, GoChevronLeft } from "react-icons/go";
import useShiftStore from '@/store/useShiftStore';

const ITEMS_PER_PAGE = 6;

// Table columns
const columns = [
  "Date",
  "Pump",
  "Product", 
  "Shift Type",
  "Opening Reading",
  "Closing Reading",
  "Litres Sold",
  "Price/L",
  "Total Amount",
  "Status"
];

export default function ShiftsPage() {
  const { shifts, loading, fetchShifts } = useShiftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Fetch shifts on mount
  useEffect(() => {
    fetchShifts({ page: 1, limit: 100 }); // Fetch all shifts
  }, [fetchShifts]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  // Convert shifts to table data format
  const fullData = useMemo(() => {
    return shifts.map(shift => [
      formatDate(shift.shiftDate),
      shift.pumpTitle || "N/A",
      shift.product || "N/A",
      shift.shiftType || "N/A",
      shift.openingMeterReading?.toFixed(2) || "0.00",
      shift.closingMeterReading ? shift.closingMeterReading.toFixed(2) : "Ongoing",
      shift.litresSold ? shift.litresSold.toFixed(2) : "N/A",
      shift.pricePerLtr ? `₦${shift.pricePerLtr.toFixed(2)}` : "N/A",
      shift.totalAmount ? `₦${shift.totalAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}` : "N/A",
      shift.status || "N/A"
    ]);
  }, [shifts]);

  // Filter the data based on the search term
  const filteredData = useMemo(() => {
    if (!Array.isArray(fullData)) return [];
    if (!searchTerm.trim()) return fullData;
    
    const lowerSearch = searchTerm.toLowerCase();
    return fullData.filter(row =>
      row.some(cell => 
        String(cell).toLowerCase().includes(lowerSearch)
      )
    );
  }, [fullData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page]);

  const handleNext = () => setPage(prev => Math.min(prev + 1, totalPages));
  const handlePrev = () => setPage(prev => Math.max(prev - 1, 1));

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
          exportData={filteredData}
          exportColumns={columns}
          exportVariant='default'
        />

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading shifts...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? `No shifts found for "${searchTerm}"` : "No shifts found. Start a shift to begin."}
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto mt-4">
              <Table columns={columns} data={paginatedData || []} />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
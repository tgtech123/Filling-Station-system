// "use client";

// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import { Search } from "lucide-react";
// import Pagination from "@/components/Pagination";
// import { useState, useEffect } from "react";
// import CustomTable from "./CustomTable";
// import { lubricantColumns, lubricantData, lubricantDataRows } from "./lubricantData";


// export default function LubricantSales() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const itemsPerPage = 10;

//     return (
//         <DisplayCard>
//             <header className="flex flex-col lg:flex-row gap-2 lg:gap-0 justify-between items-start lg:items-end">
//                 <div>
//                     <h3 className="text-xl font-semibold">Recent Transactions</h3>
//                     <p>Latest sales activities</p>
//                 </div>

//                 <div className="relative">
//                     <input 
//                         type="text"
//                         className="p-2 min-w-[300px] lg:min-w-[400px] rounded-[8px] w-full border-2 border-gray-300" 
//                         placeholder="Search"
//                     />
                    
//                     <Search className="text-gray-400 absolute top-2 right-3 " />
//                 </div>
//             </header>

//             <CustomTable columns={lubricantColumns} data={lubricantDataRows} />

//              {/* Pagination */}
//                   <div className="mt-4">
//                     <Pagination
//                       currentPage={currentPage}
//                       // totalPages={totalPages}
//                       // totalItems={totalItems}
//                       // onPageChange={setCurrentPage}
//                       // itemsPerPage={itemsPerPage}
//                     />
//                 </div>
//         </DisplayCard>
//     )
// }


"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import { useState, useEffect, useMemo } from "react";
import CustomTable from "./CustomTable";
import { lubricantColumns, lubricantData, lubricantDataRows } from "./lubricantData";

export default function LubricantSales() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return lubricantDataRows;
    }

    return lubricantDataRows.filter((row) => {
      // Search across all columns - adjust this based on your data structure
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [searchTerm]);

  // Calculate pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <DisplayCard>
      <header className="flex flex-col lg:flex-row gap-2 lg:gap-0 justify-between items-start lg:items-end">
        <div>
          <h3 className="text-xl font-semibold">Recent Transactions</h3>
          <p>Latest sales activities</p>
        </div>

        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 min-w-[300px] lg:min-w-[400px] rounded-[8px] w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none" 
            placeholder="Search transactions..."
          />
          
          <Search className="text-gray-400 absolute top-2 right-3" />
        </div>
      </header>

      {/* Show search results info */}
      {searchTerm && (
        <div className="text-sm text-gray-600 mb-2">
          {totalItems > 0 ? (
            <>Showing {totalItems} result{totalItems !== 1 ? 's' : ''} for "{searchTerm}"</>
          ) : (
            <>No results found for "{searchTerm}"</>
          )}
        </div>
      )}

      <CustomTable columns={lubricantColumns} data={currentData} />

      {/* Only show pagination if there are results */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Show message when no data */}
      {totalItems === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found matching your search.</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="text-blue-500 hover:underline mt-2"
          >
            Clear search
          </button>
        </div>
      )}
    </DisplayCard>
  );
}
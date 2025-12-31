// "use client";
// import TableHere from "@/components/TableHere";
// import SearchBar from "@/hooks/SearchBar";
// import React from "react";
// import { useState, useEffect, useMemo } from "react";
// import { IoFilter } from "react-icons/io5";
// import activityLogsTable from "./activityLogsTable";
// import Pagination from "@/components/Pagination";

// const ActivityPage = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const itemsPerPage = 8;

//   // Filter data based on search term
//   const filteredData = useMemo(() => {
//     if (!searchTerm.trim()) {
//       return activityLogsTable.body;
//     }
//     return activityLogsTable.body.filter((row) => {
//       // Search across all columns - adjust this based on your data structure
//       return Object.values(row).some((value) => {
//         if (value === null || value === undefined) return false;
//         return value
//           .toString()
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//       });
//     });
//   }, [searchTerm]);

//   // Calculate pagination values
//   const totalItems = filteredData.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentData = filteredData.slice(startIndex, endIndex);

//   // Reset to page 1 when search term changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   // Handle search input change
//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   // Handle page change
//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   return (
//     <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
//       <div className="lg:flex flex-wrap gap-3  justify-between">
//         <div className="flex-wrap gap-3">
//           <h1 className="text-[1.375rem] font-semibold">Recent Transactions</h1>
//           <p className="text-[1rem] font-[400px]">Latest activities logs</p>
//         </div>

//         <div className="lg:flex lg:gap-3 gap-3  max-w-full">
//           <SearchBar />
//             <div className="flex  lg:mt-0 mt-[0.75rem]">
//                 <button className="border-2 border-neutral-300  mt-0 px-4 py-2 rounded-2xl font-semibold">
//                     Duration
//                 </button>
//                 <button className="border-2 border-neutral-300 ml-1 px-4 py-2 rounded-2xl font-semibold flex gap-2">
//                     Filter <IoFilter size={26} />{" "}
//                 </button>
//                 <button className="border-2 border-neutral-300 ml-1 bg-blue-600 text-white px-4 py-2 rounded-2xl font-semibold">
//                     Export
//                 </button>
//             </div>

//         </div>
      
//       </div>

//       <span className="mt-[1rem]">
//         <TableHere
//           key={currentPage + searchTerm}
//           columns={activityLogsTable.header}
//           data={currentData}
//         />
//       </span>

//       <span>
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           totalItems={totalItems}
//           onPageChange={setCurrentPage}
//           itemsPerPage={itemsPerPage}
//         />
//       </span>
//     </div>
//   );
// };

// export default ActivityPage;


"use client";

import TableHere from "@/components/TableHere";
import SearchBar from "@/components/SearchBar";
import React, { useState, useEffect, useMemo } from "react";
import { IoFilter } from "react-icons/io5";
import Pagination from "@/components/Pagination";
import useSupervisorStore from "@/store/useSupervisorStore";

const ActivityPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;

  const { activityLogs, loading, error, fetchActivityLogs } = useSupervisorStore();

  useEffect(() => {
    fetchActivityLogs({ page: 1, limit: 100 });
  }, [fetchActivityLogs]);

  // Table columns
  const tableColumns = [
    "Date & Time",
    "User",
    "Role",
    "Action",
    "Description",
    "IP Address",
    "Status"
  ];

  // Transform API data to table rows
  const tableRows = useMemo(() => {
    if (!activityLogs?.logs) return [];
    
    return activityLogs.logs.map((log) => [
      new Date(log.date).toLocaleString(),
      log.user,
      log.role,
      log.action,
      log.description,
      log.ipAddress,
      <span 
        key={log._id}
        className={`px-2 py-1 rounded text-xs font-semibold ${
          log.status === "Success" 
            ? "bg-green-100 text-green-700" 
            : log.status === "Failed"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {log.status}
      </span>
    ]);
  }, [activityLogs]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return tableRows;
    }
    return tableRows.filter((row) => {
      return row.some((cell) => {
        const cellValue = React.isValidElement(cell) ? cell.props.children : cell;
        if (cellValue === null || cellValue === undefined) return false;
        return cellValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [searchTerm, tableRows]);

 // Calculate pagination values
const totalItems = filteredData.length;
const totalPages = Math.ceil(totalItems / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage; // ← ADD THIS LINE
const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Loading state
  if (loading && !activityLogs) {
    return (
      <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => fetchActivityLogs({ page: 1, limit: 100 })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!activityLogs?.logs || activityLogs.logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
        <div className="text-center py-12">
          <p className="text-gray-500">No activity logs found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 mt-[1.5rem] max-x-full mx-8 mb-[1rem]">
      <div className="lg:flex flex-wrap gap-3 justify-between">
        <div className="flex-wrap gap-3">
          <h1 className="text-[1.375rem] font-semibold">Recent Activities</h1>
          <p className="text-[1rem] font-[400px]">Latest activity logs</p>
        </div>

        <div className="lg:flex lg:gap-3 gap-3 max-w-full">
          <SearchBar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
          />
          <div className="flex lg:mt-0 mt-[0.75rem] gap-2">
            <button className="border-2 border-neutral-300 px-4 py-2 rounded-2xl font-semibold">
              Duration
            </button>
            <button className="border-2 border-neutral-300 px-4 py-2 rounded-2xl font-semibold flex gap-2 items-center">
              Filter <IoFilter size={20} />
            </button>
            <button className="border-2 border-neutral-300 bg-blue-600 text-white px-4 py-2 rounded-2xl font-semibold">
              Export
            </button>
          </div>
        </div>
      </div>

      <span className="mt-[1rem]">
        <TableHere
          columns={tableColumns}
          data={currentData}
        />
      </span>

      <span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </span>
    </div>
  );
};

export default ActivityPage;
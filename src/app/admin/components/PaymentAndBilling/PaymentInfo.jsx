import React, { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import DataTable from "../DataTable";
import Pagination from "./Pagination";
import tableData, { tableHeaders } from "./paymentsTableData";

const ITEMS_PER_PAGE = 10;

const PaymentInfo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filterByDuration = (row) => {
    if (!durationFilter) return true;
    const rowDate = new Date(row.date);
    const now = new Date();

    if (durationFilter === "Weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return rowDate >= weekAgo && rowDate <= now;
    }
    if (durationFilter === "Monthly") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return rowDate >= monthAgo && rowDate <= now;
    }
    if (durationFilter === "Yearly") {
      const yearAgo = new Date();
      yearAgo.setFullYear(now.getFullYear() - 1);
      return rowDate >= yearAgo && rowDate <= now;
    }
    return true;
  };

  const filteredData = useMemo(() => {
    setCurrentPage(1);
    return tableData.filter((row) => {
      const matchesSearch =
        !searchQuery ||
        row.stationName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || row.status === statusFilter;
      const matchesDuration = filterByDuration(row);
      return matchesSearch && matchesStatus && matchesDuration;
    });
  }, [searchQuery, statusFilter, durationFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleExport = () => {
    const csvHeaders = tableHeaders.map((h) => h.label).join(",");
    const csvRows = filteredData.map((row) =>
      tableHeaders
        .map((h) => `"${String(row[h.key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="flex gap-4 items-center justify-end mt-[1rem]">
        {/* Search */}
        <div className="flex relative items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by station name or owner"
            className="lg:w-[21.875rem] w-fit h-[2.75rem] pl-8 rounded-lg border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none font-semibold"
          />
          <Search size={24} className="text-neutral-500 absolute ml-1" />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
          >
            <option value="">All status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Duration Filter */}
        <div>
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
          >
            <option value="">Duration</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex gap-2 cursor-pointer hover:bg-blue-700 bg-blue-600 text-white rounded-lg px-5 py-2.5 font-semibold"
        >
          <Download size={24} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="mt-[1rem]">
        {paginatedData.length > 0 ? (
          <DataTable headers={tableHeaders} rows={paginatedData} />
        ) : (
          <p className="text-center text-gray-400 py-10 font-medium">
            No results found.
          </p>
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default PaymentInfo;


// import React from "react";
// import { Search, Download } from "lucide-react";
// import DataTable from "../DataTable";
// import tableData, { tableHeaders } from "./paymentsTableData";

// const PaymentInfo = () => {
//   return (
//     <div className="bg-white rounded-xl p-5 ">
      
//       <div className="flex gap-4 items-center justify-end mt-[1rem]">
//         <div className="flex relative items-center">
//           <input
//             type="text"
//             placeholder="Search by station name or owner"
//             className="lg:w-[21.875rem] w-fit h-[2.75rem] pl-8 rounded-lg border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none font-semibold "
//           />
//           <Search size={24} className="text-neutral-500 absolute ml-1 "/>
//         </div>

//         <div>
//             <select className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold">
//                 <option value="">All status</option>
//                 <option value="">Active</option>
//                 <option value="">Pending</option>
//                 <option value="">Failed</option>
//             </select>
//         </div>

//         <div>
//             <select className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold">
//                 <option value="">Duration</option>
//                 <option value="">Weekly</option>
//                 <option value="">Monthly</option>
//                 <option value="">Yearly</option>
//             </select>
//         </div>

//         <button className="flex gap-2 cursor-pointer hover:bg-blue-700 bg-blue-600 text-white rounded-lg px-5 py-2.5 font-semibold">
//             <Download size={24} />
//             Export
//         </button>
//       </div>

//     {/* the table session */}
//       <div className="mt-[1rem]">
//             <DataTable headers={tableHeaders} rows={tableData} />
//       </div>

//     </div>
//   );
// };

// export default PaymentInfo;

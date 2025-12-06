// "use client";

// import DashboardLayout from "@/components/Dashboard/DashboardLayout";
// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import Table from "./Table";
// import Pagination from "@/components/Pagination";
// import { ChevronDown, Download, ListFilter, Search } from "lucide-react";
// import { fuelSalesColumns, fuelSalesData, attendantReportFilterConfig } from "./attendantReportData";
// import { useState, useMemo } from "react";
// import DurationModal from "./DurationModal";
// import exportToExcel from "@/hooks/ExportToExcel";
// import Filter from "./Filter";


// export default function AttendantReport() {
//   const [openDurationModal, setOpenDurationModal] = useState(false);
//   const [openFilter, setOpenFilter] = useState(false);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Search state
//   const [searchTerm, setSearchTerm] = useState("");

//   // Filter data based on search term
//   const filteredData = useMemo(() => {
//     if (!searchTerm) return fuelSalesData;

//     return fuelSalesData.filter(
//       (item) =>
//         item[1]?.toLowerCase().includes(searchTerm.toLowerCase()) || // Attendant
//         item[3]?.toLowerCase().includes(searchTerm.toLowerCase())    // Product
//     );
//   }, [searchTerm]);

//   // Pagination values
//   const totalItems = filteredData.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   // Current page data
//   const currentData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     return filteredData.slice(startIndex, endIndex);
//   }, [filteredData, currentPage, itemsPerPage]);

//   // Convert object data into arrays for the Table component


//   // Handle page change
//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//   };

//   // Handle search
//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1); // Reset to first page when searching
//   };

//   return (
//     <DashboardLayout>
//       <header className="mt-2 mb-6">
//         <h2 className="text-2xl font-semibold">Reconciled Attendant Report</h2>
//         <p>Summary of reconciled attendant sales</p>
//       </header>

//       <DisplayCard>
//         <section className="flex flex-col lg:flex-row gap-3 lg:gap-0 justify-between items-center">
//           {/* Search input */}
//           <div className="relative w-full lg:w-[40%]">
//             <input
//               type="text"
//               className="p-2 rounded-[8px] border-2 border-gray-300 w-full"
//               placeholder="Search by attendant/product"
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             <Search className="absolute text-gray-300 top-2 right-4" />
//           </div>

//           {/* Action buttons */}
//           <div className="flex gap-4">
//             <button
//               className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
//               onClick={() => setOpenDurationModal(true)}
//             >
//               Duration
//               <ChevronDown />
//             </button>
//             <button onClick={() => setOpenFilter(true)} className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]">
//               Filter
//               <ListFilter />
//             </button>
//             <button onClick={() => exportToExcel(fuelSalesData, fuelSalesColumns, "AttendantReport")} className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]">
//               Export
//               <Download />
//             </button>
//           </div>
//         </section>

//         {/* Data table */}
//         <Table columns={fuelSalesColumns} data={currentData} />

//         {/* Pagination */}
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           totalItems={totalItems}
//           onPageChange={handlePageChange}
//           itemsPerPage={itemsPerPage}
//           showItemCount={true}
//           className="mt-4"
//         />
//       </DisplayCard>

//       {openDurationModal && <DurationModal />}
//       {openFilter && <Filter handleClose={() => setOpenFilter(false)} filterConfig={attendantReportFilterConfig} />}
//     </DashboardLayout>
//   );
// }

"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import Pagination from "@/components/Pagination";
import { ChevronDown, Download, ListFilter, Search } from "lucide-react";
import { fuelSalesColumns, attendantReportFilterConfig } from "./attendantReportData";
import { useState, useMemo, useEffect } from "react";
import DurationModal from "./DurationModal";
import exportToExcel from "@/hooks/ExportToExcel";
import Filter from "./Filter";
import { useReconciliationReport } from "@/store/useCashierDashboardStore";

function AttendantReport() {
  // Zustand store
  const { 
    reconciliationReport, 
    isLoading, 
    error, 
    fetchReconciliationReport 
  } = useReconciliationReport();

  // Modal states
  const [openDurationModal, setOpenDurationModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    attendantId: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
  const fetchData = async () => {
    const result = await fetchReconciliationReport({
      page: currentPage,
      limit: itemsPerPage,
      ...filters,
    });
    
    console.log('🔍 API Response:', result);
    console.log('📊 Total records:', result?.data?.length);
    console.log('👥 Attendants:', result?.data?.map(d => d.attendant));
  };
  
  fetchData();
}, [currentPage, itemsPerPage, filters]);

  // Fetch data on mount and when filters/pagination change
  useEffect(() => {
    fetchReconciliationReport({
      page: currentPage,
      limit: itemsPerPage,
      ...filters,
    });
  }, [currentPage, itemsPerPage, filters, fetchReconciliationReport]);

  // Transform store data to table format
  const transformedData = useMemo(() => {
    if (!reconciliationReport?.data) return [];

    return reconciliationReport.data.map((item) => [
      item.date,
      item.attendant,
      item.pumpNo,
      item.product,
      item.litresSold?.toString() || "0",
      item.pricePerLtr?.toString() || "0",
      item.expectedAmount?.toLocaleString() || "0",
      item.cashReceived?.toLocaleString() || "0",
      item.discrepancy?.toLocaleString() || "0",
      item.status || "Unknown",
    ]);
  }, [reconciliationReport?.data]);

  // Filter data based on search term (client-side search)
  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;

    return transformedData.filter(
      (item) =>
        item[1]?.toLowerCase().includes(searchTerm.toLowerCase()) || // Attendant
        item[3]?.toLowerCase().includes(searchTerm.toLowerCase())    // Product
    );
  }, [transformedData, searchTerm]);

  // Pagination values
  const totalItems = reconciliationReport?.pagination?.total || filteredData.length;
  const totalPages = reconciliationReport?.pagination?.pages || Math.ceil(filteredData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter apply
  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
    setOpenFilter(false);
  };

  // Handle duration change
  const handleDurationChange = (startDate, endDate) => {
    setFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
    setCurrentPage(1);
    setOpenDurationModal(false);
  };

  // Export handler
  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : transformedData;
    exportToExcel(dataToExport, fuelSalesColumns, "AttendantReport");
  };

  return (
    <DashboardLayout>
      <header className="mt-2 mb-6">
        <h2 className="text-2xl font-semibold">Reconciled Attendant Report</h2>
        <p>Summary of reconciled attendant sales</p>
      </header>

      <DisplayCard>
        <section className="flex flex-col lg:flex-row gap-3 lg:gap-0 justify-between items-center">
          {/* Search input */}
          <div className="relative w-full lg:w-[40%]">
            <input
              type="text"
              className="p-2 rounded-[8px] border-2 border-gray-300 w-full"
              placeholder="Search by attendant/product"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute text-gray-300 top-2 right-4" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
              onClick={() => setOpenDurationModal(true)}
            >
              Duration
              <ChevronDown />
            </button>
            <button 
              onClick={() => setOpenFilter(true)} 
              className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
            >
              Filter
              <ListFilter />
            </button>
            <button 
              onClick={handleExport} 
              className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]"
              disabled={isLoading}
            >
              Export
              <Download />
            </button>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold">Error loading data:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0080ff]"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No reconciliation data found</p>
            <p className="text-sm mt-2">Try adjusting your filters or date range</p>
          </div>
        ) : (
          <>
            {/* Data table */}
            <Table columns={fuelSalesColumns} data={filteredData} />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              showItemCount={true}
              className="mt-4"
            />
          </>
        )}
      </DisplayCard>

      {openDurationModal && (
        <DurationModal 
          onClose={() => setOpenDurationModal(false)}
          onApply={handleDurationChange}
        />
      )}
      
      {openFilter && (
        <Filter 
          handleClose={() => setOpenFilter(false)} 
          filterConfig={attendantReportFilterConfig}
          onApply={handleFilterApply}
          currentFilters={filters}
        />
      )}
    </DashboardLayout>
  );
}

export default AttendantReport;
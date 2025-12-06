
import React from "react";
import {
  dailyAttendantSalesColumns,
  dailyAttendantSalesData,
} from "./dailyAttendantSalesData";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import SearchBar from "@/hooks/SearchBar";

const DailyAttendantSales = () => {
  return (
    <div className="bg-white w-full overflow-x-auto rounded-2xl p-5 mt-[1.5rem] ">

        <div className="flex justify-between mb-[1rem]">
            <h1 className="text-[1.125rem] font-medium">Daily Attendant Sales Summary</h1>
            <SearchBar />   
        </div>
    
        <TableWithoutBorder
          columns={dailyAttendantSalesColumns}
          data={dailyAttendantSalesData}
        />
      
    </div>
  );
};

export default DailyAttendantSales;


// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import TableWithoutBorder from "@/components/TableWithoutBorder";
// import SearchBar from "@/hooks/SearchBar";
// import { useDailySales } from "@/store/useCashierDashboardStore"; // Adjust path
// import { dailyAttendantSalesColumns } from "./dailyAttendantSalesData";

// const DailyAttendantSales = () => {
//   const { dailySales, isLoading, error, fetchDailySales, reconcileCash } = useDailySales();
  
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filters, setFilters] = useState({
//     status: "", // "", "Pending", "Matched", "Flagged"
//   });
//   const [cashInputs, setCashInputs] = useState({});
//   const [selectedRows, setSelectedRows] = useState({});

//   // Fetch daily sales on mount
//   useEffect(() => {
//     fetchDailySales({ limit: 50 });
//   }, [fetchDailySales]);

//   // Debug: Log the API response
//   useEffect(() => {
//     if (dailySales && dailySales.length > 0) {
//       console.log("Daily Sales Data:", dailySales);
//       console.log("First Sale Object:", dailySales[0]);
//     }
//   }, [dailySales]);

//   // Handle cash input change
//   const handleCashInputChange = (saleId, value) => {
//     setCashInputs(prev => ({
//       ...prev,
//       [saleId]: value
//     }));
//   };

//   // Handle checkbox change
//   const handleCheckboxChange = (saleId, checked) => {
//     setSelectedRows(prev => ({
//       ...prev,
//       [saleId]: checked
//     }));
//   };

//   // Handle bulk reconciliation
//   const handleBulkReconcile = async () => {
//     const selectedSales = Object.keys(selectedRows).filter(id => selectedRows[id]);
    
//     if (selectedSales.length === 0) {
//       alert("Please select at least one sale to reconcile");
//       return;
//     }

//     const confirmed = window.confirm(
//       `Reconcile ${selectedSales.length} selected sale(s)?`
//     );

//     if (!confirmed) return;

//     let successCount = 0;
//     let errorCount = 0;

//     for (const saleId of selectedSales) {
//       const cashReceived = parseFloat(cashInputs[saleId] || 0);
      
//       if (cashReceived <= 0) {
//         errorCount++;
//         continue;
//       }

//       const result = await reconcileCash(saleId, cashReceived, "Bulk reconciliation");
      
//       if (result.success) {
//         successCount++;
//       } else {
//         errorCount++;
//       }
//     }

//     alert(
//       `Reconciliation complete!\nSuccess: ${successCount}\nFailed: ${errorCount}`
//     );

//     // Clear selections and inputs
//     setSelectedRows({});
//     setCashInputs({});
//   };

//   // Transform API data to table format
//   const transformedData = useMemo(() => {
//     if (!dailySales || dailySales.length === 0) {
//       return [];
//     }

//     return dailySales.map((sale) => {
//       const isReconciled = sale.reconciled;
      
//       // Calculate discrepancy display
//       let discrepancyDisplay = "-";
//       if (sale.cashReceived !== null && sale.cashReceived !== undefined) {
//         const discrepancy = sale.discrepancies || 0;
//         if (discrepancy > 0) {
//           discrepancyDisplay = (
//             <span className="text-green-600 font-semibold">
//               +{discrepancy.toLocaleString()}
//             </span>
//           );
//         } else if (discrepancy < 0) {
//           discrepancyDisplay = (
//             <span className="text-red-600 font-semibold">
//               {discrepancy.toLocaleString()}
//             </span>
//           );
//         } else {
//           discrepancyDisplay = "0";
//         }
//       }

//       return [
//         sale.formattedDate || new Date(sale.date).toLocaleDateString('en-US', {
//           month: '2-digit',
//           day: '2-digit',
//           year: '2-digit'
//         }),
//         sale.attendant || "-",
//         sale.pumpNo || "-",
//         sale.product || "-",
//         sale.shiftOpen || "-",
//         sale.shiftClose || "-",
//         sale.litresSold ? `${sale.litresSold}` : "-",
//         sale.amount ? sale.amount.toLocaleString() : "-",
//         <input
//           key={`cash-${sale._id}`}
//           type="text"
//           value={isReconciled ? sale.cashReceived.toLocaleString() : cashInputs[sale._id] || ""}
//           onChange={(e) => handleCashInputChange(sale._id, e.target.value.replace(/,/g, ''))}
//           className="border rounded-md w-[8rem] px-2 py-1"
//           placeholder={sale.amount?.toLocaleString()}
//           disabled={isReconciled}
//         />,
//         discrepancyDisplay,
//         <input
//           key={`check-${sale._id}`}
//           type="checkbox"
//           checked={isReconciled || selectedRows[sale._id] || false}
//           onChange={(e) => handleCheckboxChange(sale._id, e.target.checked)}
//           disabled={isReconciled}
//         />,
//       ];
//     });
//   }, [dailySales, cashInputs, selectedRows]);

//   // Filter data based on search term
//   const filteredData = useMemo(() => {
//     if (!searchTerm) return transformedData;

//     return transformedData.filter((row) =>
//       row.some((cell) => {
//         // Skip React elements (inputs, spans)
//         if (React.isValidElement(cell)) return false;
//         return cell?.toString().toLowerCase().includes(searchTerm.toLowerCase());
//       })
//     );
//   }, [transformedData, searchTerm]);

//   // Handle filter changes
//   const handleFilterChange = (status) => {
//     setFilters({ status });
//     fetchDailySales({ status: status || undefined, limit: 50 });
//   };

//   return (
//     <div className="bg-white w-full overflow-x-auto rounded-2xl p-5 mt-[1.5rem]">
//       <div className="flex justify-between items-center mb-[1rem]">
//         <h1 className="text-[1.125rem] font-medium">
//           Daily Attendant Sales Summary
//         </h1>
//         <div className="flex gap-3 items-center">
//           {/* Status Filter */}
//           <select
//             value={filters.status}
//             onChange={(e) => handleFilterChange(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">All Status</option>
//             <option value="Pending">Pending</option>
//             <option value="Matched">Matched</option>
//             <option value="Flagged">Flagged</option>
//           </select>

//           <SearchBar />
//         </div>
//       </div>

//       {/* Bulk Actions Bar */}
//       {Object.values(selectedRows).some(Boolean) && (
//         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
//           <span className="text-sm text-blue-800">
//             {Object.values(selectedRows).filter(Boolean).length} sale(s) selected
//           </span>
//           <button
//             onClick={handleBulkReconcile}
//             className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Reconcile Selected
//           </button>
//         </div>
//       )}

//       {/* Loading State */}
//       {isLoading && (
//         <div className="flex items-center justify-center py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//           <span className="ml-3 text-gray-600">Loading sales data...</span>
//         </div>
//       )}

//       {/* Error State */}
//       {error && !isLoading && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//           <p className="text-red-800 text-sm">
//             <strong>Error:</strong> {error}
//           </p>
//           <button
//             onClick={() => fetchDailySales({ limit: 50 })}
//             className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       {/* Empty State */}
//       {!isLoading && !error && filteredData.length === 0 && (
//         <div className="flex flex-col items-center justify-center py-12 text-gray-500">
//           <svg
//             className="w-16 h-16 mb-4 text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//             />
//           </svg>
//           <p className="text-lg font-medium">No sales data found</p>
//           <p className="text-sm mt-1">
//             {searchTerm || filters.status
//               ? "Try adjusting your filters"
//               : "No attendant sales available"}
//           </p>
//         </div>
//       )}

//       {/* Table with Data */}
//       {!isLoading && !error && filteredData.length > 0 && (
//         <TableWithoutBorder 
//           columns={dailyAttendantSalesColumns} 
//           data={filteredData} 
//         />
//       )}

//       {/* Summary Footer */}
//       {!isLoading && !error && dailySales.length > 0 && (
//         <div className="mt-6 pt-4 border-t border-gray-200">
//           <div className="flex justify-between items-center">
//             <div className="flex gap-8 text-sm">
//               <div>
//                 <span className="text-gray-600">Total Sales:</span>
//                 <span className="ml-2 font-semibold">
//                   {dailySales.length}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-gray-600">Pending:</span>
//                 <span className="ml-2 font-semibold text-yellow-600">
//                   {dailySales.filter((s) => s.status === "Pending").length}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-gray-600">Matched:</span>
//                 <span className="ml-2 font-semibold text-green-600">
//                   {dailySales.filter((s) => s.status === "Matched").length}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-gray-600">Flagged:</span>
//                 <span className="ml-2 font-semibold text-red-600">
//                   {dailySales.filter((s) => s.status === "Flagged").length}
//                 </span>
//               </div>
//             </div>
            
//             <div className="text-sm text-gray-600">
//               Total Amount: <span className="font-semibold text-gray-900">
//                 ₦{dailySales.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DailyAttendantSales;
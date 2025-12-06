
// import React from "react";
// import {
//   dailyAttendantSalesColumns,
//   dailyAttendantSalesData,
// } from "./dailyAttendantSalesData";
// import TableWithoutBorder from "@/components/TableWithoutBorder";
// import SearchBar from "@/hooks/SearchBar";

// const DailyAttendantSales = () => {
//   return (
//     <div className="bg-white w-full overflow-x-auto rounded-2xl p-5 mt-[1.5rem] ">

//         <div className="flex justify-between mb-[1rem]">
//             <h1 className="text-[1.125rem] font-medium">Daily Attendant Sales Summary</h1>
//             <SearchBar />   
//         </div>
    
//         <TableWithoutBorder
//           columns={dailyAttendantSalesColumns}
//           data={dailyAttendantSalesData}
//         />
      
//     </div>
//   );
// };

// export default DailyAttendantSales;


// // "use client";

// // import React, { useEffect, useState, useMemo } from "react";
// // import TableWithoutBorder from "@/components/TableWithoutBorder";
// // import SearchBar from "@/hooks/SearchBar";
// // import { useDailySales } from "@/store/useCashierDashboardStore"; // Adjust path
// // import { dailyAttendantSalesColumns } from "./dailyAttendantSalesData";

// // const DailyAttendantSales = () => {
// //   const { dailySales, isLoading, error, fetchDailySales, reconcileCash } = useDailySales();
  
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [filters, setFilters] = useState({
// //     status: "", // "", "Pending", "Matched", "Flagged"
// //   });
// //   const [cashInputs, setCashInputs] = useState({});
// //   const [selectedRows, setSelectedRows] = useState({});

// //   // Fetch daily sales on mount
// //   useEffect(() => {
// //     fetchDailySales({ limit: 50 });
// //   }, [fetchDailySales]);

// //   // Debug: Log the API response
// //   useEffect(() => {
// //     if (dailySales && dailySales.length > 0) {
// //       console.log("Daily Sales Data:", dailySales);
// //       console.log("First Sale Object:", dailySales[0]);
// //     }
// //   }, [dailySales]);

// //   // Handle cash input change
// //   const handleCashInputChange = (saleId, value) => {
// //     setCashInputs(prev => ({
// //       ...prev,
// //       [saleId]: value
// //     }));
// //   };

// //   // Handle checkbox change
// //   const handleCheckboxChange = (saleId, checked) => {
// //     setSelectedRows(prev => ({
// //       ...prev,
// //       [saleId]: checked
// //     }));
// //   };

// //   // Handle bulk reconciliation
// //   const handleBulkReconcile = async () => {
// //     const selectedSales = Object.keys(selectedRows).filter(id => selectedRows[id]);
    
// //     if (selectedSales.length === 0) {
// //       alert("Please select at least one sale to reconcile");
// //       return;
// //     }

// //     const confirmed = window.confirm(
// //       `Reconcile ${selectedSales.length} selected sale(s)?`
// //     );

// //     if (!confirmed) return;

// //     let successCount = 0;
// //     let errorCount = 0;

// //     for (const saleId of selectedSales) {
// //       const cashReceived = parseFloat(cashInputs[saleId] || 0);
      
// //       if (cashReceived <= 0) {
// //         errorCount++;
// //         continue;
// //       }

// //       const result = await reconcileCash(saleId, cashReceived, "Bulk reconciliation");
      
// //       if (result.success) {
// //         successCount++;
// //       } else {
// //         errorCount++;
// //       }
// //     }

// //     alert(
// //       `Reconciliation complete!\nSuccess: ${successCount}\nFailed: ${errorCount}`
// //     );

// //     // Clear selections and inputs
// //     setSelectedRows({});
// //     setCashInputs({});
// //   };

// //   // Transform API data to table format
// //   const transformedData = useMemo(() => {
// //     if (!dailySales || dailySales.length === 0) {
// //       return [];
// //     }

// //     return dailySales.map((sale) => {
// //       const isReconciled = sale.reconciled;
      
// //       // Calculate discrepancy display
// //       let discrepancyDisplay = "-";
// //       if (sale.cashReceived !== null && sale.cashReceived !== undefined) {
// //         const discrepancy = sale.discrepancies || 0;
// //         if (discrepancy > 0) {
// //           discrepancyDisplay = (
// //             <span className="text-green-600 font-semibold">
// //               +{discrepancy.toLocaleString()}
// //             </span>
// //           );
// //         } else if (discrepancy < 0) {
// //           discrepancyDisplay = (
// //             <span className="text-red-600 font-semibold">
// //               {discrepancy.toLocaleString()}
// //             </span>
// //           );
// //         } else {
// //           discrepancyDisplay = "0";
// //         }
// //       }

// //       return [
// //         sale.formattedDate || new Date(sale.date).toLocaleDateString('en-US', {
// //           month: '2-digit',
// //           day: '2-digit',
// //           year: '2-digit'
// //         }),
// //         sale.attendant || "-",
// //         sale.pumpNo || "-",
// //         sale.product || "-",
// //         sale.shiftOpen || "-",
// //         sale.shiftClose || "-",
// //         sale.litresSold ? `${sale.litresSold}` : "-",
// //         sale.amount ? sale.amount.toLocaleString() : "-",
// //         <input
// //           key={`cash-${sale._id}`}
// //           type="text"
// //           value={isReconciled ? sale.cashReceived.toLocaleString() : cashInputs[sale._id] || ""}
// //           onChange={(e) => handleCashInputChange(sale._id, e.target.value.replace(/,/g, ''))}
// //           className="border rounded-md w-[8rem] px-2 py-1"
// //           placeholder={sale.amount?.toLocaleString()}
// //           disabled={isReconciled}
// //         />,
// //         discrepancyDisplay,
// //         <input
// //           key={`check-${sale._id}`}
// //           type="checkbox"
// //           checked={isReconciled || selectedRows[sale._id] || false}
// //           onChange={(e) => handleCheckboxChange(sale._id, e.target.checked)}
// //           disabled={isReconciled}
// //         />,
// //       ];
// //     });
// //   }, [dailySales, cashInputs, selectedRows]);

// //   // Filter data based on search term
// //   const filteredData = useMemo(() => {
// //     if (!searchTerm) return transformedData;

// //     return transformedData.filter((row) =>
// //       row.some((cell) => {
// //         // Skip React elements (inputs, spans)
// //         if (React.isValidElement(cell)) return false;
// //         return cell?.toString().toLowerCase().includes(searchTerm.toLowerCase());
// //       })
// //     );
// //   }, [transformedData, searchTerm]);

// //   // Handle filter changes
// //   const handleFilterChange = (status) => {
// //     setFilters({ status });
// //     fetchDailySales({ status: status || undefined, limit: 50 });
// //   };

// //   return (
// //     <div className="bg-white w-full overflow-x-auto rounded-2xl p-5 mt-[1.5rem]">
// //       <div className="flex justify-between items-center mb-[1rem]">
// //         <h1 className="text-[1.125rem] font-medium">
// //           Daily Attendant Sales Summary
// //         </h1>
// //         <div className="flex gap-3 items-center">
// //           {/* Status Filter */}
// //           <select
// //             value={filters.status}
// //             onChange={(e) => handleFilterChange(e.target.value)}
// //             className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           >
// //             <option value="">All Status</option>
// //             <option value="Pending">Pending</option>
// //             <option value="Matched">Matched</option>
// //             <option value="Flagged">Flagged</option>
// //           </select>

// //           <SearchBar />
// //         </div>
// //       </div>

// //       {/* Bulk Actions Bar */}
// //       {Object.values(selectedRows).some(Boolean) && (
// //         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
// //           <span className="text-sm text-blue-800">
// //             {Object.values(selectedRows).filter(Boolean).length} sale(s) selected
// //           </span>
// //           <button
// //             onClick={handleBulkReconcile}
// //             className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
// //           >
// //             Reconcile Selected
// //           </button>
// //         </div>
// //       )}

// //       {/* Loading State */}
// //       {isLoading && (
// //         <div className="flex items-center justify-center py-12">
// //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
// //           <span className="ml-3 text-gray-600">Loading sales data...</span>
// //         </div>
// //       )}

// //       {/* Error State */}
// //       {error && !isLoading && (
// //         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
// //           <p className="text-red-800 text-sm">
// //             <strong>Error:</strong> {error}
// //           </p>
// //           <button
// //             onClick={() => fetchDailySales({ limit: 50 })}
// //             className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
// //           >
// //             Try again
// //           </button>
// //         </div>
// //       )}

// //       {/* Empty State */}
// //       {!isLoading && !error && filteredData.length === 0 && (
// //         <div className="flex flex-col items-center justify-center py-12 text-gray-500">
// //           <svg
// //             className="w-16 h-16 mb-4 text-gray-400"
// //             fill="none"
// //             stroke="currentColor"
// //             viewBox="0 0 24 24"
// //           >
// //             <path
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //               strokeWidth={2}
// //               d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
// //             />
// //           </svg>
// //           <p className="text-lg font-medium">No sales data found</p>
// //           <p className="text-sm mt-1">
// //             {searchTerm || filters.status
// //               ? "Try adjusting your filters"
// //               : "No attendant sales available"}
// //           </p>
// //         </div>
// //       )}

// //       {/* Table with Data */}
// //       {!isLoading && !error && filteredData.length > 0 && (
// //         <TableWithoutBorder 
// //           columns={dailyAttendantSalesColumns} 
// //           data={filteredData} 
// //         />
// //       )}

// //       {/* Summary Footer */}
// //       {!isLoading && !error && dailySales.length > 0 && (
// //         <div className="mt-6 pt-4 border-t border-gray-200">
// //           <div className="flex justify-between items-center">
// //             <div className="flex gap-8 text-sm">
// //               <div>
// //                 <span className="text-gray-600">Total Sales:</span>
// //                 <span className="ml-2 font-semibold">
// //                   {dailySales.length}
// //                 </span>
// //               </div>
// //               <div>
// //                 <span className="text-gray-600">Pending:</span>
// //                 <span className="ml-2 font-semibold text-yellow-600">
// //                   {dailySales.filter((s) => s.status === "Pending").length}
// //                 </span>
// //               </div>
// //               <div>
// //                 <span className="text-gray-600">Matched:</span>
// //                 <span className="ml-2 font-semibold text-green-600">
// //                   {dailySales.filter((s) => s.status === "Matched").length}
// //                 </span>
// //               </div>
// //               <div>
// //                 <span className="text-gray-600">Flagged:</span>
// //                 <span className="ml-2 font-semibold text-red-600">
// //                   {dailySales.filter((s) => s.status === "Flagged").length}
// //                 </span>
// //               </div>
// //             </div>
            
// //             <div className="text-sm text-gray-600">
// //               Total Amount: <span className="font-semibold text-gray-900">
// //                 ₦{dailySales.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
// //               </span>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default DailyAttendantSales;

"use client";

import React, { useEffect, useState, useMemo } from "react";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import { useDailySales } from "@/store/useCashierDashboardStore";
import { Search } from "lucide-react";

const DailyAttendantSales = () => {
  const { dailySales, isLoading, error, fetchDailySales, reconcileCash } = useDailySales();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "", // "", "Pending", "Matched", "Flagged"
  });
  const [cashInputs, setCashInputs] = useState({});
  const [reconcilingIds, setReconcilingIds] = useState(new Set());

  // Table columns - defined in component
  const dailyAttendantSalesColumns = [
    "Date", 
    "Attendant", 
    "Pump No", 
    "Product", 
    "Shift Open", 
    "Shift Close", 
    "Litres Sold", 
    "Amount", 
    "Cash Received", 
    "Discrepancy", 
    "Status", 
    "Action"
  ];

  // Fetch daily sales on mount
  useEffect(() => {
    console.log("🔄 Fetching daily sales...");
    fetchDailySales({ limit: 100 });
  }, []);

  // Debug: Log the API response
  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 DAILY SALES COMPONENT - DATA CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Total sales:", dailySales?.length);
    console.log("Is Loading:", isLoading);
    console.log("Error:", error);
    
    if (dailySales && dailySales.length > 0) {
      console.log("\n📋 FIRST SALE - COMPLETE OBJECT:");
      console.log(JSON.stringify(dailySales[0], null, 2));
      
      console.log("\n🔍 CHECKING ALL POSSIBLE FIELDS:");
      const firstSale = dailySales[0];
      console.log("ALL KEYS:", Object.keys(firstSale));
      
      console.log("\n👤 ATTENDANT FIELDS:");
      console.log("  - sale.attendant:", firstSale.attendant);
      console.log("  - sale.attendantName:", firstSale.attendantName);
      console.log("  - sale.attendantId:", firstSale.attendantId);
      console.log("  - sale.attendant?.fullName:", firstSale.attendant?.fullName);
      console.log("  - sale.attendant?.firstName:", firstSale.attendant?.firstName);
      console.log("  - sale.attendant?.lastName:", firstSale.attendant?.lastName);
      console.log("  - sale.attendant?.name:", firstSale.attendant?.name);
      
      console.log("\n📦 PRODUCT FIELDS:");
      console.log("  - sale.product:", firstSale.product);
      console.log("  - sale.productName:", firstSale.productName);
      console.log("  - sale.product?.name:", firstSale.product?.name);
      console.log("  - sale.fuelType:", firstSale.fuelType);
      
      console.log("\n🏢 PUMP FIELDS:");
      console.log("  - sale.pumpNo:", firstSale.pumpNo);
      console.log("  - sale.pumpTitle:", firstSale.pumpTitle);
      console.log("  - sale.pump:", firstSale.pump);
      console.log("  - sale.pump?.title:", firstSale.pump?.title);
      
      console.log("\n👥 ALL UNIQUE ATTENDANTS:");
      const attendants = [...new Set(dailySales.map(s => s.attendant || s.attendantName))];
      attendants.forEach((att, i) => console.log(`  ${i + 1}. ${att}`));
    } else {
      console.log("⚠️ No sales data available");
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }, [dailySales, isLoading, error]);

  // Handle cash input change
  const handleCashInputChange = (saleId, value) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setCashInputs(prev => ({
      ...prev,
      [saleId]: numericValue
    }));
  };

  // Handle checkbox change - triggers reconciliation
  const handleCheckboxChange = async (sale, checked) => {
    if (!checked) return; // Only reconcile when checking
    
    const saleId = sale._id;
    const cashReceived = parseFloat(cashInputs[saleId]);

    // Validation
    if (!cashReceived || cashReceived <= 0) {
      alert("Please enter a valid cash amount before reconciling");
      return;
    }

    const attendantName = sale.attendant || sale.attendantName || sale.attendantId || "-";
    const confirmed = window.confirm(
      `Reconcile this sale?\n\nAttendant: ${attendantName}\nExpected: ₦${parseFloat(sale.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\nCash Received: ₦${parseFloat(cashReceived).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
    );

    if (!confirmed) return;

    // Add to reconciling set
    setReconcilingIds(prev => new Set(prev).add(saleId));

    try {
      const result = await reconcileCash(saleId, cashReceived, "Reconciled from daily sales");
      
      if (result.success) {
        // Clear the cash input for this sale
        setCashInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[saleId];
          return newInputs;
        });
        
        // Show success message
        alert("✅ Sale reconciled successfully!");
        
        // Refresh the data
        await fetchDailySales({ limit: 100 });
      } else {
        alert(`❌ Failed to reconcile: ${result.error}`);
      }
    } catch (err) {
      console.error("Reconciliation error:", err);
      alert("❌ An error occurred during reconciliation");
    } finally {
      // Remove from reconciling set
      setReconcilingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(saleId);
        return newSet;
      });
    }
  };

  // Transform API data to table format
  const transformedData = useMemo(() => {
    if (!dailySales || dailySales.length === 0) {
      return [];
    }

    return dailySales.map((sale) => {
      const isReconciled = sale.reconciled || sale.status === "Matched" || sale.status === "Flagged";
      const isReconciling = reconcilingIds.has(sale._id);
      
      // Get attendant name - try multiple possible fields
      let attendantName = "-";
      if (typeof sale.attendant === 'string') {
        attendantName = sale.attendant;
      } else if (sale.attendant?.fullName) {
        attendantName = sale.attendant.fullName;
      } else if (sale.attendant?.firstName && sale.attendant?.lastName) {
        attendantName = `${sale.attendant.firstName} ${sale.attendant.lastName}`;
      } else if (sale.attendant?.name) {
        attendantName = sale.attendant.name;
      } else if (sale.attendantName) {
        attendantName = sale.attendantName;
      } else if (sale.attendantId) {
        attendantName = sale.attendantId;
      }
      
      // Get product name - try multiple possible fields
      let productName = "-";
      if (typeof sale.product === 'string') {
        productName = sale.product;
      } else if (sale.product?.name) {
        productName = sale.product.name;
      } else if (sale.productName) {
        productName = sale.productName;
      } else if (sale.fuelType) {
        productName = sale.fuelType;
      }
      
      console.log(`Mapping sale ${sale._id}: attendant=${attendantName}, product=${productName}`);
      
      // Calculate discrepancy display
      let discrepancyDisplay = "-";
      if (sale.cashReceived !== null && sale.cashReceived !== undefined) {
        const discrepancy = sale.discrepancy || sale.discrepancies || 0;
        const formattedDiscrepancy = Math.abs(discrepancy).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        if (discrepancy > 0) {
          discrepancyDisplay = (
            <span className="text-green-600 font-semibold">
              +₦{formattedDiscrepancy}
            </span>
          );
        } else if (discrepancy < 0) {
          discrepancyDisplay = (
            <span className="text-red-600 font-semibold">
              -₦{formattedDiscrepancy}
            </span>
          );
        } else {
          discrepancyDisplay = <span className="text-gray-600">₦0.00</span>;
        }
      }

      // Status badge
      const statusBadge = isReconciled ? (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          sale.status === "Matched" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {sale.status}
        </span>
      ) : (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Pending
        </span>
      );

      return [
        sale.formattedDate || new Date(sale.date || sale.createdAt).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }),
        attendantName,
        sale.pumpNo || sale.pumpTitle || "-",
        sale.product || "-",
        sale.shiftOpen || "-",
        sale.shiftClose || "-",
        sale.litresSold ? `${parseFloat(sale.litresSold).toFixed(2)}L` : "-",
        sale.amount ? `₦${parseFloat(sale.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : "-",
        <input
          key={`cash-${sale._id}`}
          type="text"
          value={isReconciled 
            ? `₦${parseFloat(sale.cashReceived).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` 
            : cashInputs[sale._id] || ""
          }
          onChange={(e) => handleCashInputChange(sale._id, e.target.value)}
          className={`border rounded-md w-full max-w-[8rem] px-2 py-1 text-sm ${
            isReconciled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          placeholder={`₦${parseFloat(sale.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
          disabled={isReconciled || isReconciling}
        />,
        discrepancyDisplay,
        statusBadge,
        <div key={`check-${sale._id}`} className="flex items-center justify-center">
          {isReconciling ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <input
              type="checkbox"
              checked={isReconciled}
              onChange={(e) => handleCheckboxChange(sale, e.target.checked)}
              disabled={isReconciled}
              className={`w-4 h-4 ${isReconciled ? "cursor-not-allowed" : "cursor-pointer"}`}
            />
          )}
        </div>,
      ];
    });
  }, [dailySales, cashInputs, reconcilingIds]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;

    return transformedData.filter((row) =>
      row.some((cell) => {
        // Skip React elements (inputs, spans)
        if (React.isValidElement(cell)) return false;
        return cell?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [transformedData, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (status) => {
    setFilters({ status });
    fetchDailySales({ status: status || undefined, limit: 100 });
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!dailySales || dailySales.length === 0) {
      return { total: 0, pending: 0, matched: 0, flagged: 0, totalAmount: 0 };
    }

    return {
      total: dailySales.length,
      pending: dailySales.filter((s) => !s.reconciled && s.status !== "Matched" && s.status !== "Flagged").length,
      matched: dailySales.filter((s) => s.status === "Matched").length,
      flagged: dailySales.filter((s) => s.status === "Flagged").length,
      totalAmount: dailySales.reduce((sum, s) => sum + (s.amount || 0), 0),
    };
  }, [dailySales]);

  return (
    <div className="bg-white w-full rounded-2xl p-5 mt-[1.5rem]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-[1rem]">
        <div>
          <h1 className="text-[1.125rem] font-medium">
            Daily Attendant Sales Summary
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter cash received and check the box to reconcile
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Matched">Matched</option>
            <option value="Flagged">Flagged</option>
          </select>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading sales data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={() => fetchDailySales({ limit: 100 })}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No sales data found</p>
          <p className="text-sm mt-1">
            {searchTerm || filters.status
              ? "Try adjusting your filters"
              : "No attendant sales available"}
          </p>
        </div>
      )}

      {/* Table with Data - Wrapped in overflow container */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-max">
            <TableWithoutBorder 
              columns={dailyAttendantSalesColumns} 
              data={filteredData} 
            />
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {!isLoading && !error && dailySales.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="grid grid-cols-2 lg:flex lg:gap-8 gap-4 text-sm w-full lg:w-auto">
              <div>
                <span className="text-gray-600">Total Sales:</span>
                <span className="ml-2 font-semibold">
                  {stats.total}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Pending:</span>
                <span className="ml-2 font-semibold text-yellow-600">
                  {stats.pending}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Matched:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {stats.matched}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Flagged:</span>
                <span className="ml-2 font-semibold text-red-600">
                  {stats.flagged}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Total Amount: <span className="font-semibold text-gray-900">
                ₦{stats.totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAttendantSales;
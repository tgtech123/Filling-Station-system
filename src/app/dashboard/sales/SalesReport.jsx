
"use client";

import { useEffect, useState, useMemo } from "react";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import CustomSearchBar from "@/components/Dashboard/CustomSearchBar";
import useShiftStore from "@/store/useShiftStore"; // Adjust path as needed
import { paginate } from "./utils/paginate";

const ITEMS_PER_PAGE = 9;

export default function SalesReport() {
  // Zustand store
  const { salesReport, loading, error, fetchSalesReport } = useShiftStore();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    shiftType: { all: true, morning: false, afternoon: false, night: false },
    pumpNo: { all: true, pump1: false, pump2: false, pump3: false },
  });

  // Fetch sales report on component mount
  useEffect(() => {
    fetchSalesReport({ limit: 100 }); // Fetch more records for reports
  }, [fetchSalesReport]);

  // Helper: Check if any filter is active
  const isFilterActive = (filterCategory) => {
    return (
      !filterCategory.all &&
      Object.entries(filterCategory).some(
        ([key, value]) => key !== "all" && value === true
      )
    );
  };

  // Transform API data to table format (array of arrays)
  const transformedData = useMemo(() => {
    if (!salesReport.data || salesReport.data.length === 0) {
      return [];
    }

    return salesReport.data.map((shift) => [
      shift.date,                                    // Date
      shift.shiftType,                               // Shift Type
      shift.pump,                                    // Pump No
      shift.product,                                 // Product
      `${shift.startTime} - ${shift.endTime}`,      // Time Range
      shift.openingReading,                          // Opening Reading
      shift.closingReading,                          // Closing Reading
      shift.litresSold,                              // Litres Sold
      `₦${shift.pricePerLtr.toLocaleString()}`,     // Price/Ltr
      `₦${shift.totalAmount.toLocaleString()}`,     // Total Amount
    ]);
  }, [salesReport.data]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    let filtered = transformedData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        row.some((cell) =>
          cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Shift type filter
    if (isFilterActive(activeFilters.shiftType)) {
      filtered = filtered.filter((row) => {
        const shiftType = row[1]?.toLowerCase() || "";
        return (
          (activeFilters.shiftType.morning && shiftType.includes("morning")) ||
          (activeFilters.shiftType.afternoon && shiftType.includes("afternoon")) ||
          (activeFilters.shiftType.night && shiftType.includes("night"))
        );
      });
    }

    // Pump filter
    if (isFilterActive(activeFilters.pumpNo)) {
      filtered = filtered.filter((row) => {
        const pump = row[2] || "";
        return (
          (activeFilters.pumpNo.pump1 && pump.includes("1")) ||
          (activeFilters.pumpNo.pump2 && pump.includes("2")) ||
          (activeFilters.pumpNo.pump3 && pump.includes("3"))
        );
      });
    }

    return filtered;
  }, [transformedData, searchTerm, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = paginate(filteredData, page, ITEMS_PER_PAGE);

  // Event handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleApplyFilter = (filterCriteria) => {
    setActiveFilters(filterCriteria);
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleDateRangeChange = (start, end) => {
    setDateRange({ startDate: start, endDate: end });
    fetchSalesReport({ 
      startDate: start, 
      endDate: end,
      limit: 100 
    });
    setPage(1);
  };

  // Check if filters are active
  const hasActiveFilters =
    isFilterActive(activeFilters.shiftType) ||
    isFilterActive(activeFilters.pumpNo);

  // Table columns
  const columns = [
    "Date",
    "Shift Type",
    "Pump No",
    "Product",
    "Time Range",
    "Opening Reading",
    "Closing Reading",
    "Litres Sold",
    "Price/Ltr",
    "Total Amount",
  ];

  return (
    <div className="bg-white p-4 rounded-[24px] relative">
      {/* Summary Cards */}
      {salesReport.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-md font-semibold text-neutral-600">Total Shifts</p>
            <p className="text-2xl font-bold text-blue-600">
              {salesReport.summary.totalShifts}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-md font-semibold text-neutral-600">Total Litres Sold</p>
            <p className="text-2xl font-bold text-green-600">
              {salesReport.summary.totalLitresSold.toLocaleString()} L
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <p className="text-md font-semibold text-neutral-600">Total Revenue</p>
            <p className="text-2xl font-bold text-orange-600">
              ₦{salesReport.summary.totalRevenue.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-md font-semibold text-neutral-600">Avg Revenue/Shift</p>
            <p className="text-2xl font-bold text-purple-600">
              ₦{salesReport.summary.averageRevenuePerShift.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div>
        <CustomSearchBar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          exportData={filteredData}
          exportColumns={columns}
          onApplyFilter={handleApplyFilter}
          currentFilters={activeFilters}
          hasActiveFilters={hasActiveFilters}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading sales report...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={() => fetchSalesReport({ limit: 100 })}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredData.length === 0 && (
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
          <p className="text-lg font-medium">No sales records found</p>
          <p className="text-sm mt-1">
            {searchTerm || hasActiveFilters
              ? "Try adjusting your filters or search term"
              : "Complete some shifts to see your sales report"}
          </p>
        </div>
      )}

      {/* Table with Data */}
      {!loading && !error && filteredData.length > 0 && (
        <>
          <div className="mt-4 w-full overflow-x-auto">
            <Table columns={columns} data={paginatedData} />
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredData.length}
            onPageChange={handlePageChange}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}
    </div>
  );
}
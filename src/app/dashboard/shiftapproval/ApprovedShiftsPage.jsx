"use client";
import React, { useState, useEffect, useMemo } from "react";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Filter from "@/components/Filter";
import { IoFilterOutline } from "react-icons/io5";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import useSupervisorStore from "@/store/useSupervisorStore";

export default function ApprovedShiftsPage() {
  const ITEMS_PER_PAGE = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [showDuration, setShowDuration] = useState(false);

  // Get data from Zustand store
  const { 
    approvedShifts, 
    loading, 
    error, 
    fetchApprovedShifts,
    pagination: apiPagination 
  } = useSupervisorStore();

  // Fetch approved shifts on mount
  useEffect(() => {
    fetchApprovedShifts({ page: 1, limit: 100 }); // Fetch more for client-side filtering
  }, [fetchApprovedShifts]);

  // Table columns
  const tableColumns = [
    "Date",
    "Attendant",
    "Shift type",
    "Pump no",
    "Litres sold",
    "No. of Transactions",
    "Total",
    "Cash received",
    "Discrepancy",
    "Approved by",
    "Status"
  ];

  // Transform API data to table rows with styling
  const tableRows = useMemo(() => {
    return approvedShifts.map((shift) => {
      const discrepancy = Math.abs(shift.discrepancy || 0);
      const hasDiscrepancy = discrepancy > 0;
      const isFlagged = shift.status === "Flagged";

      return [
        new Date(shift.date).toLocaleDateString(),
        shift.attendant,
        shift.shiftType,
        shift.pumpNo,
        `${shift.litresSold?.toLocaleString() || 0}L`,
        shift.noOfTransactions || 0,
        `₦${shift.total?.toLocaleString() || 0}`,
        `₦${shift.cashReceived?.toLocaleString() || 0}`,
        // Discrepancy with conditional styling - return JSX
        <span className={hasDiscrepancy ? "text-red-600 font-semibold" : ""}>
          ₦{discrepancy.toLocaleString()}
        </span>,
        shift.approvedBy,
        // Status with conditional styling - return JSX
        <span className={
          isFlagged 
            ? "text-red-600 font-semibold bg-red-50 px-2 py-1 rounded" 
            : shift.status === "Matched"
            ? "text-green-600 font-semibold bg-green-50 px-2 py-1 rounded"
            : ""
        }>
          {shift.status}
        </span>
      ];
    });
  }, [approvedShifts]);

  // Helper function to extract text from cells (JSX or plain values)
  const getCellText = (cell) => {
    if (React.isValidElement(cell)) {
      return cell.props.children;
    }
    if (typeof cell === 'object' && cell?.value) {
      return cell.value;
    }
    return cell;
  };

  // ✅ Dynamically generate filter options
  const generateFilterConfig = () => {
    const filterKeys = ["Attendant", "Shift type", "Approved by", "Status"];

    return filterKeys.map((key) => {
      const columnIndex = tableColumns.indexOf(key);
      if (columnIndex === -1) return null;

      const uniqueOptions = [
        ...new Set(
          tableRows.map((row) => {
            const cell = row[columnIndex];
            return getCellText(cell);
          })
        ),
      ].filter(Boolean);

      return {
        key,
        label: key,
        options: uniqueOptions,
      };
    }).filter(Boolean);
  };

  const filterConfig = useMemo(() => generateFilterConfig(), [tableRows]);

  // 🔍 Search + filter combined
  const filteredData = useMemo(() => {
    let result = [...tableRows];

    if (searchTerm) {
      result = result.filter((row) =>
        row.some((cell) => {
          const cellValue = getCellText(cell);
          return String(cellValue).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    Object.entries(appliedFilters).forEach(([key, values]) => {
      const selectedOptions = Object.entries(values)
        .filter(([option, checked]) => checked && option !== "all")
        .map(([option]) => option.toLowerCase());

      if (selectedOptions.length) {
        const columnIndex = tableColumns.indexOf(key);
        if (columnIndex !== -1) {
          result = result.filter((row) => {
            const cell = row[columnIndex];
            const cellValue = getCellText(cell);
            return selectedOptions.includes(String(cellValue).toLowerCase());
          });
        }
      }
    });

    return result;
  }, [searchTerm, appliedFilters, tableRows]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const highlightedColumnIndex = tableColumns.indexOf("Discrepancy");

  // Loading state
  if (loading && approvedShifts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading approved shifts...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={() => fetchApprovedShifts({ page: 1, limit: 100 })}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (approvedShifts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No approved shifts yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: search + duration + filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-0">
          <SearchBar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            exportData={filteredData}
            exportColumns={tableColumns}
            exportVariant="outlined"
          />
        </div>

        <button
          onClick={() => setShowDuration(!showDuration)}
          className="flex items-center gap-2 border border-neutral-300 font-semibold px-3 py-2 rounded-xl text-sm shrink-0"
        >
          {showDuration ? "12/08/2025" : "Duration"}
          {showDuration ? <HiChevronUp size={18} /> : <HiChevronDown size={18} />}
        </button>

        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 border border-neutral-300 dark:border-gray-600 px-3 py-2 font-semibold bg-white dark:bg-gray-700 text-neutral-800 dark:text-gray-200 rounded-xl hover:bg-neutral-50 text-sm shrink-0"
        >
          Filter <IoFilterOutline size={16} />
        </button>
      </div>

      {/* Mobile card list (< sm) */}
      <div className="sm:hidden space-y-3">
        {paginatedData.map((row, i) => {
          const discrepancyVal = getCellText(row[8]);
          const hasDisc = discrepancyVal && discrepancyVal !== "₦0";
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{getCellText(row[1])}</p>
                  <p className="text-xs text-gray-400">{getCellText(row[0])} · {getCellText(row[2])}</p>
                </div>
                <div>{row[10]}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <span><span className="text-gray-400">Pump</span> {getCellText(row[3])}</span>
                <span><span className="text-gray-400">Litres</span> {getCellText(row[4])}</span>
                <span><span className="text-gray-400">Txns</span> {getCellText(row[5])}</span>
                <span><span className="text-gray-400">Total</span> <span className="font-semibold text-gray-800">{getCellText(row[6])}</span></span>
                <span><span className="text-gray-400">Cash</span> {getCellText(row[7])}</span>
                <span className={hasDisc ? "text-red-600 font-semibold" : ""}>
                  <span className="text-gray-400 font-normal">Disc.</span> {getCellText(row[8])}
                </span>
              </div>
              <p className="text-xs text-gray-400">Approved by: <span className="text-gray-600 font-medium">{getCellText(row[9])}</span></p>
            </div>
          );
        })}
      </div>

      {/* Desktop table (sm+) */}
      <div className="hidden sm:block">
        <Table
          columns={tableColumns}
          data={paginatedData}
          highlightedColumnIndex={highlightedColumnIndex}
        />
      </div>

      {/* 🔢 Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        onPageChange={handlePageChange}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {/* ✅ Filter Modal */}
      {isFilterOpen && (
        <Filter
          title="Filter Shifts"
          filterConfig={filterConfig}
          currentFilters={appliedFilters}
          onApplyFilter={setAppliedFilters}
          handleClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}
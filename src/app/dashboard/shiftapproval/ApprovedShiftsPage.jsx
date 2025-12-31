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
    <div className="flex relative flex-col gap-4">
      {/* 🔍 Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        exportData={filteredData}
        exportColumns={tableColumns}
        exportVariant="outlined"
      />

      <button 
        onClick={() => setShowDuration(!showDuration)} 
        className="border-[1.5px] flex font-semibold absolute right-58 gap-3 items-center border-neutral-300 w-fit px-4 py-2 rounded-xl"
      >
        {showDuration ? "12/08/2025" : "Duration"}
        {showDuration ? <HiChevronUp size={22} /> : <HiChevronDown size={22} />}
      </button>

      <div className="flex absolute top-0 right-30 flex-wrap">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex gap-3 items-center border-[1.5px] border-neutral-300 justify-center px-4 py-2 font-semibold bg-white text-neutral-800 rounded-xl hover:bg-neutral-100"
        >
          Filter <IoFilterOutline />
        </button>
      </div>

      {/* 📊 Filtered Table */}
      <Table
        columns={tableColumns}
        data={paginatedData}
        highlightedColumnIndex={highlightedColumnIndex}
      />

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
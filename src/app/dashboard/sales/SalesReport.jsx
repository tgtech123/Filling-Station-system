"use client";

import Table from "@/components/Table";
import { columns, data as fullData } from "./salesData";
import { paginate } from "./utils/paginate";
import { useState, useMemo } from "react";
import Pagination from "@/components/Pagination";
import CustomSearchBar from "@/components/Dashboard/CustomSearchBar";

const ITEMS_PER_PAGE = 9;

export default function SalesReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    shiftType: { all: true, morning: false, afternoon: false, night: false },
    pumpNo: { all: true, pump1: false, pump2: false, pump3: false },
  });

  const isFilterActive = (filterCategory) => {
    return (
      !filterCategory.all &&
      Object.entries(filterCategory).some(
        ([key, value]) => key !== "all" && value === true
      )
    );
  };

  const filteredData = useMemo(() => {
    console.log("SalesReport - Filtering data...");
    console.log("fullData sample:", fullData[0]);
    console.log("activeFilters:", activeFilters);

    let filtered = fullData;

    if (searchTerm) {
      filtered = filtered.filter((row) =>
        row.some((cell) =>
          cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    console.log("After search filter:", filtered.length);

    filtered = filtered.filter((row) => {
      const shiftTypeColumn = row[1]?.toLowerCase?.() || "";
      const pumpNoColumn = row[2] || "";

      if (isFilterActive(activeFilters.shiftType)) {
        const matchesShiftType =
          (activeFilters.shiftType.morning && shiftTypeColumn === "morning") ||
          (activeFilters.shiftType.afternoon &&
            shiftTypeColumn === "afternoon") ||
          (activeFilters.shiftType.night && shiftTypeColumn === "night");

        if (!matchesShiftType) {
          console.log("Filtered out by shift type:", shiftTypeColumn);
          return false;
        }
      }

      if (isFilterActive(activeFilters.pumpNo)) {
        const matchesPump =
          (activeFilters.pumpNo.pump1 && pumpNoColumn === "P001") ||
          (activeFilters.pumpNo.pump2 && pumpNoColumn === "P002") ||
          (activeFilters.pumpNo.pump3 && pumpNoColumn === "P003");

        if (!matchesPump) {
          console.log("Filtered out by pump no:", pumpNoColumn);
          return false;
        }
      }

      return true;
    });

    console.log("Final filtered data:", filtered.length);
    return filtered;
  }, [searchTerm, activeFilters, fullData]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleApplyFilter = (filterCriteria) => {
    console.log("SalesReport - handleApplyFilter called with:", filterCriteria);
    setActiveFilters(filterCriteria);
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = paginate(filteredData, page, ITEMS_PER_PAGE);

  const hasActiveFilters =
    isFilterActive(activeFilters.shiftType) ||
    isFilterActive(activeFilters.pumpNo);

  return (
    <div className="bg-white p-4 rounded-[24px] relative">
      <div>
        <CustomSearchBar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          exportData={filteredData}
          exportColumns={columns}
          onApplyFilter={handleApplyFilter}
          currentFilters={activeFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
      {console.log("Filtered data length:", filteredData.length)}
      <div className="w-full overflow-x-auto">
        <Table columns={columns} data={paginatedData} />
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredData.length}
        onPageChange={handlePageChange}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}

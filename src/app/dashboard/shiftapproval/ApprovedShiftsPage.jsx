// src/app/dashboard/shiftapproval/ApprovedShiftsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import { tableColumns, tableRows } from "./ApprovedShiftsData";

export default function ApprovedShiftsPage() {
  const ITEMS_PER_PAGE = 10;

  // 🔍 Search state
  const [searchTerm, setSearchTerm] = useState("");

  // 🧮 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);

  // ✅ Memoize filtered data to avoid re-render loops
  const filteredData = useMemo(() => {
    return tableRows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // 🔁 Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 🪄 Paginate filtered data
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, filteredData]);

  // ⏩ Handle pagination button click
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const highlightedColumnIndex = 8;

  return (
    <div className="flex flex-col gap-4">
      {/* 🔍 Reusable Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        exportData={filteredData}
        exportColumns={tableColumns}
      />

      {/* 📊 Reusable Table */}
      <Table
        columns={tableColumns}
        data={paginatedData}
        highlightedColumnIndex={highlightedColumnIndex}
      />

      {/* 🔢 Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        onPageChange={handlePageChange}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}

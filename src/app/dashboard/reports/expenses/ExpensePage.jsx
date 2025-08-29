"use client";
import React, { useState, useEffect } from "react";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import SearchBar from "@/hooks/SearchBar";
import DurationButton from "./DurationButton";
import { columnsData, rowsData } from "./expensesData";
import Pagination from "@/components/Pagination";

const ExpensePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  // ✅ filter only EXP_ID & Category (using index-based access)
  const filteredData = rowsData.filter((item) => {
    if (!searchTerm) return true;

    const lowerSearch = searchTerm.trim().toLowerCase();
    const EXP_ID = String(item[1] || "").toLowerCase(); // index 1 = EXP_ID
    const Category = String(item[2] || "").toLowerCase(); // index 2 = Category

    return EXP_ID.includes(lowerSearch) || Category.includes(lowerSearch);
  });

  // ✅ reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl p-4 mt-4">
      {/* 🔍 Search & Actions */}
      <div className="flex justify-between flex-col md:flex-row gap-3">
        <span className="w-full md:w-1/2">
          <SearchBar
            value={searchTerm}
            placeholder="Search by Expense ID/Category"
            onChange={setSearchTerm} // ✅ controlled input
          />
        </span>

        {/* Duration + Filter */}
        <span>
          <DurationButton  />
        </span>
      </div>

      {/* 📊 Table */}
      <div className="mt-5">
        {currentData.length > 0 ? (
          <TableWithoutBorder
            key={currentPage + searchTerm}
            columns={columnsData}
            data={currentData}
          />
        ) : (
          <div className="text-center text-gray-500 py-4">
            {searchTerm ? "No match found" : "No records found"}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default ExpensePage;

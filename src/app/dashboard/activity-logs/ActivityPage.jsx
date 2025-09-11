"use client";
import TableHere from "@/components/TableHere";
import SearchBar from "@/hooks/SearchBar";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { IoFilter } from "react-icons/io5";
import activityLogsTable from "./activityLogsTable";
import Pagination from "@/components/Pagination";

const ActivityPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return activityLogsTable.body;
    }
    return activityLogsTable.body.filter((row) => {
      // Search across all columns - adjust this based on your data structure
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return value
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    });
  }, [searchTerm]);

  // Calculate pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-2xl p-4 mt-[1.5rem] mx-10 mb-[1rem]">
      <div className="lg:flex gap-3 justify-between">
        <div className="flex-wrap gap-3">
          <h1 className="text-[1.375rem] font-semibold">Recent Transactions</h1>
          <p className="text-[1rem] font-[400px]">Latest activities logs</p>
        </div>

        <div className="lg:flex flex-wrap lg:gap-3 gap-3 lg:mt-[1rem]">
          <SearchBar />
          <button className="border-2 border-neutral-300  mt-0 px-4 py-2 rounded-2xl font-semibold">
            Duration
          </button>
          <button className="border-2 border-neutral-300 ml-1 px-4 py-2 rounded-2xl font-semibold flex gap-2">
            Filter <IoFilter size={26} />{" "}
          </button>
          <button className="border-2 border-neutral-300 ml-1 bg-blue-600 text-white px-4 py-2 rounded-2xl font-semibold">
            Export
          </button>
        </div>
      </div>

      <span className="mt-[1rem]">
        <TableHere
          key={currentPage + searchTerm}
          columns={activityLogsTable.header}
          data={currentData}
        />
      </span>

      <span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </span>
    </div>
  );
};

export default ActivityPage;

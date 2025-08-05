// src/app/dashboard/shiftapproval/ApprovedShiftsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Filter from "@/components/Filter";
import { IoFilterOutline } from "react-icons/io5";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { tableColumns, tableRows } from "./ApprovedShiftsData";

export default function ApprovedShiftsPage() {
  const ITEMS_PER_PAGE = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [showDuration, setShowDuration] = useState(false)

  // ✅ Dynamically generate filter options
  const generateFilterConfig = () => {
    const filterKeys = ["Attendant", "Shift type", "Approved by"];

    return filterKeys.map((key) => {
      const columnIndex = tableColumns.indexOf(key);
      if (columnIndex === -1) return null;

      const uniqueOptions = [
        ...new Set(tableRows.map((row) => row[columnIndex])),
      ].filter(Boolean); // remove null or undefined

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
        row.some((cell) =>
          String(cell).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(appliedFilters).forEach(([key, values]) => {
      const selectedOptions = Object.entries(values)
        .filter(([option, checked]) => checked && option !== "all")
        .map(([option]) => option.toLowerCase());

      if (selectedOptions.length) {
        const columnIndex = tableColumns.indexOf(key);
        if (columnIndex !== -1) {
          result = result.filter((row) =>
            selectedOptions.includes(String(row[columnIndex]).toLowerCase())
          );
        }
      }
    });

    return result;
  }, [searchTerm, appliedFilters]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, filteredData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const highlightedColumnIndex = tableColumns.indexOf("Discrepancy");

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

          <button onClick={()=> setShowDuration(!showDuration)} className={`border-[1.5px] flex font-semibold absolute right-58 gap-3 items-center border-neutral-300 w-fit px-4 py-2 rounded-xl `}>
            {showDuration ? "12/08/2025" : "Duration" }
            {showDuration ?  <HiChevronUp size={22} /> : <HiChevronDown size={22} />}

          </button>

            {/* <div className="border-[1.5px] border-neutral-400 w-fit p-2 rounded-lg mt-[-12px]">
                {showDuration && (
                    
                      <input type="date" />                

                )}
            </div> */}
          {/* 📎 Open Filter Button */}
          <div className="flex absolute top-0 right-30 flex-wrap">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex  gap-3 items-center border-[1.5px] border-neutral-300 justify-center px-4 py-2 font-semibold bg-white text-neutral-800 rounded-xl hover:bg-neutral-100"
            >
              Filter  <IoFilterOutline />
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

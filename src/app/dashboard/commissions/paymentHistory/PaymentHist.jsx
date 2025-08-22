'use client'
import React, { useState, useEffect } from "react";
import { paymentColumns, paymentData } from "./PaymentHistoryData";
import TableTwo from "@/components/TableTwo";
import exportToExcel from "@/hooks/ExportToExcel";
import { FiDownload } from "react-icons/fi";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import Pagination from "@/components/Pagination";
import SearchBar from "@/hooks/SearchBar";

const PaymentHist = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isToggleChev, setIsToggleChev] = useState(false);
  const itemsPerPage = 5;

  // ✅ filter only staffName & role
  const filteredData = paymentData.filter((item) => {
    if (!searchTerm) return true;

    const lowerSearch = searchTerm.trim().toLowerCase();
    const staffName = (item.staffName || "").toLowerCase();
    const role = (item.role || "").toLowerCase();

    return staffName.includes(lowerSearch) || role.includes(lowerSearch);
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

  const handleExport = () => {
    exportToExcel(filteredData, paymentColumns, "PaymentHistory_Search");
  };

  const handleToggleChev = () => {
    setIsToggleChev(!isToggleChev);
  };

  return (
    <div className="mt-5 px-2 sm:px-4 lg:px-6">
      {/* 🔍 Search & Actions */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="w-full md:w-1/2">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Staff Name or Role"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Duration Dropdown */}
          <div
            onClick={handleToggleChev}
            className="relative flex justify-between items-center gap-3 px-4 py-2 text-neutral-600 font-bold border-2 border-neutral-300 rounded-xl cursor-pointer"
          >
            <h1>Duration</h1>
            {isToggleChev ? (
              <HiChevronUp className="text-neutral-600" size={24} />
            ) : (
              <HiChevronDown className="text-neutral-600" size={24} />
            )}

            {isToggleChev && (
              <div className="flex flex-col w-56 sm:w-64 bg-white absolute top-12 left-0 shadow-lg rounded-xl border border-neutral-200 z-20">
                {/* From & To */}
                <div className="flex flex-col sm:flex-row justify-between p-2 gap-3">
                  <button className="flex-1 flex justify-between items-center px-4 py-2 border-[1.5px] rounded-lg font-medium">
                    From
                    <HiChevronDown className="text-neutral-600" size={20} />
                  </button>
                  <button className="flex-1 flex justify-between items-center px-4 py-2 border-[1.5px] rounded-lg font-medium">
                    To
                    <HiChevronDown className="text-neutral-600" size={20} />
                  </button>
                </div>

                <hr className="my-2 mx-2 border-t border-neutral-100" />

                {/* Quick Select */}
                <div className="flex flex-col gap-2 font-light px-2 mb-3">
                  {["Today", "This week", "This month", "This quarter"].map(
                    (label) => (
                      <span
                        key={label}
                        className="w-full text-left px-2 border border-neutral-200 hover:bg-blue-600 hover:text-white py-1 rounded-lg font-medium cursor-pointer"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>

                <hr className="my-2 mx-2 border-t border-neutral-100" />

                <button className="w-[90%] mx-auto py-2 bg-[#0080FF] hover:bg-blue-700 text-center text-white font-semibold mb-3 rounded-lg">
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 flex justify-center items-center gap-2 font-bold bg-[#0080FF] text-white rounded-lg hover:bg-blue-700"
          >
            Export <FiDownload size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {currentData.length > 0 ? (
          <TableTwo
            key={currentPage + searchTerm}
            columns={paymentColumns}
            data={currentData}
          />
        ) : (
          <p className="text-center text-gray-500 py-6">
            No matching records found.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

export default PaymentHist;

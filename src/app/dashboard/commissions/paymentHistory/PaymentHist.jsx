'use client'
import React, { useState, useEffect } from "react";
import { paymentColumns, paymentData } from "./PaymentHistoryData";
import TableTwo from "@/components/TableTwo";
import exportToExcel from "@/hooks/ExportToExcel";
import { FiDownload } from "react-icons/fi";
import { HiChevronDown, HiChevronUp  } from "react-icons/hi2";
import Pagination from "@/components/Pagination";
import SearchBar from "@/hooks/SearchBar";

const PaymentHist = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isToggleChev, setIsToggleChev] = useState(false)
  const [toggleFrom, setToggleFrom] = useState(false)
  const itemsPerPage = 5;

  // ✅ filter only staffName & role
  const filteredData = paymentData.filter((item) => {
    if (!searchTerm) return true; // no search → return all

    const lowerSearch = searchTerm.trim().toLowerCase();
    const staffName = (item.staffName || "").toLowerCase();
    const role = (item.role || "").toLowerCase();

    // match only if staffName or role contains search text
    return (
      staffName.includes(lowerSearch) ||
      role.includes(lowerSearch)
    );
  });

  // ✅ reset to page 1 when search changes
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
    setIsToggleChev(!isToggleChev)
  }
  // const handleToggleFrom = () => {
  //   setToggleFrom(!toggleFrom)
  // }

  return (
    <div className="mt-5">
      {/* 🔍 Search Bar */}
      <div className="mb- flex justify-between items-center gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by Staff Name or Role"
        />

        <div className="flex gap-3">
          <div onClick={handleToggleChev} className=" relative flex gap-3 px-4 text-neutral-600 font-bold py-2 border-2 border-neutral-300 rounded-xl ">
            <h1 >Duration</h1>
            {isToggleChev ? <HiChevronUp className="text-neutral-600" size={24}/> : <HiChevronDown size={24} className="text-neutral-600" />}


          {isToggleChev && (
            <div className="flex flex-col border-1 border-neutral-300 w-fit bg-white absolute top-12 left-1 rounded-xl h-auto">
                <div className="flex justify-between p-2 gap-5">
                    <button className="flex gap-5 px-6 py-2 border-[1.5px] rounded-lg font-medium ">
                      From
                      <HiChevronDown className="text-neutral-600" size={24}/>
                    </button>
                    <button className="flex gap-5 px-6 py-2 border-[1.5px] rounded-lg font-medium ">
                      To
                      <HiChevronDown className="text-neutral-600" size={24}/>
                    </button>
                </div>
                <hr className="my-2 mx-2 border-t-1 border-neutral-100" />

                <div className="flex flex-col gap-2 font-light px-2 mb-3 ">
                  <span className="w-full text-left px-2 border-[1px] hover:bg-blue-600 hover:text-white py-1 rounded-lg font-medium" >Today</span>
                  <span className="w-full text-left px-2 border-[1px] hover:bg-blue-600 hover:text-white py-1 rounded-lg font-medium" >This week</span>
                  <span className="w-full text-left px-2 border-[1px] hover:bg-blue-600 hover:text-white py-1 rounded-lg font-medium" >This month</span>
                  <span className="w-full text-left px-2 border-[1px] hover:bg-blue-600 hover:text-white py-1 rounded-lg font-medium" >This quarter</span>
                </div>
                <hr className="my-2 mx-2 border-t-1 border-neutral-100" />
                <button className="w-[95%] mx-auto py-1 bg-[#0080FF] hover:bg-blue-700 text-center text-white font-semibold mb-3 rounded-lg">Save</button>
            </div>
          )}
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 flex gap-2 font-bold bg-[#0080FF] text-white rounded-lg hover:bg-blue-700"
          >
            Export <FiDownload size={23} />
          </button>
        </div>

      </div>

      {/* Table or No Results */}
      {currentData.length > 0 ? (
        <TableTwo
          key={currentPage + searchTerm} // force refresh on new search or page change
          columns={paymentColumns}
          data={currentData}
        />
      ) : (
        <p className="text-center text-gray-500 py-6">
          No matching records found.
        </p>
      )}

      {/* Pagination - always visible */}
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

export default PaymentHist;

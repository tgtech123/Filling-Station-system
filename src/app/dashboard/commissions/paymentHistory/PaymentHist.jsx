'use client'
import React, { useState } from "react";
import { paymentColumns, paymentData } from "./PaymentHistoryData";
import TableTwo from "@/components/TableTwo";
import exportToExcel from "@/hooks/ExportToExcel";
import { FiDownload } from "react-icons/fi";
import Pagination from "@/components/Pagination";

const PaymentHist = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // pagination logic
  const totalItems = paymentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = paymentData.slice(startIndex, endIndex);

  const handleExport = () => {
   exportToExcel(paymentData, paymentColumns, "PaymentHistory_All");
  };

  return (
    <div>
      {/* Export button */}
      <div className="mb-5 flex place-content-end items-center">
        <button
          onClick={handleExport}
          className="px-4 py-2 flex gap-2 font-bold bg-[#0080FF] text-white rounded-lg hover:bg-blue-700"
        >
          Export <FiDownload size={23} />
        </button>
      </div>

      {/* Table with current page data */}
      <TableTwo key={currentPage} columns={paymentColumns} data={currentData} />

      {/* Pagination controls */}
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

"use client";
import React, { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import DataTable from "../DataTable";
import Pagination from "./Pagination";
import { tableHeaders } from "./paymentsTableData";
import useAdminStore from "@/store/useAdminStore";

const PaymentInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("Duration");

  const { payments, paymentsPagination, paymentsLoading, fetchPayments } =
    useAdminStore();

  // Initial load
  useEffect(() => {
    fetchPayments({ page: 1, limit: 10 });
  }, []);

  // Debounced refetch on filter/search change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments({
        page: 1,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        duration: durationFilter,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, durationFilter]);

  const handleExport = () => {
    const csvHeaders = tableHeaders.map((h) => h.label).join(",");
    const csvRows = payments.map((row) =>
      tableHeaders
        .map((h) => `"${String(row[h.key] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const mappedRows = payments.map((row) => ({
    stationName: row.stationName,
    plan: (
      <span className="text-blue-600 font-semibold">{row.plan}</span>
    ),
    amount: row.amount,
    paymentMethod: row.paymentMethod,
    status: (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.status === "Active"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : row.status === "Failed"
            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        }`}
      >
        {row.status}
      </span>
    ),
    date: row.date,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5">
      <div className="flex gap-4 items-center justify-end mt-[1rem]">
        {/* Search */}
        <div className="flex relative items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by station name or owner"
            className="lg:w-[21.875rem] w-fit h-[2.75rem] pl-8 rounded-lg border-[2px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-[2px] focus:border-blue-600 outline-none font-semibold"
          />
          <Search size={24} className="text-neutral-500 absolute ml-1" />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
          >
            <option value="all">All status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Duration Filter */}
        <div>
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="w-[7.686rem] h-[2.75rem] border-[2px] border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-[2px] focus:border-blue-600 outline-none rounded-lg font-semibold"
          >
            <option value="Duration">Duration</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex gap-2 cursor-pointer hover:bg-blue-700 bg-blue-600 text-white rounded-lg px-5 py-2.5 font-semibold"
        >
          <Download size={24} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="mt-[1rem]">
        {paymentsLoading ? (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {tableHeaders.map((h) => (
                    <th
                      key={h.key}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array(10)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {tableHeaders.map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-12 font-medium">
            No payments found
          </p>
        ) : (
          <DataTable headers={tableHeaders} rows={mappedRows} />
        )}
      </div>

      {/* Pagination */}
      {!paymentsLoading && paymentsPagination.totalItems > 0 && (
        <Pagination
          currentPage={paymentsPagination.currentPage}
          totalItems={paymentsPagination.totalItems}
          itemsPerPage={paymentsPagination.itemsPerPage}
          onPageChange={(page) =>
            fetchPayments({
              page,
              limit: 10,
              search: searchTerm,
              status: statusFilter,
              duration: durationFilter,
            })
          }
        />
      )}
    </div>
  );
};

export default PaymentInfo;

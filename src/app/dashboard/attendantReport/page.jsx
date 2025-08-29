"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import Pagination from "@/components/Pagination";
import { ChevronDown, Download, ListFilter, Search } from "lucide-react";
import { fuelSalesColumns, fuelSalesData, attendantReportFilterConfig } from "./attendantReportData";
import { useState, useMemo } from "react";
import DurationModal from "./DurationModal";
import exportToExcel from "@/hooks/ExportToExcel";
import Filter from "./Filter";


export default function AttendantReport() {
  const [openDurationModal, setOpenDurationModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return fuelSalesData;

    return fuelSalesData.filter(
      (item) =>
        item[1]?.toLowerCase().includes(searchTerm.toLowerCase()) || // Attendant
        item[3]?.toLowerCase().includes(searchTerm.toLowerCase())    // Product
    );
  }, [searchTerm]);

  // Pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Convert object data into arrays for the Table component


  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <DashboardLayout>
      <header className="mt-2 mb-6">
        <h2 className="text-2xl font-semibold">Reconciled Attendant Report</h2>
        <p>Summary of reconciled attendant sales</p>
      </header>

      <DisplayCard>
        <section className="flex flex-col lg:flex-row gap-3 lg:gap-0 justify-between items-center">
          {/* Search input */}
          <div className="relative w-full lg:w-[40%]">
            <input
              type="text"
              className="p-2 rounded-[8px] border-2 border-gray-300 w-full"
              placeholder="Search by attendant/product"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute text-gray-300 top-2 right-4" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
              onClick={() => setOpenDurationModal(true)}
            >
              Duration
              <ChevronDown />
            </button>
            <button onClick={() => setOpenFilter(true)} className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]">
              Filter
              <ListFilter />
            </button>
            <button onClick={() => exportToExcel(fuelSalesData, fuelSalesColumns, "AttendantReport")} className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]">
              Export
              <Download />
            </button>
          </div>
        </section>

        {/* Data table */}
        <Table columns={fuelSalesColumns} data={currentData} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          showItemCount={true}
          className="mt-4"
        />
      </DisplayCard>

      {openDurationModal && <DurationModal />}
      {openFilter && <Filter handleClose={() => setOpenFilter(false)} filterConfig={attendantReportFilterConfig} />}
    </DashboardLayout>
  );
}

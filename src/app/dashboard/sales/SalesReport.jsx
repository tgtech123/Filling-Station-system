"use client";
import SearchBar from "@/components/SearchBar";
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

  // Filter data by product type
  const filteredData = useMemo(() => {
    return fullData.filter((row) =>
      row[1].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = paginate(filteredData, page, ITEMS_PER_PAGE);

  // const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
  // const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="bg-white p-4 rounded-[24px]">
      <div>
        {/* <SearchBar
          searchTerm={searchTerm}
          onSearch={(val) => {
            setSearchTerm(val);
            setPage(1); 
          }}
        /> */}
        <CustomSearchBar
          searchTerm={searchTerm}
          onSearch={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
        />
      </div>
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

"use client";
import { useState, useMemo } from 'react';
import TableHeader from './TableHeader';
import SearchBar from '@/components/SearchBar';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import { columns, data as fullData } from './shiftData';
import { paginate } from './utils/paginate';

const ITEMS_PER_PAGE = 6;

export default function ShiftsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    return fullData.filter(row =>
      row[1].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = paginate(filteredData, page, ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] py-6 sm:px-6 lg:px-12">
      <div className="max-w-full bg-white p-4 rounded-[24px] overflow-x-auto">
        <TableHeader />
        <SearchBar
          searchTerm={searchTerm}
          onSearch={handleSearch}
        />
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
    </div>
  );
}
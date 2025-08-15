'use client';
import React, { useState } from 'react';
import { IoCloseOutline } from "react-icons/io5";
import Table from '@/components/Table';
import { columns, data } from "./ReceiptData";
import ActionButtons from './ActionButtons';
import FilterModal from '../FilterModal';
import { BsFilter } from "react-icons/bs";
import { HiChevronDown, HiChevronUp  } from "react-icons/hi2";
import SearchBar from '@/components/SearchBar';
import ExportButton from '@/components/ExportButton';

const Modal = ({ isOpen, onClose }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [toggleChevron, setToggleChevron] =useState(false)


  const handleChevron = ()=>{
    setToggleChevron(!toggleChevron)
  }

  // 🔍 Handle search by Transaction ID only
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((row) =>
          row[1].toLowerCase().includes(term.toLowerCase()) // index 1 = Transaction ID
        )
      );
    }
  };

  const handleApplyFilter = (filters) => {
    console.log("Filters Applied:", filters);

    let newData = data;

    // Match products (dataset uses index 2 for product info)
    if (!filters.products.includes("All")) {
      newData = newData.filter((row) =>
        filters.products.some((prod) =>
          row[2].toLowerCase().includes(prod.toLowerCase())
        )
      );
    }

    // Match payment type (dataset uses index 4)
    if (!filters.payments.includes("All")) {
      newData = newData.filter((row) =>
        filters.payments.includes(row[4])
      );
    }

    setFilteredData(newData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with lighter opacity */}
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={onClose}
      ></div>

      {/* Main Modal */}
      <div className="relative bg-white rounded shadow-lg p-6 w-[90%] max-w-5xl max-h-[85%] overflow-auto z-50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:bg-neutral-100 p-1 rounded-full"
        >
          <IoCloseOutline size={24} />
        </button>

        {/* Header */}
        <div className="flex-1 mb-4">
          <div>
            <p className="text-lg font-semibold">Reprint receipt</p>
            <p className="text-sm text-gray-500">Print and export all sales receipts</p>
          </div>

          <div className="flex justify-between  py-3 flex-col sm:flex-row gap-2">
            {/* SearchBar now only searches by Transaction ID */}
            <SearchBar
              searchTerm={searchTerm}
              onSearch={handleSearch}
              exportData={filteredData}
              exportColumns={columns}
              exportVariant="compact"
              placeholder='Search by Transaction ID'
            />

           <div className='flex gap-3'>
              <button onClick={handleChevron} className='flex items-center justify-center px-4 py-2 gap-3 border-[1.5px] border-neutral-300 rounded-xl ' >
                Duration {toggleChevron ? <HiChevronDown size={24} /> : <HiChevronUp size={24}/> }  
              </button>


              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex gap-2 font-semibold items-center border-[1.5px] border-neutral-300 px-4 py-2 rounded-lg"
              >
                Filter <BsFilter size={24} />
              </button>
            {/* <button className='flex gap-2'>
              Export <HiOutlineDownload size={24} /> 
            </button> */}

            <ExportButton
              data={filteredData}
              columns={columns}
              fileName='Sales_Reports'
              format='excel'
            />
            
            </div> 
          </div>

        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredData}
          renderActions={(row) => (
            <ActionButtons
              onView={() => console.log("View", row)}
              onPrint={() => console.log("Print", row)}
            />
          )}
        />

        {/* Filter Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
              <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                products={[
                  "Engine oil (1L)",
                  "Motor Grease",
                  "Gametol Oil",
                  "Shell Oil",
                  "Ali Lub."
                ]}
                paymentTypes={["POS", "Transfer", "Cash"]}
                onApply={(filters) => {
                  handleApplyFilter(filters);
                  setIsFilterOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

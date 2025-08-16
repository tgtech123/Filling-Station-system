'use client';
import React, { useState } from 'react';
import { IoCloseOutline } from "react-icons/io5";
import Table from '@/components/Table';
import { columns, data } from "./ReceiptData";
import ActionButtons from './ActionButtons';
import FilterModal from '../FilterModal';
import { BsFilter } from "react-icons/bs";
import { HiChevronDown, HiChevronUp  } from "react-icons/hi2";
import { GrSearch } from "react-icons/gr";
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
            <div className='relative  '>
              <input type="text" placeholder='Search by Transaction ID' className='border-[1.5px] py-2 outline-none w-[400px] text-neutral-300 pl-3 rounded-lg' />
                <GrSearch size={22} className='absolute top-3 text-neutral-200 right-3'/>
            </div>

           <div className=' relative  flex gap-3'>
              <button onClick={handleChevron} className='flex items-center justify-center px-4 py-2 gap-3 border-[1.5px] border-neutral-300 rounded-xl ' >
                Duration {toggleChevron ? <HiChevronDown size={24} /> : <HiChevronUp size={24}/> }  
              </button>

              {toggleChevron && (
                <div className="absolute z-50 top-14 bg-white border-2 rounded-lg w-fit p-3">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      placeholder="From"
                      className="flex-1 px-2 py-2 rounded-md border border-neutral-300 outline-none"
                    />
                    <input
                      type="date"
                      placeholder="To"
                      className="flex-1 px-2 py-2 rounded-md border border-neutral-300 outline-none"
                    />
                  </div>
                    <hr className='border-[1px] mt-2' />

                  <div className='flex flex-col gap-2 mt-3'>
                    <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>Today</button>
                    <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>This week</button>
                    <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>This month</button>
                    <button className='flex place-items-start border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md'>This quarter</button>
                  </div>
                    <hr className='border-[1px] mt-2' />

                    <span className='flex hover:bg-blue-400 justify-center cursor-pointer p-2 bg-blue-600 text-white font-semibold rounded-md'>
                      <button onClick={handleChevron} className='flex place-items-center'>Save</button>
                    </span>

                </div>
              )}

              
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

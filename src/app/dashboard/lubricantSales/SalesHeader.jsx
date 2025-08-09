'use client'
import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { BsPrinter } from "react-icons/bs";
// import { Link } from "lucide-react";
import Link from "next/link";
// import page from '/lubricantSales/reusefilter'
import Modal from "./reusefilter/Modal";


const SalesHeader = () => {
 const [isModalOpen, setIsModalOpen] = useState(false)

 
  return (
    <div className="w-full">
      <div className="bg-white w-full h-fit rounded-md p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-3">
        {/* Form section */}
        <form className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Date Input */}
          <input
            type="date"
            className="border p-2 rounded-md text-purple-500 font-semibold w-full md:w-auto"
          />

          {/* Search Input */}
          <div className="flex relative w-full md:w-[400px]">
            <input
              type="text"
              placeholder="Search by product name"
              className="py-2 pl-3 pr-10  outline-none  focus:border-[#FF9D29] w-full border-[1.5px] border-neutral-300 rounded-lg"
            />
            <IoIosSearch
              className="absolute text-neutral-300 top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
              size={24}
            />
          </div>
        </form>

        {/* Reprint Button */}
        {/* <Link href='/dashboard/lubricantSales/reusefilter'> */}
          <button onClick={()=> setIsModalOpen(true)} className="bg-[#0080FF]  flex  gap-2 w-full md:w-auto px-4 py-2 text-white font-semibold hover:bg-blue-700 rounded-lg">
            Reprint
            <BsPrinter size={24} />
          </button>
        {/* </Link> */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
          

        
      </div>
    </div>
  );
};

export default SalesHeader;

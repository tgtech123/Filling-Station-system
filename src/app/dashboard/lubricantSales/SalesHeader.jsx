'use client';
import React, { useState, useEffect, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { BsPrinter } from "react-icons/bs";
import { Calendar, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import Modal from "./reusefilter/Modal";
import { useLubricantStore } from "@/store/lubricantStore";
import LubricantStockModal from "./LubricantStockModal";

const SalesHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState(""); 
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const inputRef = useRef(null);

  const { searchLubricants, setSelectedProductForSale } = useLubricantStore();

  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;

  // Enhanced search handler with error handling
  const handleSearch = async (term) => {
    const searchValue = term || searchTerm;
    setSearchError(""); 

    if (searchValue.trim().length > 0) {
      try {
        const filtered = await searchLubricants(searchValue.trim());
        
        if (filtered.length === 0) {
          setSearchError(`No products found matching "${searchValue}"`);
          setResults([]);
          setShowDropdown(false);
        } else {
          setResults(filtered);
          setShowDropdown(true);
        }
      } catch (error) {
        setSearchError("Failed to search products");
        setResults([]);
        setShowDropdown(false);
      }
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  // Handle input change with real-time search
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Handle product selection
  const handleProductSelect = (item) => {
    setSelectedProductForSale(item);
    setSearchTerm("");
    setResults([]);
    setShowDropdown(false);
    setSearchError(""); // Clear error on selection
  };

  // hide dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white w-full h-fit rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:flex-wrap sm:justify-between mb-3">
        {/* Search Form */}
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center relative w-full sm:w-auto flex-1 min-w-0"
          onSubmit={(e) => e.preventDefault()}
          ref={inputRef}
        >
          {/* Date Input */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="text-purple-600" size={18} />
            <p className="text-purple-600 text-sm font-semibold">
              {formattedDate}
            </p>
          </div>

          {/* Search Input */}
          <div className="flex relative w-full sm:w-[340px] lg:w-[400px]">
            <input
              type="text"
              placeholder="Search by product name or barcode"
              className="py-2 pl-3 pr-10 outline-none focus:border-[#FF9D29] w-full border-[1.5px] border-neutral-300 rounded-lg"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <IoIosSearch
              className="absolute text-[#FF9D29] top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
              size={24}
              onClick={() => handleSearch()}
            />

            {/* 🆕 Search Error Message */}
            {searchError && (
              <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-300 rounded-md mt-1 p-3 z-50 shadow-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={18} />
                  <p className="text-sm font-medium">{searchError}</p>
                </div>
              </div>
            )}

            {/* 🆕 Enhanced Dropdown with better styling */}
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                {results.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleProductSelect(item)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  >
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Barcode: {item.barcode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Buttons */}
        <div className="flex flex-col xs:flex-row sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0080FF] flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 text-white font-semibold hover:bg-blue-700 rounded-lg transition-colors"
          >
            Reprint
            <BsPrinter size={20} />
          </button>

          <button
            onClick={() => setStockModalOpen(true)}
            className="border-2 border-[#0080FF] flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 text-[#0080ff] font-semibold hover:bg-blue-700 hover:text-white hover:border-blue-700 rounded-lg transition-colors"
          >
            Add Stock
            <Plus size={20} />
          </button>
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        {stockModalOpen && <LubricantStockModal onClose={() => setStockModalOpen(false)} />}
      </div>
    </div>
  );
};

export default SalesHeader;
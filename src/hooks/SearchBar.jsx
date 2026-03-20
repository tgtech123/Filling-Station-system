"use client";
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  const [searchQuery, setSearchQuery] = useState("")

  // const filteredSearch =
  return (
    <div className="w-full sm:w-1/2 lg:w-[440px]">
      <div className="relative">
        <input
          type="text"
          value={value} // controlled input
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          className="w-[25.718rem] h-[2.325rem] pl-3 text-gray-700 text-sm border-2 border-neutral-300 rounded-lg focus:border-2 focus:border-blue-500 focus:outline-none"
        />
        {/* 🔍 keep icon on the right, as you had */}
        <FiSearch size={26} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;

"use client";
import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="w-full sm:w-1/2 lg:w-[440px]">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 text-gray-700 text-sm border border-neutral-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;

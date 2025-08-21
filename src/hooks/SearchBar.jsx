"use client";
import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="w-full sm:w-1/3">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-[440px]  px-4 py-1.5 pl-3 text-neutral-200 text-sm border border-neutral-300 rounded-lg focus:border-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <FiSearch className="absolute right-[-110px] top-1/2 -translate-y-1/2 text-neutral-200" />
      </div>
    </div>
  );
};

export default SearchBar;

"use client";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative w-full">
      <FiSearch
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm text-gray-700 Kborder-2 border-neutral-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
      />
    </div>
  );
};

export default SearchBar;

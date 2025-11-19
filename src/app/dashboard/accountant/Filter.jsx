// components/Filter.tsx
"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function Filter({
  title = "Customize Filter",
  filterConfig = [],
  currentFilters = {},
  onApplyFilter,
  handleClose,
  showReset = true,
}) {
  const initializeFilterState = (options, current = {}) => {
    const baseState = options.reduce((acc, option) => {
      acc[option] = false;
      return acc;
    }, { all: true });
    return { ...baseState, ...current };
  };

  const [filters, setFilters] = useState(() => {
    const initial = {};
    filterConfig.forEach(({ key, options }) => {
      initial[key] = initializeFilterState(options, currentFilters[key]);
    });
    return initial;
  });

  const handleChange = (categoryKey, optionKey) => {
    setFilters((prev) => {
      const current = prev[categoryKey];
      const newState = { ...current };
      
      if (optionKey === "all") {
        Object.keys(newState).forEach((key) => (newState[key] = key === "all"));
      } else {
        newState.all = false;
        newState[optionKey] = !newState[optionKey];
        
        const allSelected = Object.entries(newState)
          .filter(([k]) => k !== "all")
          .every(([_, v]) => v);
        const noneSelected = Object.entries(newState)
          .filter(([k]) => k !== "all")
          .every(([_, v]) => !v);
          
        if (allSelected || noneSelected) {
          Object.keys(newState).forEach((key) => (newState[key] = key === "all"));
        }
      }
      return { ...prev, [categoryKey]: newState };
    });
  };

  const resetFilters = () => {
    const reset = {};
    filterConfig.forEach(({ key, options }) => {
      reset[key] = initializeFilterState(options);
    });
    setFilters(reset);
  };

  const applyFilters = () => {
    if (typeof onApplyFilter === "function") {
      onApplyFilter(filters);
    }
    if (typeof handleClose === "function") {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Filter sections - 3 column grid to match image */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {filterConfig.map(({ key, label, options }) => (
            <div key={key}>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                {label}
              </h3>
              <div className="space-y-3">
                {["all", ...options].map((option) => (
                  <label key={option} className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters[key]?.[option] || false}
                        onChange={() => handleChange(key, option)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded ${
                        filters[key]?.[option] 
                          ? 'bg-orange-400 border-orange-400' 
                          : 'border-gray-300 bg-white group-hover:border-orange-300'
                      } flex items-center justify-center transition-colors`}>
                        {filters[key]?.[option] && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700 select-none">
                      {option === "all" ? "All" : option.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={applyFilters}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
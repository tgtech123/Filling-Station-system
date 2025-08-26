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
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30">
      <div className="bg-white flex flex-col rounded-xl p-3 w-full sm:overflow-y-auto max-w-[700px] shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Filter sections */}
        <div className="flex flex-wrap gap-6 mb-6">
          {filterConfig.map(({ key, label, options }) => (
            <div key={key} className="flex-1 min-w-[200px]">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                {label}
              </h3>
              <div className="space-y-2">
                {["all", ...options].map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[key]?.[option] || false}
                      onChange={() => handleChange(key, option)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700 capitalize">
                      {option.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {showReset !== false && (
              <button
                onClick={handleReset}
                className="px-4 py-1.5 border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                Reset
              </button>
            )}
          <button
            onClick={applyFilters}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

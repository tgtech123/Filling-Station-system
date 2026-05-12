import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CustomFilter({ handleClose, onApplyFilter, currentFilters = {} }) {
  const defaultShiftType = {
    all: true,
    oneDay: false,
    morning: false,
    evening: false,
    dayOff: false,
  };

  const defaultPumpNo = {
    all: true,
    pump1: false,
    pump2: false,
    pump3: false,
    pump4: false,
    pump5: false,
    pump6: false,
  };

  const [shiftType, setShiftType] = useState({ ...defaultShiftType, ...currentFilters.shiftType });
  const [pumpNo, setPumpNo] = useState({ ...defaultPumpNo, ...currentFilters.pumpNo });

  const handleShiftTypeChange = (type) => {
    if (type === 'all') {
      setShiftType({ all: true, oneDay: false, morning: false, evening: false, dayOff: false });
    } else {
      setShiftType((prev) => {
        const newState = { ...prev, all: false, [type]: !prev[type] };
        const individualOptions = ['oneDay', 'morning', 'evening', 'dayOff'];
        if (individualOptions.every((o) => newState[o])) {
          return { all: true, oneDay: false, morning: false, evening: false, dayOff: false };
        }
        if (individualOptions.every((o) => !newState[o])) return { ...newState, all: true };
        return newState;
      });
    }
  };

  const handlePumpNoChange = (pump) => {
    if (pump === 'all') {
      setPumpNo({ all: true, pump1: false, pump2: false, pump3: false, pump4: false, pump5: false, pump6: false });
    } else {
      setPumpNo((prev) => {
        const newState = { ...prev, all: false, [pump]: !prev[pump] };
        const pumpOptions = ['pump1', 'pump2', 'pump3', 'pump4', 'pump5', 'pump6'];
        if (pumpOptions.every((o) => newState[o])) {
          return { all: true, pump1: false, pump2: false, pump3: false, pump4: false, pump5: false, pump6: false };
        }
        if (pumpOptions.every((o) => !newState[o])) return { ...newState, all: true };
        return newState;
      });
    }
  };

  const applyFilter = () => {
    const filterCriteria = { shiftType, pumpNo };
    if (typeof onApplyFilter === 'function') {
      try { onApplyFilter(filterCriteria); } catch {}
    }
    if (typeof handleClose === 'function') handleClose();
  };

  const resetFilters = () => {
    setShiftType({ all: true, oneDay: false, morning: false, evening: false, dayOff: false });
    setPumpNo({ all: true, pump1: false, pump2: false, pump3: false, pump4: false, pump5: false, pump6: false });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-[500px] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Customize Filter</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex gap-8 mb-6">
          {/* Shift Type Column */}
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-4">Shift type</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={shiftType.all} onChange={() => handleShiftTypeChange('all')} className="w-4 h-4 text-blue-600 border-[8px] bg-gray-100 border-gray-400 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="ml-3 text-sm text-gray-700">All</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={shiftType.oneDay} onChange={() => handleShiftTypeChange('oneDay')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="ml-3 text-sm text-gray-700">One-Day</span>
              </label>
              <div className="ml-6 space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={shiftType.morning} onChange={() => handleShiftTypeChange('morning')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                  <span className="ml-3 text-sm text-gray-700">Morning</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={shiftType.evening} onChange={() => handleShiftTypeChange('evening')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                  <span className="ml-3 text-sm text-gray-700">Evening</span>
                </label>
              </div>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={shiftType.dayOff} onChange={() => handleShiftTypeChange('dayOff')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="ml-3 text-sm text-gray-700">Day-Off</span>
              </label>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-4">Pump No</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={pumpNo.all} onChange={() => handlePumpNoChange('all')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <span className="ml-3 text-sm text-gray-700">All</span>
              </label>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <label key={num} className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={pumpNo[`pump${num}`]} onChange={() => handlePumpNoChange(`pump${num}`)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                  <span className="ml-3 text-sm text-gray-700">Pump {num}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={resetFilters} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
            Reset
          </button>
          <button onClick={applyFilter} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

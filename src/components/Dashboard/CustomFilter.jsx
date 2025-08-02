import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CustomFilter({ handleClose, onApplyFilter, currentFilters = {} }) {
  console.log('CustomFilter rendered with props:', { handleClose, onApplyFilter, currentFilters });
  
    const defaultShiftType = {
  all: true,
  oneDay: false,
  morning: false,
  evening: false,
  dayOff: false
};

const defaultPumpNo = {
  all: true,
  pump1: false,
  pump2: false,
  pump3: false,
  pump4: false,
  pump5: false,
  pump6: false
};

const [shiftType, setShiftType] = useState({
  ...defaultShiftType,
  ...currentFilters.shiftType
});

const [pumpNo, setPumpNo] = useState({
  ...defaultPumpNo,
  ...currentFilters.pumpNo
});

   useEffect(() => {
    console.log('Current shiftType state:', shiftType);
    console.log('Current pumpNo state:', pumpNo);
  }, [shiftType, pumpNo]);

  const handleShiftTypeChange = (type) => {
    console.log('Shift type changing:', type);
    
    if (type === 'all') {
      setShiftType({
        all: true,
        oneDay: false,
        morning: false,
        evening: false,
        dayOff: false
      });
    } else {
      setShiftType(prev => {
        console.log('Previous shiftType:', prev);
        
        const newState = {
          ...prev,
          all: false,
          [type]: !prev[type]
        };
        
        console.log('New shiftType state (before checks):', newState);
        
        // Check if all individual options are selected
        const individualOptions = ['oneDay', 'morning', 'evening', 'dayOff'];
        const allIndividualSelected = individualOptions.every(option => newState[option]);
        
        if (allIndividualSelected) {
          console.log('All individual options selected, setting all to true');
          return {
            all: true,
            oneDay: false,
            morning: false,
            evening: false,
            dayOff: false
          };
        }
        
        // Check if no individual options are selected
        const noIndividualSelected = individualOptions.every(option => !newState[option]);
        if (noIndividualSelected) {
          console.log('No individual options selected, setting all to true');
          return {
            ...newState,
            all: true
          };
        }
        
        console.log('Final shiftType state:', newState);
        return newState;
      });
    }
  };

  const handlePumpNoChange = (pump) => {
    console.log('Pump changing:', pump);
    
    if (pump === 'all') {
      setPumpNo({
        all: true,
        pump1: false,
        pump2: false,
        pump3: false,
        pump4: false,
        pump5: false,
        pump6: false
      });
    } else {
      setPumpNo(prev => {
        console.log('Previous pumpNo:', prev);
        
        const newState = {
          ...prev,
          all: false,
          [pump]: !prev[pump]
        };
        
        console.log('New pumpNo state (before checks):', newState);
        
        // Check if all individual pumps are selected
        const pumpOptions = ['pump1', 'pump2', 'pump3', 'pump4', 'pump5', 'pump6'];
        const allPumpsSelected = pumpOptions.every(option => newState[option]);
        
        if (allPumpsSelected) {
          console.log('All pumps selected, setting all to true');
          return {
            all: true,
            pump1: false,
            pump2: false,
            pump3: false,
            pump4: false,
            pump5: false,
            pump6: false
          };
        }
        
        // Check if no individual pumps are selected
        const noPumpsSelected = pumpOptions.every(option => !newState[option]);
        if (noPumpsSelected) {
          console.log('No pumps selected, setting all to true');
          return {
            ...newState,
            all: true
          };
        }
        
        console.log('Final pumpNo state:', newState);
        return newState;
      });
    }
  };

  const applyFilter = () => {
    const filterCriteria = {
      shiftType,
      pumpNo
    };
    
    console.log('Applying filters:', filterCriteria);
    console.log('onApplyFilter type:', typeof onApplyFilter);
    console.log('onApplyFilter function:', onApplyFilter);
    
    // Only call if it's a function
    if (typeof onApplyFilter === 'function') {
      try {
        onApplyFilter(filterCriteria);
        console.log('Filter applied successfully');
      } catch (error) {
        console.error('Error applying filter:', error);
      }
    } else {
      console.error('onApplyFilter is not a function!', onApplyFilter);
    }
    
    if (typeof handleClose === 'function') {
      handleClose();
    } else {
      console.error('handleClose is not a function!', handleClose);
    }
  };

  const resetFilters = () => {
    console.log('Resetting filters');
    setShiftType({
      all: true,
      oneDay: false,
      morning: false,
      evening: false,
      dayOff: false
    });
    setPumpNo({
      all: true,
      pump1: false,
      pump2: false,
      pump3: false,
      pump4: false,
      pump5: false,
      pump6: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-[500px] shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Customize Filter</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex gap-8 mb-6">
          {/* Shift Type Column */}
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-4">Shift type</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftType.all}
                  onChange={() => {
                    console.log('Clicking shift type: all');
                    handleShiftTypeChange('all');
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700">All</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftType.oneDay}
                  onChange={() => {
                    console.log('Clicking shift type: oneDay');
                    handleShiftTypeChange('oneDay');
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700">One-Day</span>
              </label>

              <div className="ml-6 space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftType.morning}
                    onChange={() => {
                      console.log('Clicking shift type: morning');
                      handleShiftTypeChange('morning');
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">Morning</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftType.evening}
                    onChange={() => {
                      console.log('Clicking shift type: evening');
                      handleShiftTypeChange('evening');
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">Evening</span>
                </label>
              </div>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftType.dayOff}
                  onChange={() => {
                    console.log('Clicking shift type: dayOff');
                    handleShiftTypeChange('dayOff');
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700">Day-Off</span>
              </label>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-4">Pump No</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pumpNo.all}
                  onChange={() => {
                    console.log('Clicking pump: all');
                    handlePumpNoChange('all');
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700">All</span>
              </label>
              
              {[1, 2, 3, 4, 5, 6].map(num => (
                <label key={num} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pumpNo[`pump${num}`]}
                    onChange={() => {
                      console.log(`Clicking pump: pump${num}`);
                      handlePumpNoChange(`pump${num}`);
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700">Pump {num}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              console.log('Reset button clicked');
              resetFilters();
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => {
              console.log('Apply button clicked');
              applyFilter();
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
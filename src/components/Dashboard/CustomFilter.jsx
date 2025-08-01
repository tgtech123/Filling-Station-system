// import React, { useState } from 'react';
// import { X } from 'lucide-react';

// export default function CustomFilter({ handleClose }) {
//   const [shiftType, setShiftType] = useState({
//     all: true,
//     oneDay: false,
//     morning: false,
//     evening: false,
//     dayOff: false
//   });
//   const [pumpNo, setPumpNo] = useState({
//     all: true,
//     pump1: false,
//     pump2: false,
//     pump3: false,
//     pump4: false,
//     pump5: false,
//     pump6: false
//   });

//   const handleShiftTypeChange = (type) => {
//     if (type === 'all') {
//       setShiftType({
//         all: true,
//         oneDay: false,
//         morning: false,
//         evening: false,
//         dayOff: false
//       });
//     } else {
//       setShiftType(prev => {
//         const newState = {
//           ...prev,
//           all: false,
//           [type]: !prev[type]
//         };
        
//         // Check if all individual options are selected
//         const individualOptions = ['oneDay', 'morning', 'evening', 'dayOff'];
//         const allIndividualSelected = individualOptions.every(option => newState[option]);
        
//         if (allIndividualSelected) {
//           return {
//             all: true,
//             oneDay: false,
//             morning: false,
//             evening: false,
//             dayOff: false
//           };
//         }
        
//         return newState;
//       });
//     }
//   };

//   const handlePumpNoChange = (pump) => {
//     if (pump === 'all') {
//       setPumpNo({
//         all: true,
//         pump1: false,
//         pump2: false,
//         pump3: false,
//         pump4: false,
//         pump5: false,
//         pump6: false
//       });
//     } else {
//       setPumpNo(prev => {
//         const newState = {
//           ...prev,
//           all: false,
//           [pump]: !prev[pump]
//         };
        
//         // Check if all individual pumps are selected
//         const pumpOptions = ['pump1', 'pump2', 'pump3', 'pump4', 'pump5', 'pump6'];
//         const allPumpsSelected = pumpOptions.every(option => newState[option]);
        
//         if (allPumpsSelected) {
//           return {
//             all: true,
//             pump1: false,
//             pump2: false,
//             pump3: false,
//             pump4: false,
//             pump5: false,
//             pump6: false
//           };
//         }
        
//         return newState;
//       });
//     }
//   };

//   const applyFilter = () => {
//     console.log('Applied filters:', { shiftType, pumpNo });
//     setIsOpen(false);
//   };


//   return (
//     <div className="absolute top-[250px] right-10 h-[400px] flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-xl">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <h2 className="text- font-semibold text-gray-900">Customize Filter</h2>
//           <button 
//             onClick={handleClose}
//             className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <X size={20} className="text-gray-500" />
//           </button>
//         </div>

//         {/* Filter Content */}
//         <div className="flex gap-8 mb-8">
//           {/* Shift Type Column */}
//           <div className="flex-1">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Shift type</h3>
//             <div className="space-y-3">
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={shiftType.all}
//                   onChange={() => handleShiftTypeChange('all')}
//                   className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
//                 />
//                 <span className="ml-3 text-gray-700">All</span>
//               </label>
              
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={shiftType.oneDay}
//                   onChange={() => handleShiftTypeChange('oneDay')}
//                   className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
//                 />
//                 <span className="ml-3 text-gray-700">One-Day</span>
//               </label>

//               <div className="ml-8 space-y-3">
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={shiftType.morning}
//                     onChange={() => handleShiftTypeChange('morning')}
//                     className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
//                   />
//                   <span className="ml-3 text-gray-700">Morning</span>
//                 </label>
                
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={shiftType.evening}
//                     onChange={() => handleShiftTypeChange('evening')}
//                     className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
//                   />
//                   <span className="ml-3 text-gray-700">Evening</span>
//                 </label>
//               </div>
              
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={shiftType.dayOff}
//                   onChange={() => handleShiftTypeChange('dayOff')}
//                   className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
//                 />
//                 <span className="ml-3 text-gray-700">Day-Off</span>
//               </label>
//             </div>
//           </div>

//           {/* Pump No Column */}
//           <div className="flex-1">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Pump No</h3>
//             <div className="space-y-3">
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={pumpNo.all}
//                   onChange={() => handlePumpNoChange('all')}
//                   className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
//                 />
//                 <span className="ml-3 text-gray-700">All</span>
//               </label>
              
//               {[1, 2, 3, 4, 5, 6].map(num => (
//                 <label key={num} className="flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={pumpNo[`pump${num}`]}
//                     onChange={() => handlePumpNoChange(`pump${num}`)}
//                     className="w-5 h-5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
//                   />
//                   <span className="ml-3 text-gray-700">Pump {num}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Apply Button */}
//         <button
//           onClick={applyFilter}
//           className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
//         >
//           Apply Filter
//         </button>
//       </div>
//     </div>
//   );
// };



import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CustomFilter({ handleClose }) {
  const [shiftType, setShiftType] = useState({
    all: true,
    oneDay: false,
    morning: false,
    evening: false,
    dayOff: false
  });
  const [pumpNo, setPumpNo] = useState({
    all: true,
    pump1: false,
    pump2: false,
    pump3: false,
    pump4: false,
    pump5: false,
    pump6: false
  });

  const handleShiftTypeChange = (type) => {
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
        const newState = {
          ...prev,
          all: false,
          [type]: !prev[type]
        };
        
        // Check if all individual options are selected
        const individualOptions = ['oneDay', 'morning', 'evening', 'dayOff'];
        const allIndividualSelected = individualOptions.every(option => newState[option]);
        
        if (allIndividualSelected) {
          return {
            all: true,
            oneDay: false,
            morning: false,
            evening: false,
            dayOff: false
          };
        }
        
        return newState;
      });
    }
  };

  const handlePumpNoChange = (pump) => {
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
        const newState = {
          ...prev,
          all: false,
          [pump]: !prev[pump]
        };
        
        // Check if all individual pumps are selected
        const pumpOptions = ['pump1', 'pump2', 'pump3', 'pump4', 'pump5', 'pump6'];
        const allPumpsSelected = pumpOptions.every(option => newState[option]);
        
        if (allPumpsSelected) {
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
        
        return newState;
      });
    }
  };

  const applyFilter = () => {
    console.log('Applied filters:', { shiftType, pumpNo });
    handleClose();
  };

  return (
    <div className="absolute top-[250px] right-4 lg:right-10 h-[350px] w-[350px] lg:w-[400px] flex items-center justify-center p-2">
      <div className="bg-white rounded-xl p-4 w-full max-w-[600px] shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-gray-900">Customize Filter</h2>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex gap-6 mb-5">
          {/* Shift Type Column */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Shift type</h3>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftType.all}
                  onChange={() => handleShiftTypeChange('all')}
                  className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
                />
                <span className="ml-2 text-sm text-gray-700">All</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftType.oneDay}
                  onChange={() => handleShiftTypeChange('oneDay')}
                  className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
                />
                <span className="ml-2 text-sm text-gray-700">One-Day</span>
              </label>

              <div className="ml-6 space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftType.morning}
                    onChange={() => handleShiftTypeChange('morning')}
                    className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
                  />
                  <span className="ml-2 text-sm text-gray-700">Morning</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftType.evening}
                    onChange={() => handleShiftTypeChange('evening')}
                    className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
                  />
                  <span className="ml-2 text-sm text-gray-700">Evening</span>
                </label>
              </div>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftType.dayOff}
                  onChange={() => handleShiftTypeChange('dayOff')}
                  className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
                />
                <span className="ml-2 text-sm text-gray-700">Day-Off</span>
              </label>
            </div>
          </div>

          {/* Pump No Column */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Pump No</h3>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pumpNo.all}
                  onChange={() => handlePumpNoChange('all')}
                  className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
                />
                <span className="ml-2 text-sm text-gray-700">All</span>
              </label>
              
              {[1, 2, 3, 4, 5, 6].map(num => (
                <label key={num} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pumpNo[`pump${num}`]}
                    onChange={() => handlePumpNoChange(`pump${num}`)}
                    className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-1"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pump {num}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilter}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};
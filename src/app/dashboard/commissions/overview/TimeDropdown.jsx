'use client'
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TimeDropdown = ({ value, onChange, options = ['This month', 'Last 3 months', 'Last 6 months', 'This year'] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center font-bold gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
      >
        {value}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-blue-600 rounded-md shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-600 font-bold hover:rounded-xl hover:text-white first:rounded-t-md last:rounded-b-md"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeDropdown;

//     'use client'
// import React, { useState } from 'react';
// import { ChevronDown } from 'lucide-react';

// const TimeDropdown = ({ value, onChange, options = ['This month', 'Last month', 'Last 3 months', 'Last 6 months'] }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center font-bold gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
//       >
//         {value}
//         <ChevronDown className="w-4 h-4 text-gray-500" />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-blue-600 rounded-md shadow-lg z-10">
//           {options.map((option) => (
//             <button
//               key={option}
//               onClick={() => {
//                 onChange(option);
//                 setIsOpen(false);
//               }}
//               className="w-full px-3 py-2 text-left text-sm hover:bg-blue-600 font-bold hover:rounded-xl hover:text-white first:rounded-t-md last:rounded-b-md"
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TimeDropdown;

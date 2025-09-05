// import React from 'react';
// import { GoChevronRight, GoChevronLeft  } from "react-icons/go";


// export default function Pagination({
//   currentPage,
//   totalPages,
//   totalItems,
//   onPageChange,
//   className = "",
//   showItemCount = true,
//   itemsPerPage = 10
// }) {
//   const handlePrev = () => {
//     if (currentPage > 1) {
//       onPageChange(currentPage - 1);
//     }
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) {
//       onPageChange(currentPage + 1);
//     }
//   };

//   const startItem = (currentPage - 1) * itemsPerPage + 1;
//   const endItem = Math.min(currentPage * itemsPerPage, totalItems);

//   if (totalPages <= 1) return null; 

//   return (
//     <div className={`flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 gap-3 ${className}`}>
//       {showItemCount && (
//         <p className="text-center sm:text-left text-xs sm:text-sm">pg
//          <span className='text-[#1a71f6] font-semibold'> {currentPage} </span> - {totalPages}  of {totalItems} items
//         </p>
//       )}
      
//       <div className="flex gap-2">
//         <button
//           onClick={handlePrev}
//           className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
//           disabled={currentPage === 1}
//           aria-label="Previous page"
//         >
//           <GoChevronLeft size={20} />
//         </button>
        
//         <button
//           onClick={handleNext}
//           className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 text-xs sm:text-sm"
//           disabled={currentPage === totalPages}
//           aria-label="Next page"
//         >
//           <GoChevronRight size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };




import React from 'react';
import { GoChevronRight, GoChevronLeft } from "react-icons/go";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange = () => {},
  className = "",
  showItemCount = true,
  itemsPerPage = 10
}) {
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 gap-3 ${className}`}>
      {showItemCount && (
        <p className="text-center sm:text-left text-xs sm:text-sm">
          Showing{' '}
          <span className='text-[#1a71f6] font-semibold'>{startItem}</span>
          {' '}-{' '}
          <span className='text-[#1a71f6] font-semibold'>{endItem}</span>
          {' '}of{' '}
          <span className='text-[#1a71f6] font-semibold'>{totalItems}</span>
          {' '}items
        </p>
      )}
      
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <GoChevronLeft size={20} />
          </button>
          
          <button
            onClick={handleNext}
            className="px-2 py-1 border-[1.5px] border-neutral-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors"
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <GoChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
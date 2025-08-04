import React from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null; 

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 gap-3 ${className}`}>
      {showItemCount && (
        <p className="text-center sm:text-left text-xs sm:text-sm">
          Showing <span className='text-[#1a71f6] font-semibold'>{startItem}</span> - {endItem} of {totalItems} items
        </p>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors"
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          &lt;
        </button>
        
        <button
          onClick={handleNext}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors"
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};






// 'use client'
// import React, { useState } from "react";
// import { IoIosSearch } from "react-icons/io";
// import { BsPrinter } from "react-icons/bs";
// import { Plus } from "lucide-react";
// import Link from "next/link";
// import Modal from "./reusefilter/Modal";
// import { useLubricantStore } from "@/store/lubricantStore";

// const SalesHeader = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const { searchLubricants } = useLubricantStore();

  
//   // handle clicking the search icon
//   // const handleSearch = async () => {
//     //   if (!searchTerm.trim()) return;
//     //   try {
//       //     await fetchLubricants(searchTerm.trim());
//       //   } catch (error) {
//         //     console.error("Error fetching lubricant:", error);
//         //   }
//         // };
        
//   const handleSearch = async () => {
//   if (!searchTerm.trim()) return;

//   try {
//     const results = await searchLubricants(searchTerm.trim());
//     console.log("Search results:", results);
//     // Optionally set a local state to show results immediately
//     // setFilteredLubricants(results)
//   } catch (err) {
//     console.error("Error fetching search results:", err);
//   }
// };

// // handle pressing Enter key
// const handleKeyDown = (e) => {
//   if (e.key === "Enter" && searchTerm.trim()) {
//     e.preventDefault(); // prevent form reload
//     handleSearch();
//   }
// };

// return (
//     <div className="w-full">
//       <div className="bg-white w-full h-fit rounded-md p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-3">
//         {/* Search Form */}
//         <form
//           className="flex flex-col gap-4 md:flex-row md:items-center"
//           onSubmit={(e) => e.preventDefault()}
//         >
//           {/* Date Input */}
//           <input
//             type="date"
//             className="border p-2 rounded-md text-purple-500 font-semibold w-full md:w-auto"
//           />

//           {/* Search Input */}
//           <div className="flex relative w-full md:w-[400px]">
//             <input
//               type="text"
//               placeholder="Search by product name or barcode"
//               className="py-2 pl-3 pr-10 outline-none focus:border-[#FF9D29] w-full border-[1.5px] border-neutral-300 rounded-lg"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <IoIosSearch
//               className="absolute text-[#FF9D29] top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
//               size={24}
//               onClick={handleSearch}
//             />
//           </div>
//         </form>

//         {/* Buttons */}
//         <div className="flex gap-4">
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="bg-[#0080FF] flex gap-2 w-full md:w-auto px-4 py-2 text-white font-semibold hover:bg-blue-700 rounded-lg"
//           >
//             Reprint
//             <BsPrinter size={24} />
//           </button>

//           <button className="border-2 border-[#0080FF] flex gap-2 w-full md:w-auto px-4 py-2 text-[#0080ff] font-semibold hover:bg-blue-700 rounded-lg">
//             Add Stock
//             <Plus size={24} />
//           </button>
//         </div>

//         {/* Modal */}
//         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
//       </div>
//     </div>
//   );
// };

// export default SalesHeader;



'use client';
import React, { useState, useEffect, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { BsPrinter } from "react-icons/bs";
import { Plus } from "lucide-react";
import Link from "next/link";
import Modal from "./reusefilter/Modal";
import { useLubricantStore } from "@/store/lubricantStore";

const SalesHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const { searchLubricants } = useLubricantStore();

  // handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const filtered = await searchLubricants(searchTerm.trim());
    setResults(filtered);
    setShowDropdown(true);
  };

  // handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // hide dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white w-full h-fit rounded-md p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-3">
        {/* Search Form */}
        <form
          className="flex flex-col gap-4 md:flex-row md:items-center relative"
          onSubmit={(e) => e.preventDefault()}
          ref={inputRef}
        >
          {/* Date Input */}
          <input
            type="date"
            className="border p-2 rounded-md text-purple-500 font-semibold w-full md:w-auto"
          />

          {/* Search Input */}
          <div className="flex relative w-full md:w-[400px]">
            <input
              type="text"
              placeholder="Search by product name or barcode"
              className="py-2 pl-3 pr-10 outline-none focus:border-[#FF9D29] w-full border-[1.5px] border-neutral-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchTerm && setShowDropdown(true)}
            />
            <IoIosSearch
              className="absolute text-[#FF9D29] top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
              size={24}
              onClick={handleSearch}
            />

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                {results.map((item) => (
                  <li
                    key={item._id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchTerm(item.productName);
                      setShowDropdown(false);
                    }}
                  >
                    {item.productName} - {item.barcode}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0080FF] flex gap-2 w-full md:w-auto px-4 py-2 text-white font-semibold hover:bg-blue-700 rounded-lg"
          >
            Reprint
            <BsPrinter size={24} />
          </button>

          <button className="border-2 border-[#0080FF] flex gap-2 w-full md:w-auto px-4 py-2 text-[#0080ff] font-semibold hover:bg-blue-700 rounded-lg">
            Add Stock
            <Plus size={24} />
          </button>
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
};

export default SalesHeader;

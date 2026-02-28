import React from "react";
import Image from "next/image";
import { ArrowDownToLine, ListFilter } from "lucide-react";

const SearchBarButtons = ({ searchValue, onSearchChange, onExport }) => {
  return (
    <div className="flex justify-end items-center gap-4">
      {/* SEARCH */}
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by station name or owner"
          className="w-[350px] py-2 rounded-lg pl-10 border-[2px] font-semibold
                     text-neutral-600 focus:border-blue-600 outline-none
                     border-[#E5E5E5]"
        />

        <Image
          src="/mystery.png"
          height={20}
          width={20}
          alt="search"
          className="absolute top-3 left-3"
        />
      </div>

      {/* FILTERS + EXPORT */}
      <div className="flex gap-3">
        <div className="flex gap-3">
          <select className="py-2 px-3 rounded-md font-semibold border-[2px]
                             border-neutral-300 focus:border-blue-600">
            <option value="">All Status</option>
            <option>Active</option>
            <option>Maintenance</option>
            <option>Suspended</option>
          </select>

          <button className="py-2 px-3 rounded-md font-semibold border-[2px]
                             border-neutral-300 focus:border-blue-600 flex gap-3 ">
            <ListFilter size={24} />
            Filter
          </button>
         
        </div>

        <button
          onClick={onExport}
          className="bg-[#0080FF] hover:bg-blue-900 text-white
                     font-semibold px-4 py-2 rounded-lg flex gap-3 items-center"
        >
          <ArrowDownToLine size={22} />
          Export
        </button>
      </div>
    </div>
  );
};

export default SearchBarButtons;




// import React from "react";
// import Image from "next/image";
// import { ArrowDownToLine } from "lucide-react";

// const SearchBarButtons = () => {
//   return (
//     <div className="flex justify-end items-center gap-4 ">
//       <div className="relative">
//         <input
//           type="text"
//           placeholder="Search by station name or owner"
//           className="w-[350px] py-2 rounded-lg pl-10 border-[2px] font-semibold text-neutral-600 focus:border-blue-600 outline-none border-[#E5E5E5]"
//         />

//         <Image src="/mystery.png" height={24} width={24} alt="search" className="absolute top-3 left-3" />
//       </div>

//       <div className="flex gap-3">
//             <form action="" className="flex gap-3" >
//                 <select name="status" className="py-2 px-3 rounded-md font-semibold border-[2px] border-neutral-300 focus:border-blue-600 ">
//                     <option value="">All Status</option>
//                     <option value="">Active</option>
//                     <option value="">Pending</option>
//                     <option value="">Failed</option>
//                 </select>
//                 <select name="Duration" className="py-2 px-3 rounded-md font-semibold border-[2px] border-neutral-300 focus:border-blue-600 ">
//                     <option value="">Duration</option>
//                     <option value="">Monthly</option>
//                     <option value="">Weekly</option>
//                     <option value="">Annually</option>
//                 </select>
//             </form> 

//             <button className="bg-[#0080FF] cursor-pointer hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded-lg flex gap-3 items-center justify-center">
//                 <ArrowDownToLine size={24} />
//                 Export
//             </button>

//       </div>
//     </div>
//   );
// };

// export default SearchBarButtons;

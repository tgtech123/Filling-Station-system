"use client";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Eye, Play } from "lucide-react";
import { RiDeleteBinLine } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ActionModal from "./stations/ActionModal";
import ActivateActionModal from "./stations/ActivateActionModal";

/* 🔹 Helpers for styling */
const statusStyles = {
  Active: "text-green-700 bg-green-100",
  Maintenance: "text-orange-700 bg-orange-100",
  Suspended: "text-red-700 bg-red-100",
};

const planStyles = {
  Prime: "text-blue-700 bg-blue-100",
  Plus: "text-blue-700 bg-blue-100",
  Basic: "text-blue-700 bg-blue-100",
};

export default function DataTable({ headers, rows, onActionClick }) {
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const menuRefs = useRef({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false)
  const [selectedRowForActivate, setSelectedRowForActivate] = useState(null)

  useEffect(()=> {
    const handleClickOutside = (e) => {
      if(openRowIndex !==null && menuRefs.current && !menuRefs.current.contains(e.target)){
        setOpenRowIndex(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openRowIndex])

const handleViewStation = (row) =>{
  setSelectedRow(row)
  setIsModalOpen(true)
  setOpenRowIndex(null)
}

const handleActivateStation = (row) => {
  setSelectedRowForActivate(row)
  setIsActivateModalOpen(true)
  setOpenRowIndex(null)
}

const handleCloseModal = () =>{
  setIsModalOpen(false)
  setSelectedRow(null)
}

const handleCloseActivateModal = () => {
  setIsActivateModalOpen(false)
  setSelectedRowForActivate(null)
}

  return (
    <div className="overflow-x-auto bg-white rounded-lg">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-600"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {headers.map((header) => {
                const value = row[header.key];

                if (header.key === "action") {
                  return (
                    <td key={header.key} className="px-6 py-4 text-center">
                      <div   className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenRowIndex(
                              openRowIndex === rowIndex ? null : rowIndex,
                            )
                          }
                          className="flex items-center justify-center w-10 h-10
                            rounded-full hover:bg-gray-100 transition"
                        >
                          <EllipsisHorizontalIcon className="w-7 h-7 text-gray-700" />
                        </button>

                        {/* 🔽 ACTION MENU */}
                        {openRowIndex === rowIndex && (
                          <div
                          ref={menuRefs}
                            className="absolute right-0 mt-2 p-5 w-[17.5rem] h-auto bg-white border
                                  rounded-lg shadow-lg z-50 text-left"
                          >
                            <h1 className="text-[1rem] font-semibold leading-[1.235rem] text-[#212121]">
                              Actions
                            </h1>
                            <hr className="my-2 h-px w-full border-gray-300 mt-4 " />

                            <div className="flex flex-col items-start gap-3 text-neutral-500 font-medium mt-[1rem]">
                              <button
                                onClick={() => handleViewStation(row)}
                                className="menu-item cursor-pointer flex gap-2 "
                              >
                                <Eye size={24} />
                                View Station
                              </button>
                              <hr className="my-1 h-px w-full border-gray-300 " />
                            </div>

                            <button
                              onClick={() => handleActivateStation(row)}
                              className="menu-item flex gap-2 text-neutral-500 cursor-pointer font-medium mt-[1rem]"
                            >
                              <Play size={24}/>
                              Activate Station
                            </button>
                            <hr className="my-2 w-full border-gray-300 mt-[1rem] " />

                            <button
                              onClick={() => onActionClick("reset", row)}
                              className="menu-item flex gap-2 text-neutral-500 cursor-pointer font-medium mt-[1rem]"
                            >
                              <Image src="/reset-password.png" height={20} width={23} alt="reset" />
                              Reset Owner Password
                            </button>
                            <hr className="my-2 w-full border-gray-300 mt-[1rem]" />

                            <button
                              onClick={() => onActionClick("delete", row)}
                              className="menu-item flex gap-2 text-red-600 cursor-pointer font-medium mt-[1rem] "
                            >
                              <RiDeleteBinLine size={24}  />
                              Delete Station
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                } /* 🔵 PLAN COLUMN */
                if (header.key === "plan") {
                  return (
                    <td key={header.key} className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-bold
                          ${planStyles[value] || "text-gray-700 bg-gray-100"}`}
                      >
                        {value}
                      </span>
                    </td>
                  );
                }
                if (header.key === "status") {
                  return (
                    <td key={header.key} className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full font-bold text-sm ${statusStyles[value] || "text-gray-600 bg-gray-100"}`}
                      >
                        {value}
                      </span>
                    </td>
                  );
                }
                /* 🧾 DEFAULT CELL */
                return (
                  <td
                    key={header.key}
                    className="px-6 py-4 text-sm text-gray-700"
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ActionModal isOpen={isModalOpen} onClose={handleCloseModal} data={selectedRow} />
      <ActivateActionModal isOpen={isActivateModalOpen} onClose={handleCloseActivateModal} />
    </div>
  );
}

// "use client";
// import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
// import { Eye, Play } from "lucide-react";
// import { RiDeleteBinLine } from "react-icons/ri";
// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import ActionModal from "./stations/ActionModal";

// /* 🔹 Helpers for styling */
// const statusStyles = {
//   Active: "text-green-700 bg-green-100",
//   Maintenance: "text-orange-700 bg-orange-100",
//   Suspended: "text-red-700 bg-red-100",
// };

// const planStyles = {
//   Prime: "text-blue-700 bg-blue-100",
//   Plus: "text-blue-700 bg-blue-100",
//   Basic: "text-blue-700 bg-blue-100",
// };

// export default function DataTable({ headers, rows, onActionClick }) {
//   const [openRowIndex, setOpenRowIndex] = useState(null);
//   const menuRefs = useRef({})
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [selectedRow, setSelectedRow] = useState(null)
//   const [modalOpen, setModalOpen] = useState(false)
//   const [selectedRowTwo, setSelectedRowTwo] = useState(null)

//   useEffect(()=> {
//     const handleClickOutside = (e) => {
//       if(openRowIndex !==null && menuRefs.current && !menuRefs.current.contains(e.target)){
//         setOpenRowIndex(null)
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside)
//   }, [openRowIndex])

// const handleViewStation = (row) =>{
//   setSelectedRow(row)
//   setIsModalOpen(true)
//   setOpenRowIndex(null)
// }

// const handleCloseModal = () =>{
//   setIsModalOpen(false)
//   setSelectedRow(null)
// }

//   return (
//     <div className="overflow-x-auto bg-white rounded-lg">
//       <table className="min-w-full border-collapse">
//         <thead className="bg-gray-50">
//           <tr>
//             {headers.map((header) => (
//               <th
//                 key={header.key}
//                 className="px-6 py-3 text-left text-sm font-semibold text-gray-600"
//               >
//                 {header.label}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody className="divide-y">
//           {rows.map((row, rowIndex) => (
//             <tr key={rowIndex} className="hover:bg-gray-50">
//               {headers.map((header) => {
//                 const value = row[header.key];

//                 if (header.key === "action") {
//                   return (
//                     <td key={header.key} className="px-6 py-4 text-center">
//                       <div   className="relative inline-block">
//                         <button
//                           onClick={() =>
//                             setOpenRowIndex(
//                               openRowIndex === rowIndex ? null : rowIndex,
//                             )
//                           }
//                           className="flex items-center justify-center w-10 h-10
//                             rounded-full hover:bg-gray-100 transition"
//                         >
//                           <EllipsisHorizontalIcon className="w-7 h-7 text-gray-700" />
//                         </button>

//                         {/* 🔽 ACTION MENU */}
//                         {openRowIndex === rowIndex && (
//                           <div
//                           ref={menuRefs}
//                             className="absolute right-0 mt-2 p-5 w-[17.5rem] h-auto bg-white border
//                                   rounded-lg shadow-lg z-50 text-left"
//                           >
//                             <h1 className="text-[1rem] font-semibold leading-[1.235rem] text-[#212121]">
//                               Actions
//                             </h1>
//                             <hr className="my-2 h-px w-full border-gray-300 mt-4 " />

//                             <div className="flex flex-col items-start gap-3 text-neutral-500 font-medium mt-[1rem]">
//                               <button
//                                 onClick={() => handleViewStation(row)}
//                                 className="menu-item cursor-pointer flex gap-2 "
//                               >
//                                 <Eye size={24} />
//                                 View Station
//                               </button>
//                               <hr className="my-1 h-px w-full border-gray-300 " />
//                             </div>

//                             <button
//                               onClick={() => onActionClick("activate", row)}
//                               className="menu-item flex gap-2 text-neutral-500 cursor-pointer font-medium mt-[1rem]"
//                             >
//                               <Play size={24}/>
//                               Activate Station
//                             </button>
//                             <hr className="my-2 w-full border-gray-300 mt-[1rem] " />

//                             <button
//                               onClick={() => onActionClick("reset", row)}
//                               className="menu-item flex gap-2 text-neutral-500 cursor-pointer font-medium mt-[1rem]"
//                             >
//                               <Image src="/reset-password.png" height={20} width={23} alt="reset" />
//                               Reset Owner Password
//                             </button>
//                             <hr className="my-2 w-full border-gray-300 mt-[1rem]" />

//                             <button
//                               onClick={() => onActionClick("delete", row)}
//                               className="menu-item flex gap-2 text-red-600 cursor-pointer font-medium mt-[1rem] "
//                             >
//                               <RiDeleteBinLine size={24}  />
//                               Delete Station
//                             </button>
//                             {/* <hr className="my-2 w-full border-gray-300 mt-[1rem] " /> */}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                   );
//                 } /* 🔵 PLAN COLUMN */
//                 if (header.key === "plan") {
//                   return (
//                     <td key={header.key} className="px-6 py-4">
//                       <span
//                         className={`inline-flex px-3 py-1 rounded-full text-sm font-bold
//                           ${planStyles[value] || "text-gray-700 bg-gray-100"}`}
//                       >
//                         {value}
//                       </span>
//                     </td>
//                   );
//                 }
//                 if (header.key === "status") {
//                   return (
//                     <td key={header.key} className="px-6 py-4">
//                       <span
//                         className={`inline-flex px-3 py-1 rounded-full font-bold text-sm ${statusStyles[value] || "text-gray-600 bg-gray-100"}`}
//                       >
//                         {value}
//                       </span>
//                     </td>
//                   );
//                 }
//                 /* 🧾 DEFAULT CELL */
//                 return (
//                   <td
//                     key={header.key}
//                     className="px-6 py-4 text-sm text-gray-700"
//                   >
//                     {value}
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <ActionModal isOpen={isModalOpen} onClose={handleCloseModal} data={selectedRow} />
//     </div>
//   );
// }

// const planStyles = {
//   Basic: "bg-gray-100 text-blue-600",
//   Plus: "bg-gray-100 text-blue-600",
//   Prime: "bg-gray-100 text-blue-600",
// };

// const statusStyles = {
//   Active: "bg-green-100 text-green-700",
//   Maintenance: "bg-orange-100 text-orange-700",
//   Suspended: "bg-red-100 text-red-700",
// };

// export default function DataTable({ headers, rows }) {
//   return (
//     <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
//       <table className="w-full text-left">
//         <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-500">
//           <tr>
//             {headers.map((header) => (
//               <th key={header.key} className="px-6 py-4">
//                 {header.label}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {rows.map((row, rowIndex) => (
//             <tr
//               key={rowIndex}
//               className="border-t border-gray-100 text-sm text-gray-600"
//             >
//               {headers.map((header) => {
//                 const value = row[header.key];

//                 if (header.key === "plan") {
//                   return (
//                     <td key={header.key} className="px-6 py-4">
//                       <span
//                         className={`rounded-full px-3 py-1 text-xs font-medium ${planStyles[value]}`}
//                       >
//                         {value}
//                       </span>
//                     </td>
//                   );
//                 }

//                 if (header.key === "status") {
//                   return (
//                     <td key={header.key} className="px-6 py-4">
//                       <span
//                         className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[value]}`}
//                       >
//                         {value}
//                       </span>
//                     </td>
//                   );
//                 }

//                 return (
//                   <td key={header.key} className="px-6 py-4">
//                     {value}
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

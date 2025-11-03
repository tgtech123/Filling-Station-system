"use client";

import { Mail, Phone, Clock, Trash2, Edit2 } from "lucide-react";
import { TbCurrencyNaira } from "react-icons/tb";
import { useState } from "react";

import SalesTargetCard from "./SalesTargetCard";
import TerminateStaffModal from "@/app/dashboard/staffManagement/TerminateStaffModal";
import EditStaffModal from "@/app/dashboard/staffManagement/EditStaffModal";
import useStaffStore from "@/store/useStaffStore";

export default function EmployeeCard({
  name,
  role,
  dutyStatus,
  shift,
  phone,
  email,
  earnings,
  salesTarget,
  responsibilities,
  onEdit,
  onDelete,
  onToggleDuty,
  staff,
  userToken,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  

  return (
    <>
      <div className="bg-white text-neutral-800 rounded-2xl p-4 w-auto max-w-sm border-[1.5px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            <span className="bg-[#D9D9D9] h-10 w-10 rounded-full"></span>
            <div>
              <h2 className="font-semibold text-lg">{name}</h2>
              <p className="text-gray-500 text-sm">{role}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                dutyStatus
                  ? "bg-[#B2FFB4] text-[#04910C] font-semibold"
                  : "bg-neutral-200 font-semibold text-neutral-400"
              }`}
            >
              {dutyStatus ? "On Duty" : "Off Duty"}
            </span>
            {/* Simple toggle button */}
            <button
              onClick={onToggleDuty}
              className={`w-11 h-5 flex items-center rounded-full p-1 transition ${
                dutyStatus ? "bg-[#1154D4]" : "bg-[#D0D5DD]"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  dutyStatus ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <hr className="px-2 py-3" />

        {/* Info */}
        <div className="text-sm space-y-2">
          <p className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" /> {shift}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" /> {phone}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" /> {email}
          </p>
          <p className="text-gray-600 flex items-center gap">
            <span>
              <TbCurrencyNaira size={22} />
            </span>
            <span className="font-medium">Monthly earnings:</span> {earnings}
          </p>
        </div>

        {/* Sales Target (reused component) */}
        {salesTarget && (
          <div className="">
            <SalesTargetCard
              current={salesTarget.current}
              target={salesTarget.total}
              currency="₦"
            />
          </div>
        )}

        {/* Responsibilities */}
        <div className="">
          <h3 className="font-semibold text-gray-700 text-md mb-1">
            Responsibilities
          </h3>
          <p className="text-[12px]">{responsibilities}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2 mt-4">
          <button
            onClick={() => {
              console.log("Edit clicked, staff data:", staff); // Debug log
              setIsOpen(true);
            }}
            className="flex font-semibold justify-center items-center w-full gap-1 px-3 py-1 rounded-xl bg-[#0080FF] text-white hover:bg-blue-700"
          >
            Edit
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full border-[1.5px] border-neutral-700 bg-transparent text-neutral-700 hover:bg-red-600 hover:text-white hover:border-white"
          >
            <Trash2 className="w-4 h-8" />
          </button>
        </div>
      </div>

      {/* Modals - Only render when open */}
      {isOpen && (
        <EditStaffModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          staffData={staff}
          token={userToken}
        />
      )}

      {isModalOpen && (
        <TerminateStaffModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          staffId={staff?._id}
          deleteStaff={onDelete}
          token={userToken}
          staffName={`${staff.firstName} ${staff.lastName}`}
        />
      )}
    </>
  );
}

// "use client";

// import { Mail, Phone, Clock, Trash2, Edit2 } from "lucide-react";
// import { TbCurrencyNaira } from "react-icons/tb";

// import SalesTargetCard from "./SalesTargetCard"; // import the separate component
// import { useState } from "react";
// import TerminateStaffModal from "@/app/dashboard/staffManagement/TerminateStaffModal";
// import EditStaffModal from "@/app/dashboard/staffManagement/EditStaffModal";

// export default function EmployeeCard({
//   name,
//   role,
//   dutyStatus,
//   shift,
//   phone,
//   email,
//   earnings,
//   salesTarget,
//   responsibilities,
//   onEdit,
//   onDelete,
//   onToggleDuty,
//   staff,
//   userToken,
// }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className=" bg-white text-neutral-800 rounded-2xl p-4 w-auto max-w-sm border-[1.5px]">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex gap-1">
//           <span className="bg-[#D9D9D9] h-10 w-10 rounded-full"></span>
//           <div>
//             <h2 className="font-semibold text-lg">{name}</h2>
//             <p className="text-gray-500 text-sm">{role}</p>
//           </div>
//         </div>
//         <div className="flex flex-col items-center gap-2">
//           <span
//             className={`text-xs px-2 py-1 rounded-full ${
//               dutyStatus
//                 ? "bg-[#B2FFB4] text-[#04910C] font-semibold "
//                 : "bg-neutral-200 font-semibold text-neutral-400"
//             }`}
//           >
//             {dutyStatus ? "On Duty" : "Off Duty"}
//           </span>
//           {/* Simple toggle button */}
//           <button
//             onClick={onToggleDuty}
//             className={`w-11 h-5 flex items-center rounded-full p-1 transition ${
//               dutyStatus ? "bg-[#1154D4]" : "bg-[#D0D5DD]"
//             }`}
//           >
//             <div
//               className={`bg-white w-4 h-4 rounded-full shadow-md  transform transition ${
//                 dutyStatus ? "translate-x-5" : "translate-x-0"
//               }`}
//             />
//           </button>
//         </div>
//       </div>

//       <hr className="px-2 py-3" />

//       {/* Info */}
//       <div className="text-sm space-y-2">
//         <p className="flex items-center gap-2 text-gray-600">
//           <Clock className="w-4 h-4" /> {shift}
//         </p>
//         <p className="flex items-center gap-2 text-gray-600">
//           <Phone className="w-4 h-4" /> {phone}
//         </p>
//         <p className="flex items-center gap-2 text-gray-600">
//           <Mail className="w-4 h-4" /> {email}
//         </p>
//         <p className="text-gray-600 flex items-center gap">
//           <span>
//             <TbCurrencyNaira size={22} />
//           </span>
//           <span className="font-medium">Monthly earnings:</span> {earnings}
//         </p>
//       </div>

//       {/* Sales Target (reused component) */}
//       {salesTarget && (
//         <div className="">
//           <SalesTargetCard
//             current={salesTarget.current}
//             target={salesTarget.total}
//             currency="₦"
//           />
//         </div>
//       )}

//       {/* Responsibilities */}
//       <div className="">
//         <h3 className="font-semibold text-gray-700 text-md mb-1">
//           Responsibilities
//         </h3>
//         <p className="text-[12px]">{responsibilities}</p>
//       </div>

//       {/* Actions */}
//       <div className="flex justify-between gap-2 mt-4">
//         <button
//           onClick={() => setIsOpen(true)}
//           className="flex font-semibold justify-center items-center w-full gap-1 px-3 py-1 rounded-xl bg-[#0080FF] text-white hover:bg-blue-700"
//         >
//           Edit
//         </button>
//         <EditStaffModal
//           isOpen={isOpen}
//           onClose={() => setIsOpen(false)}
//           staffData={staff}
//           token={userToken}
//         />

//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="flex items-center gap-1 px-3 py-1 rounded-full border-[1.5px] border-neutral-700 bg-transparent text-neutral-700 hover:bg-red-600 hover:text-white hover:border-white"
//         >
//           <Trash2 className="w-4 h-8" />
//         </button>
//         <TerminateStaffModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//         />
//       </div>
//     </div>
//   );
// }

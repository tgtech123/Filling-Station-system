// "use client";

// import BlueToggleSwitch from "@/components/BlueToggleSwitch";
// import usePumpStore from "@/store/pumpStore";
// import { Check, Fuel, Moon, TrendingUp, Wrench, X } from "lucide-react";
// import { useState, useEffect } from "react";

// export default function PumpControlCard({
//   pumpId,
//   pumpName,
//   productType,
//   status,
//   pricePerLtr,
//   salesToday,
//   ltsSold,
//   lastMaintenance,
// }) {

//   const {deletePump, loading} = usePumpStore()
//   const [enabled, setEnabled] = useState(false);

//   useEffect(() => {
//     if (status === "Active" || status === "Idle" || status === "Maintenance") {
//       setEnabled(true);
//     } else {
//       setEnabled(false);
//     }
//   }, []);

//   // handle delete pump
//   const handleDelete = async () => {
//     if (window.confirm(` Are you sure you want to delete "${pumpName}"?`)) {
//       await deletePump(pumpId);
//       window.alert(`"${pumpName}" deleted successfully `)
//     }
//   };
//   return (
//     <div className="w-full rounded-[12px] p-4 border-1 border-gray-300">
//       <section className="flex justify-between items-start pb-8 border-b-1 border-gray-200">
//         <div className="flex flex-col gap-2">
//           <div className="flex justify-center items-center h-10 w-10 rounded-full bg-[#d9d9d9]">
//             <Fuel size={20} />
//           </div>
//           <h4 className="text-xl font-semibold">{pumpName}</h4>
//           <p>{productType}</p>
//         </div>
//         <div
//           className={`p-2 rounded-[8px] text-sm ${
//             status === "Active"
//               ? "bg-[#b2ffb4] text-[#04910c]"
//               : status === "Inactive"
//               ? "bg-[#b0b0b0] text-gray-500"
//               : status === "Idle"
//               ? "bg-[#dcd2ff] text-[#7f27ff]"
//               : "bg-[#fec6aa] text-[#eb2b0b]"
//           }`}
//         >
//           {status === "Active" ? (
//             <span className="flex gap-1 items-center font-semibold">
//               {status}
//               <Check size={17} />
//             </span>
//           ) : status === "Inactive" ? (
//             <span className="flex gap-1 items-center font-semibold">
//               {status}
//               <X size={17} />
//             </span>
//           ) : status === "Idle" ? (
//             <span className="flex gap-1 items-center font-semibold">
//               {status}
//               <Moon size={17} />
//             </span>
//           ) : (
//             <span className="flex gap-1 items-center font-semibold">
//               {status}
//               <Wrench size={17} />
//             </span>
//           )}
//         </div>
//       </section>

//       <section className="mt-4 flex flex-col gap-2">
//         <div className="flex justify-between items-center">
//           <h4 className="text-sm font-semibold">Online Status</h4>
//           <BlueToggleSwitch enabled={status === "Active" ? true : false} pumpId={pumpId} />
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex gap-2 items-center">
//             <span className="text-xl">₦</span>
//             <p className="text-gray-600 text-sm">Price/Litre</p>
//           </div>
//           <p className="text-sm font-semibold">{pricePerLtr}</p>
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex gap-2 items-center">
//             <span className="text-xl">
//               <TrendingUp size={18} />
//             </span>
//             <p className="text-gray-600 text-sm">Sales Today</p>
//           </div>
//           <p className="text-sm font-semibold">{salesToday}</p>
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex gap-2 items-center">
//             <span className="text-xl">
//               <Fuel size={18} />
//             </span>
//             <p className="text-gray-600 text-sm">Litres Sold</p>
//           </div>
//           <p className="text-sm font-semibold">{ltsSold}</p>
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex gap-2 items-center">
//             <span className="text-xl">
//               <Wrench size={18} />
//             </span>
//             <p className="text-gray-600 text-sm">Last Maintenance</p>
//           </div>
//           <p className="text-sm font-semibold">{lastMaintenance}</p>
//         </div>
//       </section>

//       {/* the update and delete pump card section */}
//       <div className="mt-[1.5rem] flex gap-5">
//         <button disabled={loading} onClick={handleDelete}  className="bg-red-300 px-3 py-1.5 rounded-md text-white font-bold hover:bg-red-700">
//           {loading ? "Deleting..." : "Delete Pump"}
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import BlueToggleSwitch from "@/components/BlueToggleSwitch";
import usePumpStore from "@/store/pumpStore";
import { Check, Fuel, Moon, TrendingUp, Wrench, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function PumpControlCard({
  pumpId,
  pumpName,
  productType,
  status,
  pricePerLtr,
  salesToday,
  ltsSold,
  lastMaintenance,
}) {
  const { deletePump } = usePumpStore(); // remove global loading
  const [enabled, setEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // local loading

  useEffect(() => {
    if (["Active", "Idle", "Maintenance"].includes(status)) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [status]);

  // handle delete pump
  // handle delete pump
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${pumpName}"?`)) {
      setIsDeleting(true);
      await deletePump(pumpId);
      setIsDeleting(false);
      window.alert(`"${pumpName}" deleted successfully`);
    }
  };

  return (
    <div className="w-full rounded-[12px] p-4 border border-gray-300">
      <section className="flex justify-between items-start pb-8 border-b border-gray-200">
        <div className="flex flex-col gap-2">
          <div className="flex justify-center items-center h-10 w-10 rounded-full bg-[#d9d9d9]">
            <Fuel size={20} />
          </div>
          <h4 className="text-xl font-semibold">{pumpName}</h4>
          <p>{productType}</p>
        </div>
        <div
          className={`p-2 rounded-[8px] text-sm ${
            status === "Active"
              ? "bg-[#b2ffb4] text-[#04910c]"
              : status === "Inactive"
              ? "bg-[#b0b0b0] text-gray-500"
              : status === "Idle"
              ? "bg-[#dcd2ff] text-[#7f27ff]"
              : "bg-[#fec6aa] text-[#eb2b0b]"
          }`}
        >
          {status === "Active" ? (
            <span className="flex gap-1 items-center font-semibold">
              {status}
              <Check size={17} />
            </span>
          ) : status === "Inactive" ? (
            <span className="flex gap-1 items-center font-semibold">
              {status}
              <X size={17} />
            </span>
          ) : status === "Idle" ? (
            <span className="flex gap-1 items-center font-semibold">
              {status}
              <Moon size={17} />
            </span>
          ) : (
            <span className="flex gap-1 items-center font-semibold">
              {status}
              <Wrench size={17} />
            </span>
          )}
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-semibold">Online Status</h4>
          <BlueToggleSwitch
            enabled={status === "Active"}
            pumpId={pumpId}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <span className="text-xl">₦</span>
            <p className="text-gray-600 text-sm">Price/Litre</p>
          </div>
          <p className="text-sm font-semibold">{pricePerLtr}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <TrendingUp size={18} />
            <p className="text-gray-600 text-sm">Sales Today</p>
          </div>
          <p className="text-sm font-semibold">{salesToday}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Fuel size={18} />
            <p className="text-gray-600 text-sm">Litres Sold</p>
          </div>
          <p className="text-sm font-semibold">{ltsSold}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Wrench size={18} />
            <p className="text-gray-600 text-sm">Last Maintenance</p>
          </div>
          <p className="text-sm font-semibold">{lastMaintenance}</p>
        </div>
      </section>

      {/* 🧹 update and delete pump card section */}
      <div className="mt-[1.5rem] flex gap-5">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`px-3 py-1.5 rounded-md text-white font-bold ${
            isDeleting
              ? "bg-red-200 cursor-not-allowed"
              : "bg-red-200 hover:bg-red-700"
          }`}
        >
          {isDeleting ? "Deleting..." : "Delete Pump"}
        </button>
      </div>
    </div>
  );
}


// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import Table from "@/components/Table";
// import {
//   ChevronDown,
//   Download,
//   Eye,
//   ListFilter,
//   Search,
//   X,
// } from "lucide-react";
// import { lubricantTrackerColumns, lubricantTrackerData } from "./lubricantData";

// export default function LubricantTracker({ onclose }) {
//   return (
//     <div className="fixed px-4 lg:px-0 inset-0  z-50 flex items-center justify-center bg-black/50">
//       {/* modal box */}
//       <div className="bg-[#f6f6f6] border-2 rounded-lg w-full max-w-[400px] lg:max-w-[1000px] p-3 lg:p-6 max-h-[80vh] scrollbar-hide overflow-y-auto">
//         <div className="mb-4 flex justify-end cursor-pointer">
//           <X onClick={onclose} />
//         </div>
//         <header className="mb-8">
//           <h2 className="font-semibold text-2xl"> Lubricant Tracker</h2>
//           <p>Track lubricant purchases and records</p>
//         </header>

//         <DisplayCard>
//           <div className="flex flex-col gap-4 lg:flex-row justify-between items-center">
//             <div className="relative w-full lg:w-1/2">
//               <input
//                 type="text"
//                 className="w-full border-2 border-gray-300 p-2 rounded-xl"
//               />
//               <Search className="absolute top-2 right-3" />
//             </div>

//             <div className="flex gap-4">
//               <button className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300">
//                 Duration
//                 <ChevronDown />
//               </button>
//               <button className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300">
//                 Filter
//                 <ListFilter />
//               </button>
//               <button className="flex gap-2 items-center p-2 rounded-[10px] bg-[#0080ff] text-white">
//                 Export
//                 <Download />
//               </button>
//             </div>
//           </div>

//           <Table
//             columns={lubricantTrackerColumns}
//             data={lubricantTrackerData}
//             renderActions={(row) => (
//               <div className="flex gap-6">
//                 <button
//                   onClick={() => console.log("Preview", row)}
//                   className="text-gray-500"
//                 >
//                   <Eye size={18} />
//                 </button>
//                 <button
//                   onClick={() => console.log("Export", row)}
//                   className="text-orange-500"
//                 >
//                   <Download size={18} />
//                 </button>
//               </div>
//             )}
//           />
//         </DisplayCard>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination"; // import your pagination
import {
  ChevronDown,
  Download,
  Eye,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import {
  lubricantTrackerColumns,
  lubricantTrackerData,
} from "./lubricantData";
import InvoiceModal from "./InvoiceModal";

export default function LubricantTracker({ onclose }) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  // total pages
  const totalPages = Math.ceil(lubricantTrackerData.length / itemsPerPage);

  // slice data for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = lubricantTrackerData.slice(startIndex, endIndex);


  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-[#f6f6f6] border-2 rounded-lg w-full max-w-[400px] lg:max-w-[1000px] p-3 lg:p-6 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mb-4 flex justify-end cursor-pointer">
          <X onClick={onclose} />
        </div>
        <header className="mb-8">
          <h2 className="font-semibold text-2xl">Lubricant Tracker</h2>
          <p>Track lubricant purchases and records</p>
        </header>

        <DisplayCard>
          <div className="flex flex-col gap-4 lg:flex-row justify-between items-center">
            <div className="relative w-full lg:w-1/2">
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-xl"
                placeholder="Search..."
              />
              <Search className="absolute top-2 right-3" />
            </div>

            <div className="flex gap-4">
              <button className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300">
                Duration
                <ChevronDown />
              </button>
              <button className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300">
                Filter
                <ListFilter />
              </button>
              <button className="flex gap-2 items-center p-2 rounded-[10px] bg-[#0080ff] text-white">
                Export
                <Download />
              </button>
            </div>
          </div>

          {/* Pass paginated data here */}
          <Table
            columns={lubricantTrackerColumns}
            data={currentData}
            renderActions={(row) => (
              <div className="flex gap-6">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="text-gray-500"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => console.log("Export", row)}
                  className="text-orange-500"
                >
                  <Download size={18} />
                </button>
              </div>
            )}
          />

          {/* Pagination below table */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={lubricantTrackerData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            className="mt-6"
          />
        </DisplayCard>
      </div>

      {showInvoiceModal && (
        <InvoiceModal onClose={() => setShowInvoiceModal(false)} />
      )}
    </div>
  );
}

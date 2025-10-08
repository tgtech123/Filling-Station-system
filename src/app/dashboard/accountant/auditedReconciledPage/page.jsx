// "use client";
// import { AlertTriangle, Eye, Check, Search, ChevronDown, ListFilter, Download } from "lucide-react";

// import DashboardLayout from "@/components/Dashboard/DashboardLayout";
// import { useState, useMemo } from "react";
// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import AuditModal from "../AuditModal";
// import Pagination from "@/components/Pagination";

// export default function AuditedReconciledPage() {
//   const salesData = [
//     {
//       date: "04/17/23",
//       attendant: "John Dave",
//       shiftType: "Morning",
//       pumpNo: 1,
//       litres: 30,
//       amount: "123,000,000",
//       cashReceived: "120,000,000",
//       discrepancy: -3000,
//       status: "Flagged",
//     },
//     {
//       date: "04/17/23",
//       attendant: "John Dave",
//       shiftType: "Morning",
//       pumpNo: 2,
//       litres: 40,
//       amount: "110,000,000",
//       cashReceived: "110,000,000",
//       discrepancy: 0,
//       status: "Matched",
//     },
//     {
//       date: "04/18/23",
//       attendant: "Jane Doe",
//       shiftType: "Afternoon",
//       pumpNo: 3,
//       litres: 25,
//       amount: "100,000,000",
//       cashReceived: "99,000,000",
//       discrepancy: -1000,
//       status: "Flagged",
//     },
//     {
//       date: "04/17/23",
//       attendant: "John Dave",
//       shiftType: "Morning",
//       pumpNo: 1,
//       litres: 30,
//       amount: "123,000,000",
//       cashReceived: "120,000,000",
//       discrepancy: -3000,
//       status: "Flagged",
//     },
//     {
//       date: "04/17/23",
//       attendant: "John Dave",
//       shiftType: "Morning",
//       pumpNo: 2,
//       litres: 40,
//       amount: "110,000,000",
//       cashReceived: "110,000,000",
//       discrepancy: 0,
//       status: "Matched",
//     },
//     {
//       date: "04/18/23",
//       attendant: "Jane Doe",
//       shiftType: "Afternoon",
//       pumpNo: 3,
//       litres: 25,
//       amount: "100,000,000",
//       cashReceived: "99,000,000",
//       discrepancy: -1000,
//       status: "Flagged",
//     },
//     {
//       date: "04/17/23",
//       attendant: "John Dave",
//       shiftType: "Morning",
//       pumpNo: 1,
//       litres: 30,
//       amount: "123,000,000",
//       cashReceived: "120,000,000",
//       discrepancy: -3000,
//       status: "Flagged",
//     },
//     {
//       date: "04/17/23",
//       attendant: "John Dave",
//       shiftType: "Morning",
//       pumpNo: 2,
//       litres: 40,
//       amount: "110,000,000",
//       cashReceived: "110,000,000",
//       discrepancy: 0,
//       status: "Matched",
//     },
//     {
//       date: "04/18/23",
//       attendant: "Jane Doe",
//       shiftType: "Afternoon",
//       pumpNo: 3,
//       litres: 25,
//       amount: "100,000,000",
//       cashReceived: "99,000,000",
//       discrepancy: -1000,
//       status: "Flagged",
//     },
//   ];

//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [auditedRecords, setAuditedRecords] = useState({});

//     const [openDurationModal, setOpenDurationModal] = useState(false);
//     const [openFilter, setOpenFilter] = useState(false);
  
//     // Pagination state
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(10);
  
//     // Search state
//     const [searchTerm, setSearchTerm] = useState("");
  
//     // Filter data based on search term
//     const filteredData = useMemo(() => {
//       if (!searchTerm) return salesData;
  
//       return salesData.filter(
//         (item) =>
//           item[1]?.toLowerCase().includes(searchTerm.toLowerCase()) || // Attendant
//           item[3]?.toLowerCase().includes(searchTerm.toLowerCase())    // Product
//       );
//     }, [searchTerm]);
  
//     // Pagination values
//     const totalItems = filteredData.length;
//     const totalPages = Math.ceil(totalItems / itemsPerPage);
  
//     // Current page data
//     const currentData = useMemo(() => {
//       const startIndex = (currentPage - 1) * itemsPerPage;
//       const endIndex = startIndex + itemsPerPage;
//       return filteredData.slice(startIndex, endIndex);
//     }, [filteredData, currentPage, itemsPerPage]);
  
//     // Convert object data into arrays for the Table component
  
  
//     // Handle page change
//     const handlePageChange = (newPage) => {
//       setCurrentPage(newPage);
//     };
  
//     // Handle search
//     const handleSearchChange = (e) => {
//       setSearchTerm(e.target.value);
//       setCurrentPage(1); // Reset to first page when searching
//     };
  

//   const handleView = (record, index) => {
//     setSelectedRecord({ ...record, index });
//     setIsModalOpen(true);
//   };

//   const handleAudit = () => {
//     setAuditedRecords((prev) => ({
//       ...prev,
//       [selectedRecord.index]: true,
//     }));
//     setIsModalOpen(false);
//   };

//   return (
//     <DashboardLayout>
//       <div>
//         {/* Table */}
//         <DisplayCard>

//           <section className="flex flex-col lg:flex-row gap-3 lg:gap-0 justify-between items-center">
//           {/* Search input */}
//           <div className="relative w-full lg:w-[40%]">
//             <input
//               type="text"
//               className="p-2 rounded-[8px] border-2 border-gray-300 w-full"
//               placeholder="Search by attendant/product"
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             <Search className="absolute text-gray-300 top-2 right-4" />
//           </div>

//           {/* Action buttons */}
//           <div className="flex gap-4">
//             <button
//               className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
//               onClick={() => setOpenDurationModal(true)}
//             >
//               Duration
//               <ChevronDown />
//             </button>
//             <button onClick={() => setOpenFilter(true)} className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]">
//               Filter
//               <ListFilter />
//             </button>
//             <button onClick={() => exportToExcel(salesData, "AttendantReport")} className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]">
//               Export
//               <Download />
//             </button>
//           </div>
//         </section>

//           <div className="mt-10 overflow-x-auto scrollbar-hide rounded-lg">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-50 text-gray-600 text-center">
//                   <th className="py-3 px-4">Date</th>
//                   <th className="py-3 px-4">Attendant</th>
//                   <th className="py-3 px-4">Shift type</th>
//                   <th className="py-3 px-4">Pump no</th>
//                   <th className="py-3 px-4">Litres sold</th>
//                   <th className="py-3 px-4">Amount</th>
//                   <th className="py-3 px-4">Cash received</th>
//                   <th className="py-3 px-4">Discrepancies</th>
//                   <th className="py-3 px-4">Status</th>
//                   <th className="py-3 px-4">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {salesData.map((item, i) => {
//                   const isAudited = auditedRecords[i];
//                   return (
//                     <tr
//                       key={i}
//                       className="border-t border-gray-100 hover:bg-gray-50 text-center"
//                     >
//                       <td className="py-3 px-4">{item.date}</td>
//                       <td className="py-3 px-4">{item.attendant}</td>
//                       <td className="py-3 px-4">{item.shiftType}</td>
//                       <td className="py-3 px-4">{item.pumpNo}</td>
//                       <td className="py-3 px-4">{item.litres}</td>
//                       <td className="py-3 px-4">{item.amount}</td>
//                       <td className="py-3 px-4">{item.cashReceived}</td>
//                       <td
//                         className={`py-3 px-4 font-medium ${
//                           item.discrepancy > 0
//                             ? "text-green-600"
//                             : item.discrepancy < 0
//                             ? "text-red-500"
//                             : "text-gray-600"
//                         }`}
//                       >
//                         {item.discrepancy}
//                       </td>
//                       <td className="py-3 px-4">
//                         {item.status === "Matched" ? (
//                           <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
//                             <Check size={12} />
//                             <span>Matched</span>
//                           </span>
//                         ) : (
//                           <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
//                             <AlertTriangle size={12} />
//                             <span>Flagged</span>
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4 flex items-center justify-center space-x-3">
//                         <Eye
//                           size={16}
//                           onClick={() => handleView(item, i)}
//                           className="text-gray-500 cursor-pointer hover:text-gray-700"
//                         />
//                         <input
//                           type="checkbox"
//                           checked={isAudited || false}
//                           readOnly
//                           className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
//                         />
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//            {/* Pagination */}
//                   <Pagination
//                     currentPage={currentPage}
//                     totalPages={totalPages}
//                     totalItems={totalItems}
//                     onPageChange={handlePageChange}
//                     itemsPerPage={itemsPerPage}
//                     showItemCount={true}
//                     className="mt-4"
//                   />

//         </DisplayCard>
//       </div>

//       {isModalOpen && <AuditModal onClose={() => setIsModalOpen(false)} />}
//     </DashboardLayout>
//   );
// }


"use client";
import { AlertTriangle, Eye, Check, Search, ChevronDown, ListFilter, Download } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useState, useMemo } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import AuditModal from "../AuditModal";
import Pagination from "@/components/Pagination";
import DurationModal from "../DurationModal";
import Filter from "../Filter";

export default function AuditedReconciledPage() {
  const salesData = [
    {
      date: "04/17/23",
      attendant: "John Dave",
      shiftType: "Morning",
      pumpNo: 1,
      litres: 30,
      amount: "123,000,000",
      cashReceived: "120,000,000",
      discrepancy: -3000,
      status: "Flagged",
    },
    {
      date: "04/17/23",
      attendant: "John Dave",
      shiftType: "Morning",
      pumpNo: 2,
      litres: 40,
      amount: "110,000,000",
      cashReceived: "110,000,000",
      discrepancy: 0,
      status: "Matched",
    },
    {
      date: "04/18/23",
      attendant: "Jane Doe",
      shiftType: "Afternoon",
      pumpNo: 3,
      litres: 25,
      amount: "100,000,000",
      cashReceived: "99,000,000",
      discrepancy: -1000,
      status: "Flagged",
    },
    {
      date: "04/17/23",
      attendant: "John Dave",
      shiftType: "Morning",
      pumpNo: 1,
      litres: 30,
      amount: "123,000,000",
      cashReceived: "120,000,000",
      discrepancy: -3000,
      status: "Flagged",
    },
    {
      date: "04/17/23",
      attendant: "John Dave",
      shiftType: "Morning",
      pumpNo: 2,
      litres: 40,
      amount: "110,000,000",
      cashReceived: "110,000,000",
      discrepancy: 0,
      status: "Matched",
    },
    {
      date: "04/18/23",
      attendant: "Jane Doe",
      shiftType: "Afternoon",
      pumpNo: 3,
      litres: 25,
      amount: "100,000,000",
      cashReceived: "99,000,000",
      discrepancy: -1000,
      status: "Flagged",
    },
    {
      date: "04/17/23",
      attendant: "John Dave",
      shiftType: "Morning",
      pumpNo: 1,
      litres: 30,
      amount: "123,000,000",
      cashReceived: "120,000,000",
      discrepancy: -3000,
      status: "Flagged",
    },
    {
      date: "04/17/23",
      attendant: "John Dave",
      shiftType: "Morning",
      pumpNo: 2,
      litres: 40,
      amount: "110,000,000",
      cashReceived: "110,000,000",
      discrepancy: 0,
      status: "Matched",
    },
    {
      date: "04/18/23",
      attendant: "Jane Doe",
      shiftType: "Afternoon",
      pumpNo: 3,
      litres: 25,
      amount: "100,000,000",
      cashReceived: "99,000,000",
      discrepancy: -1000,
      status: "Flagged",
    },
  ];

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditedRecords, setAuditedRecords] = useState({});
  const [openDurationModal, setOpenDurationModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Corrected Search Filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return salesData;
    return salesData.filter((item) =>
      item.attendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shiftType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [salesData, searchTerm]);

  // ✅ Pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // ✅ Current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // ✅ Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleView = (record, index) => {
    setSelectedRecord({ ...record, index });
    setIsModalOpen(true);
  };

  const handleAudit = () => {
    setAuditedRecords((prev) => ({
      ...prev,
      [selectedRecord.index]: true,
    }));
    setIsModalOpen(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <DashboardLayout>
      <DisplayCard>
        <section className="flex flex-col lg:flex-row gap-3 lg:gap-0 justify-between items-center">
          {/* Search input */}
          <div className="relative w-full lg:w-[40%]">
            <input
              type="text"
              className="p-2 rounded-[8px] border-2 border-gray-300 w-full"
              placeholder="Search by attendant/shift/status/date"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute text-gray-300 top-2 right-4" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
              onClick={() => setOpenDurationModal(true)}
            >
              Duration
              <ChevronDown />
            </button>
            <button
              onClick={() => setOpenFilter(true)}
              className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
            >
              Filter
              <ListFilter />
            </button>
            <button
              onClick={() => console.log("Export to Excel")}
              className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]"
            >
              Export
              <Download />
            </button>
          </div>
        </section>

        {/* ✅ Use currentData instead of salesData */}
        <div className="mt-10 overflow-x-auto scrollbar-hide rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-center">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Attendant</th>
                <th className="py-3 px-4">Shift type</th>
                <th className="py-3 px-4">Pump no</th>
                <th className="py-3 px-4">Litres sold</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Cash received</th>
                <th className="py-3 px-4">Discrepancies</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, i) => {
                const isAudited = auditedRecords[i];
                return (
                  <tr
                    key={i}
                    className="border-t border-gray-100 hover:bg-gray-50 text-center"
                  >
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">{item.attendant}</td>
                    <td className="py-3 px-4">{item.shiftType}</td>
                    <td className="py-3 px-4">{item.pumpNo}</td>
                    <td className="py-3 px-4">{item.litres}</td>
                    <td className="py-3 px-4">{item.amount}</td>
                    <td className="py-3 px-4">{item.cashReceived}</td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        item.discrepancy > 0
                          ? "text-green-600"
                          : item.discrepancy < 0
                          ? "text-red-500"
                          : "text-gray-600"
                      }`}
                    >
                      {item.discrepancy}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === "Matched" ? (
                        <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
                          <Check size={12} />
                          <span>Matched</span>
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
                          <AlertTriangle size={12} />
                          <span>Flagged</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 flex items-center justify-center space-x-3">
                      <Eye
                        size={16}
                        onClick={() => handleView(item, i)}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                      <input
                        type="checkbox"
                        checked={isAudited || false}
                        readOnly
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          showItemCount={true}
          className="mt-4"
        />
      </DisplayCard>

      {isModalOpen && <AuditModal onClose={() => setIsModalOpen(false)} />}
      {openDurationModal && <DurationModal />}
      {openFilter && <Filter handleClose={() => setOpenFilter(false)}  />}
    </DashboardLayout>
  );
}

"use client";
import { AlertTriangle, Eye, Check, Search, ChevronDown, ListFilter, Download } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useState, useMemo, useEffect } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import AuditModal from "../AuditModal";
import Pagination from "@/components/Pagination";
import DurationModal from "../DurationModal";
import Filter from "../Filter";
import useAccountantStore from "@/store/useAccountantStore";

export default function page() {
  // Zustand store
  const {
    reconciledSales,
    loading,
    errors,
    pagination,
    filters,
    fetchReconciledSales,
    setFilters,
    setPage,
    nextPage,
    previousPage,
  } = useAccountantStore();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditedRecords, setAuditedRecords] = useState({});
  const [openDurationModal, setOpenDurationModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  // Local search state
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetchReconciledSales();
  }, [fetchReconciledSales]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit' 
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return value?.toLocaleString() || '0';
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return reconciledSales;
    return reconciledSales.filter((item) =>
      item.attendant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shiftType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(item.date).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reconciledSales, searchTerm]);

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
    setPage(newPage);
    fetchReconciledSales({ page: newPage });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export to Excel");
  };

  // Loading state
  if (loading.reconciledSales && reconciledSales.length === 0) {
    return (
      <DashboardLayout>
        <DisplayCard>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-sm text-gray-600">Loading audited sales...</p>
            </div>
          </div>
        </DisplayCard>
      </DashboardLayout>
    );
  }

  // Error state
  if (errors.reconciledSales) {
    return (
      <DashboardLayout>
        <DisplayCard>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {errors.reconciledSales}</p>
            <button 
              onClick={() => fetchReconciledSales()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </DisplayCard>
      </DashboardLayout>
    );
  }

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
              onClick={handleExport}
              className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]"
            >
              Export
              <Download />
            </button>
          </div>
        </section>

        {/* Empty state */}
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">
              {searchTerm ? "No results found for your search" : "No audited sales data available"}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
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
                  {filteredData.map((item, i) => {
                    const isAudited = auditedRecords[i];
                    return (
                      <tr
                        key={item._id || i}
                        className="border-t border-gray-100 hover:bg-gray-50 text-center"
                      >
                        <td className="py-3 px-4">{formatDate(item.date)}</td>
                        <td className="py-3 px-4">{item.attendant}</td>
                        <td className="py-3 px-4">{item.shiftType}</td>
                        <td className="py-3 px-4">{item.pumpNo}</td>
                        <td className="py-3 px-4">{item.litresSold}</td>
                        <td className="py-3 px-4">{formatCurrency(item.amount)}</td>
                        <td className="py-3 px-4">{formatCurrency(item.cashReceived)}</td>
                        <td
                          className={`py-3 px-4 font-medium ${
                            item.discrepancies > 0
                              ? "text-green-600"
                              : item.discrepancies < 0
                              ? "text-red-500"
                              : "text-gray-600"
                          }`}
                        >
                          {formatCurrency(item.discrepancies)}
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

            {/* Pagination */}
            {!searchTerm && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                onPageChange={handlePageChange}
                itemsPerPage={pagination.limit}
                showItemCount={true}
                className="mt-4"
              />
            )}
          </>
        )}
      </DisplayCard>

      {/* Modals */}
      {isModalOpen && (
        <AuditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          record={selectedRecord || {}}
          onAudit={handleAudit}
          isAudited={selectedRecord ? auditedRecords[selectedRecord.index] : false}
        />
      )}
      {openDurationModal && (
        <DurationModal onClose={() => setOpenDurationModal(false)} />
      )}
      {openFilter && (
        <Filter handleClose={() => setOpenFilter(false)} />
      )}
    </DashboardLayout>
  );
}



// "use client";
// import { AlertTriangle, Eye, Check, Search, ChevronDown, ListFilter, Download } from "lucide-react";
// import DashboardLayout from "@/components/Dashboard/DashboardLayout";
// import { useState, useMemo } from "react";
// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import AuditModal from "../AuditModal";
// import Pagination from "@/components/Pagination";
// import DurationModal from "../DurationModal";
// import Filter from "../Filter";

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
//   const [openDurationModal, setOpenDurationModal] = useState(false);
//   const [openFilter, setOpenFilter] = useState(false);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);

//   // Search state
//   const [searchTerm, setSearchTerm] = useState("");

//   // ✅ Corrected Search Filter
//   const filteredData = useMemo(() => {
//     if (!searchTerm) return salesData;
//     return salesData.filter((item) =>
//       item.attendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.shiftType.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.date.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [salesData, searchTerm]);

//   // ✅ Pagination values
//   const totalItems = filteredData.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   // ✅ Current page data
//   const currentData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     return filteredData.slice(startIndex, endIndex);
//   }, [filteredData, currentPage, itemsPerPage]);

//   // ✅ Handle search
//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1); // Reset to first page when searching
//   };

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

//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//   };

//   return (
//     <DashboardLayout>
//       <DisplayCard>
//         <section className="flex flex-col lg:flex-row gap-3 lg:gap-0 justify-between items-center">
//           {/* Search input */}
//           <div className="relative w-full lg:w-[40%]">
//             <input
//               type="text"
//               className="p-2 rounded-[8px] border-2 border-gray-300 w-full"
//               placeholder="Search by attendant/shift/status/date"
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
//             <button
//               onClick={() => setOpenFilter(true)}
//               className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]"
//             >
//               Filter
//               <ListFilter />
//             </button>
//             <button
//               onClick={() => console.log("Export to Excel")}
//               className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]"
//             >
//               Export
//               <Download />
//             </button>
//           </div>
//         </section>

//         {/* ✅ Use currentData instead of salesData */}
//         <div className="mt-10 overflow-x-auto scrollbar-hide rounded-lg">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="bg-gray-50 text-gray-600 text-center">
//                 <th className="py-3 px-4">Date</th>
//                 <th className="py-3 px-4">Attendant</th>
//                 <th className="py-3 px-4">Shift type</th>
//                 <th className="py-3 px-4">Pump no</th>
//                 <th className="py-3 px-4">Litres sold</th>
//                 <th className="py-3 px-4">Amount</th>
//                 <th className="py-3 px-4">Cash received</th>
//                 <th className="py-3 px-4">Discrepancies</th>
//                 <th className="py-3 px-4">Status</th>
//                 <th className="py-3 px-4">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentData.map((item, i) => {
//                 const isAudited = auditedRecords[i];
//                 return (
//                   <tr
//                     key={i}
//                     className="border-t border-gray-100 hover:bg-gray-50 text-center"
//                   >
//                     <td className="py-3 px-4">{item.date}</td>
//                     <td className="py-3 px-4">{item.attendant}</td>
//                     <td className="py-3 px-4">{item.shiftType}</td>
//                     <td className="py-3 px-4">{item.pumpNo}</td>
//                     <td className="py-3 px-4">{item.litres}</td>
//                     <td className="py-3 px-4">{item.amount}</td>
//                     <td className="py-3 px-4">{item.cashReceived}</td>
//                     <td
//                       className={`py-3 px-4 font-medium ${
//                         item.discrepancy > 0
//                           ? "text-green-600"
//                           : item.discrepancy < 0
//                           ? "text-red-500"
//                           : "text-gray-600"
//                       }`}
//                     >
//                       {item.discrepancy}
//                     </td>
//                     <td className="py-3 px-4">
//                       {item.status === "Matched" ? (
//                         <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
//                           <Check size={12} />
//                           <span>Matched</span>
//                         </span>
//                       ) : (
//                         <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
//                           <AlertTriangle size={12} />
//                           <span>Flagged</span>
//                         </span>
//                       )}
//                     </td>
//                     <td className="py-3 px-4 flex items-center justify-center space-x-3">
//                       <Eye
//                         size={16}
//                         onClick={() => handleView(item, i)}
//                         className="text-gray-500 cursor-pointer hover:text-gray-700"
//                       />
//                       <input
//                         type="checkbox"
//                         checked={isAudited || false}
//                         readOnly
//                         className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
//                       />
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* ✅ Pagination */}
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           totalItems={totalItems}
//           onPageChange={handlePageChange}
//           itemsPerPage={itemsPerPage}
//           showItemCount={true}
//           className="mt-4"
//         />
//       </DisplayCard>

//       {isModalOpen && <AuditModal onClose={() => setIsModalOpen(false)} />}
//       {openDurationModal && <DurationModal />}
//       {openFilter && <Filter handleClose={() => setOpenFilter(false)}  />}
//     </DashboardLayout>
//   );
// }

import React, { useState, useEffect } from "react";
import { Eye, Check, AlertTriangle } from "lucide-react";
import AuditModal from "./AuditModal";
import Link from "next/link";
import useAccountantStore from "@/store/useAccountantStore";

const AuditReconciledSales = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditedRecords, setAuditedRecords] = useState({});
  const [isShow, setIsShow] =useState('link1')

  // Get data from Zustand store
  const { 
    reconciledSales, 
    loading, 
    errors,
    fetchReconciledSales 
  } = useAccountantStore();

  // Fetch reconciled sales on mount
  useEffect(() => {
    fetchReconciledSales({ limit: 9 }); // Limit to 9 records for dashboard view
  }, [fetchReconciledSales]);

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

  // Show loading state
  if (loading.reconciledSales && reconciledSales.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Audit Reconciled Sales</h2>
            <p className="text-sm text-gray-500">
              Verify and audit daily attendant sales
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading sales data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (errors.reconciledSales) {
    return (
      <div className="bg-white rounded-2xl p-4 w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Audit Reconciled Sales</h2>
            <p className="text-sm text-gray-500">
              Verify and audit daily attendant sales
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {errors.reconciledSales}</p>
          <button 
            onClick={() => fetchReconciledSales({ limit: 9 })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (reconciledSales.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Audit Reconciled Sales</h2>
            <p className="text-sm text-gray-500">
              Verify and audit daily attendant sales
            </p>
          </div>
          <Link href="/dashboard/accountant/auditedReconciledPage" className="border border-gray-400 font-semibold rounded-lg text-sm px-4 py-2 text-gray-600 hover:bg-gray-100 transition">
            View all report
          </Link>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No sales data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Audit Reconciled Sales</h2>
          <p className="text-sm text-gray-500">
            Verify and audit daily attendant sales
          </p>
        </div>
        <Link href="/dashboard/accountant/auditedReconciledPage" className="border border-gray-400 font-semibold rounded-lg text-sm px-4 py-2 text-gray-600 hover:bg-gray-100 transition">
          View all report
        </Link>
      </div>

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
            {reconciledSales.map((item, i) => {
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

      {/* Modal */}
      <AuditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={selectedRecord || {}}
        onAudit={handleAudit}
        isAudited={
          selectedRecord ? auditedRecords[selectedRecord.index] : false
        }
      />
    </div>
  );
};

export default AuditReconciledSales;




// import React, { useState } from "react";
// import { Eye, Check, AlertTriangle } from "lucide-react";
// import AuditModal from "./AuditModal";
// import Link from "next/link";

// const salesData = [
//   { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 1, litres: 30, amount: "123,000,000", cashReceived: "120,000,000", discrepancy: -3000, status: "Flagged" },
//   { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 2, litres: 40, amount: "110,000,000", cashReceived: "110,000,000", discrepancy: 0, status: "Matched" },
//   { date: "04/18/23", attendant: "Jane Doe", shiftType: "Afternoon", pumpNo: 3, litres: 25, amount: "100,000,000", cashReceived: "99,000,000", discrepancy: -1000, status: "Flagged" },
//   { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 1, litres: 30, amount: "123,000,000", cashReceived: "120,000,000", discrepancy: -3000, status: "Flagged" },
//   { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 2, litres: 40, amount: "110,000,000", cashReceived: "110,000,000", discrepancy: 0, status: "Matched" },
//   { date: "04/18/23", attendant: "Jane Doe", shiftType: "Afternoon", pumpNo: 3, litres: 25, amount: "100,000,000", cashReceived: "99,000,000", discrepancy: -1000, status: "Flagged" },
//   { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 1, litres: 30, amount: "123,000,000", cashReceived: "120,000,000", discrepancy: -3000, status: "Flagged" },
//   { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 2, litres: 40, amount: "110,000,000", cashReceived: "110,000,000", discrepancy: 0, status: "Matched" },
//   { date: "04/18/23", attendant: "Jane Doe", shiftType: "Afternoon", pumpNo: 3, litres: 25, amount: "100,000,000", cashReceived: "99,000,000", discrepancy: -1000, status: "Flagged" },
// ];

// const AuditReconciledSales = () => {
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [auditedRecords, setAuditedRecords] = useState({});

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
//     <div className="bg-white rounded-2xl p-4 w-full mx-auto">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-800">Audit Reconciled Sales</h2>
//           <p className="text-sm text-gray-500">
//             Verify and audit daily attendant sales
//           </p>
//         </div>
//         <Link href="/dashboard/accountant/auditedReconciledPage" className="border border-gray-400 font-semibold rounded-lg text-sm px-4 py-2 text-gray-600 hover:bg-gray-100 transition">
//           View all report
//         </Link>
//       </div>

//       {/* Table */}
//       <div className="mt-10 overflow-x-auto scrollbar-hide rounded-lg">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="bg-gray-50 text-gray-600 text-center">
//               <th className="py-3 px-4">Date</th>
//               <th className="py-3 px-4">Attendant</th>
//               <th className="py-3 px-4">Shift type</th>
//               <th className="py-3 px-4">Pump no</th>
//               <th className="py-3 px-4">Litres sold</th>
//               <th className="py-3 px-4">Amount</th>
//               <th className="py-3 px-4">Cash received</th>
//               <th className="py-3 px-4">Discrepancies</th>
//               <th className="py-3 px-4">Status</th>
//               <th className="py-3 px-4">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {salesData.map((item, i) => {
//               const isAudited = auditedRecords[i];
//               return (
//                 <tr
//                   key={i}
//                   className="border-t border-gray-100 hover:bg-gray-50 text-center"
//                 >
//                   <td className="py-3 px-4">{item.date}</td>
//                   <td className="py-3 px-4">{item.attendant}</td>
//                   <td className="py-3 px-4">{item.shiftType}</td>
//                   <td className="py-3 px-4">{item.pumpNo}</td>
//                   <td className="py-3 px-4">{item.litres}</td>
//                   <td className="py-3 px-4">{item.amount}</td>
//                   <td className="py-3 px-4">{item.cashReceived}</td>
//                   <td
//                     className={`py-3 px-4 font-medium ${
//                       item.discrepancy > 0
//                         ? "text-green-600"
//                         : item.discrepancy < 0
//                         ? "text-red-500"
//                         : "text-gray-600"
//                     }`}
//                   >
//                     {item.discrepancy}
//                   </td>
//                   <td className="py-3 px-4">
//                     {item.status === "Matched" ? (
//                       <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
//                         <Check size={12} />
//                         <span>Matched</span>
//                       </span>
//                     ) : (
//                       <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
//                         <AlertTriangle size={12} />
//                         <span>Flagged</span>
//                       </span>
//                     )}
//                   </td>
//                   <td className="py-3 px-4 flex items-center justify-center space-x-3">
//                     <Eye
//                       size={16}
//                       onClick={() => handleView(item, i)}
//                       className="text-gray-500 cursor-pointer hover:text-gray-700"
//                     />
//                     <input
//                       type="checkbox"
//                       checked={isAudited || false}
//                       readOnly
//                       className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
//                     />
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       <AuditModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         record={selectedRecord || {}}
//         onAudit={handleAudit}
//         isAudited={
//           selectedRecord ? auditedRecords[selectedRecord.index] : false
//         }
//       />
//     </div>
//   );
// };

// export default AuditReconciledSales;

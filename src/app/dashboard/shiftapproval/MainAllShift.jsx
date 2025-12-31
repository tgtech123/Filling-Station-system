// "use client";
// import React, { useState } from "react";
// import ShiftApprovalHeader from "./ShiftApprovalHeader";
// import ShiftCard from "./ShiftCard";
// import ApprovedShiftsPage from "./ApprovedShiftsPage";

// const allShifts = [
//   {
//     id: 1,
//     name: "Sam Melo",
//     date: "12/12/2025",
//     shift: "One-Day(Morning)- 6am - 2pm",
//     pumpNo: 1,
//     fuelType: "Diesel",
//     pricePerLitre: "N120",
//     litresSold: "120 Litres",
//     transactions: 222,
//     amount: "N14,400",
//     reconciledCash: "N14,000",
//     status: "Flagged",
//   },
//   {
//     id: 2,
//     name: "Sam Melo",
//     date: "12/12/2025",
//     shift: "Day-Off (6am - 10pm)",
//     pumpNo: 1,
//     fuelType: "Diesel",
//     pricePerLitre: "N120",
//     litresSold: "120 Litres",
//     transactions: 222,
//     amount: "N14,400",
//     reconciledCash: "N14,000",
//     status: "Flagged",
//   },
//   {
//     id: 3,
//     name: "Sam Melo",
//     date: "12/12/2025",
//     shift: "One-Day(Morning)- 6am - 2pm",
//     pumpNo: 1,
//     fuelType: "Diesel",
//     pricePerLitre: "N120",
//     litresSold: "120 Litres",
//     transactions: 222,
//     amount: "N14,400",
//     reconciledCash: "N14,000",
//     status: "Matched",
//   },
// ];

// export default function ShiftApprovalPage() {
//   const [activeTab, setActiveTab] = useState("pending");

//   let shiftsToDisplay = [];
//   if (activeTab === "pending") {
//     // Show ALL shifts when "Pending" is active
//     shiftsToDisplay = allShifts;
//   } else if (activeTab === "approved") {
//     // Show nothing when "Approved" is active
//     shiftsToDisplay = [];
//   }

//   return (
//     <div>
//         <ShiftApprovalHeader activeTab={activeTab} onTabChange={setActiveTab} />
//       <div className="mx-auto p-4 bg-white rounded-xl">
//         {shiftsToDisplay.length === 0 ? (
//           <div className="text-gray-500">
//             <ApprovedShiftsPage/>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {shiftsToDisplay.map((shift) => (
//               <ShiftCard key={shift.id} data={shift} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 

"use client";
import React, { useState, useEffect } from "react";
import ShiftApprovalHeader from "./ShiftApprovalHeader";
import ShiftCard from "./ShiftCard";
import ApprovedShiftsPage from "./ApprovedShiftsPage";
import useSupervisorStore from "@/store/useSupervisorStore";

export default function ShiftApprovalPage() {
  const [activeTab, setActiveTab] = useState("pending");
  
  // Get data from Zustand store
  const { 
    pendingShifts, 
    loading, 
    error, 
    fetchPendingShifts,
    pagination 
  } = useSupervisorStore();

  // Fetch pending shifts on component mount
  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingShifts({ page: 1, limit: 20 });
    }
  }, [activeTab, fetchPendingShifts]);

  // Transform API data to match ShiftCard props
  const transformedShifts = pendingShifts.map((shift) => ({
    id: shift._id,
    name: shift.attendant?.name || "Unknown",
    email: shift.attendant?.email,
    phone: shift.attendant?.phone,
    date: new Date(shift.date).toLocaleDateString(),
    shift: shift.shiftType || "N/A",
    pumpNo: shift.pumpNo || "N/A",
    fuelType: shift.product || "N/A",
    pricePerLitre: `₦${shift.pricePerLtr?.toLocaleString() || 0}`,
    litresSold: `${shift.litresSold?.toLocaleString() || 0} Litres`,
    transactions: shift.noOfTransactions || 0,
    amount: `₦${shift.amount?.toLocaleString() || 0}`,
    reconciledCash: `₦${shift.reconciledCash?.toLocaleString() || 0}`,
    discrepancy: shift.discrepancy || 0,
    status: shift.status || "Pending",
    shiftId: shift._id,
  }));

  // Handle loading more shifts (pagination)
  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchPendingShifts({ 
        page: pagination.page + 1, 
        limit: pagination.limit 
      });
    }
  };

  return (
    <div>
      <ShiftApprovalHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mx-auto p-4 bg-white rounded-xl">
        {activeTab === "pending" ? (
          <>
            {/* Loading State */}
            {loading && pendingShifts.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading pending shifts...</p>
              </div>
            ) : error ? (
              /* Error State */
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">Error loading shifts</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
                <button 
                  onClick={() => fetchPendingShifts({ page: 1, limit: 20 })}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : transformedShifts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold">No pending shifts</p>
                <p className="text-sm text-gray-500 mt-2">All shifts have been approved or there are no completed shifts yet.</p>
              </div>
            ) : (
              /* Shifts Grid */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transformedShifts.map((shift) => (
                    <ShiftCard key={shift.id} data={shift} />
                  ))}
                </div>

                {/* Pagination Info & Load More */}
                {pagination.pages > 1 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Showing {pendingShifts.length} of {pagination.total} shifts
                      (Page {pagination.page} of {pagination.pages})
                    </p>
                    
                    {pagination.page < pagination.pages && (
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Loading..." : "Load More"}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Approved Shifts Tab */
          <ApprovedShiftsPage />
        )}
      </div>
    </div>
  );
}
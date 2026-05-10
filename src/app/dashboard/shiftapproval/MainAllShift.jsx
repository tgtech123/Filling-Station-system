"use client";
import React, { useState, useEffect } from "react";
import ShiftApprovalHeader from "./ShiftApprovalHeader";
import ShiftCard from "./ShiftCard";
import ApprovedShiftsPage from "./ApprovedShiftsPage";
import useSupervisorStore from "@/store/useSupervisorStore";
import toast from "react-hot-toast";

export default function ShiftApprovalPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearingStale, setClearingStale] = useState(false);

  // Derive role once on mount
  const userRole = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.role?.toLowerCase() || "";
    } catch {
      return "";
    }
  })();
  const canClearStale = userRole === "supervisor" || userRole === "manager";

  // Select state and actions with stable individual selectors
  // to avoid dependency array instability from bulk destructuring
  const pendingShifts      = useSupervisorStore((s) => s.pendingShifts);
  const loading            = useSupervisorStore((s) => s.loading);
  const error              = useSupervisorStore((s) => s.error);
  const pagination         = useSupervisorStore((s) => s.pagination);
  const fetchPendingShifts  = useSupervisorStore((s) => s.fetchPendingShifts);
  const fetchApprovedShifts = useSupervisorStore((s) => s.fetchApprovedShifts);
  const clearPendingShifts  = useSupervisorStore((s) => s.clearPendingShifts);
  const clearStaleShifts    = useSupervisorStore((s) => s.clearStaleShifts);

  // Clear stale cards then fetch fresh on mount/tab change
  useEffect(() => {
    if (activeTab === "pending") {
      clearPendingShifts();
      fetchPendingShifts({ page: 1, limit: 20 });
    } else {
      fetchApprovedShifts({ page: 1, limit: 100 });
    }
  }, [activeTab, fetchPendingShifts, fetchApprovedShifts, clearPendingShifts]);

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
        limit: pagination.limit,
      });
    }
  };

  const handleClearStale = async () => {
    setClearingStale(true);
    setShowConfirm(false);
    try {
      const res = await clearStaleShifts();
      const count = res?.data?.deletedCount ?? res?.deletedCount ?? 0;
      toast.success(`${count} stale shift${count !== 1 ? "s" : ""} cleared`);
      clearPendingShifts();
      fetchPendingShifts({ page: 1, limit: 20 });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to clear stale shifts");
    } finally {
      setClearingStale(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <ShiftApprovalHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canClearStale={canClearStale}
        clearingStale={clearingStale}
        onClearStaleClick={() => setShowConfirm(true)}
        pendingCount={transformedShifts.length}
      />

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-gray-100 mb-2">Clear Stale Shifts</h2>
            <p className="text-sm text-neutral-600 dark:text-gray-400 mb-6">
              This will remove all pending shifts older than 7 days. Continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearStale}
                className="px-4 py-2 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50 transition font-medium"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl">
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
                <p className="text-gray-700 dark:text-gray-200 font-semibold">Error loading shifts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>
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
                <p className="text-gray-700 dark:text-gray-200 font-semibold">No pending shifts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All shifts have been approved or there are no completed shifts yet.</p>
              </div>
            ) : (
              /* Shifts Grid */
              <>
                {/* Clear stale cards and re-fetch from server */}
                <div className="flex justify-end mb-3 gap-2">
                  <button
                    onClick={() => {
                      clearPendingShifts();
                      fetchPendingShifts({ page: 1, limit: 20 });
                    }}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? "Refreshing..." : "Clear & Refresh"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transformedShifts.map((shift) => (
                    <ShiftCard key={shift.id} data={shift} />
                  ))}
                </div>

                {/* Pagination Info & Load More */}
                {pagination.pages > 1 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
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

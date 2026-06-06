"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RotateCcw, CheckCircle2, X, AlertCircle, Loader2, Filter } from "lucide-react";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";

function StatusBadge({ status }) {
  const map = {
    pending:  "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
  };
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${map[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>;
}

export default function RedemptionsPage() {
  const { redemptions, redemptionTotal, loading, fetchRedemptions, approveRedemption, rejectRedemption } = useFuelLoyaltyStore();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => { fetchRedemptions({ status: statusFilter }); }, [statusFilter]);

  const handleApprove = async (id) => {
    setError(null);
    setActionLoading(id + "_approve");
    const result = await approveRedemption(id);
    setActionLoading(null);
    if (result.success) {
      fetchRedemptions({ status: statusFilter });
      setSuccess(result.message);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(result.error);
    }
  };

  const handleReject = async (id) => {
    setError(null);
    setActionLoading(id + "_reject");
    const result = await rejectRedemption(id);
    setActionLoading(null);
    if (result.success) {
      fetchRedemptions({ status: statusFilter });
    } else {
      setError(result.error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <RotateCcw className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">Redemption Requests</h1>
            <p className="text-sm text-gray-500">{redemptionTotal} total</p>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-5">
          {["pending", "approved", "rejected"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border capitalize transition-all ${statusFilter === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}>
              <Filter size={11} /> {s}
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading.redemption ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
        ) : redemptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <RotateCcw className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No {statusFilter} redemptions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map(r => {
              const c = r.customer;
              return (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(c?.name || c?.plateNumber || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{c?.name || c?.plateNumber || c?.customerId}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c?.phone && <span>{c.phone} · </span>}
                        {c?.plateNumber && <span className="font-mono">{c.plateNumber} · </span>}
                        <span className="font-mono text-xs">{c?.customerId}</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">
                      {new Date(r.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}
                    </p>
                  </div>

                  {/* Redemption details */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Points Used</p>
                      <p className="font-bold text-gray-700 mt-0.5">{Number(r.pointsRedeemed).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Free Litres</p>
                      <p className="font-bold text-emerald-600 mt-0.5">{r.litresValue} L</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Product</p>
                      <p className="font-bold text-gray-700 mt-0.5">{r.product}</p>
                    </div>
                  </div>

                  {r.note && (
                    <p className="text-xs text-gray-400 mt-3 italic">{r.note}</p>
                  )}

                  {/* Approve / Reject buttons (pending only) */}
                  {r.status === "pending" && (
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => handleApprove(r._id)} disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                        {actionLoading === r._id + "_approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Approve
                      </button>
                      <button onClick={() => handleReject(r._id)} disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 font-semibold py-2.5 rounded-xl text-sm border border-red-200 transition-colors">
                        {actionLoading === r._id + "_reject" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        Reject
                      </button>
                    </div>
                  )}
                  {r.status === "approved" && r.approvedBy && (
                    <p className="text-xs text-gray-400 mt-3">Approved by {r.approvedBy?.firstName} {r.approvedBy?.lastName}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

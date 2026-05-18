"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Flame, CheckCircle2, AlertTriangle, Loader2, RefreshCw, FileCheck } from "lucide-react";
import useGasAnalyticsStore from "@/store/useGasAnalyticsStore";
import useGasShiftStore from "@/store/useGasShiftStore";

function fmt(n) { return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function GasReconciliationPage() {
  const { reconciliation, fetchReconciliation, submitReconciliation, loading, errors } = useGasAnalyticsStore();
  const { currentShift } = useGasShiftStore();

  const [submitting,   setSubmitting]   = useState(false);
  const [notes,        setNotes]        = useState("");
  const [submitted,    setSubmitted]    = useState(false);
  const [submitError,  setSubmitError]  = useState(null);

  useEffect(() => { fetchReconciliation(); }, []);

  const R = reconciliation || {};
  const co = R.customerOrders      || {};
  const cs = R.cashierSales        || {};
  const ad = R.attendantDispensed  || {};

  const kgDisc   = Math.abs((cs.totalKg   || 0) - (ad.totalKg    || 0));
  const amtDisc  = Math.abs((cs.totalAmount|| 0) - (ad.totalAmount|| 0));
  const balanced = kgDisc === 0 && amtDisc === 0 && (R.pendingSales || 0) === 0;

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!currentShift) return setSubmitError("No active shift found. You must be on an active shift to reconcile.");
    setSubmitting(true);
    const result = await submitReconciliation({ gasShift: currentShift._id, cashier: currentShift.attendant, notes });
    setSubmitting(false);
    if (result.success) setSubmitted(true);
    else setSubmitError(result.error);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800">End-of-Day Reconciliation</h1>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString("en-NG", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
          </div>
          <button onClick={fetchReconciliation} className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        {submitted && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-green-700">Reconciliation Submitted!</p>
            <p className="text-sm text-green-600 mt-1">The record has been saved for manager and accountant review.</p>
          </div>
        )}

        {loading.reconciliation ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
        ) : (
          <>
            {/* 3-column comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {[
                { title: "Customer Orders",     data: co, color: "border-blue-400   bg-blue-50   text-blue-700"    },
                { title: "Cashier Sales",        data: cs, color: "border-orange-400 bg-orange-50 text-orange-700"  },
                { title: "Attendant Dispensed",  data: ad, color: "border-green-400  bg-green-50  text-green-700"   },
              ].map(col => (
                <div key={col.title} className={`rounded-2xl border-2 p-4 ${col.color}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-3 opacity-70`}>{col.title}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70">Count</span>
                      <span className="font-bold text-lg">{col.data.count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70">Volume</span>
                      <span className="font-semibold">{(col.data.totalKg || 0).toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-70">Amount</span>
                      <span className="font-semibold">₦{fmt(col.data.totalAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Discrepancy Alert */}
            {!balanced ? (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-5">
                <div className="flex gap-3 items-start">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-amber-700">Discrepancies Found</p>
                    <div className="mt-2 space-y-1">
                      {R.pendingSales > 0 && <p className="text-sm text-amber-600">• {R.pendingSales} sale(s) confirmed by cashier but not yet dispensed</p>}
                      {kgDisc > 0  && <p className="text-sm text-amber-600">• {kgDisc.toFixed(3)} kg volume discrepancy</p>}
                      {amtDisc > 0 && <p className="text-sm text-amber-600">• ₦{fmt(amtDisc)} amount discrepancy</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 mb-5 flex gap-3 items-center">
                <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                <p className="font-bold text-green-700">All balanced! No discrepancies found.</p>
              </div>
            )}

            {/* Transaction Log */}
            {R.sales && R.sales.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-700 text-sm">Transaction Log</h3>
                </div>

                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                      <tr>
                        {["Receipt","Customer","Kg","Amount","Cashier","Attendant","Status"].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {R.sales.map(s => (
                        <tr key={s._id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-mono text-orange-600 text-[11px]">{s.receiptNumber}</td>
                          <td className="px-3 py-2.5">{s.walkInName || (s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : "Walk-in")}</td>
                          <td className="px-3 py-2.5 font-semibold">{s.quantityKg?.toFixed(2)}</td>
                          <td className="px-3 py-2.5 font-semibold">₦{fmt(s.amountPaid)}</td>
                          <td className="px-3 py-2.5">{s.cashier?.firstName} {s.cashier?.lastName}</td>
                          <td className="px-3 py-2.5">{s.attendant ? `${s.attendant.firstName} ${s.attendant.lastName}` : "—"}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${
                              s.status === "dispensed" ? "bg-green-100 text-green-700" :
                              s.status === "confirmed" ? "bg-blue-100 text-blue-700"   :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {s.status === "dispensed" ? "✓" : s.status === "confirmed" ? "Conf." : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {R.sales.map(s => (
                    <div key={s._id} className="p-3 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-orange-600">{s.receiptNumber}</p>
                        <p className="text-sm font-semibold text-gray-800">{s.quantityKg?.toFixed(2)} kg · ₦{fmt(s.amountPaid)}</p>
                        <p className="text-xs text-gray-500">{s.cashier?.firstName} {s.cashier?.lastName}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        s.status === "dispensed" ? "bg-green-100 text-green-700" :
                        s.status === "confirmed" ? "bg-blue-100 text-blue-700"   :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {s.status === "dispensed" ? "Dispensed" : s.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Reconciliation */}
            {!submitted && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FileCheck size={18} className="text-orange-500" />
                  Submit End-of-Day Reconciliation
                </h3>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Notes or comments about today's sales..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-3" />
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex gap-2">
                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}
                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
                  Submit Reconciliation
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

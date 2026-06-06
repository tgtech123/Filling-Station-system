"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { ShieldAlert, CheckCircle2, AlertTriangle, Loader2, Calendar } from "lucide-react";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";

export default function LoyaltyAuditPage() {
  const { auditReport, loading, fetchAudit } = useFuelLoyaltyStore();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { fetchAudit(date); }, [date]);

  const hasFlags = auditReport.some(r => r.status === "flagged");

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Loyalty Audit</h1>
            <p className="text-sm text-gray-500">Verify loyalty credits against pump meter readings</p>
          </div>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {/* Overall status banner */}
        {!loading.audit && auditReport.length > 0 && (
          <div className={`rounded-2xl p-4 mb-5 flex items-center gap-3 ${hasFlags ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
            {hasFlags
              ? <AlertTriangle size={20} className="text-red-500 shrink-0" />
              : <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
            <div>
              <p className={`font-bold text-sm ${hasFlags ? "text-red-700" : "text-green-700"}`}>
                {hasFlags ? "Discrepancy Detected" : "All Clear"}
              </p>
              <p className={`text-xs mt-0.5 ${hasFlags ? "text-red-500" : "text-green-500"}`}>
                {hasFlags
                  ? "One or more products have loyalty credits exceeding pump meter readings. Review immediately."
                  : "All loyalty credits are within pump meter limits for the selected date."}
              </p>
            </div>
          </div>
        )}

        {loading.audit ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
        ) : auditReport.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <ShieldAlert className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No data for this date</p>
            <p className="text-gray-300 text-sm mt-1">No loyalty transactions or shifts found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditReport.map(r => (
              <div key={r.product} className={`bg-white rounded-2xl border shadow-sm p-5 ${r.status === "flagged" ? "border-red-200" : "border-gray-100"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{r.product}</span>
                    {r.status === "flagged"
                      ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Flagged</span>
                      : <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Clean</span>}
                  </div>
                  <span className="text-xs text-gray-400">{r.loyaltyCount} loyalty transaction{r.loyaltyCount !== 1 ? "s" : ""}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-400 font-medium">Loyalty Credits</p>
                    <p className="font-bold text-blue-700 mt-0.5">{r.loyaltyLitres} L</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 font-medium">Pump Meter Total</p>
                    <p className="font-bold text-gray-700 mt-0.5">{r.pumpLitres} L</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${r.status === "flagged" ? "bg-red-50" : "bg-green-50"}`}>
                    <p className={`text-xs font-medium ${r.status === "flagged" ? "text-red-400" : "text-green-400"}`}>Over-Credited</p>
                    <p className={`font-bold mt-0.5 ${r.status === "flagged" ? "text-red-700" : "text-green-700"}`}>
                      {r.status === "flagged" ? r.overCredited + " L" : "0 L"}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Loyalty as % of pump sales</span>
                    <span>{r.pumpLitres > 0 ? ((r.loyaltyLitres / r.pumpLitres) * 100).toFixed(1) : "—"}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${r.status === "flagged" ? "bg-red-500" : "bg-blue-400"}`}
                      style={{ width: `${r.pumpLitres > 0 ? Math.min(100, (r.loyaltyLitres / r.pumpLitres) * 100) : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

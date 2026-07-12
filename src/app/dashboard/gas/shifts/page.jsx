"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Flame, Clock, CheckCircle2, AlertCircle, Loader2, Play, Square, ChevronDown, ChevronUp, User } from "lucide-react";
import useGasShiftStore from "@/store/useGasShiftStore";
import useGasSaleStore from "@/store/useGasSaleStore";
import useGasStore from "@/store/useGasStore";
import { Zap, Database } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

function fmt(n) { return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function StatusBadge({ status }) {
  const map = {
    pending_confirmation: { bg: "bg-amber-100",  text: "text-amber-700",  label: "Pending"   },
    confirmed:            { bg: "bg-blue-100",   text: "text-blue-700",   label: "Confirmed" },
    dispensed:            { bg: "bg-green-100",  text: "text-green-700",  label: "Dispensed" },
    voided:               { bg: "bg-red-100",    text: "text-red-600",    label: "Voided"    },
  };
  const s = map[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
}

function SaleCard({ sale, onConfirm, onDispense, confirming, dispensing }) {
  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden ${
      sale.status === "pending_confirmation" ? "border-amber-300" :
      sale.status === "confirmed"            ? "border-blue-300"  :
      sale.status === "dispensed"            ? "border-green-200" : "border-gray-200"
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-gray-500">{sale.receiptNumber}</span>
              <StatusBadge status={sale.status} />
            </div>
            <p className="font-bold text-gray-800">{sale.cylinderSize} · {sale.quantityKg?.toFixed(2)} kg</p>
            <p className="text-sm text-orange-600 font-semibold">₦{fmt(sale.amountPaid)}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              Cashier: {sale.cashier?.firstName} {sale.cashier?.lastName} · {sale.paymentMethod}
              {sale.source === "customer_order" && " · Self-order"}
            </p>
            <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleTimeString("en-NG", {hour:"2-digit",minute:"2-digit"})}</p>
          </div>
        </div>
        {sale.customer && (
          <div className="mt-2 flex items-center gap-2 bg-purple-50 rounded-lg px-2.5 py-1.5">
            <User size={12} className="text-purple-500" />
            <p className="text-xs text-purple-700 font-medium">{sale.customer.firstName} {sale.customer.lastName}</p>
          </div>
        )}
      </div>

      {sale.status === "pending_confirmation" && (
        <div className="flex border-t border-gray-100">
          <button onClick={() => onConfirm(sale._id)} disabled={confirming === sale._id}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
            {confirming === sale._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Verify & Confirm
          </button>
        </div>
      )}
      {sale.status === "confirmed" && (
        <div className="flex border-t border-gray-100">
          <button onClick={() => onDispense(sale._id)} disabled={dispensing === sale._id}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
            {dispensing === sale._id ? <Loader2 size={14} className="animate-spin" /> : <Flame size={14} />}
            Dispense Gas
          </button>
        </div>
      )}
    </div>
  );
}

export default function GasAttendantShiftPage() {
  const { currentShift, fetchCurrentShift, startShift, endShift, loading: shiftLoading } = useGasShiftStore();
  const { pendingSales, fetchPendingSales, confirmSale, dispenseSale, fetchSales, sales } = useGasSaleStore();
  const { pumps, fetchPumps } = useGasStore();

  const [openingReading, setOpeningReading] = useState("");
  const [closingReading, setClosingReading] = useState("");
  const [shiftNotes,     setShiftNotes]     = useState("");
  const [selectedPump,   setSelectedPump]   = useState("");
  const [showEnd,        setShowEnd]        = useState(false);
  const [error,          setError]          = useState(null);
  const [success,        setSuccess]        = useState(null);
  const [confirming,     setConfirming]     = useState(null);
  const [dispensing,     setDispensing]     = useState(null);
  const [activeTab,      setActiveTab]      = useState("pending");

  useEffect(() => {
    fetchCurrentShift();
    fetchPendingSales();
    fetchPumps();
    const i = setInterval(fetchPendingSales, 20000);
    return () => clearInterval(i);
  }, []);

  // Socket: a cashier POS sale appears in the pending queue instantly
  // (the 20s poll above stays as a fallback).
  useSocket({
    "gas:sale-updated": () => {
      fetchPendingSales();
      if (activeTab === "history") fetchSales({ status: "dispensed", limit: 30 });
    },
  });

  useEffect(() => {
    if (activeTab === "history") fetchSales({ status: "dispensed", limit: 30 });
  }, [activeTab]);

  const activePumps = pumps.filter(p => p.isActive);

  const handleStart = async () => {
    setError(null);
    if (!openingReading || isNaN(Number(openingReading))) return setError("Enter a valid opening meter reading");
    if (activePumps.length > 0 && !selectedPump) return setError("Select which pump you will be operating");
    const result = await startShift({
      openingMeterReading: Number(openingReading),
      notes: shiftNotes,
      pumpId: selectedPump || undefined,
    });
    if (result.success) {
      setOpeningReading("");
      setShiftNotes("");
      setSelectedPump("");
      setSuccess("Shift started successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleEnd = async () => {
    setError(null);
    if (!closingReading || isNaN(Number(closingReading))) return setError("Enter a valid closing meter reading");
    if (!currentShift) return;
    const result = await endShift(currentShift._id, { closingMeterReading: Number(closingReading), notes: shiftNotes });
    if (result.success) {
      setClosingReading("");
      setShiftNotes("");
      setShowEnd(false);
      setSuccess(`Shift ended. Total sold: ${result.data.totalKgSold} kg · ₦${fmt(result.data.totalAmountSold)}`);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(result.error);
    }
  };

  const handleConfirm = async (id) => {
    setConfirming(id);
    const result = await confirmSale(id);
    if (!result.success) setError(result.error);
    setConfirming(null);
  };

  const handleDispense = async (id) => {
    setDispensing(id);
    const result = await dispenseSale(id);
    if (!result.success) setError(result.error);
    else await fetchPendingSales();
    setDispensing(null);
  };

  // Separate confirmed (ready to dispense) from waiting confirmation
  const waitingConfirm = pendingSales.filter(s => s.status === "pending_confirmation");
  const readyDispense  = pendingSales.filter(s => s.status === "confirmed");

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Gas Department</h1>
            <p className="text-sm text-gray-500">Attendant — Shift Management</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
          </div>
        )}

        {/* Shift Card */}
        {!currentShift ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-700">No Active Shift</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Start your shift to begin confirming sales and dispensing gas.</p>
            <div className="space-y-3">
              {/* Pump selector */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block flex items-center gap-1">
                  <Zap size={12} className="text-blue-500" />
                  Your Pump / Dispenser {activePumps.length > 0 ? "*" : ""}
                </label>
                {activePumps.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-amber-700 font-medium">No pumps configured. Ask your manager to set up pumps in the Inventory page.</p>
                  </div>
                ) : (
                  <select
                    value={selectedPump}
                    onChange={e => setSelectedPump(e.target.value)}
                    className="w-full border-2 border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select your pump…</option>
                    {activePumps.map(p => {
                      const tank = p.tank;
                      const tankLabel = tank ? ` → ${tank.name} (${tank.currentStockKg?.toFixed(1)} kg)` : "";
                      return (
                        <option key={p._id} value={p._id}>{p.name}{tankLabel}</option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Opening Meter Reading *</label>
                <input
                  type="number" step="0.1" min="0"
                  value={openingReading}
                  onChange={e => setOpeningReading(e.target.value)}
                  placeholder="e.g. 12450.0"
                  className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes (optional)</label>
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                  placeholder="Any shift notes..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button
                onClick={handleStart}
                disabled={shiftLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {shiftLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                Start Shift
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 shadow-lg mb-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                <span className="font-bold text-sm">SHIFT ACTIVE</span>
              </div>
              <span className="text-xs opacity-80">{new Date(currentShift.startTime).toLocaleTimeString("en-NG", {hour:"2-digit",minute:"2-digit"})}</span>
            </div>
            {/* Pump + tank info */}
            {currentShift.pump && (
              <div className="bg-white/20 rounded-xl p-3 mb-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center shrink-0">
                  <Zap size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold opacity-90">{currentShift.pump.name}</p>
                  {currentShift.pump.tank && (
                    <p className="text-[11px] opacity-70 flex items-center gap-1 mt-0.5">
                      <Database size={10} />
                      {currentShift.pump.tank.name} · {currentShift.pump.tank.currentStockKg?.toFixed(1)} kg remaining
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/20 rounded-xl p-2.5">
                <p className="text-[10px] opacity-70 mb-0.5">Opening Reading</p>
                <p className="font-bold text-lg">{currentShift.openingMeterReading?.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-2.5">
                <p className="text-[10px] opacity-70 mb-0.5">Sales Confirmed</p>
                <p className="font-bold text-lg">{readyDispense.length + (sales?.filter(s=>s.status==="dispensed")?.length || 0)}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-2.5">
                <p className="text-[10px] opacity-70 mb-0.5">Pending</p>
                <p className="font-bold text-lg">{waitingConfirm.length}</p>
              </div>
            </div>
            <button
              onClick={() => setShowEnd(!showEnd)}
              className="w-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Square className="w-4 h-4" />
              End Shift
              {showEnd ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showEnd && (
              <div className="mt-3 bg-white rounded-xl p-4 text-gray-800 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Closing Meter Reading *</label>
                  <input
                    type="number" step="0.1" min={currentShift.openingMeterReading}
                    value={closingReading}
                    onChange={e => setClosingReading(e.target.value)}
                    placeholder="e.g. 12537.5"
                    className="w-full border-2 border-red-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <button
                  onClick={handleEnd}
                  disabled={shiftLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {shiftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                  Confirm End Shift
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sales Tabs */}
        {currentShift && (
          <>
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-5 gap-1">
              {[
                { id: "pending",   label: `Verify (${waitingConfirm.length})` },
                { id: "dispense",  label: `Dispense (${readyDispense.length})` },
                { id: "history",   label: "History"                          },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab===t.id?"bg-white shadow text-orange-600":"text-gray-500"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "pending" && (
              <div className="space-y-4">
                {waitingConfirm.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No pending verifications</p>
                  </div>
                ) : (
                  waitingConfirm.map(s => (
                    <SaleCard key={s._id} sale={s} onConfirm={handleConfirm} onDispense={handleDispense} confirming={confirming} dispensing={dispensing} />
                  ))
                )}
              </div>
            )}

            {activeTab === "dispense" && (
              <div className="space-y-4">
                {readyDispense.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <Flame className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No confirmed sales ready to dispense</p>
                  </div>
                ) : (
                  readyDispense.map(s => (
                    <SaleCard key={s._id} sale={s} onConfirm={handleConfirm} onDispense={handleDispense} confirming={confirming} dispensing={dispensing} />
                  ))
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-3">
                {sales?.filter(s => s.status === "dispensed").length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <p className="text-gray-400">No dispensed sales yet today</p>
                  </div>
                ) : (
                  sales?.filter(s => s.status === "dispensed").map(s => (
                    <div key={s._id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">{s.receiptNumber}</p>
                        <p className="font-semibold text-gray-700 text-sm">{s.cylinderSize} · {s.quantityKg?.toFixed(2)} kg</p>
                        <p className="text-xs text-gray-500">Cashier: {s.cashier?.firstName} {s.cashier?.lastName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-600">₦{fmt(s.amountPaid)}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Dispensed</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

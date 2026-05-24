"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  Flame, Plus, Mail, Printer, CheckCircle2, AlertCircle, Loader2,
  Package, RefreshCw, X, Send, ShieldCheck, ClipboardCheck,
  ChevronDown, Search, UserPlus, Building2, Phone, AtSign,
  Check, Trash2,
} from "lucide-react";
import useGasProcurementStore from "@/store/useGasProcurementStore";
import useGasStore from "@/store/useGasStore";
import useSupplierStore from "@/store/useSupplierStore";
import { Database } from "lucide-react";

function fmt(n) { return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const STATUS_CONFIG = {
  ordered:           { label: "Order Placed",           bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  awaiting_delivery: { label: "Awaiting Delivery",      bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500"  },
  delivered:         { label: "Delivered – Verify",     bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  validated:         { label: "Validated ✓",            bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  cancelled:         { label: "Cancelled",              bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400"   },
};

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.ordered;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Supplier Selector ────────────────────────────────────────────────────────
function SupplierSelector({ value, onChange, onRegisterNew, suppliers, loading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = suppliers.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const selected = suppliers.find((s) => s._id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-3 py-2.5 text-sm transition-all bg-white ${
          open ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200 hover:border-orange-300"
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <Building2 size={13} className="text-orange-600" />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-semibold text-gray-800 text-sm truncate">{selected.name}</p>
              <p className="text-xs text-gray-400 truncate">{selected.phone}{selected.email ? ` · ${selected.email}` : ""}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">
            {loading ? "Loading suppliers…" : "Select a registered supplier…"}
          </span>
        )}
        <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2.5 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supplier name, phone or email…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Supplier list */}
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-sm">
                <Loader2 size={15} className="animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center">
                <Building2 size={24} className="text-gray-200 mx-auto mb-1.5" />
                <p className="text-xs text-gray-400">
                  {search ? "No suppliers match your search" : "No suppliers registered yet"}
                </p>
              </div>
            ) : (
              filtered.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => { onChange(s); setOpen(false); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 ${
                    value === s._id ? "bg-orange-50" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{s.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {s.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={10} className="text-gray-400" /> {s.phone}
                        </span>
                      )}
                      {s.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                          <AtSign size={10} className="text-gray-400" /> {s.email}
                        </span>
                      )}
                    </div>
                  </div>
                  {value === s._id && (
                    <Check size={15} className="text-orange-500 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Register new */}
          <div className="p-2.5 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={() => { setOpen(false); onRegisterNew(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <UserPlus size={13} /> Register New Supplier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Register Supplier Modal ─────────────────────────────────────────────────
function RegisterSupplierModal({ onClose, onSaved, type = "gas" }) {
  const { createSupplier, saving } = useSupplierStore();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "", type });
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) return setError("Supplier name is required");
    if (!form.phone.trim()) return setError("Phone number is required");
    const result = await createSupplier(form);
    if (result.success) {
      onSaved(result.data);
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus size={15} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Register New Supplier</h3>
              <p className="text-orange-100 text-xs">Add to your supplier directory</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Supplier / Company Name *</label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Total Gas Nigeria Ltd"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone Number *</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 08012345678"
                type="tel"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email Address</label>
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="supplier@example.com"
                type="email"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Supplier Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
            >
              <option value="gas">Gas Supplier</option>
              <option value="lubricant">Lubricant Supplier</option>
              <option value="both">Gas & Lubricant</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Address (optional)</label>
            <input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Supplier's business address"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional info about this supplier…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </div>

          {error && (
            <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-2.5">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {saving ? "Saving…" : "Register Supplier"}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  supplierId: "", supplierName: "", supplierPhone: "", supplierEmail: "",
  quantityKg: "", pricePerKg: "",
  date: new Date().toISOString().split("T")[0],
  invoiceNumber: "", notes: "", sendEmail: true, targetTankId: "",
};

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, userRole, tanks, onConfirmDelivery, onValidate, onCancel, onResendEmail }) {
  const [open,           setOpen]           = useState(false);
  const [deliveryQty,    setDeliveryQty]    = useState("");
  const [superNotes,     setSuperNotes]     = useState("");
  const [resendEmail,    setResendEmail]    = useState("");
  const [validateTankId, setValidateTankId] = useState(order.targetTank?._id || order.targetTank || "");
  const [working,        setWorking]        = useState(false);
  const [localError,     setLocalError]     = useState(null);

  const isManager    = ["manager", "admin"].includes(userRole);
  const isSupervisor = ["supervisor", "manager", "admin"].includes(userRole);

  const handleConfirm = async () => {
    if (!deliveryQty || isNaN(Number(deliveryQty))) return setLocalError("Enter the actual quantity delivered");
    setWorking(true); setLocalError(null);
    const r = await onConfirmDelivery(order._id, { deliveredQuantityKg: Number(deliveryQty), superNotes });
    setWorking(false);
    if (!r.success) setLocalError(r.error);
    else setOpen(false);
  };

  const handleValidate = async () => {
    if (!validateTankId) return setLocalError("Select which tank should receive this delivery");
    setWorking(true); setLocalError(null);
    const r = await onValidate(order._id, validateTankId);
    setWorking(false);
    if (!r.success) setLocalError(r.error);
  };

  const handleResend = async () => {
    setWorking(true); setLocalError(null);
    const r = await onResendEmail(order._id, resendEmail || order.supplierEmail);
    setWorking(false);
    if (!r.success) setLocalError(r.error);
    else setResendEmail("");
  };

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
      order.status === "delivered" ? "border-purple-300 shadow-md" :
      order.status === "validated" ? "border-green-200" : "border-gray-100"
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{order.orderNumber}</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Building2 size={12} className="text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{order.supplierName}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  {order.supplierPhone && (
                    <span className="flex items-center gap-1"><Phone size={10} className="text-gray-400" />{order.supplierPhone}</span>
                  )}
                  {order.supplierEmail && (
                    <span className="flex items-center gap-1"><AtSign size={10} className="text-gray-400" />{order.supplierEmail}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-orange-600 text-lg">₦{fmt(order.totalCost)}</p>
            <p className="text-xs text-gray-400">{order.orderedQuantityKg?.toLocaleString()} kg ordered</p>
            <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString("en-NG")}</p>
          </div>
        </div>

        {(order.status === "delivered" || order.status === "validated") && order.deliveredQuantityKg !== undefined && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-purple-50 rounded-xl p-2.5 border border-purple-100">
              <p className="text-[10px] text-purple-500 font-semibold uppercase">Ordered</p>
              <p className="font-bold text-gray-800">{order.orderedQuantityKg} kg</p>
            </div>
            <div className="bg-green-50 rounded-xl p-2.5 border border-green-100">
              <p className="text-[10px] text-green-600 font-semibold uppercase">Delivered</p>
              <p className="font-bold text-gray-800">{order.deliveredQuantityKg} kg</p>
              {order.deliveredQuantityKg !== order.orderedQuantityKg && (
                <p className="text-[10px] text-amber-600 font-semibold">
                  {order.deliveredQuantityKg < order.orderedQuantityKg ? "⚠ Short delivery" : "Extra delivered"}
                </p>
              )}
            </div>
          </div>
        )}

        {order.confirmedBySuper && (
          <p className="text-xs text-gray-400 mt-2">
            Delivery confirmed by: <span className="font-semibold">{order.confirmedBySuper.firstName} {order.confirmedBySuper.lastName}</span>
            {order.superNotes && ` — "${order.superNotes}"`}
          </p>
        )}
        {order.validatedBy && (
          <p className="text-xs text-green-600 mt-1 font-semibold">
            ✓ Validated by {order.validatedBy.firstName} {order.validatedBy.lastName} · {new Date(order.validatedAt).toLocaleString("en-NG")}
          </p>
        )}

        {order.targetTank && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Database size={11} className="text-orange-400" />
            Tank: <span className="font-semibold text-gray-700">{order.targetTank.name || order.targetTank}</span>
          </p>
        )}

        {order.emailSentAt && (
          <p className="text-xs text-blue-500 mt-1">📧 Order email sent to {order.emailSentTo} · {new Date(order.emailSentAt).toLocaleString("en-NG")}</p>
        )}

        {localError && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 flex gap-1.5 items-start">
            <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{localError}</p>
          </div>
        )}
      </div>

      {order.status !== "validated" && order.status !== "cancelled" && (
        <div className="border-t border-gray-100">
          {isSupervisor && (order.status === "ordered" || order.status === "awaiting_delivery") && (
            <div className="p-4 bg-amber-50 border-t border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                <ShieldCheck size={13} /> Supervisor: Confirm Gas Received
              </p>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Actual Qty Delivered (kg)</label>
                  <input
                    type="number" step="0.1" min="0"
                    value={deliveryQty}
                    onChange={(e) => setDeliveryQty(e.target.value)}
                    placeholder={`Expected: ${order.orderedQuantityKg} kg`}
                    className="w-full border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <button onClick={handleConfirm} disabled={working}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-colors">
                  {working ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  Confirm
                </button>
              </div>
              <input
                type="text" value={superNotes} onChange={(e) => setSuperNotes(e.target.value)}
                placeholder="Supervisor notes (optional)"
                className="mt-2 w-full border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>
          )}

          {isManager && order.status === "delivered" && (
            <div className="p-4 bg-green-50 border-t border-green-100">
              <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1.5">
                <ClipboardCheck size={13} /> Manager: Validate & Add to Tank
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Supervisor confirmed <strong>{order.deliveredQuantityKg} kg</strong> delivered. Select which tank receives this stock.
              </p>
              {tanks && tanks.length > 0 ? (
                <div className="mb-3">
                  <label className="text-[10px] font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                    <Database size={10} className="inline mr-1" />Target Tank *
                  </label>
                  <select
                    value={validateTankId}
                    onChange={(e) => setValidateTankId(e.target.value)}
                    className="w-full border border-green-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  >
                    <option value="">Select a tank…</option>
                    {tanks.filter((t) => t.isActive).map((t) => {
                      const space = t.capacityKg - t.currentStockKg;
                      return (
                        <option key={t._id} value={t._id}>
                          {t.name} — space: {space.toFixed(1)} kg / cap: {t.capacityKg.toLocaleString()} kg
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <p className="text-xs text-amber-700 font-medium">No tanks configured. Add tanks in the Inventory page first.</p>
                </div>
              )}
              <button onClick={handleValidate} disabled={working || !validateTankId}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                {working ? <Loader2 size={14} className="animate-spin" /> : <ClipboardCheck size={14} />}
                Validate & Add {order.deliveredQuantityKg} kg to Tank
              </button>
            </div>
          )}

          {isManager && (
            <div className="flex gap-0 divide-x divide-gray-100">
              {!order.emailSentAt && order.supplierEmail && (
                <button onClick={handleResend} disabled={working}
                  className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                  <Mail size={13} /> Resend Email
                </button>
              )}
              {(order.status === "ordered" || order.status === "awaiting_delivery") && (
                <button onClick={() => onCancel(order._id)}
                  className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                  <X size={13} /> Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GasProcurementPage() {
  const {
    procurements, total, loading,
    fetchProcurements, createProcurement,
    confirmDelivery, validateProcurement, cancelProcurement, resendEmail,
  } = useGasProcurementStore();
  const { inventory, tanks, fetchInventory, fetchTanks } = useGasStore();
  const { suppliers, loading: suppLoading, fetchSuppliers } = useSupplierStore();

  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const printRef = useRef();

  const [userRole, setUserRole] = useState("manager");
  useEffect(() => {
    try { setUserRole(JSON.parse(localStorage.getItem("user") || "{}").role || "manager"); } catch {}
    fetchProcurements();
    fetchInventory();
    fetchTanks();
    fetchSuppliers("gas");
  }, []);

  useEffect(() => {
    fetchProcurements(filterStatus ? { status: filterStatus } : {});
  }, [filterStatus]);

  const totalCost = form.quantityKg && form.pricePerKg
    ? (parseFloat(form.quantityKg) * parseFloat(form.pricePerKg)).toFixed(2)
    : "0.00";

  const handleSelectSupplier = (supplier) => {
    setForm((p) => ({
      ...p,
      supplierId:    supplier._id,
      supplierName:  supplier.name,
      supplierPhone: supplier.phone || "",
      supplierEmail: supplier.email || "",
    }));
  };

  const handleNewSupplierSaved = (supplier) => {
    // Auto-select the newly registered supplier
    handleSelectSupplier(supplier);
    fetchSuppliers("gas");
  };

  const handleSave = async () => {
    setError(null);
    if (!form.supplierName || !form.supplierPhone || !form.quantityKg || !form.pricePerKg) {
      return setError("Please select a supplier and fill in quantity and price");
    }
    setSaving(true);
    const result = await createProcurement({ ...form, sendEmail: form.sendEmail && !!form.supplierEmail });
    setSaving(false);
    if (result.success) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchInventory();
      const msg = result.data.emailSent
        ? `Order ${result.data.orderNumber} placed and email sent to ${form.supplierEmail}`
        : `Order ${result.data.orderNumber} placed`;
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(result.error);
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Gas Purchase Orders</title>
      <style>body{font-family:Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#fff7ed}h2{color:#ea580c}</style>
      </head><body>${content}</body></html>`);
    w.document.close();
    w.print();
  };

  const awaitingDelivery = procurements.filter((p) => p.status === "ordered" || p.status === "awaiting_delivery").length;
  const awaitingValidate = procurements.filter((p) => p.status === "delivered").length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800">Gas Procurement</h1>
            <p className="text-sm text-gray-500">Order → Supplier Email → Supervisor Confirms → Manager Validates → Inventory Updated</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              <Printer size={15} /> Print
            </button>
            {["manager", "admin"].includes(userRole) && (
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm">
                <Plus size={16} />
                <span className="hidden sm:inline">New Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Alert badges */}
        {(awaitingDelivery > 0 || awaitingValidate > 0) && (
          <div className="flex flex-wrap gap-3 mb-5">
            {awaitingDelivery > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <Package size={15} className="text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">{awaitingDelivery} order(s) awaiting delivery</span>
              </div>
            )}
            {awaitingValidate > 0 && (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 animate-pulse">
                <ClipboardCheck size={15} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">{awaitingValidate} order(s) ready for your validation!</span>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-start">
            <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Inventory summary */}
        {inventory && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Current Stock",  value: `${(inventory.currentStockKg || 0).toFixed(1)} kg`, color: "text-orange-600" },
              { label: "Total Procured", value: `${(inventory.totalProcuredKg || 0).toFixed(1)} kg`, color: "text-blue-600"   },
              { label: "Total Sold",     value: `${(inventory.totalSoldKg || 0).toFixed(1)} kg`,     color: "text-green-600"  },
              { label: "Stock Value",    value: `₦${fmt(inventory.stockValue)}`,                      color: "text-purple-600" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className={`font-bold text-lg ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* New Order Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 mb-6 overflow-hidden">
            {/* Form header */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                <Package size={15} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">New Gas Purchase Order</h2>
                <p className="text-xs text-gray-500">Select a supplier from your directory or register a new one</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* ── Supplier selector section ── */}
              <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={15} className="text-orange-500" />
                    <span className="text-sm font-bold text-gray-700">Select Supplier *</span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                      {suppliers.length} registered
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-white border border-orange-200 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <UserPlus size={12} /> New Supplier
                  </button>
                </div>

                <SupplierSelector
                  value={form.supplierId}
                  onChange={handleSelectSupplier}
                  onRegisterNew={() => setShowRegister(true)}
                  suppliers={suppliers}
                  loading={suppLoading}
                />

                {/* Selected supplier detail chips */}
                {form.supplierName && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-orange-100">
                      <Building2 size={12} className="text-orange-400 shrink-0" />
                      <span className="text-xs text-gray-700 font-medium truncate">{form.supplierName}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-orange-100">
                      <Phone size={12} className="text-orange-400 shrink-0" />
                      <span className="text-xs text-gray-700 font-medium truncate">{form.supplierPhone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-orange-100">
                      <AtSign size={12} className="text-orange-400 shrink-0" />
                      <span className="text-xs text-gray-700 font-medium truncate">{form.supplierEmail || "No email"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Order fields ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "quantityKg",    label: "Quantity to Order (kg) *",  type: "number", placeholder: "e.g. 200" },
                  { key: "pricePerKg",    label: "Agreed Price / kg (₦) *",   type: "number", placeholder: "e.g. 850" },
                  { key: "date",          label: "Order Date *",              type: "date",   placeholder: ""         },
                  { key: "invoiceNumber", label: "Expected Invoice No.",       type: "text",   placeholder: "optional" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      step={f.type === "number" ? "0.01" : undefined}
                      min={f.type === "number" ? "0" : undefined}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes / Special Instructions</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Any special instructions for the supplier..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              {/* Target tank */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Database size={12} className="text-gray-400" /> Target Tank (optional — can select at validation)
                </label>
                {tanks && tanks.filter((t) => t.isActive).length > 0 ? (
                  <select
                    value={form.targetTankId}
                    onChange={(e) => setForm((p) => ({ ...p, targetTankId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Not specified yet…</option>
                    {tanks.filter((t) => t.isActive).map((t) => {
                      const space = t.capacityKg - t.currentStockKg;
                      return (
                        <option key={t._id} value={t._id}>
                          {t.name} — available space: {space.toFixed(1)} kg
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    No tanks configured yet. You can add tanks in the Inventory page.
                  </p>
                )}
              </div>

              {/* Estimated total */}
              {parseFloat(totalCost) > 0 && (
                <div className="bg-orange-50 rounded-xl p-3 flex justify-between items-center border border-orange-100">
                  <span className="text-sm font-semibold text-gray-700">Estimated Total</span>
                  <span className="font-bold text-xl text-orange-600">₦{fmt(Number(totalCost))}</span>
                </div>
              )}

              {/* Email toggle */}
              {form.supplierEmail && (
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setForm((p) => ({ ...p, sendEmail: !p.sendEmail }))}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${form.sendEmail ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.sendEmail ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Send order email to supplier</p>
                    <p className="text-xs text-gray-400">An official purchase order email will be sent to {form.supplierEmail}</p>
                  </div>
                </label>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {form.sendEmail && form.supplierEmail ? "Place Order & Send Email" : "Place Order"}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(null); }}
                  className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "",                 label: "All"         },
            { id: "ordered",          label: "Ordered"     },
            { id: "awaiting_delivery",label: "Awaiting"    },
            { id: "delivered",        label: "To Validate" },
            { id: "validated",        label: "Validated"   },
            { id: "cancelled",        label: "Cancelled"   },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === f.id ? "bg-orange-500 border-orange-500 text-white" : "border-gray-200 text-gray-500 hover:border-orange-300"
              }`}>
              {f.label}
              {f.id === "delivered" && awaitingValidate > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-white text-orange-600 rounded-full text-[9px] font-black inline-flex items-center justify-center">{awaitingValidate}</span>
              )}
            </button>
          ))}
          <button onClick={() => fetchProcurements(filterStatus ? { status: filterStatus } : {})}
            className="ml-auto p-1.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Printable area */}
        <div ref={printRef} className="hidden">
          <h2>Gas Procurement Orders</h2>
          <table>
            <thead>
              <tr><th>Order#</th><th>Date</th><th>Supplier</th><th>Qty (kg)</th><th>Price/kg</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {procurements.map((p) => (
                <tr key={p._id}>
                  <td>{p.orderNumber}</td>
                  <td>{new Date(p.date).toLocaleDateString("en-NG")}</td>
                  <td>{p.supplierName} · {p.supplierPhone}</td>
                  <td>{p.orderedQuantityKg} kg</td>
                  <td>₦{fmt(p.pricePerKg)}</td>
                  <td>₦{fmt(p.totalCost)}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
        ) : procurements.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {procurements.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                userRole={userRole}
                tanks={tanks}
                onConfirmDelivery={confirmDelivery}
                onValidate={validateProcurement}
                onCancel={async (id) => {
                  if (!window.confirm("Cancel this order?")) return;
                  const r = await cancelProcurement(id);
                  if (r.success) setSuccess("Order cancelled");
                }}
                onResendEmail={resendEmail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Register Supplier Modal */}
      {showRegister && (
        <RegisterSupplierModal
          type="gas"
          onClose={() => setShowRegister(false)}
          onSaved={handleNewSupplierSaved}
        />
      )}
    </DashboardLayout>
  );
}

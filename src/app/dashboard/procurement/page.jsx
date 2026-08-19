"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, Plus, Minus, Trash2, Send,
  RefreshCw, CheckCircle, AlertTriangle, XCircle,
  Eye, Edit3, Save, FileText, TruckIcon, BadgeCheck, Filter, ArrowLeft,
  Search, ChevronDown, Building2, Phone, AtSign, UserPlus, Check,
  AlertCircle, Loader2, X, CreditCard, Banknote, Clock, CircleDollarSign,
  ClipboardCheck,
} from "lucide-react";
import useProcurementStore from "@/store/useProcurementStore";
import useSupplierStore from "@/store/useSupplierStore";
import { useLubricantStore } from "@/store/lubricantStore";
import ReceivePricing from "./ReceivePricing";
import toast from "react-hot-toast";
import PageBackBar from "@/components/Dashboard/PageBackBar";

// ─── urgency config ──────────────────────────────────────────────────────────
const URGENCY = {
  out_of_stock: { label: "Out of Stock", bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  critical:     { label: "Critical",     bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  low:          { label: "Low Stock",    bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
  healthy:      { label: "Healthy",      bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
};

const STATUS_CONFIG = {
  draft:     { label: "Draft",     bg: "bg-gray-100",   text: "text-gray-600",   icon: <Edit3 size={11}/>      },
  submitted: { label: "Submitted", bg: "bg-blue-100",   text: "text-blue-700",   icon: <Send size={11}/>       },
  ordered:   { label: "Ordered",   bg: "bg-purple-100", text: "text-purple-700", icon: <TruckIcon size={11}/>  },
  // Supplier has replied with what they can supply and at what price.
  confirmed: { label: "Confirmed", bg: "bg-amber-100",  text: "text-amber-700",  icon: <ClipboardCheck size={11}/> },
  received:  { label: "Received",  bg: "bg-green-100",  text: "text-green-700",  icon: <BadgeCheck size={11}/> },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  );
}

const PAYMENT_CONFIG = {
  unpaid:  { label: "Unpaid",     bg: "bg-red-100",    text: "text-red-700",    icon: <Clock size={11}/>          },
  partial: { label: "Part. Paid", bg: "bg-orange-100", text: "text-orange-700", icon: <CreditCard size={11}/>     },
  paid:    { label: "Paid",       bg: "bg-emerald-100",text: "text-emerald-700",icon: <CheckCircle size={11}/>    },
};

function PaymentBadge({ status }) {
  const c = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.unpaid;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  const u = URGENCY[urgency] || URGENCY.healthy;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.bg} ${u.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${u.dot}`} />
      {u.label}
    </span>
  );
}

function StockBar({ current, max }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : (current > 0 ? 100 : 0);
  const color = pct === 0 ? "bg-red-500" : pct < 50 ? "bg-orange-400" : pct < 100 ? "bg-yellow-400" : "bg-green-400";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Supplier Selector ────────────────────────────────────────────────────────
function SupplierSelector({ value, onChange, onRegisterNew, suppliers, loading, accentColor = "blue" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const accent = {
    blue:   { ring: "focus:ring-blue-100", border: "border-blue-400", bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-600", btn: "bg-blue-600 hover:bg-blue-700", icon: "text-blue-500" },
  }[accentColor] || {};

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
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-3 py-2.5 text-sm transition-all bg-white dark:bg-gray-800 ${
          open
            ? `${accent.border} ring-2 ${accent.ring}`
            : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
              <Building2 size={13} className={accent.icon} />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{selected.name}</p>
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
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2.5 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supplier name, phone or email…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-white"
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                    value === s._id ? `${accent.bg} dark:bg-blue-900/20` : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl ${accent.bg} flex items-center justify-center shrink-0`}>
                    <Building2 size={14} className={accent.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{s.name}</p>
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
                  {value === s._id && <Check size={15} className={accent.icon} />}
                </button>
              ))
            )}
          </div>

          {/* Register new */}
          <div className="p-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => { setOpen(false); onRegisterNew(); }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 ${accent.btn} text-white rounded-xl text-xs font-bold transition-colors`}
            >
              <UserPlus size={13} /> Register New Supplier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Register Supplier Modal ──────────────────────────────────────────────────
function RegisterSupplierModal({ onClose, onSaved, type = "lubricant" }) {
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus size={15} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Register {type === "store" ? "Store" : "Lubricant"} Supplier
              </h3>
              <p className="text-blue-100 text-xs">
                {type === "store"
                  ? "Drinks, snacks and shop wholesalers"
                  : "Oil and lubricant distributors"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Supplier / Company Name *</label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. ABC Lubricants Ltd"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Phone Number *</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 08012345678"
                type="tel"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Email Address</label>
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="supplier@example.com"
                type="email"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Supplier Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="gas">Gas Supplier</option>
              <option value="lubricant">Lubricant Supplier</option>
              <option value="store">Store Supplier</option>
              <option value="both">Gas & Lubricant</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Address (optional)</label>
            <input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Supplier's business address"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional info about this supplier…"
              rows={2}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>

          {error && (
            <div className="flex gap-2 items-start bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-2.5">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {saving ? "Saving…" : "Register Supplier"}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order card (orders tab) ──────────────────────────────────────────────────
function OrderCard({ order, onView, onDelete }) {
  const isDraft = order.status === "draft";
  const isReceived = order.status === "received";
  const cardTotal = (order.items || []).reduce((s, i) => {
    const qty = isReceived ? (i.receivedQuantity ?? i.quantityToProcure) : i.quantityToProcure;
    return s + qty * (i.unitCost || 0);
  }, 0);
  const hasCost = (order.items || []).some((i) => (i.unitCost || 0) > 0);
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{order.procurementNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5">
          <Building2 size={11} className="text-gray-400 shrink-0" />
          <span className="text-gray-400">Vendor:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
            {order.vendorName || <span className="italic text-gray-300">Not set</span>}
          </span>
        </div>
        {order.vendorPhone && (
          <div className="flex items-center gap-1.5">
            <Phone size={11} className="text-gray-400 shrink-0" />
            <span className="text-gray-500">{order.vendorPhone}</span>
          </div>
        )}
        <p><span className="text-gray-400">Items:</span> {order.items?.length} product{order.items?.length !== 1 ? "s" : ""}</p>
        <p><span className="text-gray-400">By:</span> {order.procuredByName}</p>
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
          <span className="text-gray-400">{isReceived ? "Actual Cost:" : "Est. Cost:"}</span>
          {hasCost ? (
            <span className={`font-bold ${isReceived ? "text-green-600 dark:text-green-400" : "text-blue-600"}`}>
              ₦{cardTotal.toLocaleString("en-NG")}
            </span>
          ) : (
            <span className="italic text-gray-300">Price pending</span>
          )}
        </div>
        {isReceived && (
          <div className="flex items-center justify-between pt-1.5">
            <span className="text-gray-400">Payment:</span>
            <PaymentBadge status={order.paymentStatus || "unpaid"} />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onView(order)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
        >
          <Eye size={13} /> View
        </button>
        {isDraft && (
          <button
            onClick={() => onDelete(order._id)}
            className="flex items-center justify-center p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition-colors min-w-[40px]"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Order detail modal ───────────────────────────────────────────────────────
function OrderDetailModal({ order: initialOrder, onClose, onUpdate, role }) {
  const [order, setOrder]               = useState(initialOrder);
  const [actioning,       setActioning]       = useState(false);
  const [confirmReceipt,  setConfirmReceipt]  = useState(false);
  const [receivedQtys,    setReceivedQtys]    = useState({});
  // Prices settled at the door, keyed by product id. Empty until touched, so an
  // untouched product keeps whatever the markup produces on the server.
  const [pricing,         setPricing]         = useState({});

  /**
   * The station catalogue, so the pricing rows know each product's units.
   * The PO line itself carries only a name and a cost — the pack ladder lives
   * on the product.
   */
  const { lubricants, fetchLubricants } = useLubricantStore();
  useEffect(() => { if (!lubricants?.length) fetchLubricants(); }, []);
  const productById = new Map((lubricants || []).map((l) => [String(l._id), l]));
  const [unitCosts,       setUnitCosts]       = useState({});
  const [paymentAmount,   setPaymentAmount]   = useState("");
  const [paymentNotes,    setPaymentNotes]    = useState("");
  const [paymentSaving,   setPaymentSaving]   = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [editVendorId,    setEditVendorId]    = useState("");
  const [editVendorName,  setEditVendorName]  = useState("");
  const [editVendorPhone, setEditVendorPhone] = useState("");
  const [editVendorEmail, setEditVendorEmail] = useState("");
  const [editNotes,  setEditNotes]  = useState("");
  const [editItems,  setEditItems]  = useState([]);
  const [productSearch,   setProductSearch]   = useState("");
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [showRegister,    setShowRegister]    = useState(false);

  const { markOrdered, markReceived, updateProcurement, recordPayment, reorderItems, fetchReorderItems, confirmProcurement } = useProcurementStore();

  // ── Supplier's reply to the PO ────────────────────────────────────────────
  const [showSupplierReply, setShowSupplierReply] = useState(false);
  const [replyRows, setReplyRows] = useState({});
  const [supplierNotes, setSupplierNotes] = useState(order?.supplierNotes || "");
  const [savingReply, setSavingReply] = useState(false);

  const setReplyRow = (lubricantId, field, value) =>
    setReplyRows((prev) => ({
      ...prev,
      [lubricantId]: { ...(prev[lubricantId] || {}), [field]: value },
    }));

  // The markup lives on the product, not the order line, so the suggested
  // selling price comes from the reorder list the page already loaded.
  const productMarkup = (lubricantId) =>
    reorderItems.find((p) => String(p._id) === String(lubricantId))?.sellingPercentage ?? 0;

  const saveSupplierReply = async () => {
    setSavingReply(true);
    try {
      // Only send lines the user actually touched — an untouched line means
      // "confirmed as requested", and sending blanks would overwrite it.
      const items = Object.entries(replyRows)
        .map(([lubricantId, r]) => {
          const out = { lubricantId };
          if (r.confirmedQuantity !== undefined && r.confirmedQuantity !== "")
            out.confirmedQuantity = Number(r.confirmedQuantity);
          if (r.confirmedUnitCost !== undefined && r.confirmedUnitCost !== "")
            out.confirmedUnitCost = Number(r.confirmedUnitCost);
          if (r.confirmedSellingPrice !== undefined && r.confirmedSellingPrice !== "")
            out.confirmedSellingPrice = Number(r.confirmedSellingPrice);
          return out;
        })
        .filter((o) => Object.keys(o).length > 1);

      const result = await confirmProcurement(order._id, items, supplierNotes);
      if (result.success) {
        setOrder(result.data);
        setShowSupplierReply(false);
        toast.success(result.message || "Supplier's reply saved");
        // Name what changed — that is the manager's decision point, not a
        // detail to be discovered later at the delivery door.
        (result.changes || []).forEach((c) =>
          toast(`${c.productName}: ${c.requestedQty} → ${c.confirmedQty ?? c.requestedQty} @ ₦${Number(c.confirmedUnitCost ?? c.originalUnitCost).toLocaleString()}`, { icon: "📝" })
        );
      } else {
        toast.error(result.error || "Could not save the supplier's reply");
      }
    } finally {
      setSavingReply(false);
    }
  };
  const { suppliers, loading: suppLoading, fetchSuppliers } = useSupplierStore();

  const canEdit = (role === "manager" || role === "supervisor") &&
    (order.status === "draft" || order.status === "submitted");

  // Marking a PO ordered/received is an operational action for goods-handling
  // roles only. Accountant and cashier see the PO (for billing/context) but must
  // never move it through receipt — the server enforces the same set.
  const canReceive = ["manager", "supervisor", "admin"].includes(role);

  // Registering a vendor from inside an order registers them for THAT kind of
  // supply — a drinks wholesaler added while editing a store order must not
  // then appear in the lubricant vendor list.
  const supplierType = order?.orderType === "store" ? "store" : "lubricant";

  useEffect(() => {
    if (isEditing) fetchSuppliers(supplierType);
  }, [isEditing, supplierType]);

  const enterEdit = () => {
    setEditVendorId("");
    setEditVendorName(order.vendorName || "");
    setEditVendorPhone(order.vendorPhone || "");
    setEditVendorEmail(order.vendorEmail || "");
    setEditNotes(order.notes || "");
    setEditItems((order.items || []).map((i) => ({ ...i })));
    // Editing an existing order — load the products for THAT order's type, so a
    // store order cannot have engine oil added to it from a stale list.
    if (!reorderItems.length) fetchReorderItems(order.orderType || "lubricant");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowAddProducts(false);
    setProductSearch("");
  };

  const handleSelectSupplier = (supplier) => {
    setEditVendorId(supplier._id);
    setEditVendorName(supplier.name);
    setEditVendorPhone(supplier.phone || "");
    setEditVendorEmail(supplier.email || "");
  };

  const handleNewSupplierSaved = (supplier) => {
    handleSelectSupplier(supplier);
    fetchSuppliers(supplierType);
  };

  const updateEditQty = (lubricantId, qty) => {
    const n = Math.max(1, parseInt(qty) || 1);
    setEditItems((prev) => prev.map((i) =>
      i.lubricantId?.toString() === lubricantId?.toString() ? { ...i, quantityToProcure: n } : i
    ));
  };

  const removeEditItem = (lubricantId) =>
    setEditItems((prev) => prev.filter((i) => i.lubricantId?.toString() !== lubricantId?.toString()));

  const addProduct = (product) => {
    const id = product._id.toString();
    if (editItems.some((i) => i.lubricantId?.toString() === id)) return;
    setEditItems((prev) => [...prev, {
      lubricantId:       id,
      productName:       product.productName,
      productType:       product.productType || "",
      brand:             product.brand || "",
      currentStock:      product.qtyInStock ?? 0,
      reOrderLevel:      product.reOrderLevel ?? 0,
      quantityToProcure: Math.max(1, (product.reOrderLevel ?? 0) - (product.qtyInStock ?? 0)),
      unitCost:          product.unitCost ?? 0,
    }]);
  };

  const handleSave = async () => {
    if (!editItems.length) { toast.error("At least one item is required"); return; }
    setSaving(true);
    const result = await updateProcurement(order._id, {
      vendorName:  editVendorName,
      vendorPhone: editVendorPhone,
      vendorEmail: editVendorEmail,
      notes:       editNotes,
      items:       editItems,
    });
    setSaving(false);
    if (result.success) {
      toast.success("Order updated successfully");
      setOrder(result.data);
      if (onUpdate) onUpdate(result.data);
      setIsEditing(false);
      setShowAddProducts(false);
    } else {
      toast.error(result.error || "Failed to update order");
    }
  };

  const handleAction = async (fn, label) => {
    setActioning(true);
    const result = await fn(order._id);
    setActioning(false);
    if (result.success) { toast.success(`Marked as ${label}`); onClose(); }
    else toast.error(result.error || "Action failed");
  };

  const initConfirmReceipt = () => {
    const qtys = {};
    const costs = {};
    (order.items || []).forEach((item) => {
      const id = item.lubricantId?.toString();
      qtys[id]  = item.quantityToProcure;
      costs[id] = item.unitCost || 0;
    });
    setReceivedQtys(qtys);
    setUnitCosts(costs);
    setConfirmReceipt(true);
  };

  const handleConfirmReceived = async () => {
    setActioning(true);
    const receivedItems = (order.items || []).map((item) => ({
      lubricantId:      item.lubricantId.toString(),
      receivedQuantity: Number(receivedQtys[item.lubricantId?.toString()] ?? item.quantityToProcure),
      unitCost:         Number(unitCosts[item.lubricantId?.toString()] ?? item.unitCost ?? 0),
      // Prices as adjusted on this screen. Omitted when untouched, so the
      // server falls back to recomputing from each product own markup.
      ...(pricing[item.lubricantId?.toString()] || {}),
    }));
    const result = await markReceived(order._id, receivedItems);
    setActioning(false);
    if (result.success) {
      toast.success(result.data?.stockUpdated ? "Delivery confirmed — stock updated" : "Delivery confirmed");
      onClose();
    } else {
      toast.error(result.error || "Action failed");
    }
  };

  const viewTotal = order.items?.reduce((s, i) => s + i.quantityToProcure * i.unitCost, 0) || 0;
  const actualTotal = order.items?.reduce((s, i) => s + (i.receivedQuantity ?? i.quantityToProcure) * i.unitCost, 0) || 0;
  const editTotal = editItems.reduce((s, i) => s + i.quantityToProcure * (i.unitCost || 0), 0);
  const confirmActualTotal = (order.items || []).reduce((s, item) => {
    const id   = item.lubricantId?.toString();
    const qty  = receivedQtys[id] ?? item.quantityToProcure;
    const cost = unitCosts[id]    ?? item.unitCost ?? 0;
    return s + qty * cost;
  }, 0);

  const availableProducts = reorderItems.filter((p) => {
    if (editItems.some((i) => i.lubricantId?.toString() === p._id.toString())) return false;
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.productName?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
  });

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4"
        onClick={isEditing ? undefined : onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 w-full sm:rounded-2xl sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl rounded-t-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-start justify-between gap-3 z-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 dark:text-white">{order.procurementNumber}</p>
                {isEditing && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                    Editing
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={order.status} />
                <span className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              {!isEditing && canEdit && (
                <button onClick={enterEdit}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">
                  <Edit3 size={13} /> Edit
                </button>
              )}
              {isEditing && (
                <>
                  <button onClick={handleSave} disabled={saving || !editItems.length}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors">
                    <Save size={13} /> {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={cancelEdit}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Vendor / Procured By */}
            {isEditing ? (
              <div className="bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 size={12} /> Vendor / Supplier
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <UserPlus size={11} /> New Supplier
                  </button>
                </div>

                <SupplierSelector
                  value={editVendorId}
                  onChange={handleSelectSupplier}
                  onRegisterNew={() => setShowRegister(true)}
                  suppliers={suppliers}
                  loading={suppLoading}
                  accentColor="blue"
                />

                {editVendorName && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-blue-100">
                      <Building2 size={12} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{editVendorName}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-blue-100">
                      <Phone size={12} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{editVendorPhone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-blue-100">
                      <AtSign size={12} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{editVendorEmail || "No email"}</span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-gray-400">Or type vendor details manually:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Vendor Name</label>
                    <input
                      value={editVendorName}
                      onChange={(e) => setEditVendorName(e.target.value)}
                      placeholder="e.g. ABC Lubricants Ltd"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Vendor Phone</label>
                    <input
                      value={editVendorPhone}
                      onChange={(e) => setEditVendorPhone(e.target.value)}
                      placeholder="e.g. 080 1234 5678"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      Vendor Email <span className="font-normal text-blue-500">(order will be emailed to supplier on submit)</span>
                    </label>
                    <div className="relative">
                      <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        value={editVendorEmail}
                        onChange={(e) => setEditVendorEmail(e.target.value)}
                        placeholder="supplier@example.com"
                        type="email"
                        className="w-full pl-9 pr-3 border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Vendor</p>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-blue-400 shrink-0" />
                    <p className="font-bold text-gray-900 dark:text-white">{order.vendorName || "—"}</p>
                  </div>
                  {order.vendorPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-500">{order.vendorPhone}</p>
                    </div>
                  )}
                  {order.vendorEmail && (
                    <div className="flex items-center gap-2">
                      <AtSign size={12} className="text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-500 truncate">{order.vendorEmail}</p>
                    </div>
                  )}
                  {order.emailSentAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Order emailed {new Date(order.emailSentAt).toLocaleDateString("en-NG", { day:"numeric", month:"short" })}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Procured By</p>
                  <p className="font-bold text-gray-900 dark:text-white">{order.procuredByName}</p>
                  <p className="text-xs text-gray-400">{order.stationName}</p>
                </div>
              </div>
            )}

            {/* Items table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 -mx-4 sm:mx-0">
              <table className="w-full text-sm min-w-[520px]">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {(isEditing
                      ? ["Product", "Stock / Lvl", "Qty", "Unit Cost", "Total", ""]
                      : order.status === "received"
                        ? ["Product", "Brand", "Ordered", "Received", "Unit Cost", "Total"]
                        : ["Product", "Brand", "In Stock", "Threshold", "Qty to Buy", "Unit Cost", "Total"]
                    ).map((h) => (
                      <th key={h} className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {isEditing
                    ? editItems.map((item) => (
                      <tr key={item.lubricantId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 sm:px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.brand}</p>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {item.currentStock} / {item.reOrderLevel || "—"}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateEditQty(item.lubricantId, item.quantityToProcure - 1)}
                              className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform">
                              <Minus size={11} />
                            </button>
                            <input type="number" min={1} value={item.quantityToProcure}
                              onChange={(e) => updateEditQty(item.lubricantId, e.target.value)}
                              className="w-12 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm py-1 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                            />
                            <button onClick={() => updateEditQty(item.lubricantId, item.quantityToProcure + 1)}
                              className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform">
                              <Plus size={11} />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">₦{item.unitCost?.toLocaleString() || 0}</td>
                        <td className="px-3 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap">
                          ₦{(item.quantityToProcure * (item.unitCost || 0)).toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <button onClick={() => removeEditItem(item.lubricantId)}
                            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                    : order.items?.map((item, i) => {
                      const receivedQty = item.receivedQuantity ?? item.quantityToProcure;
                      const isShort = order.status === "received" && item.receivedQuantity != null && item.receivedQuantity < item.quantityToProcure;
                      return order.status === "received" ? (
                        <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isShort ? "bg-orange-50/40 dark:bg-orange-900/5" : ""}`}>
                          <td className="px-3 sm:px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                          <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">{item.brand || "—"}</td>
                          <td className="px-3 sm:px-4 py-3 text-gray-500">{item.quantityToProcure}</td>
                          <td className="px-3 sm:px-4 py-3">
                            <span className={`font-bold ${isShort ? "text-orange-600" : "text-green-600"}`}>{receivedQty}</span>
                            {isShort && <span className="text-xs text-orange-400 block">−{item.quantityToProcure - receivedQty} short</span>}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">₦{item.unitCost?.toLocaleString() || 0}</td>
                          <td className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">₦{(receivedQty * item.unitCost).toLocaleString()}</td>
                        </tr>
                      ) : (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-3 sm:px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                          <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">{item.brand || "—"}</td>
                          <td className="px-3 sm:px-4 py-3 text-gray-700 dark:text-gray-300">{item.currentStock}</td>
                          <td className="px-3 sm:px-4 py-3 text-gray-500">{item.reOrderLevel || "—"}</td>
                          <td className="px-3 sm:px-4 py-3 font-bold text-blue-600">{item.quantityToProcure}</td>
                          <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">₦{item.unitCost?.toLocaleString() || 0}</td>
                          <td className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">₦{(item.quantityToProcure * item.unitCost).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 dark:bg-blue-900/10">
                    <td colSpan={isEditing ? 4 : order.status === "received" ? 5 : 6} className="px-3 sm:px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300 text-sm">
                      {order.status === "received" ? "Actual Total" : "Estimated Total"}
                    </td>
                    <td colSpan={isEditing ? 2 : 1} className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      {order.status === "received" ? (
                        <div>
                          <p className="font-bold text-green-700 dark:text-green-400">₦{actualTotal.toLocaleString()}</p>
                          {actualTotal !== viewTotal && (
                            <p className="text-xs text-gray-400 line-through">₦{viewTotal.toLocaleString()}</p>
                          )}
                        </div>
                      ) : (
                        <span className="font-bold text-blue-700">₦{(isEditing ? editTotal : viewTotal).toLocaleString()}</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Add Products (edit mode) */}
            {isEditing && (
              <div className="border border-dashed border-blue-300 dark:border-blue-700 rounded-xl overflow-hidden">
                <button onClick={() => setShowAddProducts(!showAddProducts)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-semibold text-blue-700 dark:text-blue-400">
                  <span className="flex items-center gap-2"><Plus size={14} /> Add Products to Order</span>
                  <ChevronDown size={15} className={`transition-transform duration-200 ${showAddProducts ? "rotate-180" : ""}`} />
                </button>
                {showAddProducts && (
                  <div className="p-3 space-y-2 bg-white dark:bg-gray-900 border-t border-dashed border-blue-200 dark:border-blue-800">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search product name or brand…"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                      {availableProducts.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-5">
                          {reorderItems.length === 0 ? "Loading products…" : productSearch ? "No products match your search" : "All products already in this order"}
                        </p>
                      ) : availableProducts.map((p) => (
                        <div key={p._id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.productName}</p>
                            <p className="text-xs text-gray-400">{p.brand} · In stock: {p.qtyInStock}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <UrgencyBadge urgency={p.urgency} />
                            <button onClick={() => addProduct(p)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">
                              <Plus size={11} /> Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {isEditing ? (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Notes</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Additional notes (optional)…" rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>
            ) : order.notes ? (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{order.notes}</p>
              </div>
            ) : null}

            {/* ── Payment Panel (received orders only) ── */}
            {!isEditing && order.status === "received" && (role === "manager" || role === "supervisor" || role === "accountant") && (() => {
              const totalCost = (order.items || []).reduce((s, i) => s + (i.receivedQuantity ?? i.quantityToProcure) * (i.unitCost || 0), 0);
              const paid      = order.amountPaid || 0;
              const balance   = Math.max(0, totalCost - paid);
              const pStatus   = order.paymentStatus || "unpaid";

              const handlePayment = async () => {
                const amt = parseFloat(paymentAmount);
                if (isNaN(amt) || amt < 0) { toast.error("Enter a valid amount"); return; }
                setPaymentSaving(true);
                const result = await recordPayment(order._id, { amountPaid: amt, paymentNotes });
                setPaymentSaving(false);
                if (result.success) {
                  toast.success(result.data.paymentStatus === "paid" ? "Marked as fully paid" : "Payment recorded");
                  setOrder(result.data);
                  if (onUpdate) onUpdate(result.data);
                  setPaymentAmount("");
                  setPaymentNotes("");
                } else {
                  toast.error(result.error || "Failed to record payment");
                }
              };

              return (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <CircleDollarSign size={15} className="text-blue-500" /> Payment Status
                    </h4>
                    <PaymentBadge status={pStatus} />
                  </div>

                  {/* Cost breakdown */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Invoice Total</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {totalCost > 0 ? `₦${totalCost.toLocaleString("en-NG")}` : <span className="italic text-gray-400 text-xs">Prices not entered</span>}
                      </span>
                    </div>
                    {paid > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount Paid</span>
                        <span className="font-bold text-emerald-600">₦{paid.toLocaleString("en-NG")}</span>
                      </div>
                    )}
                    {pStatus !== "paid" && totalCost > 0 && (
                      <div className="flex justify-between border-t border-dashed border-gray-200 dark:border-gray-700 pt-2">
                        <span className="font-semibold text-red-600 dark:text-red-400">Outstanding</span>
                        <span className="font-bold text-red-600 dark:text-red-400">₦{balance.toLocaleString("en-NG")}</span>
                      </div>
                    )}
                    {pStatus === "paid" && order.paidAt && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={11} /> Paid on {new Date(order.paidAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}
                      </p>
                    )}
                    {order.paymentNotes && (
                      <p className="text-xs text-gray-400 italic">"{order.paymentNotes}"</p>
                    )}
                  </div>

                  {/* Record / update payment */}
                  {pStatus !== "paid" && (
                    <div className="bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-3.5 space-y-2.5">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <Banknote size={13} /> Record Payment
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Amount Paid (₦)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">₦</span>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder={totalCost > 0 ? totalCost.toLocaleString("en-NG") : "0.00"}
                              className="w-full pl-7 pr-3 border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white font-bold"
                            />
                          </div>
                          {totalCost > 0 && (
                            <button
                              type="button"
                              onClick={() => setPaymentAmount(String(balance))}
                              className="mt-1 text-[11px] text-blue-600 hover:underline"
                            >
                              Fill outstanding (₦{balance.toLocaleString("en-NG")})
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Payment Notes (optional)</label>
                          <input
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            placeholder="e.g. Bank transfer ref #123"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                      <button
                        disabled={paymentSaving || !paymentAmount}
                        onClick={handlePayment}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                      >
                        {paymentSaving ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                        {paymentSaving ? "Saving…" : "Record Payment"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Status actions (view mode) — goods-handling roles only */}
            {/* ── Supplier's reply ──────────────────────────────────────────
                The PO goes out; the supplier fills it in and sends it back by
                email, WhatsApp or on paper with what they can actually supply
                and today's prices. This is where that reply is entered, and it
                becomes what the delivery is checked against. */}
            {!isEditing && canReceive && showSupplierReply && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-xl p-3.5">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-0.5 flex items-center gap-1.5">
                    <ClipboardCheck size={15} /> Supplier's Reply
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mb-3">
                    Enter what {order.vendorName || "the supplier"} confirmed — quantity available and
                    their price today. Selling price updates from your markup; adjust it if you need to.
                  </p>

                  <div className="space-y-2.5">
                    {(order.items || []).map((it) => {
                      const row = replyRows[it.lubricantId] || {};
                      const cost = Number(row.confirmedUnitCost ?? it.unitCost ?? 0);
                      const markup = Number(it.sellingPercentage ?? productMarkup(it.lubricantId) ?? 0);
                      const suggested = cost * (1 + markup / 100);
                      const selling = row.confirmedSellingPrice ?? (suggested ? suggested.toFixed(2) : "");
                      const qtyShort =
                        row.confirmedQuantity !== undefined &&
                        Number(row.confirmedQuantity) < Number(it.quantityToProcure);
                      const priceUp = cost > Number(it.unitCost || 0);

                      return (
                        <div key={it.lubricantId} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 border border-amber-100 dark:border-gray-700">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold dark:text-gray-100">{it.productName}</p>
                            <p className="text-[11px] text-gray-400 whitespace-nowrap">
                              asked {it.quantityToProcure} @ ₦{Number(it.unitCost || 0).toLocaleString()}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[11px] text-gray-500">Qty available</label>
                              <input
                                type="number" min="0"
                                value={row.confirmedQuantity ?? ""}
                                placeholder={String(it.quantityToProcure)}
                                onChange={(e) => setReplyRow(it.lubricantId, "confirmedQuantity", e.target.value)}
                                className={`w-full px-2 py-1.5 text-sm rounded-lg border ${qtyShort ? "border-amber-400 bg-amber-50" : "border-gray-200 dark:border-gray-600"} dark:bg-gray-700`}
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-gray-500">Their cost ₦</label>
                              <input
                                type="number" min="0" step="0.01"
                                value={row.confirmedUnitCost ?? ""}
                                placeholder={String(it.unitCost ?? 0)}
                                onChange={(e) => setReplyRow(it.lubricantId, "confirmedUnitCost", e.target.value)}
                                className={`w-full px-2 py-1.5 text-sm rounded-lg border ${priceUp ? "border-red-300 bg-red-50" : "border-gray-200 dark:border-gray-600"} dark:bg-gray-700`}
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-gray-500">
                                Sell at ₦ {markup ? <span className="text-gray-400">({markup}%)</span> : null}
                              </label>
                              <input
                                type="number" min="0" step="0.01"
                                value={selling}
                                onChange={(e) => setReplyRow(it.lubricantId, "confirmedSellingPrice", e.target.value)}
                                className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                              />
                            </div>
                          </div>

                          {qtyShort && (
                            <p className="text-[11px] text-amber-700 mt-1.5">
                              Short by {Number(it.quantityToProcure) - Number(row.confirmedQuantity)} — the
                              delivery will be checked against {row.confirmedQuantity}, not {it.quantityToProcure}.
                            </p>
                          )}
                          {Number(selling) > 0 && Number(selling) < cost && (
                            <p className="text-[11px] text-red-600 mt-1.5">
                              Selling below cost — check this is intended.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <textarea
                    value={supplierNotes}
                    onChange={(e) => setSupplierNotes(e.target.value)}
                    placeholder="Notes from the supplier (delivery date, part shipment, substitutions...)"
                    rows={2}
                    className="w-full mt-2.5 px-2.5 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                  />

                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <button
                      disabled={savingReply}
                      onClick={saveSupplierReply}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
                    >
                      {savingReply ? <Loader2 size={14} className="animate-spin" /> : <ClipboardCheck size={14} />}
                      Save supplier's reply
                    </button>
                    <button
                      onClick={() => setShowSupplierReply(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isEditing && canReceive && (order.status === "submitted" || order.status === "ordered" || order.status === "confirmed") && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                {!confirmReceipt ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {!showSupplierReply && ["submitted", "ordered", "confirmed"].includes(order.status) && (
                        <button
                          disabled={actioning}
                          onClick={() => {
                            // The suggested selling price needs each product's
                            // markup, which lives on the product not the order
                            // line — make sure that list is loaded first.
                            if (!reorderItems.length) fetchReorderItems(order.orderType || "lubricant");
                            setShowSupplierReply(true);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 w-full sm:w-auto">
                          <ClipboardCheck size={14} />
                          {order.status === "confirmed" ? "Update supplier's reply" : "Enter supplier's reply"}
                        </button>
                      )}
                      {order.status === "submitted" && (
                        <button disabled={actioning} onClick={() => handleAction(markOrdered, "ordered")}
                          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 w-full sm:w-auto">
                          <TruckIcon size={14} /> Mark as Ordered
                        </button>
                      )}
                      {["submitted", "ordered", "confirmed"].includes(order.status) && (
                        <button disabled={actioning} onClick={initConfirmReceipt}
                          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 w-full sm:w-auto">
                          <BadgeCheck size={14} />
                          <span>Mark Received<span className="hidden sm:inline"> — confirm delivery</span></span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* ── Confirm Receipt Panel ── */}
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-xl p-3.5">
                      <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-0.5 flex items-center gap-1.5">
                        <BadgeCheck size={15} /> Confirm Delivery
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter the <strong>unit price from the supplier's invoice</strong> and the actual quantity received for each item.
                        This ensures cost records are accurate for your accountant.
                      </p>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-0.5">
                      {order.items?.map((item) => {
                        const id      = item.lubricantId?.toString();
                        const qty     = receivedQtys[id] ?? item.quantityToProcure;
                        const cost    = unitCosts[id] ?? item.unitCost ?? 0;
                        const isShort = qty < item.quantityToProcure;
                        const lineTotal = qty * cost;
                        return (
                          <div key={id} className={`p-3 rounded-xl border ${isShort ? "border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-700" : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"}`}>
                            <div className="flex items-start gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.productName}</p>
                                <p className="text-xs text-gray-400">{item.brand || "—"} · Ordered: <strong>{item.quantityToProcure}</strong> pcs</p>
                              </div>
                              <div className={`text-right shrink-0 min-w-[72px]`}>
                                <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Line Total</p>
                                <p className={`text-sm font-bold ${cost === 0 ? "text-gray-400" : isShort ? "text-orange-600" : "text-green-600"}`}>
                                  {cost > 0 ? `₦${lineTotal.toLocaleString()}` : "—"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Unit Cost (₦) — from supplier invoice</p>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={cost}
                                  onChange={(e) => setUnitCosts((prev) => ({ ...prev, [id]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                                  className="w-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 rounded-lg px-2.5 py-1 text-sm outline-none font-bold text-blue-700 dark:text-blue-300 focus:border-blue-500"
                                />
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Qty Received</p>
                                <input
                                  type="number"
                                  min={0}
                                  value={qty}
                                  onChange={(e) => setReceivedQtys((prev) => ({ ...prev, [id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                  className={`w-16 border rounded-lg text-center text-sm py-1 outline-none font-bold ${isShort ? "border-orange-300 text-orange-600 focus:border-orange-500 dark:bg-gray-700" : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:border-green-500 dark:bg-gray-700"}`}
                                />
                              </div>
                            </div>

                            {/* The delivery is the moment the real cost is known
                                — invoice in hand — so it is where the shelf
                                price gets settled, singles and packs alike. */}
                            <ReceivePricing
                              product={productById.get(id)}
                              unitCost={cost}
                              value={pricing[id] || {}}
                              onChange={(next) => setPricing((prev) => ({ ...prev, [id]: next }))}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Total summary */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Quoted Total</span>
                        <span className={`text-sm ${confirmActualTotal < viewTotal ? "line-through text-gray-400" : "font-bold text-gray-700 dark:text-gray-200"}`}>
                          ₦{viewTotal.toLocaleString()}
                        </span>
                      </div>
                      {confirmActualTotal < viewTotal && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Actual Total</span>
                          <span className="text-base font-bold text-orange-600">₦{confirmActualTotal.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setConfirmReceipt(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Cancel
                      </button>
                      <button disabled={actioning} onClick={handleConfirmReceived}
                        className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold disabled:opacity-60 transition-colors">
                        {actioning ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
                        {actioning ? "Confirming…" : "Confirm Receipt — Update Stock"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Edit mode — bottom save/cancel */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button onClick={cancelEdit}
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:border-gray-400 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !editItems.length}
                  className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-sm active:scale-[0.98]">
                  <Save size={14} />
                  {saving ? "Saving changes…" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRegister && (
        <RegisterSupplierModal
          type={supplierType}
          onClose={() => setShowRegister(false)}
          onSaved={handleNewSupplierSaved}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProcurementPage() {
  const {
    reorderItems, procurements, reorderLoading, loading,
    fetchReorderItems, fetchProcurements,
    createProcurement, submitProcurement, deleteProcurement,
  } = useProcurementStore();

  const { suppliers, loading: suppLoading, fetchSuppliers } = useSupplierStore();

  const [activeTab,       setActiveTab]       = useState("new");
  const [selected,        setSelected]        = useState(new Set());
  const [draftItems,      setDraftItems]      = useState([]);
  const [vendorId,        setVendorId]        = useState("");
  const [vendorName,      setVendorName]      = useState("");
  const [vendorPhone,     setVendorPhone]     = useState("");
  const [vendorEmail,     setVendorEmail]     = useState("");
  const [notes,           setNotes]           = useState("");
  const [savingDraft,     setSavingDraft]     = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [viewOrder,       setViewOrder]       = useState(null);
  const [urgencyFilter,   setUrgencyFilter]   = useState("all");
  const [paymentFilter,   setPaymentFilter]   = useState("all");
  const [userData,        setUserData]        = useState(null);
  const [showRegister,    setShowRegister]    = useState(false);

  /**
   * Lubricants and store stock are bought from different suppliers, so the whole
   * screen works in one mode at a time: the reorder list, the existing orders and
   * the vendor dropdown all follow this switch. Mixing them would offer a drinks
   * wholesaler in the vendor list while ordering engine oil.
   */
  const [orderType, setOrderType] = useState("lubricant");
  // A vendor registered from this screen is registered for whatever is being
  // ordered right now, so they appear in the correct dropdown next time.
  const supplierType = orderType;

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setUserData(u);
      if (u?.role === "accountant") setActiveTab("orders");
    } catch {}
  }, []);

  useEffect(() => {
    fetchReorderItems(orderType);
    fetchProcurements("", orderType);
    fetchSuppliers(orderType);
  }, [orderType]);

  const procuredBy     = userData ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Manager" : "Manager";
  const stationLogo    = userData?.station?.logoUrl || userData?.station?.logo || userData?.station?.image || "";
  const stationName    = userData?.station?.name || "";
  const stationAddress = userData?.station?.address || "";

  const filteredItems = urgencyFilter === "all" ? reorderItems : reorderItems.filter((i) => i.urgency === urgencyFilter);

  const needsAttentionCount = useMemo(
    () => reorderItems.filter((i) => i.urgency !== "healthy").length,
    [reorderItems]
  );

  const handleSelectSupplier = (supplier) => {
    setVendorId(supplier._id);
    setVendorName(supplier.name);
    setVendorPhone(supplier.phone || "");
    setVendorEmail(supplier.email || "");
  };

  const handleNewSupplierSaved = (supplier) => {
    handleSelectSupplier(supplier);
    fetchSuppliers(supplierType);
  };

  const toggleSelect = (item) => {
    const id = item._id.toString();
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
      setDraftItems((p) => p.filter((d) => d.lubricantId !== id));
    } else {
      next.add(id);
      setDraftItems((p) => [...p, {
        lubricantId:       id,
        productName:       item.productName,
        productType:       item.productType || "",
        brand:             item.brand || "",
        currentStock:      item.qtyInStock ?? 0,
        reOrderLevel:      item.reOrderLevel ?? 0,
        quantityToProcure: Math.max(1, (item.reOrderLevel ?? 0) - (item.qtyInStock ?? 0)),
        unitCost:          item.unitCost ?? 0,
      }]);
    }
    setSelected(next);
  };

  const updateDraftQty = (lubricantId, qty) => {
    const n = Math.max(1, parseInt(qty) || 1);
    setDraftItems((p) => p.map((d) => d.lubricantId === lubricantId ? { ...d, quantityToProcure: n } : d));
  };

  const removeDraftItem = (lubricantId) => {
    const next = new Set(selected);
    next.delete(lubricantId);
    setSelected(next);
    setDraftItems((p) => p.filter((d) => d.lubricantId !== lubricantId));
  };

  const totalEstimate = useMemo(
    () => draftItems.reduce((s, i) => s + i.quantityToProcure * i.unitCost, 0),
    [draftItems]
  );

  const resetForm = () => {
    setDraftItems([]); setSelected(new Set());
    setVendorId(""); setVendorName(""); setVendorPhone(""); setVendorEmail(""); setNotes("");
  };

  const handleSaveDraft = async () => {
    if (!draftItems.length) { toast.error("Add at least one item"); return; }
    setSavingDraft(true);
    const result = await createProcurement({ vendorName, vendorPhone, vendorEmail, items: draftItems, notes });
    setSavingDraft(false);
    if (result.success) { toast.success(`Draft ${result.data.procurementNumber} saved`); resetForm(); setActiveTab("orders"); }
    else toast.error(result.error || "Failed to save draft");
  };

  const handleSubmit = async () => {
    if (!draftItems.length) { toast.error("No items selected"); return; }
    if (!vendorName.trim()) { toast.error("Vendor name is required"); return; }
    setSubmitting(true);
    const cr = await createProcurement({ vendorName, vendorPhone, vendorEmail, items: draftItems, notes });
    if (!cr.success) { setSubmitting(false); toast.error(cr.error || "Failed to create"); return; }
    const sr = await submitProcurement(cr.data._id);
    setSubmitting(false);
    if (sr.success) { toast.success(`${cr.data.procurementNumber} submitted`); resetForm(); setActiveTab("orders"); }
    else toast.error(sr.error || "Failed to submit");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this draft procurement?")) return;
    const r = await deleteProcurement(id);
    if (r.success) toast.success("Draft deleted");
    else toast.error(r.error || "Failed to delete");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <PageBackBar />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{orderType === "store" ? "Store" : "Lubricant"} Procurement</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Select products to procure, set vendor details and submit</p>
              </div>
            </div>
            {/* Lubricants vs Store — different suppliers, so never one list */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full sm:w-auto mr-0 sm:mr-2">
              {[
                { key: "lubricant", label: "Lubricants" },
                { key: "store", label: "Store" },
              ].map((o) => (
                <button
                  key={o.key}
                  onClick={() => setOrderType(o.key)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    orderType === o.key
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {(userData?.role === "accountant" ? ["orders"] : ["new", "orders"]).map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === t
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  }`}>
                  {t === "new" ? "New Order" : `Orders${procurements.length ? ` (${procurements.length})` : ""}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">

        {/* ── NEW ORDER TAB ── */}
        {activeTab === "new" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">

            {/* LEFT — Lubricant inventory list */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                    <Package size={17} className="text-blue-500 shrink-0" />
                    {orderType === "store" ? "Store" : "Lubricant"} Inventory
                    {reorderItems.length > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{reorderItems.length}</span>
                    )}
                  </h2>
                  {needsAttentionCount > 0 && (
                    <p className="text-xs text-orange-500 mt-0.5 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      {needsAttentionCount} product{needsAttentionCount !== 1 ? "s" : ""} need attention
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800">
                    <Filter size={12} className="text-gray-400 shrink-0" />
                    <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}
                      className="text-xs bg-transparent dark:text-white outline-none cursor-pointer">
                      <option value="all">All Products</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="critical">Critical</option>
                      <option value="low">Low Stock</option>
                      <option value="healthy">Healthy</option>
                    </select>
                  </div>
                  <button onClick={() => fetchReorderItems(orderType)} title="Refresh inventory"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <RefreshCw size={14} className={reorderLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {reorderLoading ? (
                <div className="flex items-center justify-center h-36">
                  <RefreshCw size={24} className="animate-spin text-blue-500" />
                </div>
              ) : reorderItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-10 text-center">
                  <Package size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No {orderType === "store" ? "store" : "lubricant"} products found</p>
                  <p className="text-xs text-gray-400 mt-1">Add {orderType === "store" ? "store items" : "lubricant products"} in the Lubricant Management section</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                  <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No products match this filter</p>
                  <button onClick={() => setUrgencyFilter("all")} className="mt-2 text-xs text-blue-600 hover:underline">
                    Show all products
                  </button>
                </div>
              ) : (
                <div className="space-y-2 xl:max-h-[65vh] xl:overflow-y-auto xl:pr-1">
                  {filteredItems.map((item) => {
                    const id = item._id.toString();
                    const isSelected = selected.has(id);
                    const pct = item.reOrderLevel > 0
                      ? Math.round((item.qtyInStock / item.reOrderLevel) * 100)
                      : item.qtyInStock > 0 ? 100 : 0;
                    return (
                      <label key={id}
                        className={`flex items-start gap-3 p-3.5 sm:p-4 bg-white dark:bg-gray-900 border-2 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-sm"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}>
                        <div className="flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item)} className="w-4 h-4 accent-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.productName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.brand}{item.productType ? ` · ${item.productType}` : ""}</p>
                            </div>
                            <UrgencyBadge urgency={item.urgency} />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                            <span>In stock: <strong className="text-gray-800 dark:text-gray-200">{item.qtyInStock}</strong></span>
                            {item.reOrderLevel > 0 && (
                              <span>Threshold: <strong className="text-gray-800 dark:text-gray-200">{item.reOrderLevel}</strong></span>
                            )}
                            <span className="text-gray-400">{pct}%</span>
                          </div>
                          <StockBar current={item.qtyInStock} max={item.reOrderLevel} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT — Procurement form */}
            <div className="space-y-3 sm:space-y-4">

              {/* Station header card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  {stationLogo ? (
                    <img src={stationLogo} alt="logo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain border border-gray-100 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Package size={22} className="text-blue-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">{stationName || "Your Station"}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{stationAddress}</p>
                    <p className="text-xs text-gray-400 mt-1">Procured by: <strong className="text-gray-600 dark:text-gray-300">{procuredBy}</strong></p>
                  </div>
                </div>
              </div>

              {/* ── Supplier selector section ── */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                    <Building2 size={15} className="text-blue-500" /> Vendor / Supplier
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
                      {suppliers.length} registered
                    </span>
                    <button type="button" onClick={() => setShowRegister(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      <UserPlus size={11} /> New
                    </button>
                  </div>
                </div>

                <SupplierSelector
                  value={vendorId}
                  onChange={handleSelectSupplier}
                  onRegisterNew={() => setShowRegister(true)}
                  suppliers={suppliers}
                  loading={suppLoading}
                  accentColor="blue"
                />

                {/* Selected supplier chips */}
                {vendorName && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-900/10 rounded-xl px-3 py-2 border border-blue-100">
                      <Building2 size={12} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{vendorName}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-900/10 rounded-xl px-3 py-2 border border-blue-100">
                      <Phone size={12} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{vendorPhone || "No phone"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-900/10 rounded-xl px-3 py-2 border border-blue-100">
                      <AtSign size={12} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{vendorEmail || "No email"}</span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-gray-400">Or type vendor details manually:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Vendor Name *</label>
                    <input value={vendorName} onChange={(e) => { setVendorName(e.target.value); setVendorId(""); }}
                      placeholder="e.g. ABC Lubricants Ltd"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-3 sm:py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Vendor Phone</label>
                    <input value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder="e.g. 080 1234 5678"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-3 sm:py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      Vendor Email <span className="font-normal text-blue-500">(purchase order emailed to supplier automatically on submit)</span>
                    </label>
                    <div className="relative">
                      <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)}
                        placeholder="supplier@example.com"
                        type="email"
                        className="w-full pl-9 pr-3 border border-gray-300 dark:border-gray-600 rounded-xl py-3 sm:py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Procurement list */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                    Procurement List
                    {draftItems.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{draftItems.length}</span>
                    )}
                  </h3>
                  {draftItems.length > 0 && (
                    <p className="text-xs text-gray-400 shrink-0">
                      Est. <strong className="text-blue-600">₦{totalEstimate.toLocaleString()}</strong>
                    </p>
                  )}
                </div>

                {draftItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 px-4">
                    <ShoppingCart size={28} className="mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-center">No items selected</p>
                    <p className="text-xs mt-1 text-center text-gray-400">
                      Tick products from the list <span className="xl:hidden">above</span><span className="hidden xl:inline">on the left</span>
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {["Product", "Stock / Lvl", "Qty", "Cost", ""].map((h) => (
                            <th key={h} className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {draftItems.map((item) => (
                          <tr key={item.lubricantId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <td className="px-3 sm:px-4 py-3">
                              <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap text-xs sm:text-sm">{item.productName}</p>
                              <p className="text-xs text-gray-400">{item.brand}</p>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {item.currentStock} / {item.reOrderLevel || "—"}
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => updateDraftQty(item.lubricantId, item.quantityToProcure - 1)}
                                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform">
                                  <Minus size={11} />
                                </button>
                                <input type="number" min={1} value={item.quantityToProcure}
                                  onChange={(e) => updateDraftQty(item.lubricantId, e.target.value)}
                                  className="w-12 sm:w-14 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm py-1.5 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                />
                                <button onClick={() => updateDraftQty(item.lubricantId, item.quantityToProcure + 1)}
                                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform">
                                  <Plus size={11} />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              ₦{item.unitCost?.toLocaleString() || 0}
                              <br />
                              <strong className="text-gray-700 dark:text-gray-300">
                                ₦{(item.quantityToProcure * item.unitCost).toLocaleString()}
                              </strong>
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <button onClick={() => removeDraftItem(item.lubricantId)}
                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Notes + action buttons */}
                <div className="px-4 sm:px-5 pb-5 pt-4 space-y-3 border-t border-gray-50 dark:border-gray-800">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes (optional)..."
                    rows={2}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleSaveDraft} disabled={savingDraft || !draftItems.length}
                      className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 transition-colors">
                      <Save size={14} />
                      {savingDraft ? "Saving..." : "Save Draft"}
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || !draftItems.length}
                      className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-sm active:scale-[0.98]">
                      <Send size={14} />
                      {submitting ? "Submitting..." : "Submit Order"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (() => {
          // Outstanding debt summary
          const receivedOrders   = procurements.filter((o) => o.status === "received");
          const unpaidOrders     = receivedOrders.filter((o) => (o.paymentStatus || "unpaid") !== "paid");
          const totalOutstanding = unpaidOrders.reduce((s, o) => {
            const total = (o.items || []).reduce((si, i) => si + (i.receivedQuantity ?? i.quantityToProcure) * (i.unitCost || 0), 0);
            const paid  = o.amountPaid || 0;
            return s + Math.max(0, total - paid);
          }, 0);

          const displayOrders = procurements.filter((o) => {
            if (paymentFilter === "outstanding") return o.status === "received" && (o.paymentStatus || "unpaid") !== "paid";
            if (paymentFilter === "paid")        return o.status === "received" && o.paymentStatus === "paid";
            return true;
          });

          return (
            <div className="space-y-4">
              {/* Outstanding debt card */}
              {totalOutstanding > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0">
                      <CircleDollarSign size={20} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Total Outstanding to Suppliers</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">₦{totalOutstanding.toLocaleString("en-NG")}</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                        {unpaidOrders.length} unpaid / part-paid order{unpaidOrders.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPaymentFilter(paymentFilter === "outstanding" ? "all" : "outstanding")}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      paymentFilter === "outstanding"
                        ? "bg-red-600 text-white"
                        : "bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-700 hover:bg-red-50"
                    }`}
                  >
                    <Filter size={13} /> {paymentFilter === "outstanding" ? "Show All" : "Show Outstanding"}
                  </button>
                </div>
              )}

              {/* Header + filter */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-gray-900 dark:text-white">Procurement Orders</h2>
                  {paymentFilter !== "all" && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                      {paymentFilter === "outstanding" ? "Outstanding" : "Paid"} filter active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Payment filter pills */}
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    {[["all","All"],["outstanding","Unpaid"],["paid","Paid"]].map(([val,lbl]) => (
                      <button key={val} onClick={() => setPaymentFilter(val)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          paymentFilter === val
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                        }`}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                  <button onClick={fetchProcurements}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <RefreshCw size={28} className="animate-spin text-blue-500" />
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 sm:p-16 text-center">
                  <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">
                    {paymentFilter === "outstanding" ? "No outstanding payments" : paymentFilter === "paid" ? "No paid orders yet" : "No procurement orders yet"}
                  </p>
                  {paymentFilter !== "all" && (
                    <button onClick={() => setPaymentFilter("all")} className="mt-2 text-xs text-blue-600 hover:underline">
                      Show all orders
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {displayOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onView={setViewOrder} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onUpdate={(updated) => setViewOrder(updated)}
          role={userData?.role}
        />
      )}

      {/* Register Supplier Modal (main page level) */}
      {showRegister && (
        <RegisterSupplierModal
          type={supplierType}
          onClose={() => setShowRegister(false)}
          onSaved={handleNewSupplierSaved}
        />
      )}
    </div>
  );
}

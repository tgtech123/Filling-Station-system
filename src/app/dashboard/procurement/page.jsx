"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, Plus, Minus, Trash2, Send,
  RefreshCw, CheckCircle, AlertTriangle, XCircle,
  Eye, Edit3, Save, FileText, TruckIcon, BadgeCheck, Filter, ArrowLeft,
  Search, ChevronDown,
} from "lucide-react";
import useProcurementStore from "@/store/useProcurementStore";
import toast from "react-hot-toast";

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
  // when no reorder threshold is set (max=0), treat stock as full
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : (current > 0 ? 100 : 0);
  const color = pct === 0 ? "bg-red-500" : pct < 50 ? "bg-orange-400" : pct < 100 ? "bg-yellow-400" : "bg-green-400";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Order card (orders tab) ─────────────────────────────────────────────────
function OrderCard({ order, onView, onDelete }) {
  const isDraft = order.status === "draft";
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
        <p><span className="text-gray-400">Vendor:</span> {order.vendorName || <span className="italic text-gray-300">Not set</span>}</p>
        <p><span className="text-gray-400">Items:</span> {order.items?.length} product{order.items?.length !== 1 ? "s" : ""}</p>
        <p><span className="text-gray-400">By:</span> {order.procuredByName}</p>
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

// ─── Order detail modal ──────────────────────────────────────────────────────
function OrderDetailModal({ order: initialOrder, onClose, onUpdate, role }) {
  const [order, setOrder]               = useState(initialOrder);
  const [actioning, setActioning]       = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorPhone, setEditVendorPhone] = useState("");
  const [editNotes, setEditNotes]       = useState("");
  const [editItems, setEditItems]       = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showAddProducts, setShowAddProducts] = useState(false);

  const { markOrdered, markReceived, updateProcurement, reorderItems, fetchReorderItems } = useProcurementStore();

  const canEdit = (role === "manager" || role === "supervisor") &&
    (order.status === "draft" || order.status === "submitted");

  const enterEdit = () => {
    setEditVendorName(order.vendorName || "");
    setEditVendorPhone(order.vendorPhone || "");
    setEditNotes(order.notes || "");
    setEditItems((order.items || []).map(i => ({ ...i })));
    if (!reorderItems.length) fetchReorderItems();
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowAddProducts(false);
    setProductSearch("");
  };

  const updateEditQty = (lubricantId, qty) => {
    const n = Math.max(1, parseInt(qty) || 1);
    setEditItems(prev => prev.map(i =>
      i.lubricantId?.toString() === lubricantId?.toString() ? { ...i, quantityToProcure: n } : i
    ));
  };

  const removeEditItem = (lubricantId) =>
    setEditItems(prev => prev.filter(i => i.lubricantId?.toString() !== lubricantId?.toString()));

  const addProduct = (product) => {
    const id = product._id.toString();
    if (editItems.some(i => i.lubricantId?.toString() === id)) return;
    setEditItems(prev => [...prev, {
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

  const viewTotal = order.items?.reduce((s, i) => s + i.quantityToProcure * i.unitCost, 0) || 0;
  const editTotal = editItems.reduce((s, i) => s + i.quantityToProcure * (i.unitCost || 0), 0);

  const availableProducts = reorderItems.filter(p => {
    if (editItems.some(i => i.lubricantId?.toString() === p._id.toString())) return false;
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.productName?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
  });

  return (
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

        {/* ── Header ───────────────────────────────────────────────── */}
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
              <button
                onClick={enterEdit}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || !editItems.length}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  <Save size={13} /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
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

          {/* ── Vendor / Procured By ─────────────────────────────────── */}
          {isEditing ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Vendor Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Vendor / Supplier Name</label>
                  <input
                    value={editVendorName}
                    onChange={(e) => setEditVendorName(e.target.value)}
                    placeholder="e.g. ABC Lubricants Ltd"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Vendor Phone</label>
                  <input
                    value={editVendorPhone}
                    onChange={(e) => setEditVendorPhone(e.target.value)}
                    placeholder="e.g. 080 1234 5678"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Vendor</p>
                <p className="font-bold text-gray-900 dark:text-white">{order.vendorName || "—"}</p>
                <p className="text-sm text-gray-500">{order.vendorPhone || "—"}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Procured By</p>
                <p className="font-bold text-gray-900 dark:text-white">{order.procuredByName}</p>
                <p className="text-xs text-gray-400">{order.stationName}</p>
              </div>
            </div>
          )}

          {/* ── Items table ──────────────────────────────────────────── */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {(isEditing
                    ? ["Product", "Stock / Lvl", "Qty", "Unit Cost", "Total", ""]
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
                          <button
                            onClick={() => updateEditQty(item.lubricantId, item.quantityToProcure - 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform"
                          ><Minus size={11} /></button>
                          <input
                            type="number" min={1}
                            value={item.quantityToProcure}
                            onChange={(e) => updateEditQty(item.lubricantId, e.target.value)}
                            className="w-12 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm py-1 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                          <button
                            onClick={() => updateEditQty(item.lubricantId, item.quantityToProcure + 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform"
                          ><Plus size={11} /></button>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs text-gray-500 whitespace-nowrap">₦{item.unitCost?.toLocaleString() || 0}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap">
                        ₦{(item.quantityToProcure * (item.unitCost || 0)).toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <button
                          onClick={() => removeEditItem(item.lubricantId)}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        ><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))
                  : order.items?.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-3 sm:px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.productName}</td>
                      <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">{item.brand || "—"}</td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700 dark:text-gray-300">{item.currentStock}</td>
                      <td className="px-3 sm:px-4 py-3 text-gray-500">{item.reOrderLevel || "—"}</td>
                      <td className="px-3 sm:px-4 py-3 font-bold text-blue-600">{item.quantityToProcure}</td>
                      <td className="px-3 sm:px-4 py-3 text-gray-500 whitespace-nowrap">₦{item.unitCost?.toLocaleString() || 0}</td>
                      <td className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">₦{(item.quantityToProcure * item.unitCost).toLocaleString()}</td>
                    </tr>
                  ))
                }
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 dark:bg-blue-900/10">
                  <td colSpan={isEditing ? 4 : 6} className="px-3 sm:px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300 text-sm">
                    Estimated Total
                  </td>
                  <td colSpan={isEditing ? 2 : 1} className="px-3 sm:px-4 py-3 font-bold text-blue-700 whitespace-nowrap">
                    ₦{(isEditing ? editTotal : viewTotal).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Add Products (edit mode) ──────────────────────────────── */}
          {isEditing && (
            <div className="border border-dashed border-blue-300 dark:border-blue-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAddProducts(!showAddProducts)}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-semibold text-blue-700 dark:text-blue-400"
              >
                <span className="flex items-center gap-2"><Plus size={14} /> Add Products to Order</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${showAddProducts ? "rotate-180" : ""}`} />
              </button>
              {showAddProducts && (
                <div className="p-3 space-y-2 bg-white dark:bg-gray-900 border-t border-dashed border-blue-200 dark:border-blue-800">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
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
                          <button
                            onClick={() => addProduct(p)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
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

          {/* ── Notes ───────────────────────────────────────────────── */}
          {isEditing ? (
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Additional notes (optional)…"
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              />
            </div>
          ) : order.notes ? (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{order.notes}</p>
            </div>
          ) : null}

          {/* ── Status actions (view mode) ───────────────────────────── */}
          {!isEditing && (order.status === "submitted" || order.status === "ordered") && (
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              {role !== "manager" && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2.5">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Marking as received <strong>will not update stock levels</strong>. Ask the manager to confirm receipt and update inventory.
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                {order.status === "submitted" && (
                  <button
                    disabled={actioning}
                    onClick={() => handleAction(markOrdered, "ordered")}
                    className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 w-full sm:w-auto"
                  >
                    <TruckIcon size={14} /> Mark as Ordered
                  </button>
                )}
                {["submitted", "ordered"].includes(order.status) && (
                  <button
                    disabled={actioning}
                    onClick={() => handleAction(markReceived, "received")}
                    className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 w-full sm:w-auto"
                  >
                    <BadgeCheck size={14} />
                    <span>
                      Mark Received
                      {role === "manager" && <span className="hidden sm:inline"> — auto-updates stock</span>}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Edit mode — bottom save/cancel ───────────────────────── */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={cancelEdit}
                className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editItems.length}
                className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-sm active:scale-[0.98]"
              >
                <Save size={14} />
                {saving ? "Saving changes…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProcurementPage() {
  const {
    reorderItems, procurements, reorderLoading, loading,
    fetchReorderItems, fetchProcurements,
    createProcurement, submitProcurement, deleteProcurement,
  } = useProcurementStore();

  const [activeTab, setActiveTab]         = useState("new");
  const [selected, setSelected]           = useState(new Set());
  const [draftItems, setDraftItems]       = useState([]);
  const [vendorName, setVendorName]       = useState("");
  const [vendorPhone, setVendorPhone]     = useState("");
  const [notes, setNotes]                 = useState("");
  const [savingDraft, setSavingDraft]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [viewOrder, setViewOrder]         = useState(null);
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [userData, setUserData]           = useState(null);

  useEffect(() => {
    try { setUserData(JSON.parse(localStorage.getItem("user") || "{}")); } catch {}
    fetchReorderItems();
    fetchProcurements();
  }, []);

  const procuredBy    = userData ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Manager" : "Manager";
  const stationLogo   = userData?.station?.logoUrl || userData?.station?.logo || userData?.station?.image || "";
  const stationName   = userData?.station?.name || "";
  const stationAddress = userData?.station?.address || "";

  const filteredItems = urgencyFilter === "all"
    ? reorderItems
    : reorderItems.filter((i) => i.urgency === urgencyFilter);

  const needsAttentionCount = useMemo(
    () => reorderItems.filter((i) => i.urgency !== "healthy").length,
    [reorderItems]
  );

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
    setDraftItems([]); setSelected(new Set()); setVendorName(""); setVendorPhone(""); setNotes("");
  };

  const handleSaveDraft = async () => {
    if (!draftItems.length) { toast.error("Add at least one item"); return; }
    setSavingDraft(true);
    const result = await createProcurement({ vendorName, vendorPhone, items: draftItems, notes });
    setSavingDraft(false);
    if (result.success) { toast.success(`Draft ${result.data.procurementNumber} saved`); resetForm(); setActiveTab("orders"); }
    else toast.error(result.error || "Failed to save draft");
  };

  const handleSubmit = async () => {
    if (!draftItems.length)    { toast.error("No items selected"); return; }
    if (!vendorName.trim())    { toast.error("Vendor name is required"); return; }
    setSubmitting(true);
    const cr = await createProcurement({ vendorName, vendorPhone, items: draftItems, notes });
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

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft size={17} />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Lubricant Procurement</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Select products to procure, set vendor details and submit</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {["new", "orders"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === t
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {t === "new" ? "New Order" : `My Orders${procurements.length ? ` (${procurements.length})` : ""}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">

        {/* ══ NEW ORDER TAB ═══════════════════════════════════════════ */}
        {activeTab === "new" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">

            {/* LEFT — All lubricants inventory list */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                    <Package size={17} className="text-blue-500 shrink-0" />
                    Lubricant Inventory
                    {reorderItems.length > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {reorderItems.length}
                      </span>
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
                    <select
                      value={urgencyFilter}
                      onChange={(e) => setUrgencyFilter(e.target.value)}
                      className="text-xs bg-transparent dark:text-white outline-none cursor-pointer"
                    >
                      <option value="all">All Products</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="critical">Critical</option>
                      <option value="low">Low Stock</option>
                      <option value="healthy">Healthy</option>
                    </select>
                  </div>
                  <button
                    onClick={fetchReorderItems}
                    title="Refresh inventory"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
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
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No lubricant products found</p>
                  <p className="text-xs text-gray-400 mt-1">Add lubricant products in the Lubricant Management section</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                  <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No products match this filter</p>
                  <button
                    onClick={() => setUrgencyFilter("all")}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
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
                      <label
                        key={id}
                        className={`flex items-start gap-3 p-3.5 sm:p-4 bg-white dark:bg-gray-900 border-2 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-sm"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item)}
                            className="w-4 h-4 accent-blue-600"
                          />
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

              {/* Vendor details */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                  <ShoppingCart size={15} className="text-blue-500" /> Vendor Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Vendor / Supplier Name *</label>
                    <input
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="e.g. ABC Lubricants Ltd"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-3 sm:py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Vendor Phone</label>
                    <input
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder="e.g. 080 1234 5678"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-3 sm:py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Procurement list */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                    Procurement List
                    {draftItems.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {draftItems.length}
                      </span>
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
                                <button
                                  onClick={() => updateDraftQty(item.lubricantId, item.quantityToProcure - 1)}
                                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform"
                                >
                                  <Minus size={11} />
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantityToProcure}
                                  onChange={(e) => updateDraftQty(item.lubricantId, e.target.value)}
                                  className="w-12 sm:w-14 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm py-1.5 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                />
                                <button
                                  onClick={() => updateDraftQty(item.lubricantId, item.quantityToProcure + 1)}
                                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-transform"
                                >
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
                              <button
                                onClick={() => removeDraftItem(item.lubricantId)}
                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
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
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes (optional)..."
                    rows={2}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSaveDraft}
                      disabled={savingDraft || !draftItems.length}
                      className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
                    >
                      <Save size={14} />
                      {savingDraft ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !draftItems.length}
                      className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      <Send size={14} />
                      {submitting ? "Submitting..." : "Submit Order"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ORDERS TAB ══════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-gray-900 dark:text-white">Procurement Orders</h2>
              <button
                onClick={fetchProcurements}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <RefreshCw size={28} className="animate-spin text-blue-500" />
              </div>
            ) : procurements.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 sm:p-16 text-center">
                <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">No procurement orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Create one from the New Order tab</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {procurements.map((order) => (
                  <OrderCard key={order._id} order={order} onView={setViewOrder} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onUpdate={(updated) => setViewOrder(updated)}
          role={userData?.role}
        />
      )}
    </div>
  );
}

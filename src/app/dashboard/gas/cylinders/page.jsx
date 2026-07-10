"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import toast from "react-hot-toast";
import {
  Package, Plus, X, Loader2, PackagePlus, Pencil, TrendingUp, Banknote, XCircle,
  ChevronLeft, ChevronRight, ShoppingCart, Send, Trash2, CheckCircle2, AlertTriangle,
} from "lucide-react";
import useGasCylinderStore from "@/store/useGasCylinderStore";

const fmtN = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent";

function ProductFormModal({ product, onClose, onSaved }) {
  const { addProduct, updateProduct, loading } = useGasCylinderStore();
  const isEdit = !!product;
  const [form, setForm] = useState({
    label: product?.label || "",
    weightKg: product?.weightKg ?? "",
    brand: product?.brand || "",
    costPrice: product?.costPrice ?? "",
    sellingPrice: product?.sellingPrice ?? "",
    reorderLevel: product?.reorderLevel ?? 5,
    initialStock: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.label || form.weightKg === "" || form.sellingPrice === "") {
      toast.error("Label, weight and selling price are required.");
      return;
    }
    const payload = {
      label: form.label,
      weightKg: Number(form.weightKg),
      brand: form.brand || undefined,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice),
      reorderLevel: Number(form.reorderLevel) || 0,
    };
    if (!isEdit && form.initialStock !== "") payload.initialStock = Number(form.initialStock);
    const result = isEdit ? await updateProduct(product._id, payload) : await addProduct(payload);
    if (result.success) {
      toast.success(isEdit ? "Product updated" : "Product added");
      onSaved();
      onClose();
    } else toast.error(result.error);
  };

  return (
    <Modal title={isEdit ? `Edit ${product.label}` : "Add Cylinder Product"} onClose={onClose}>
      <Field label="Label (e.g. 5kg Cylinder)"><input className={inputCls} value={form.label} onChange={set("label")} placeholder="5kg Cylinder" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (kg)"><input className={inputCls} type="number" min="0" value={form.weightKg} onChange={set("weightKg")} placeholder="5" /></Field>
        <Field label="Brand (optional)"><input className={inputCls} value={form.brand} onChange={set("brand")} placeholder="e.g. Techno" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cost price (₦/unit)"><input className={inputCls} type="number" min="0" value={form.costPrice} onChange={set("costPrice")} placeholder="18000" /></Field>
        <Field label="Selling price (₦/unit)"><input className={inputCls} type="number" min="0" value={form.sellingPrice} onChange={set("sellingPrice")} placeholder="22000" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Reorder alert level"><input className={inputCls} type="number" min="0" value={form.reorderLevel} onChange={set("reorderLevel")} /></Field>
        {!isEdit && (
          <Field label="Opening stock (units)"><input className={inputCls} type="number" min="0" value={form.initialStock} onChange={set("initialStock")} placeholder="0" /></Field>
        )}
      </div>
      <button onClick={submit} disabled={loading.saving}
        className="mt-2 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        {loading.saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {isEdit ? "Save Changes" : "Add Product"}
      </button>
    </Modal>
  );
}

function RestockModal({ product, onClose, onSaved }) {
  const { restockProduct, loading } = useGasCylinderStore();
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState(product.costPrice ?? "");
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");

  const submit = async () => {
    if (!qty || Number(qty) <= 0) return toast.error("Enter the quantity received.");
    const result = await restockProduct(product._id, {
      quantity: Number(qty),
      costPrice: cost !== "" ? Number(cost) : undefined,
      supplierName: supplier || undefined,
      note: note || undefined,
    });
    if (result.success) {
      toast.success(`Restocked ${qty} × ${product.label}`);
      onSaved();
      onClose();
    } else toast.error(result.error);
  };

  return (
    <Modal title={`Restock ${product.label}`} onClose={onClose}>
      <p className="text-xs text-gray-400 mb-4">Current stock: <strong className="text-gray-700">{product.quantityInStock} unit(s)</strong></p>
      <Field label="Quantity received"><input className={inputCls} type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 20" /></Field>
      <Field label="Cost price this batch (₦/unit)"><input className={inputCls} type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
      <Field label="Supplier (optional)"><input className={inputCls} value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" /></Field>
      <Field label="Note (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Invoice no, remarks…" /></Field>
      <button onClick={submit} disabled={loading.saving}
        className="mt-2 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        {loading.saving ? <Loader2 size={16} className="animate-spin" /> : <PackagePlus size={16} />}
        Add to Stock
      </button>
    </Modal>
  );
}

function VoidModal({ sale, onClose, onVoided }) {
  const { voidSale } = useGasCylinderStore();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const result = await voidSale(sale._id, reason);
    setBusy(false);
    if (result.success) {
      toast.success("Sale voided — stock restored");
      onVoided();
      onClose();
    } else toast.error(result.error);
  };
  return (
    <Modal title={`Void ${sale.receiptNumber}`} onClose={onClose}>
      <p className="text-sm text-gray-500 mb-3">
        {sale.quantity} × {sale.productLabel} — {fmtN(sale.totalAmount)}. Stock will be restored
        {sale.pointsEarned > 0 ? " and loyalty points reversed." : "."}
      </p>
      <Field label="Reason (optional)"><input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this sale being voided?" /></Field>
      <button onClick={submit} disabled={busy}
        className="mt-2 w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
        Void Sale
      </button>
    </Modal>
  );
}

// ── Purchase order modals (lubricant procurement pattern) ────────────────────

const URGENCY_STYLE = {
  out_of_stock: "bg-red-100 text-red-600",
  critical: "bg-red-50 text-red-500",
  low: "bg-amber-100 text-amber-700",
  healthy: "bg-green-100 text-green-700",
};

function CreatePOModal({ onClose, onSaved }) {
  const { reorderItems, fetchReorderItems, createProcurement, submitProcurement, loading } = useGasCylinderStore();
  const [rows, setRows] = useState([]); // { productId, label, weightKg, brand, currentStock, reorderLevel, qty, unitCost, urgency }
  const [vendor, setVendor] = useState({ name: "", phone: "", email: "" });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchReorderItems().then((items) => {
      // Pre-fill with everything at/below threshold, using the suggested quantity.
      setRows(
        (items || []).map((p) => ({
          productId: p._id,
          label: p.label,
          weightKg: p.weightKg,
          brand: p.brand || "",
          currentStock: p.quantityInStock,
          reorderLevel: p.reorderLevel,
          urgency: p.urgency,
          qty: p.suggestedQty || 0,
          unitCost: p.costPrice || 0,
        }))
      );
    });
  }, [fetchReorderItems]);

  const included = rows.filter((r) => Number(r.qty) > 0);
  const estTotal = included.reduce((s, r) => s + Number(r.qty) * Number(r.unitCost || 0), 0);

  const setRow = (id, key, val) =>
    setRows((rs) => rs.map((r) => (r.productId === id ? { ...r, [key]: val } : r)));

  const save = async (andSubmit) => {
    if (included.length === 0) return toast.error("Set a quantity on at least one product.");
    if (andSubmit && !vendor.name.trim()) return toast.error("Vendor name is required to submit.");
    setBusy(true);
    const result = await createProcurement({
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorEmail: vendor.email,
      notes,
      items: included.map((r) => ({
        productId: r.productId,
        label: r.label,
        weightKg: r.weightKg,
        brand: r.brand,
        currentStock: r.currentStock,
        reorderLevel: r.reorderLevel,
        quantityToProcure: Number(r.qty),
        unitCost: Number(r.unitCost) || 0,
      })),
    });
    if (!result.success) {
      setBusy(false);
      return toast.error(result.error);
    }
    if (andSubmit) {
      const sub = await submitProcurement(result.data._id);
      setBusy(false);
      if (!sub.success) return toast.error(sub.error);
      toast.success(vendor.email ? "PO submitted — order emailed to supplier" : "PO submitted");
    } else {
      setBusy(false);
      toast.success("Draft PO saved");
    }
    onSaved();
    onClose();
  };

  return (
    <Modal title="Raise Purchase Order" onClose={onClose}>
      <p className="text-xs text-gray-400 mb-3">
        Items at or below their reorder level are pre-filled with a suggested quantity. Adjust freely — set 0 to leave a product out.
      </p>
      {rows.length === 0 ? (
        <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
      ) : (
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
          {rows.map((r) => (
            <div key={r.productId} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{r.label}{r.brand ? ` · ${r.brand}` : ""}</p>
                  <p className="text-[11px] text-gray-400">{r.currentStock} in stock · reorder at {r.reorderLevel}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${URGENCY_STYLE[r.urgency] || ""}`}>
                  {r.urgency.replace("_", " ")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase">Qty to order</label>
                  <input type="number" min="0" value={r.qty}
                    onChange={(e) => setRow(r.productId, "qty", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase">Est. unit cost (₦)</label>
                  <input type="number" min="0" value={r.unitCost}
                    onChange={(e) => setRow(r.productId, "unitCost", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Field label="Vendor name"><input className={inputCls} value={vendor.name} onChange={(e) => setVendor((v) => ({ ...v, name: e.target.value }))} placeholder="Supplier company" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vendor phone"><input className={inputCls} value={vendor.phone} onChange={(e) => setVendor((v) => ({ ...v, phone: e.target.value }))} /></Field>
        <Field label="Vendor email (PO is emailed here)"><input className={inputCls} type="email" value={vendor.email} onChange={(e) => setVendor((v) => ({ ...v, email: e.target.value }))} /></Field>
      </div>
      <Field label="Notes (optional)"><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>

      <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-2.5 mb-3">
        <span className="text-xs text-gray-500">{included.length} item(s)</span>
        <span className="text-sm font-bold text-orange-600">Est. {fmtN(estTotal)}</span>
      </div>

      <div className="flex gap-2">
        <button onClick={() => save(false)} disabled={busy || loading.saving}
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          Save as Draft
        </button>
        <button onClick={() => save(true)} disabled={busy || loading.saving}
          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Submit &amp; Email PO
        </button>
      </div>
    </Modal>
  );
}

function ReceivePOModal({ po, onClose, onDone }) {
  const { markProcurementReceived } = useGasCylinderStore();
  const [rows, setRows] = useState(
    po.items.map((i) => ({ productId: i.productId, label: i.label, ordered: i.quantityToProcure, receivedQuantity: i.quantityToProcure, unitCost: i.unitCost || 0 }))
  );
  const [busy, setBusy] = useState(false);
  const setRow = (id, key, val) => setRows((rs) => rs.map((r) => (r.productId === id ? { ...r, [key]: val } : r)));

  const submit = async () => {
    setBusy(true);
    const result = await markProcurementReceived(
      po._id,
      rows.map((r) => ({ productId: r.productId, receivedQuantity: Number(r.receivedQuantity) || 0, unitCost: Number(r.unitCost) || 0 }))
    );
    setBusy(false);
    if (result.success) {
      toast.success(result.message || "Received — stock updated");
      onDone();
      onClose();
    } else toast.error(result.error);
  };

  return (
    <Modal title={`Receive ${po.procurementNumber}`} onClose={onClose}>
      <p className="text-xs text-gray-400 mb-3">Enter what actually arrived and the invoice unit cost. Stock and each product&apos;s restock log update on confirm.</p>
      <div className="space-y-2 mb-4">
        {rows.map((r) => (
          <div key={r.productId} className="rounded-xl border border-gray-100 p-3">
            <p className="text-sm font-semibold text-gray-800 mb-2">{r.label} <span className="text-xs font-normal text-gray-400">— ordered {r.ordered}</span></p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 uppercase">Received qty</label>
                <input type="number" min="0" value={r.receivedQuantity}
                  onChange={(e) => setRow(r.productId, "receivedQuantity", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase">Unit cost (₦)</label>
                <input type="number" min="0" value={r.unitCost}
                  onChange={(e) => setRow(r.productId, "unitCost", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={submit} disabled={busy}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        Confirm Received &amp; Update Stock
      </button>
    </Modal>
  );
}

function PayPOModal({ po, onClose, onDone }) {
  const { recordProcurementPayment } = useGasCylinderStore();
  const totalCost = po.items.reduce((s, i) => s + (i.receivedQuantity ?? i.quantityToProcure) * (i.unitCost || 0), 0);
  const [amount, setAmount] = useState(po.amountPaid || "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (amount === "" || isNaN(Number(amount)) || Number(amount) < 0) return toast.error("Enter a valid amount.");
    setBusy(true);
    const result = await recordProcurementPayment(po._id, { amountPaid: Number(amount), paymentNotes: note });
    setBusy(false);
    if (result.success) {
      toast.success(result.message || "Payment recorded");
      onDone();
      onClose();
    } else toast.error(result.error);
  };

  return (
    <Modal title={`Payment — ${po.procurementNumber}`} onClose={onClose}>
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 mb-4">
        <span className="text-xs text-gray-500">Invoice total (received × unit cost)</span>
        <span className="text-sm font-bold text-gray-800">{fmtN(totalCost)}</span>
      </div>
      <Field label="Amount paid (₦)"><input className={inputCls} type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <Field label="Payment notes (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bank ref, cheque no…" /></Field>
      <button onClick={submit} disabled={busy}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={16} />}
        Record Payment
      </button>
    </Modal>
  );
}

const PO_STATUS_STYLE = {
  draft: "bg-gray-100 text-gray-500",
  submitted: "bg-blue-100 text-blue-700",
  ordered: "bg-purple-100 text-purple-700",
  received: "bg-green-100 text-green-700",
};
const PAY_STYLE = {
  unpaid: "bg-red-50 text-red-500",
  partial: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
};

export default function GasCylindersPage() {
  const {
    products, sales, total, dailySummary, loading, procurements,
    fetchProducts, fetchSales, fetchDailySummary, updateProduct,
    fetchProcurements, submitProcurement, markProcurementOrdered, deleteProcurement,
  } = useGasCylinderStore();

  const [tab, setTab] = useState("products");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [poBusy, setPoBusy] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 15;

  const refresh = () => {
    fetchProducts(true);
    fetchDailySummary();
    if (tab === "sales") fetchSales({ page, limit });
    if (tab === "procurement") fetchProcurements();
  };

  useEffect(() => {
    fetchProducts(true);
    fetchDailySummary();
  }, [fetchProducts, fetchDailySummary]);

  useEffect(() => {
    if (tab === "sales") fetchSales({ page, limit });
    if (tab === "procurement") fetchProcurements();
  }, [tab, page, fetchSales, fetchProcurements]);

  const lowStockCount = products.filter((p) => p.isActive && p.quantityInStock <= p.reorderLevel).length;

  const poAction = async (id, fn, okMsg) => {
    setPoBusy(id);
    const result = await fn(id);
    setPoBusy(null);
    if (result.success) toast.success(okMsg);
    else toast.error(result.error);
  };

  const totals = dailySummary?.totals;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleActive = async (p) => {
    const result = await updateProduct(p._id, { isActive: !p.isActive });
    if (result.success) toast.success(p.isActive ? `${p.label} hidden from POS` : `${p.label} is back on sale`);
    else toast.error(result.error);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Gas Cylinders</h1>
            <p className="text-sm text-gray-500">Bottle retail — products, stock &amp; sales</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="ml-auto flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl font-semibold text-sm transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Today summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Package size={14} /> Units today</div>
            <p className="text-2xl font-bold text-gray-800">{totals?.units ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Banknote size={14} /> Revenue today</div>
            <p className="text-2xl font-bold text-orange-600">{fmtN(totals?.revenue)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><TrendingUp size={14} /> Profit today</div>
            <p className="text-2xl font-bold text-green-600">{fmtN(totals?.profit)}</p>
          </div>
        </div>

        {/* Low-stock → raise PO banner */}
        {lowStockCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                {lowStockCount} product{lowStockCount === 1 ? "" : "s"} at or below reorder level.
              </p>
            </div>
            <button onClick={() => setShowCreatePO(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-xl font-semibold text-xs transition-colors">
              <ShoppingCart size={14} /> Raise Purchase Order
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 gap-1">
          {[["products", "Products & Stock"], ["sales", "Sales History"], ["procurement", "Purchase Orders"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? "bg-white shadow text-orange-600" : "text-gray-500"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Products */}
        {tab === "products" && (
          loading.products && products.length === 0 ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No cylinder products yet</p>
              <p className="text-xs text-gray-300 mt-1">Add your first bottle size to start selling</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => {
                const low = p.quantityInStock <= p.reorderLevel;
                return (
                  <div key={p._id} className={`bg-white rounded-2xl border p-4 ${p.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800">{p.label}</p>
                          {p.brand && <span className="text-xs text-gray-400">{p.brand}</span>}
                          {!p.isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Inactive</span>}
                          {p.isActive && low && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.quantityInStock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                              {p.quantityInStock === 0 ? "Out of stock" : "Low stock"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Cost {fmtN(p.costPrice)} · Sells {fmtN(p.sellingPrice)} · Margin {fmtN(p.sellingPrice - p.costPrice)}/unit · Sold {p.totalUnitsSold || 0} all-time
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${p.quantityInStock === 0 ? "text-red-500" : low ? "text-amber-500" : "text-gray-800"}`}>{p.quantityInStock}</p>
                          <p className="text-[10px] uppercase text-gray-400">in stock</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => setRestockTarget(p)} title="Restock"
                            className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"><PackagePlus size={16} /></button>
                          <button onClick={() => setEditTarget(p)} title="Edit"
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => toggleActive(p)} title={p.isActive ? "Hide from POS" : "Return to POS"}
                            className={`p-2.5 rounded-xl transition-colors ${p.isActive ? "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Sales */}
        {tab === "sales" && (
          loading.sales && sales.length === 0 ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
          ) : sales.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Banknote className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No cylinder sales yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {sales.map((s) => (
                  <div key={s._id} className={`bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-3 ${s.status === "voided" ? "opacity-60" : ""}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{s.receiptNumber}</span>
                        {s.status === "voided" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">VOIDED</span>}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {s.quantity} × {s.productLabel} <span className="text-gray-400 font-normal">@ {fmtN(s.unitPrice)}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {fmtDate(s.date)} · {s.cashier?.firstName} {s.cashier?.lastName} · {s.paymentMethod?.toUpperCase()}
                        {s.customer ? ` · ${s.customer.firstName} ${s.customer.lastName}` : s.walkInName ? ` · ${s.walkInName}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-gray-800">{fmtN(s.totalAmount)}</p>
                      {s.status === "completed" && (
                        <button onClick={() => setVoidTarget(s)}
                          className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          Void
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              )}
            </>
          )
        )}
        {/* Purchase Orders */}
        {tab === "procurement" && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowCreatePO(true)}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl font-semibold text-sm transition-colors">
                <ShoppingCart size={15} /> Raise Purchase Order
              </button>
            </div>
            {loading.procurement && procurements.length === 0 ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : procurements.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No purchase orders yet</p>
                <p className="text-xs text-gray-300 mt-1">Raise one when cylinder stock runs low</p>
              </div>
            ) : (
              <div className="space-y-3">
                {procurements.map((po) => {
                  const totalCost = po.items.reduce(
                    (s, i) => s + (i.receivedQuantity ?? i.quantityToProcure) * (i.unitCost || 0), 0
                  );
                  return (
                    <div key={po._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{po.procurementNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PO_STATUS_STYLE[po.status] || ""}`}>{po.status}</span>
                            {po.status === "received" && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PAY_STYLE[po.paymentStatus] || ""}`}>{po.paymentStatus}</span>
                            )}
                            {po.emailSentAt && <span className="text-[10px] text-gray-400">✉ emailed</span>}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {po.vendorName || "No vendor yet"} <span className="text-gray-400 font-normal">· {po.items.length} item(s)</span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {po.items.map((i) => `${i.quantityToProcure}× ${i.label}`).join(", ")}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            By {po.procuredByName} · {fmtDate(po.createdAt)}{totalCost > 0 ? ` · Est. ${fmtN(totalCost)}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 shrink-0">
                          {po.status === "draft" && (
                            <>
                              <button onClick={() => poAction(po._id, submitProcurement, "PO submitted")}
                                disabled={poBusy === po._id}
                                className="flex items-center gap-1 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                {poBusy === po._id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Submit
                              </button>
                              <button onClick={() => poAction(po._id, deleteProcurement, "Draft deleted")}
                                disabled={poBusy === po._id}
                                className="flex items-center gap-1 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                                <Trash2 size={12} /> Delete
                              </button>
                            </>
                          )}
                          {po.status === "submitted" && (
                            <button onClick={() => poAction(po._id, markProcurementOrdered, "Marked as ordered")}
                              disabled={poBusy === po._id}
                              className="text-xs font-semibold text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50">
                              Mark Ordered
                            </button>
                          )}
                          {["submitted", "ordered"].includes(po.status) && (
                            <button onClick={() => setReceiveTarget(po)}
                              className="flex items-center gap-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">
                              <CheckCircle2 size={12} /> Receive
                            </button>
                          )}
                          {po.status === "received" && po.paymentStatus !== "paid" && (
                            <button onClick={() => setPayTarget(po)}
                              className="flex items-center gap-1 text-xs font-semibold text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                              <Banknote size={12} /> Record Payment
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {showAdd && <ProductFormModal onClose={() => setShowAdd(false)} onSaved={refresh} />}
      {editTarget && <ProductFormModal product={editTarget} onClose={() => setEditTarget(null)} onSaved={refresh} />}
      {restockTarget && <RestockModal product={restockTarget} onClose={() => setRestockTarget(null)} onSaved={refresh} />}
      {voidTarget && <VoidModal sale={voidTarget} onClose={() => setVoidTarget(null)} onVoided={refresh} />}
      {showCreatePO && <CreatePOModal onClose={() => setShowCreatePO(false)} onSaved={() => { setTab("procurement"); refresh(); fetchProcurements(); }} />}
      {receiveTarget && <ReceivePOModal po={receiveTarget} onClose={() => setReceiveTarget(null)} onDone={refresh} />}
      {payTarget && <PayPOModal po={payTarget} onClose={() => setPayTarget(null)} onDone={refresh} />}
    </DashboardLayout>
  );
}

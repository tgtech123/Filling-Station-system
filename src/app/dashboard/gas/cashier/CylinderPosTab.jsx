"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Package, Minus, Plus, Loader2, AlertCircle, Printer, Search, X, CheckCircle2,
} from "lucide-react";
import useGasCylinderStore from "@/store/useGasCylinderStore";
import useGasCustomerStore from "@/store/useGasCustomerStore";
import { useSocket } from "@/hooks/useSocket";

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockBadge({ qty, reorderLevel }) {
  if (qty <= 0)
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Out of stock</span>;
  if (qty <= reorderLevel)
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{qty} left</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{qty} in stock</span>;
}

function CylinderReceiptModal({ sale, onClose, stationInfo = { name: "", address: "" } }) {
  if (!sale) return null;
  return createPortal(
    <>
      {/* 80mm thermal print CSS — same pattern as the gas refill receipt */}
      <style>{`
        @page { size: 80mm auto; margin: 2mm 3mm; }
        @media print {
          body > *:not(#cyl-receipt-print-root) { display: none !important; }
          #cyl-receipt-print-root {
            display: block !important;
            position: static !important;
            width: 72mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: none !important;
          }
          #cyl-receipt-card {
            position: static !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 72mm !important;
            max-width: 72mm !important;
            overflow: visible !important;
            background-color: #ffffff !important;
          }
          #cyl-receipt-content { padding: 2mm 3mm !important; }
          /* Pure black + heavy weight — thermal heads are 1-bit, any gray
             dithers into faint dots on an Xprinter 80mm. */
          #cyl-receipt-content,
          #cyl-receipt-content * {
            color: #000000 !important;
            opacity: 1 !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 9pt !important;
            font-weight: 800 !important;
            line-height: 1.5 !important;
            background-color: transparent !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #cyl-receipt-content .cyl-station-name { font-size: 13pt !important; font-weight: 900 !important; text-transform: uppercase !important; }
          #cyl-receipt-content .cyl-receipt-title { font-size: 11pt !important; font-weight: 900 !important; }
          #cyl-receipt-content .cyl-receipt-total { font-size: 13pt !important; font-weight: 900 !important; }
          /* Solid black separators print stronger than light-gray dashed ones */
          #cyl-receipt-content .border-dashed { border-color: #000000 !important; }
          #cyl-receipt-actions { display: none !important; }
        }
      `}</style>
      <div id="cyl-receipt-print-root" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div id="cyl-receipt-card" className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          <div id="cyl-receipt-content" className="p-6 font-mono text-sm">
          <div className="text-center mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-white" />
            </div>
            {stationInfo.name && <p className="cyl-station-name font-bold text-gray-900 text-base leading-tight">{stationInfo.name}</p>}
            {stationInfo.address && <p className="text-xs text-gray-500 mt-0.5">{stationInfo.address}</p>}
            <h2 className="cyl-receipt-title font-bold text-gray-800 text-base mt-1">CYLINDER SALE</h2>
            <p className="text-xs text-gray-500 mt-0.5">{sale.receiptNumber}</p>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(sale.date || sale.createdAt).toLocaleString("en-NG")}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-bold">{sale.productLabel}{sale.brand ? ` (${sale.brand})` : ""}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Unit price</span><span>₦{fmt(sale.unitPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-bold">{sale.quantity}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize">{sale.paymentMethod}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span>{sale.customer?.firstName ? `${sale.customer.firstName} ${sale.customer.lastName || ""}` : sale.walkInName || "Walk-in"}</span>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700">TOTAL</span>
            <span className="cyl-receipt-total font-bold text-xl text-orange-600">₦{fmt(sale.totalAmount)}</span>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="text-center">
            <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <p className="text-xs font-bold text-green-700 flex items-center gap-1 justify-center">
                <CheckCircle2 size={12} /> SALE COMPLETED
              </p>
              <p className="text-[10px] text-green-600 mt-0.5">Hand the cylinder to the customer</p>
            </div>
          </div>
          {sale.pointsEarned > 0 && (
            <p className="text-center text-xs text-green-600 mt-2 font-medium">+{sale.pointsEarned} loyalty points earned</p>
          )}
          </div>
          <div id="cyl-receipt-actions" className="px-6 pb-6 flex gap-2">
            <button onClick={() => window.print()} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function CylinderPosTab({ stationInfo }) {
  const {
    products, loading, fetchProducts, createSale, dailySummary, fetchDailySummary,
    sales, fetchSales,
  } = useGasCylinderStore();
  const { selectedCustomer, searchByPhone, clearSelectedCustomer, loading: custLoading } = useGasCustomerStore();

  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [payMethod, setPayMethod] = useState("cash");
  const [txRef, setTxRef] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [formError, setFormError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchDailySummary();
    fetchSales({ page: 1, limit: 10 });
  }, [fetchProducts, fetchDailySummary, fetchSales]);

  // Socket: stock levels update live when the manager restocks or another
  // cashier sells the same product
  useSocket({ "gas:cylinder-products-updated": () => fetchProducts() });

  const selected = products.find((p) => p._id === selectedId);
  const total = selected ? selected.sellingPrice * qty : 0;
  const maxQty = selected ? selected.quantityInStock : 0;

  const handleSale = async () => {
    setFormError(null);
    if (!selected) return setFormError("Select a cylinder product");
    if (qty < 1) return setFormError("Quantity must be at least 1");
    if (qty > maxQty) return setFormError(`Only ${maxQty} unit(s) in stock`);

    const result = await createSale({
      productId: selected._id,
      quantity: qty,
      paymentMethod: payMethod,
      transferReference: payMethod === "transfer" ? txRef : undefined,
      customerId: selectedCustomer?._id,
    });

    if (result.success) {
      setReceipt({ ...result.data, customer: selectedCustomer || undefined });
      setQty(1);
      setTxRef("");
      setPhoneSearch("");
      clearSelectedCustomer();
      fetchDailySummary();
      fetchSales({ page: 1, limit: 10 });
    } else {
      setFormError(result.error);
      fetchProducts(); // stock may have changed under us — refresh
    }
  };

  return (
    <div className="space-y-5">
      {/* Product grid with live stock */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Cylinder Bottles</p>
        {loading.products && products.length === 0 ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-6 text-center">
            No cylinder products yet. Ask your manager to add them in Gas Cylinders.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {products.map((p) => {
              const isActive = selectedId === p._id;
              const out = p.quantityInStock <= 0;
              return (
                <button
                  key={p._id}
                  onClick={() => { if (!out) { setSelectedId(p._id); setQty(1); } }}
                  disabled={out}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? "bg-orange-500 border-orange-500 text-white shadow-md"
                      : out
                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 text-gray-700 hover:border-orange-300 bg-white"
                  }`}
                >
                  <span className="text-sm font-bold">{p.label}</span>
                  {p.brand && <span className={`text-[10px] ${isActive ? "text-orange-100" : "text-gray-400"}`}>{p.brand}</span>}
                  <span className={`text-xs font-semibold ${isActive ? "text-orange-100" : "text-orange-600"}`}>
                    ₦{Number(p.sellingPrice).toLocaleString()}
                  </span>
                  <StockBadge qty={p.quantityInStock} reorderLevel={p.reorderLevel} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quantity + total */}
      {selected && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Quantity</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-300">
                <Minus size={16} />
              </button>
              <input
                type="number" min="1" max={maxQty} value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)))}
                className="w-20 text-center border-2 border-orange-200 rounded-xl py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-300">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-3 text-white flex justify-between items-center">
              <div><p className="text-xs opacity-80">Total</p><p className="font-bold text-2xl">₦{fmt(total)}</p></div>
              <div className="text-right"><p className="text-xs opacity-80">{selected.label}</p><p className="font-bold">× {qty}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Customer (loyalty earn) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Customer (Loyalty)</p>
        <div className="flex gap-2">
          <input
            type="tel" value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="Search by phone number"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={() => searchByPhone(phoneSearch)}
            disabled={!phoneSearch || custLoading.search}
            className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
          >
            {custLoading.search ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
          {selectedCustomer && (
            <button onClick={clearSelectedCustomer} className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
        {selectedCustomer ? (
          <div className="mt-3 bg-purple-50 rounded-xl p-3 border border-purple-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
              <p className="text-xs text-gray-500">{selectedCustomer.customerId} · {selectedCustomer.loyaltyPoints?.toLocaleString()} pts — earns points on this sale</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">Walk-in sale (no loyalty points)</p>
        )}
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment Method</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ id: "cash", label: "Cash", emoji: "💵" }, { id: "transfer", label: "Transfer", emoji: "🏦" }, { id: "pos", label: "POS", emoji: "💳" }].map((m) => (
            <button key={m.id} onClick={() => setPayMethod(m.id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${payMethod === m.id ? "bg-orange-50 border-orange-400 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-200"}`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-semibold">{m.label}</span>
            </button>
          ))}
        </div>
        {payMethod === "transfer" && (
          <input type="text" value={txRef} onChange={(e) => setTxRef(e.target.value)}
            placeholder="Transfer reference number"
            className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        )}
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <button
        onClick={handleSale}
        disabled={loading.creating || !selected}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base"
      >
        {loading.creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : "Sell Cylinder & Print Receipt"}
      </button>

      {/* Today at a glance (cashier monitoring) */}
      {dailySummary?.totals && dailySummary.totals.sales > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Cylinder Sales</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-orange-600">{dailySummary.totals.units}</p>
              <p className="text-[10px] uppercase text-gray-400">Units</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-orange-600">₦{Number(dailySummary.totals.revenue).toLocaleString()}</p>
              <p className="text-[10px] uppercase text-gray-400">Revenue</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-orange-600">{dailySummary.totals.sales}</p>
              <p className="text-[10px] uppercase text-gray-400">Sales</p>
            </div>
          </div>
          <div className="space-y-1">
            {dailySummary.perProduct.map((p) => (
              <div key={p._id} className="flex justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-semibold">{p._id}</span>
                <span>{p.units} unit(s) · ₦{Number(p.revenue).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sales — reprint a receipt anytime as customer evidence */}
      {sales.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Recent Sales — Reprint Receipt</p>
          <div className="space-y-2">
            {sales.map((s) => (
              <div key={s._id} className={`flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-3 py-2.5 ${s.status === "voided" ? "opacity-50" : ""}`}>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-orange-600">{s.receiptNumber}{s.status === "voided" ? " · VOIDED" : ""}</p>
                  <p className="text-xs text-gray-600 truncate">
                    {s.quantity} × {s.productLabel} · ₦{Number(s.totalAmount).toLocaleString()} ·{" "}
                    {new Date(s.date).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => setReceipt(s)}
                  disabled={s.status === "voided"}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors"
                >
                  <Printer size={12} /> Print
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {receipt && <CylinderReceiptModal sale={receipt} onClose={() => setReceipt(null)} stationInfo={stationInfo} />}
    </div>
  );
}

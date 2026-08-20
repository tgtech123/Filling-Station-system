"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Flame, Search, X, CheckCircle2, AlertCircle, Loader2, Printer, Bell, Clock, User, ChevronRight } from "lucide-react";
import useGasStore from "@/store/useGasStore";
import useGasSaleStore from "@/store/useGasSaleStore";
import useGasOrderStore from "@/store/useGasOrderStore";
import useGasCustomerStore from "@/store/useGasCustomerStore";
import CylinderPosTab from "./CylinderPosTab";
import { api } from "@/lib/config";
import { thermalReceiptCss, printThermalReceipt } from "@/lib/thermalReceipt";

const PRESETS_KG     = [0.5, 1, 1.5, 2, 3, 5];
const PRESETS_AMOUNT = [500, 1000, 2000, 5000, 10000];

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TierBadge({ tier }) {
  const map = {
    Bronze:   "bg-orange-100 text-orange-700",
    Silver:   "bg-gray-100 text-gray-600",
    Gold:     "bg-yellow-100 text-yellow-700",
    Platinum: "bg-purple-100 text-purple-700",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[tier] || ""}`}>{tier}</span>;
}

function ReceiptModal({ sale, onClose, stationInfo = { name: "", address: "" } }) {
  // Shared with the lubricant receipt: waits for the logo to load before
  // opening the dialog, so it never prints as a blank box.
  const handlePrint = () => printThermalReceipt();
  if (!sale) return null;
  return createPortal(
    <>
      <style>{thermalReceiptCss("gas-receipt-print-root")}</style>
      <div id="gas-receipt-print-root" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div id="gas-receipt-card" className="receipt-card bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          {/* Receipt */}
          <div id="receipt-content" className="p-6 font-mono text-sm">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-white" />
              </div>
              {stationInfo.name && (
                <p className="gas-station-name font-bold text-gray-900 text-base leading-tight">{stationInfo.name}</p>
              )}
              {stationInfo.address && (
                <p className="text-xs text-gray-500 mt-0.5">{stationInfo.address}</p>
              )}
              <h2 className="gas-receipt-title font-bold text-gray-800 text-base mt-1">GAS RECEIPT</h2>
              <p className="text-xs text-gray-500 mt-0.5">{sale.receiptNumber}</p>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(sale.date || sale.createdAt).toLocaleString("en-NG")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Cashier</span><span className="font-medium">{sale.cashier?.firstName} {sale.cashier?.lastName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Cylinder</span><span className="font-medium">{sale.cylinderSize}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Volume</span><span className="font-bold">{sale.quantityKg?.toFixed(3)} kg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price/kg</span><span>₦{fmt(sale.pricePerKg)}</span></div>
              {sale.discountApplied > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₦{fmt(sale.discountApplied)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize">{sale.paymentMethod}</span></div>
              {sale.customer ? (
                <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{sale.customer?.firstName} {sale.customer?.lastName}</span></div>
              ) : (
                <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{sale.walkInName || "Walk-in"}</span></div>
              )}
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">TOTAL</span>
              <span className="gas-receipt-total font-bold text-xl text-orange-600">₦{fmt(sale.amountPaid)}</span>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="text-center">
              <div className="inline-block bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="text-xs font-bold text-amber-700">⏳ AWAITING ATTENDANT</p>
                <p className="text-[10px] text-amber-600 mt-0.5">Take this receipt to the attendant</p>
              </div>
            </div>
            {sale.pointsEarned > 0 && (
              <p className="text-center text-xs text-green-600 mt-2 font-medium">+{sale.pointsEarned} loyalty points earned</p>
            )}
          </div>
          <div id="gas-receipt-actions" className="px-6 pb-6 flex gap-2">
            <button onClick={handlePrint} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
              <Printer size={16} /> Print Receipt
            </button>
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>

        {/*
          Print-only thermal block — the Xprinter never sees the Tailwind card
          above. Same structure and classes as the lubricant receipt so both
          come off the roll looking identical.
        */}
        <div className="receipt-thermal-print">
          <div className="t-logo-wrap">
            <img src={stationInfo.logo || "/station-logo.png"} alt="Station logo" />
          </div>

          <div className="t-station-name">{stationInfo.name || "Gas Station"}</div>
          {stationInfo.address && <div className="t-address">{stationInfo.address}</div>}

          <div className="t-line-solid" />
          <div className="t-receipt-title">Gas Sales Receipt</div>
          <div className="t-line-dashed" />

          <div className="t-meta-row"><span>Ref</span><span>{sale.receiptNumber}</span></div>
          <div className="t-meta-row"><span>Date</span><span>{new Date(sale.date || sale.createdAt).toLocaleString("en-NG")}</span></div>
          <div className="t-meta-row"><span>Cashier</span><span>{`${sale.cashier?.firstName ?? ""} ${sale.cashier?.lastName ?? ""}`.trim() || "—"}</span></div>
          <div className="t-meta-row"><span>Payment</span><span>{sale.paymentMethod}</span></div>
          <div className="t-meta-row">
            <span>Customer</span>
            <span>
              {sale.customer
                ? `${sale.customer?.firstName ?? ""} ${sale.customer?.lastName ?? ""}`.trim()
                : sale.walkInName || "Walk-in"}
            </span>
          </div>

          <div className="t-line-solid" />

          <div className="t-meta-row"><span>Cylinder</span><span>{sale.cylinderSize}</span></div>
          <div className="t-meta-row"><span>Volume</span><span>{sale.quantityKg?.toFixed(3)} kg</span></div>
          <div className="t-meta-row"><span>Price/kg</span><span>{fmt(sale.pricePerKg)}</span></div>
          {sale.discountApplied > 0 && (
            <div className="t-meta-row"><span>Discount</span><span>-{fmt(sale.discountApplied)}</span></div>
          )}

          <div className="t-line-solid" />

          <div className="t-total-row">
            <span className="t-total-label">TOTAL</span>
            <span className="t-total-amount">N{fmt(sale.amountPaid)}</span>
          </div>

          <div className="t-line-dashed" />

          <div className="t-receipt-title">Awaiting Attendant</div>
          <div className="t-address">Take this receipt to the attendant</div>

          {sale.pointsEarned > 0 && (
            <div className="t-footer-line">+{sale.pointsEarned} loyalty points earned</div>
          )}

          <div className="t-line-dashed" />
          <div className="t-footer-line">Thank you for your patronage</div>
        </div>
      </div>
    </>,
    document.body
  );
}

function OrderCard({ order, onConfirm, onCancel, confirming }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
      order.status === "submitted" ? "border-orange-300" : "border-gray-200"
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{order.orderNumber}</span>
              {order.status === "submitted" && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>
              )}
            </div>
            <p className="font-bold text-gray-800 mt-1">{order.customerName}</p>
            <p className="text-sm text-gray-500">{order.cylinderSize} · {order.quantityKg?.toFixed(2)} kg · ₦{fmt(order.amountToPay)}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">Payment: {order.paymentMethod} {order.transferReference && `· Ref: ${order.transferReference}`}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">{new Date(order.submittedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p>
            <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-600 mt-1">
              <ChevronRight size={16} className={`transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
          </div>
        </div>
        {open && order.loyaltyCustomer && (
          <div className="mt-2 bg-purple-50 rounded-xl p-2 flex items-center gap-2">
            <User size={14} className="text-purple-500" />
            <div>
              <p className="text-xs font-semibold text-purple-700">{order.loyaltyCustomer.firstName} {order.loyaltyCustomer.lastName}</p>
              <p className="text-[10px] text-purple-500">{order.loyaltyCustomer.customerId} · {order.loyaltyCustomer.loyaltyPoints} pts</p>
            </div>
            <TierBadge tier={order.loyaltyCustomer.tier} />
          </div>
        )}
        {open && order.paymentProofNote && (
          <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{order.paymentProofNote}</p>
        )}
      </div>
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => onConfirm(order._id)}
          disabled={confirming === order._id}
          className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {confirming === order._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Confirm Payment
        </button>
        <button
          onClick={() => onCancel(order._id)}
          className="flex-1 py-3 border-l border-gray-100 text-red-500 hover:bg-red-50 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function GasCashierPage() {
  const [activeTab, setActiveTab] = useState("pos");

  // Stores
  const { pricing, cylinderSizes, loyaltyConfig, fetchPricing, fetchCylinderSizes, fetchLoyaltyConfig } = useGasStore();
  const { createSale, loading: saleLoading } = useGasSaleStore();
  const { inbox, fetchInbox, confirmOrder, cancelOrder, loading: orderLoading } = useGasOrderStore();
  const { selectedCustomer, searchByPhone, clearSelectedCustomer, loading: custLoading } = useGasCustomerStore();

  // POS Form
  const [saleType,     setSaleType]     = useState("kg");
  const [cylinderSize, setCylinderSize] = useState("");
  const [inputKg,      setInputKg]      = useState("");
  const [inputAmount,  setInputAmount]  = useState("");
  const [payMethod,    setPayMethod]    = useState("cash");
  /**
   * A large fill is often settled two ways: part cash from a pocket, the rest
   * by transfer. Recorded per tender because that is what reconciling needs —
   * the cash figure must match a drawer and the rest must match a statement.
   */
  const [mixCash,     setMixCash]     = useState("");
  const [mixTransfer, setMixTransfer] = useState("");
  const [mixPOS,      setMixPOS]      = useState("");
  const [phoneSearch,  setPhoneSearch]  = useState("");
  const [ptRedeem,     setPtRedeem]     = useState(0);
  const [txRef,        setTxRef]        = useState("");
  const [formError,    setFormError]    = useState(null);
  const [receipt,      setReceipt]      = useState(null);

  // Order confirmation states
  const [confirming,   setConfirming]   = useState(null);
  const [inboxError,   setInboxError]   = useState(null);
  const [stationInfo,  setStationInfo]  = useState({ name: "", address: "" });

  useEffect(() => {
    fetchPricing();
    fetchCylinderSizes();
    fetchLoyaltyConfig();
    fetchInbox();
    const interval = setInterval(fetchInbox, 30000);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.station) {
        api.get(`/api/filling-stations/${user.station}`)
          .then(res => {
            const d = res.data?.data || res.data;
            // logo carried through so the thermal receipt can print it, the
            // same way the lubricant receipt does.
            if (d?.name)
              setStationInfo({
                name: d.name,
                address: d.address || "",
                logo: d.image || d.logoUrl || d.logo || "",
              });
          })
          .catch(() => {});
      }
    } catch {}

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cylinderSizes.length > 0 && !cylinderSize) {
      setCylinderSize(cylinderSizes[0].label);
    }
  }, [cylinderSizes]);

  const pricePerKg = pricing?.pricePerKg || 0;

  const kg = saleType === "kg"
    ? parseFloat(inputKg) || 0
    : pricePerKg > 0 ? (parseFloat(inputAmount) || 0) / pricePerKg : 0;

  const amount = saleType === "amount"
    ? parseFloat(inputAmount) || 0
    : (parseFloat(inputKg) || 0) * pricePerKg;

  const cfg          = loyaltyConfig || { pointsPerK: 10, minRedeem: 500, nairaPerPoint: 1 };
  const discount     = ptRedeem * cfg.nairaPerPoint;
  const finalAmount  = Math.max(0, amount - discount);
  const pointsEarned = Math.floor((finalAmount / 1000) * cfg.pointsPerK);

  const handleSale = async () => {
    setFormError(null);
    if (!cylinderSize) return setFormError("Select a cylinder size");
    if (saleType === "kg"     && (!inputKg     || parseFloat(inputKg)     <= 0)) return setFormError("Enter a valid quantity");
    if (saleType === "amount" && (!inputAmount || parseFloat(inputAmount) <= 0)) return setFormError("Enter a valid amount");

    // A mixed sale whose parts do not add up leaves money unaccounted for in
    // the cash report, so it is refused here rather than reconciled later.
    let breakdown;
    if (payMethod === "mixed") {
      breakdown = {
        cash:     Number(mixCash)     || 0,
        transfer: Number(mixTransfer) || 0,
        POS:      Number(mixPOS)      || 0,
      };
      const entered = breakdown.cash + breakdown.transfer + breakdown.POS;
      if (Math.round((entered - finalAmount) * 100) !== 0) {
        return setFormError("The payment breakdown must add up to the amount due");
      }
    }

    const result = await createSale({
      saleType, cylinderSize,
      quantityKg:    saleType === "kg"     ? parseFloat(inputKg)     : undefined,
      amountPaid:    saleType === "amount"  ? parseFloat(inputAmount) : undefined,
      paymentMethod: payMethod,
      ...(breakdown ? { paymentBreakdown: breakdown } : {}),
      transferReference: payMethod === "transfer" ? txRef : undefined,
      customerId:    selectedCustomer?._id,
      pointsToRedeem: ptRedeem,
    });

    if (result.success) {
      setReceipt({ ...result.data, cashier: { firstName: "You", lastName: "" }, pricePerKg });
      setInputKg(""); setInputAmount(""); setPhoneSearch(""); setPtRedeem(0); setTxRef("");
      clearSelectedCustomer();
    } else {
      setFormError(result.error);
    }
  };

  const handleConfirmOrder = async (id) => {
    setConfirming(id);
    setInboxError(null);
    const result = await confirmOrder(id);
    if (result.success) {
      const { sale } = result.data;
      setReceipt({ ...sale, pricePerKg });
      setActiveTab("pos");
    } else {
      setInboxError(result.error);
    }
    setConfirming(null);
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    await cancelOrder(id, "Cancelled by cashier");
  };

  const pendingCount = inbox.filter(o => o.status === "submitted").length;

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
            <p className="text-sm text-gray-500">Cashier — Point of Sale</p>
          </div>
          <div className="ml-auto bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5">
            <p className="text-xs text-gray-500">Price/kg</p>
            <p className="font-bold text-orange-600">₦{fmt(pricePerKg)}</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 gap-1">
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "pos" ? "bg-white shadow text-orange-600" : "text-gray-500"
            }`}
          >
            Point of Sale
          </button>
          <button
            onClick={() => setActiveTab("cylinders")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "cylinders" ? "bg-white shadow text-orange-600" : "text-gray-500"
            }`}
          >
            Cylinders
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
              activeTab === "orders" ? "bg-white shadow text-orange-600" : "text-gray-500"
            }`}
          >
            Orders Inbox
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── POS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "pos" && (
          <div className="space-y-5">

            {/* Cylinder Size */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cylinder Size</p>
                {pricePerKg > 0 && (
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1">
                    ₦{fmt(pricePerKg)}/kg
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {cylinderSizes.map(s => {
                  const linePrice = pricePerKg > 0 ? s.weightKg * pricePerKg : 0;
                  const isActive  = cylinderSize === s.label;
                  return (
                    <button
                      key={s._id}
                      onClick={() => setCylinderSize(s.label)}
                      className={`flex flex-col items-center px-4 py-2.5 rounded-xl border-2 transition-all ${
                        isActive
                          ? "bg-orange-500 border-orange-500 text-white shadow-md"
                          : "border-gray-200 text-gray-600 hover:border-orange-300 bg-white"
                      }`}
                    >
                      <span className="text-sm font-bold">{s.label}</span>
                      {pricePerKg > 0 && (
                        <span className={`text-[10px] font-medium mt-0.5 ${isActive ? "text-orange-100" : "text-orange-500"}`}>
                          ₦{linePrice.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {!pricePerKg && (
                <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  No price set — ask manager to configure the price per kg in Gas Inventory.
                </p>
              )}
            </div>

            {/* Quantity Entry */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Quantity</p>
                {pricePerKg > 0 && (
                  <span className="text-xs font-semibold text-orange-500">@ ₦{fmt(pricePerKg)}/kg</span>
                )}
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                {["kg","amount"].map(t => (
                  <button key={t} onClick={() => { setSaleType(t); setInputKg(""); setInputAmount(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${saleType===t?"bg-white shadow text-orange-600":"text-gray-500"}`}>
                    {t === "kg" ? "By KG" : "By Amount (₦)"}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(saleType === "kg" ? PRESETS_KG : PRESETS_AMOUNT).map(v => (
                  <button key={v} onClick={() => saleType==="kg" ? (setSaleType("kg"), setInputKg(String(v)), setInputAmount("")) : (setSaleType("amount"), setInputAmount(String(v)), setInputKg(""))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                      (saleType==="kg" ? inputKg : inputAmount) === String(v)
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-orange-300"
                    }`}>
                    {saleType === "kg" ? `${v}kg` : `₦${v.toLocaleString()}`}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    {saleType === "kg" ? "Enter KG" : "Enter Amount (₦)"}
                  </label>
                  <input
                    type="number" step="0.1" min="0"
                    value={saleType === "kg" ? inputKg : inputAmount}
                    onChange={e => saleType==="kg" ? setInputKg(e.target.value) : setInputAmount(e.target.value)}
                    placeholder={saleType === "kg" ? "0.0" : "0.00"}
                    className="w-full border-2 border-orange-200 rounded-xl px-3 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                <div className="flex-1 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                  <p className="text-xs text-gray-400">{saleType==="kg" ? "Amount" : "Volume"}</p>
                  <p className="font-bold text-orange-600 text-lg">
                    {saleType==="kg" ? `₦${fmt(amount)}` : `${kg.toFixed(3)} kg`}
                  </p>
                </div>
              </div>

              {(kg > 0 || amount > 0) && (
                <div className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-3 text-white flex justify-between items-center">
                  <div><p className="text-xs opacity-80">Total</p><p className="font-bold text-2xl">₦{fmt(discount > 0 ? finalAmount : amount)}</p></div>
                  <div className="text-right"><p className="text-xs opacity-80">Volume</p><p className="font-bold text-2xl">{kg.toFixed(2)} kg</p></div>
                </div>
              )}
            </div>

            {/* Customer Lookup */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Customer (Loyalty)</p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneSearch}
                  onChange={e => setPhoneSearch(e.target.value)}
                  placeholder="Search by phone number"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={async () => { const r = await import("@/store/useGasCustomerStore"); useGasCustomerStore.getState().searchByPhone(phoneSearch); }}
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
                <div className="mt-3 bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                      <p className="text-xs text-gray-500">{selectedCustomer.customerId}</p>
                    </div>
                    <TierBadge tier={selectedCustomer.tier} />
                  </div>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Loyalty Points: <span className="font-bold text-purple-700">{selectedCustomer.loyaltyPoints?.toLocaleString()} pts</span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Earns {cfg.pointsPerK} pts / ₦1,000
                      </p>
                    </div>

                    {selectedCustomer.loyaltyPoints >= cfg.minRedeem ? (
                      <div className="bg-white rounded-xl border border-purple-200 p-2.5">
                        <p className="text-[10px] text-purple-500 font-semibold mb-1.5 uppercase tracking-wide">
                          Redeem Points (min {cfg.minRedeem.toLocaleString()} pts)
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step={cfg.minRedeem}
                            min="0"
                            max={selectedCustomer.loyaltyPoints}
                            value={ptRedeem}
                            onChange={e => setPtRedeem(Number(e.target.value))}
                            className="flex-1 border border-purple-200 rounded-lg px-2 py-1.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <div className="text-right">
                            <p className="text-xs font-bold text-green-600">-₦{fmt(discount)}</p>
                            <p className="text-[10px] text-gray-400">{cfg.nairaPerPoint} ₦/pt</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {ptRedeem > 0 ? `Using ${ptRedeem} pts → ₦${fmt(discount)} off. Final: ₦${fmt(finalAmount)}` : "Enter points to redeem"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                        Needs {cfg.minRedeem.toLocaleString()} pts to redeem. Currently {selectedCustomer.loyaltyPoints?.toLocaleString()} pts
                        ({(cfg.minRedeem - selectedCustomer.loyaltyPoints).toLocaleString()} more needed).
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">Walk-in sale (no loyalty points)</p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment Method</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{id:"cash",label:"Cash",emoji:"💵"},{id:"transfer",label:"Transfer",emoji:"🏦"},{id:"pos",label:"POS",emoji:"💳"},{id:"mixed",label:"Mixed",emoji:"🧾"}].map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${payMethod===m.id?"bg-orange-50 border-orange-400 text-orange-700":"border-gray-200 text-gray-500 hover:border-orange-200"}`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
              {payMethod === "transfer" && (
                <input type="text" value={txRef} onChange={e => setTxRef(e.target.value)}
                  placeholder="Transfer reference number"
                  className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              )}

              {payMethod === "mixed" && (() => {
                const entered = (Number(mixCash) || 0) + (Number(mixTransfer) || 0) + (Number(mixPOS) || 0);
                const due = Number(finalAmount) || 0;
                const diff = Math.round((due - entered) * 100) / 100;
                return (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Cash", value: mixCash, set: setMixCash },
                        { label: "Transfer", value: mixTransfer, set: setMixTransfer },
                        { label: "POS", value: mixPOS, set: setMixPOS },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-[11px] font-semibold text-gray-500">{f.label}</label>
                          <input
                            type="number" min="0" value={f.value}
                            onChange={(e) => f.set(e.target.value)}
                            placeholder="0"
                            className="w-full min-w-0 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>
                      ))}
                    </div>
                    {/* The parts must reach the total. Saying so before the sale
                        is recorded is the only cheap moment to catch it. */}
                    <p className={`text-xs font-semibold ${diff === 0 ? "text-green-600" : "text-red-600"}`}>
                      {diff === 0
                        ? "Breakdown matches the amount due."
                        : diff > 0
                        ? `₦${diff.toLocaleString()} still unallocated.`
                        : `₦${Math.abs(diff).toLocaleString()} over the amount due.`}
                    </p>
                  </div>
                );
              })()}
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

            <button
              onClick={handleSale}
              disabled={saleLoading.creating}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base"
            >
              {saleLoading.creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : "Record Sale & Print Receipt"}
            </button>
          </div>
        )}

        {/* ─── CYLINDERS TAB (bottle retail) ─────────────────────────── */}
        {activeTab === "cylinders" && <CylinderPosTab stationInfo={stationInfo} />}

        {/* ─── ORDERS INBOX TAB ──────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-700">Customer Orders</h2>
              <button onClick={fetchInbox} className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-700 font-semibold">
                <Bell size={14} /> Refresh
              </button>
            </div>

            {inboxError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{inboxError}</div>
            )}

            {orderLoading.inbox ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : inbox.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No pending orders</p>
                <p className="text-xs text-gray-300 mt-1">New customer orders will appear here</p>
              </div>
            ) : (
              inbox.map(order => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onConfirm={handleConfirmOrder}
                  onCancel={handleCancelOrder}
                  confirming={confirming}
                />
              ))
            )}
          </div>
        )}
      </div>

      {receipt && <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} stationInfo={stationInfo} />}
    </DashboardLayout>
  );
}

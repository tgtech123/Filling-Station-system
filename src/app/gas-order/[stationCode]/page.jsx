"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Flame, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Loader2, Copy, Search } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";
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
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[tier] || "bg-gray-100 text-gray-500"}`}>
      {tier}
    </span>
  );
}

export default function CustomerOrderPage() {
  const { stationCode } = useParams();

  const [station,      setStation]      = useState(null);
  const [pricePerKg,   setPricePerKg]   = useState(0);
  const [cylinderSizes,setCylinderSizes]= useState([]);
  const [cashiers,     setCashiers]     = useState([]);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [pageError,    setPageError]    = useState(null);

  // Form state
  const [name,          setName]          = useState("");
  const [phone,         setPhone]          = useState("");
  const [saleType,      setSaleType]       = useState("kg");
  const [cylinderSize,  setCylinderSize]   = useState("");
  const [inputKg,       setInputKg]        = useState("");
  const [inputAmount,   setInputAmount]    = useState("");
  const [payMethod,     setPayMethod]      = useState("cash");
  const [cashierRef,    setCashierRef]     = useState("");
  const [transferRef,   setTransferRef]    = useState("");
  const [note,          setNote]           = useState("");
  const [customKg,      setCustomKg]       = useState("");

  // Loyalty
  const [loyaltyCustomer, setLoyaltyCustomer] = useState(null);
  const [searchingLoyalty,setSearchingLoyalty]= useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(null);
  const [submitError,setSubmitError]= useState(null);

  // Copy bank account
  const [copied, setCopied] = useState(false);

  // ─── Load station info ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [infoRes, cashRes] = await Promise.all([
          fetch(`${API}/api/gas-public/${stationCode}`),
          fetch(`${API}/api/gas-public/${stationCode}/cashiers`),
        ]);
        if (!infoRes.ok) {
          const e = await infoRes.json();
          throw new Error(e.message || "Station not found");
        }
        const info = await infoRes.json();
        const cash = cashRes.ok ? await cashRes.json() : { data: [] };
        setStation(info.data.station);
        setPricePerKg(info.data.pricePerKg);
        setCylinderSizes(info.data.cylinderSizes || []);
        setCashiers(cash.data || []);
        if (info.data.cylinderSizes?.length > 0) {
          const first = info.data.cylinderSizes[0];
          setCylinderSize(first.label);
          setInputKg(String(first.weightKg));
          setSaleType("kg");
          if (info.data.pricePerKg > 0) {
            setInputAmount((first.weightKg * info.data.pricePerKg).toFixed(2));
          }
        }
      } catch (e) {
        setPageError(e.message);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [stationCode]);

  const kg     = parseFloat(inputKg)     || 0;
  const amount = parseFloat(inputAmount) || 0;

  const handlePresetKg = (v) => {
    setSaleType("kg");
    setInputKg(String(v));
    setInputAmount(pricePerKg > 0 ? (v * pricePerKg).toFixed(2) : "");
  };

  const handlePresetAmount = (v) => {
    setSaleType("amount");
    setInputAmount(String(v));
    setInputKg(pricePerKg > 0 ? (v / pricePerKg).toFixed(3) : "");
  };

  // ─── Loyalty phone lookup ─────────────────────────────────────────────────
  const lookupLoyalty = useCallback(async () => {
    if (!phone || phone.length < 7) return;
    setSearchingLoyalty(true);
    setLoyaltyCustomer(null);
    try {
      const res = await fetch(`${API}/api/gas-public/${stationCode}/cashiers`);
      // We use public endpoint — loyalty lookup happens server-side on submit
      // Just show feedback
    } finally {
      setSearchingLoyalty(false);
    }
  }, [phone, stationCode]);

  // ─── Copy account number ──────────────────────────────────────────────────
  const copyAccount = () => {
    navigator.clipboard.writeText(station?.gasBankAccount || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim())      return setSubmitError("Please enter your name");
    if (!cylinderSize)     return setSubmitError("Please select a cylinder size");
    if (!inputKg || parseFloat(inputKg) <= 0) return setSubmitError("Please enter a valid quantity");
    if (!cashierRef)       return setSubmitError("Please select a cashier");

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/gas-public/${stationCode}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName:    name.trim(),
          customerPhone:   phone.trim() || undefined,
          saleType,
          quantityKg:      saleType === "kg"     ? parseFloat(inputKg)     : undefined,
          amountToPay:     saleType === "amount"  ? parseFloat(inputAmount) : undefined,
          cylinderSize,
          paymentMethod:   payMethod,
          transferReference: payMethod === "transfer" ? transferRef : undefined,
          paymentProofNote:  note || undefined,
          assignedCashier: cashierRef,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit order");
      setSubmitted(data.data);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── States ───────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading…</p>
      </div>
    </div>
  );

  if (pageError) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="font-bold text-gray-800 text-lg">Not Available</h2>
        <p className="text-gray-500 mt-2 text-sm">{pageError}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl border border-green-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-green-500" />
        </div>
        <h2 className="font-bold text-gray-800 text-xl mb-1">Order Submitted!</h2>
        <p className="text-gray-500 text-sm mb-4">Your order has been sent to the cashier</p>
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-gray-400 mb-1">Order Number</p>
          <p className="font-bold text-xl text-orange-600 tracking-wide">{submitted.orderNumber}</p>
        </div>
        <p className="text-xs text-gray-400 mb-6">Show this number to the cashier if needed</p>
        <Link
          href={`/gas-order/${stationCode}/order-status/${submitted.orderNumber}`}
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Track My Order
        </Link>
        <button
          onClick={() => { setSubmitted(null); setName(""); setPhone(""); setInputKg(""); setInputAmount(""); setCustomKg(""); setCylinderSize(""); setTransferRef(""); setNote(""); }}
          className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Place another order
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {station?.image ? (
            <img src={station.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-orange-100" />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-800 text-sm leading-tight truncate">{station?.name}</h1>
            <p className="text-xs text-orange-500 font-semibold">Gas Self-Order</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">Current Price</p>
            <p className="font-bold text-orange-600 text-sm">₦{fmt(pricePerKg)}/kg</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
            Your Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Chisom Eze"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Phone Number <span className="text-gray-400 font-normal">(for loyalty points)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cylinder Size */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm mb-1 flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
            Cylinder Size
          </h2>
          {pricePerKg > 0 && (
            <p className="text-[10px] text-orange-500 font-semibold mb-3">
              Tap a size to auto-fill quantity &amp; price · ₦{fmt(pricePerKg)}/kg
            </p>
          )}

          {/* Preset sizes with auto-fill */}
          <div className="flex flex-wrap gap-2 mb-4">
            {cylinderSizes.map(s => {
              const linePrice = pricePerKg > 0 ? s.weightKg * pricePerKg : 0;
              const isActive  = cylinderSize === s.label && !customKg;
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    setCylinderSize(s.label);
                    setCustomKg("");
                    setInputKg(String(s.weightKg));
                    setSaleType("kg");
                    setInputAmount(pricePerKg > 0 ? (s.weightKg * pricePerKg).toFixed(2) : "");
                  }}
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

          {/* Custom KG input */}
          <div className="border-t border-gray-100 pt-3">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              My size isn&apos;t listed — enter kg manually:
            </label>
            <div className="flex items-center gap-3">
              <div className="relative w-36">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={customKg}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomKg(val);
                    const n = parseFloat(val) || 0;
                    if (n > 0) {
                      setCylinderSize(`${n}kg`);
                      setInputKg(val);
                      setSaleType("kg");
                      setInputAmount(pricePerKg > 0 ? (n * pricePerKg).toFixed(2) : "");
                    } else {
                      setCylinderSize("");
                      setInputKg("");
                      setInputAmount("");
                    }
                  }}
                  placeholder="e.g. 7"
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 font-semibold pr-9 ${
                    customKg ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">kg</span>
              </div>
              {customKg && parseFloat(customKg) > 0 && pricePerKg > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-gray-400">Estimated</p>
                  <p className="text-sm font-bold text-orange-600">₦{fmt((parseFloat(customKg) || 0) * pricePerKg)}</p>
                </div>
              )}
              {customKg && (
                <button
                  type="button"
                  onClick={() => { setCustomKg(""); setCylinderSize(""); setInputKg(""); setInputAmount(""); }}
                  className="text-gray-400 hover:text-red-500 transition-colors text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* How Much */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
            How Much Do You Want?
          </h2>

          {/* Quick KG presets */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2 font-medium">Quick KG:</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS_KG.map(v => (
                <button key={v} type="button" onClick={() => handlePresetKg(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    saleType === "kg" && inputKg === String(v)
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-orange-300"
                  }`}>
                  {v}kg
                </button>
              ))}
            </div>
          </div>

          {/* Quick Amount presets */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2 font-medium">Quick Amount:</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS_AMOUNT.map(v => (
                <button key={v} type="button" onClick={() => handlePresetAmount(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    saleType === "amount" && inputAmount === String(v)
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-orange-300"
                  }`}>
                  ₦{v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Both inputs — always visible, bidirectional sync */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Gas Volume (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={inputKg}
                onChange={e => {
                  const val = e.target.value;
                  setInputKg(val);
                  setSaleType("kg");
                  setInputAmount(pricePerKg > 0 && val ? ((parseFloat(val) || 0) * pricePerKg).toFixed(2) : "");
                }}
                placeholder="e.g. 3"
                className="w-full border-2 border-orange-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-medium"
              />
            </div>
            <div className="shrink-0 flex items-center pb-3 text-gray-300">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1 4.5h16M13 1l4 3.5-4 3.5M17 9.5H1M5 6.5l-4 3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Amount to Pay (₦)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={inputAmount}
                onChange={e => {
                  const val = e.target.value;
                  setInputAmount(val);
                  setSaleType("amount");
                  setInputKg(pricePerKg > 0 && val ? ((parseFloat(val) || 0) / pricePerKg).toFixed(3) : "");
                }}
                placeholder="e.g. 2550"
                className="w-full border-2 border-orange-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {pricePerKg > 0 && (
            <p className="text-[10px] text-gray-400 mt-1.5 text-right">@ ₦{fmt(pricePerKg)}/kg</p>
          )}

          {/* Summary */}
          {(kg > 0 || amount > 0) && (
            <div className="mt-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-3 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-80">Total to Pay</p>
                  <p className="font-bold text-xl">₦{fmt(amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">Gas Volume</p>
                  <p className="font-bold text-xl">{kg.toFixed(2)} kg</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
            Payment Method
          </h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { id: "cash",     label: "Cash",     emoji: "💵" },
              { id: "transfer", label: "Transfer", emoji: "🏦" },
              { id: "pos",      label: "POS",      emoji: "💳" },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPayMethod(m.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  payMethod === m.id
                    ? "bg-orange-50 border-orange-400 text-orange-700"
                    : "border-gray-200 text-gray-500 hover:border-orange-200"
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-xs font-semibold">{m.label}</span>
              </button>
            ))}
          </div>

          {payMethod === "transfer" && station?.gasBankAccount && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Transfer to this account</p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Bank</span>
                  <span className="text-xs font-semibold text-gray-700">{station.gasBankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Account No.</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-800 tracking-wider">{station.gasBankAccount}</span>
                    <button type="button" onClick={copyAccount} className="text-blue-500 hover:text-blue-700">
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Name</span>
                  <span className="text-xs font-semibold text-gray-700">{station.gasBankAccountName}</span>
                </div>
                {amount > 0 && (
                  <div className="flex justify-between pt-1 border-t border-blue-200">
                    <span className="text-xs font-bold text-blue-600">Amount</span>
                    <span className="text-sm font-bold text-blue-700">₦{fmt(amount)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Your Transfer Reference / Last 6 digits</label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={e => setTransferRef(e.target.value)}
                  placeholder="e.g. TRF...4521"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}

          {payMethod === "pos" && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-sm text-green-700 font-medium">
              💳 Please proceed to the cashier with your POS card to pay.
            </div>
          )}

          {payMethod === "cash" && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-sm text-gray-600 font-medium">
              💵 Please give cash to the cashier at the counter.
            </div>
          )}
        </div>

        {/* Select Cashier */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">5</span>
            Submit to Cashier
          </h2>
          {cashiers.length === 0 ? (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-xs text-amber-700 font-medium">
              ⚠️ No cashiers are currently on duty. Please try again later or approach the counter directly.
            </div>
          ) : (
            <div className="space-y-2">
              {cashiers.map(c => (
                <label
                  key={c._id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    cashierRef === c._id
                      ? "bg-orange-50 border-orange-400"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="cashier"
                    value={c._id}
                    checked={cashierRef === c._id}
                    onChange={() => setCashierRef(c._id)}
                    className="accent-orange-500"
                  />
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-gray-400">Cashier · On duty</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Additional Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any extra information for the cashier..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || cashiers.length === 0}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base"
        >
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : "Submit Order"}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by <span className="font-semibold text-orange-500">FuelDesk</span>
        </p>
      </form>
    </div>
  );
}

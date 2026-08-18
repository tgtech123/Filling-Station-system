"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Fuel, Phone, Car, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2, LogOut, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";

/** What a reward can be claimed as — mirrors the server's validProducts. */
const PORTAL_PRODUCTS = ["PMS", "AGO", "Kerosene", "Lubricant"];

// ── Tier config ──────────────────────────────────────────────────────────────
const TIER_CONFIG = {
  Bronze:   { color: "text-orange-700",  bg: "bg-orange-100",  bar: "bg-orange-400",  next: "Silver",   target: 500  },
  Silver:   { color: "text-gray-600",    bg: "bg-gray-100",    bar: "bg-gray-400",    next: "Gold",     target: 2000 },
  Gold:     { color: "text-yellow-700",  bg: "bg-yellow-100",  bar: "bg-yellow-400",  next: "Platinum", target: 5000 },
  Platinum: { color: "text-purple-700",  bg: "bg-purple-100",  bar: "bg-purple-500",  next: null,       target: null },
};

const TIER_STARTS = { Bronze: 0, Silver: 500, Gold: 2000, Platinum: 5000 };

function PortalContent() {
  const searchParams = useSearchParams();
  const stationFromUrl = searchParams.get("station") || "";

  const { portalToken, portalCustomer, portalTransactions, portalLookup, portalSetPin, portalLogin, portalFetchMe, portalFetchTransactions, portalRedemptions, portalFetchRedemptions, portalClaimReward, portalLogout } = useFuelLoyaltyStore();

  // ── Auth flow state ───────────────────────────────────────────────────────
  const [step, setStep] = useState("lookup"); // lookup | setpin | login | dashboard
  const [stationId, setStationId] = useState(stationFromUrl);
  const [query, setQuery]             = useState("");
  const [pin, setPin]                 = useState("");
  const [pinConfirm, setPinConfirm]   = useState("");
  const [showPin, setShowPin]         = useState(false);
  const [lookupData, setLookupData]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [claimProduct, setClaimProduct] = useState("PMS");
  const [claiming, setClaiming]         = useState(false);

  // The one claim that is still waiting on the station. Only ever one open at a
  // time — the server refuses a second while one is pending.
  const pendingClaim = portalRedemptions.find(r => r.status === "pending");

  const handleClaim = async () => {
    setError(null);
    setClaiming(true);
    const result = await portalClaimReward(claimProduct);
    setClaiming(false);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => setSuccess(null), 6000);
    } else {
      setError(result.error);
    }
  };

  // Restore session
  useEffect(() => {
    const token = sessionStorage.getItem("portal_token");
    if (token) {
      useFuelLoyaltyStore.setState({ portalToken: token });
      setStep("dashboard");
      portalFetchMe();
      portalFetchTransactions();
      portalFetchRedemptions();
    }
  }, []);

  const handleLookup = async () => {
    setError(null);
    if (!stationId.trim()) return setError("Enter your station ID");
    if (!query.trim()) return setError("Enter your phone number or plate number");
    setLoading(true);
    const result = await portalLookup(stationId.trim(), query.trim());
    setLoading(false);
    if (result.success) {
      setLookupData(result.data);
      setStep(result.data.hasPinSet ? "login" : "setpin");
    } else {
      setError(result.error);
    }
  };

  const handleSetPin = async () => {
    setError(null);
    if (!/^\d{4}$/.test(pin)) return setError("PIN must be exactly 4 digits");
    if (pin !== pinConfirm) return setError("PINs do not match");
    setLoading(true);
    const result = await portalSetPin(stationId.trim(), query.trim(), pin);
    setLoading(false);
    if (result.success) {
      setSuccess("PIN set! Now logging you in...");
      setTimeout(async () => {
        setSuccess(null);
        const loginResult = await portalLogin(stationId.trim(), query.trim(), pin);
        if (loginResult.success) {
          setStep("dashboard");
          portalFetchMe();
          portalFetchTransactions();
          portalFetchRedemptions();
        } else {
          setError(loginResult.error);
        }
      }, 1000);
    } else {
      setError(result.error);
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!pin) return setError("Enter your PIN");
    setLoading(true);
    const result = await portalLogin(stationId.trim(), query.trim(), pin);
    setLoading(false);
    if (result.success) {
      setStep("dashboard");
      portalFetchMe();
      portalFetchTransactions();
      portalFetchRedemptions();
    } else {
      setError(result.error);
    }
  };

  const handleLogout = () => {
    portalLogout();
    setStep("lookup");
    setQuery(""); setPin(""); setPinConfirm(""); setLookupData(null);
  };

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if (step === "dashboard" && portalCustomer) {
    const c = portalCustomer;
    const tier = c.tier || "Bronze";
    const tc = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;
    const tierStart = TIER_STARTS[tier] || 0;
    const tierEnd   = tc.target || (c.lifetimePoints + 1);
    const progressPct = tier === "Platinum" ? 100
      : Math.min(100, ((c.lifetimePoints - tierStart) / (tierEnd - tierStart)) * 100);

    const st = c.station;
    const stationLocation = st ? [st.city, st.state].filter(Boolean).join(", ") : "";

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 pb-12">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {st?.image ? (
                <img src={st.image} alt={st.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shrink-0">
                  <Fuel size={16} className="text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-tight truncate">
                  {st?.name ? `${st.name} Loyalty` : "Loyalty"}
                </p>
                {stationLocation && (
                  <p className="text-[11px] text-gray-400 truncate">{stationLocation}</p>
                )}
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pt-6 space-y-4">

          {/* Points card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-200 text-xs font-medium">LOYALTY BALANCE</p>
                <p className="text-4xl font-bold mt-1">{Number(c.totalPoints).toLocaleString()}</p>
                <p className="text-blue-200 text-sm">points</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${tc.bg} ${tc.color}`}>{tier}</div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex justify-between text-xs text-blue-200 mb-1.5">
                <span>{tier}</span>
                {tc.next && <span>{tc.next}</span>}
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${tc.bar} transition-all`} style={{ width: `${progressPct}%` }} />
              </div>
              {tc.next && (
                <p className="text-xs text-blue-200 mt-2">
                  {Math.max(0, Math.ceil(tc.target - c.lifetimePoints))} pts to {tc.next}
                </p>
              )}
            </div>
          </div>

          {/* Redemption info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <RotateCcw size={16} className="text-emerald-500" /> Your Reward
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs text-emerald-500">You can redeem for</p>
                <p className="text-2xl font-bold text-emerald-700 mt-0.5">{Number(c.redeemableFor || 0).toFixed(1)}</p>
                <p className="text-xs text-emerald-500">litres of free fuel</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-400">Lifetime Earned</p>
                <p className="text-2xl font-bold text-blue-700 mt-0.5">{Number(c.lifetimePoints).toLocaleString()}</p>
                <p className="text-xs text-blue-400">total points</p>
              </div>
            </div>
            <div className="mt-3 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">
                Minimum to redeem: <span className="font-semibold">{c.minPointsToRedeem} pts</span>
                {c.totalPoints >= c.minPointsToRedeem
                  ? <span className="ml-2 text-green-600 font-semibold">You qualify!</span>
                  : <span className="ml-2 text-gray-400">({c.minPointsToRedeem - c.totalPoints} pts more needed)</span>}
              </p>
            </div>

            {/* Claim it themselves.
                Before this the only way to redeem was to ask an attendant, which
                meant the customer's own reward depended on someone else raising
                it for them — and the station had no way to tell a real claim
                from one an attendant invented. A claim raised here starts behind
                the customer's PIN and carries a code they read out at the
                counter, where a manager or supervisor approves it. */}
            {pendingClaim ? (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Claim awaiting approval</p>
                <p className="text-3xl font-bold text-amber-700 mt-1 tracking-wider">{pendingClaim.claimCode}</p>
                <p className="text-sm text-amber-700 mt-1">
                  {Number(pendingClaim.litresValue).toFixed(1)}L of {pendingClaim.product}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Show this code at the station. A manager or supervisor will approve it and your fuel will be released.
                </p>
                {pendingClaim.expiresAt && (
                  <p className="text-[11px] text-amber-500 mt-1">
                    Valid until {new Date(pendingClaim.expiresAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            ) : c.totalPoints >= c.minPointsToRedeem ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">Claim your reward as</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PORTAL_PRODUCTS.map(p => (
                    <button key={p} onClick={() => setClaimProduct(p)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${claimProduct === p ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200"}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <button onClick={handleClaim} disabled={claiming}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  {claiming ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  Claim {Number(c.redeemableFor || 0).toFixed(1)}L free fuel
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  You'll get a code to show at the station. Nothing is deducted until it's approved.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-3">
                Keep buying to reach {c.minPointsToRedeem} points — then you can claim your reward right here.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-700 mb-3">Your Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Total Litres Bought</p>
                <p className="font-bold text-gray-700 mt-0.5">{Number(c.totalLitresPurchased || 0).toFixed(1)} L</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Amount Spent</p>
                <p className="font-bold text-gray-700 mt-0.5">₦{Number(c.totalAmountSpent || 0).toLocaleString()}</p>
              </div>
              {c.phone && <div><p className="text-xs text-gray-400">Phone</p><p className="font-semibold text-gray-700 mt-0.5">{c.phone}</p></div>}
              {c.plateNumber && <div><p className="text-xs text-gray-400">Plate</p><p className="font-semibold font-mono text-gray-700 mt-0.5">{c.plateNumber}</p></div>}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h2 className="font-bold text-blue-700 mb-3">How It Works</h2>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span> Every litre of fuel you buy earns you points</li>
              <li className="flex gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span> Tell the cashier or attendant your phone or plate number when buying</li>
              <li className="flex gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span> Once you have enough points, ask to redeem for free fuel</li>
              <li className="flex gap-2"><span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span> A manager approves your redemption — then enjoy your free litres!</li>
            </ul>
          </div>

          {/* Transaction history */}
          {portalTransactions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-5 py-4">
                <p className="font-bold text-gray-700">Transaction History</p>
                {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showHistory && (
                <div className="divide-y divide-gray-50">
                  {portalTransactions.map(t => (
                    <div key={t._id} className="flex items-center gap-3 px-5 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.type === "earn" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                        {t.type === "earn" ? "+" : "−"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 capitalize">{t.type} {t.product && `· ${t.product}`}</p>
                        <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${t.type === "earn" ? "text-blue-600" : "text-red-500"}`}>
                          {t.type === "earn" ? "+" : "−"}{t.points} pts
                        </p>
                        {t.litres > 0 && <p className="text-xs text-gray-400">{Number(t.litres).toFixed(2)} L</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Powered by footer */}
          <p className="text-center text-[11px] text-gray-400 pb-2">
            Powered by{" "}
            <span className="font-semibold text-blue-500">Techsol Dev Concepts</span>
            {" · "}
            <a href="mailto:info@fueldesks.com" className="underline hover:text-blue-500 transition-colors">
              Contact us
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── AUTH SCREENS ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-3">
            <Fuel size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Loyalty Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Check your points & rewards</p>
          <p className="text-[11px] text-gray-300 mt-2">Powered by Techsol Dev Concepts</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* STEP: Lookup */}
          {step === "lookup" && (
            <>
              <h2 className="font-bold text-gray-700 mb-4">Find Your Account</h2>
              {!stationFromUrl && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Station ID</label>
                  <input value={stationId} onChange={e => setStationId(e.target.value.trim())}
                    placeholder="Provided by your station"
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" />
                  <p className="text-xs text-gray-400 mt-1">Get this from the station — they can share a direct link</p>
                </div>
              )}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone or Plate Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-300">
                    <Phone size={14} />
                    <span className="text-gray-200">|</span>
                    <Car size={14} />
                  </div>
                  <input value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="08012345678 or AGL123AA"
                    className="w-full border border-gray-200 rounded-xl pl-14 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Use the phone or plate number you gave the station</p>
              </div>
              <button onClick={handleLookup} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Continue
              </button>
            </>
          )}

          {/* STEP: Set PIN */}
          {step === "setpin" && (
            <>
              <div className="mb-4">
                <h2 className="font-bold text-gray-700">Set Your PIN</h2>
                {lookupData?.name && <p className="text-sm text-gray-500 mt-1">Welcome, <span className="font-semibold">{lookupData.name}</span>!</p>}
                <p className="text-xs text-gray-400 mt-1">Choose a 4-digit PIN to access your account</p>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">New PIN</label>
                <div className="relative">
                  <input type={showPin ? "text" : "password"} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="Enter 4-digit PIN" maxLength={4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 tracking-widest text-center text-xl font-bold" />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Confirm PIN</label>
                <input type="password" value={pinConfirm} onChange={e => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Repeat PIN" maxLength={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 tracking-widest text-center text-xl font-bold" />
              </div>
              <button onClick={handleSetPin} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Set PIN & Enter
              </button>
              <button onClick={() => { setStep("lookup"); setError(null); }}
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
                Back
              </button>
            </>
          )}

          {/* STEP: Login */}
          {step === "login" && (
            <>
              <div className="mb-4">
                <h2 className="font-bold text-gray-700">Enter Your PIN</h2>
                {lookupData?.name && <p className="text-sm text-gray-500 mt-1">Welcome back, <span className="font-semibold">{lookupData.name}</span>!</p>}
              </div>
              <div className="mb-4">
                <div className="relative">
                  <input type={showPin ? "text" : "password"} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="_ _ _ _" maxLength={4} autoFocus
                    className="w-full border-2 border-gray-200 rounded-2xl px-3 py-4 text-center text-3xl font-bold tracking-[0.5em] focus:outline-none focus:border-blue-400" />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                View My Points
              </button>
              <button onClick={() => { setStep("lookup"); setPin(""); setError(null); }}
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoyaltyPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
      <PortalContent />
    </Suspense>
  );
}

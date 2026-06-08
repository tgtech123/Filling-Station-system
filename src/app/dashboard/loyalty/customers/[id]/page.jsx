"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { ArrowLeft, Fuel, Plus, RotateCcw, AlertCircle, CheckCircle2, Loader2, Droplets, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";
import { API_URL } from "@/lib/config";

function TierBadge({ tier }) {
  const map = { Bronze:"bg-orange-100 text-orange-700", Silver:"bg-gray-100 text-gray-600", Gold:"bg-yellow-100 text-yellow-700", Platinum:"bg-purple-100 text-purple-700" };
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[tier] || map.Bronze}`}>{tier}</span>;
}

const PRODUCTS = ["PMS", "AGO", "Kerosene", "Lubricant"];

const EMPTY_EARN = { product: "PMS", litres: "", amountSpent: "", pricePerLitre: "", note: "" };

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { selectedCustomer: customer, transactions, redemptions, settings, fetchCustomer, fetchSettings, recordEarn, requestRedemption, loading } = useFuelLoyaltyStore();

  const [showEarn, setShowEarn]           = useState(false);
  const [showRedeem, setShowRedeem]       = useState(false);
  const [earnForm, setEarnForm]           = useState(EMPTY_EARN);
  const [redeemProduct, setRedeemProduct] = useState("PMS");
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    fetchCustomer(id);
    fetchSettings();
  }, [id]);

  // Auto-calculate litres from amount or vice versa
  const handleEarnField = (key, value) => {
    const next = { ...earnForm, [key]: value };
    const price = Number(next.pricePerLitre);
    if (key === "amountSpent" && price > 0) next.litres = (Number(value) / price).toFixed(3);
    if (key === "litres"      && price > 0) next.amountSpent = (Number(value) * price).toFixed(2);
    if (key === "pricePerLitre") {
      if (next.amountSpent && Number(value) > 0) next.litres = (Number(next.amountSpent) / Number(value)).toFixed(3);
    }
    setEarnForm(next);
  };

  const handleEarn = async () => {
    setError(null);
    if (!earnForm.litres && !earnForm.amountSpent) return setError("Enter litres or amount");
    setSaving(true);
    const result = await recordEarn({ customerId: id, ...earnForm });
    setSaving(false);
    if (result.success) {
      setEarnForm(EMPTY_EARN);
      setShowEarn(false);
      fetchCustomer(id);
      setSuccess(result.message);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(result.error);
    }
  };

  const handleRedeem = async () => {
    setError(null);
    setSaving(true);
    const result = await requestRedemption({ customerId: id, product: redeemProduct });
    setSaving(false);
    if (result.success) {
      setShowRedeem(false);
      fetchCustomer(id);
      setSuccess(result.message);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/fuel-loyalty/staff/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove customer");
      router.push("/dashboard/loyalty/customers");
    } catch (e) {
      setError(e.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const pointsToNextTier =
    !customer ? 0 :
    customer.tier === "Bronze"   ? 500  - customer.lifetimePoints :
    customer.tier === "Silver"   ? 2000 - customer.lifetimePoints :
    customer.tier === "Gold"     ? 5000 - customer.lifetimePoints : 0;

  const progressPct = !customer ? 0 :
    customer.tier === "Bronze"   ? Math.min(100, (customer.lifetimePoints / 500)  * 100) :
    customer.tier === "Silver"   ? Math.min(100, ((customer.lifetimePoints - 500)  / 1500) * 100) :
    customer.tier === "Gold"     ? Math.min(100, ((customer.lifetimePoints - 2000) / 3000) * 100) : 100;

  const redeemableFor = settings && customer
    ? (customer.totalPoints * settings.litresPerRedemptionPoint).toFixed(2)
    : "—";

  if (loading.customer) return (
    <DashboardLayout>
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
    </DashboardLayout>
  );

  if (!customer) return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-400">Customer not found</p>
        <Link href="/dashboard/loyalty/customers" className="text-blue-500 text-sm mt-2 inline-block">Back to customers</Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">

        <Link href="/dashboard/loyalty/customers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-5">
          <ArrowLeft size={16} /> Back to Customers
        </Link>

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

        {/* Customer card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0">
              {(customer.name || customer.plateNumber || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-800">{customer.name || customer.plateNumber || customer.customerId}</h2>
                <TierBadge tier={customer.tier} />
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{customer.customerId}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                {customer.phone && <span>Phone: {customer.phone}</span>}
                {customer.plateNumber && <span>Plate: {customer.plateNumber}</span>}
              </div>
            </div>
          </div>

          {/* Points progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Points Balance</span>
              {customer.tier !== "Platinum" && <span>{Math.max(0, Math.ceil(pointsToNextTier))} pts to {customer.tier === "Bronze" ? "Silver" : customer.tier === "Silver" ? "Gold" : "Platinum"}</span>}
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-2xl font-bold text-blue-700">{Number(customer.totalPoints).toLocaleString()} <span className="text-sm font-normal text-gray-400">pts</span></p>
              <p className="text-sm text-gray-500 self-end">Worth <span className="font-semibold text-green-600">{redeemableFor} L</span></p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Lifetime Pts</p>
              <p className="font-bold text-gray-700 mt-0.5">{Number(customer.lifetimePoints).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Total Litres</p>
              <p className="font-bold text-gray-700 mt-0.5">{Number(customer.totalLitresPurchased || 0).toFixed(1)} L</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Total Spent</p>
              <p className="font-bold text-gray-700 mt-0.5">₦{Number(customer.totalAmountSpent || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowEarn(!showEarn); setShowRedeem(false); setError(null); }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              <Plus size={16} /> Log Sale
            </button>
            <button onClick={() => { setShowRedeem(!showRedeem); setShowEarn(false); setError(null); }}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              <RotateCcw size={16} /> Redeem Points
            </button>
            <button onClick={() => setConfirmDelete(true)}
              className="w-10 flex items-center justify-center bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-xl transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          </div>

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">Remove this customer?</p>
              <p className="text-xs text-red-500 mb-3">They will be removed from the loyalty program. Transaction history is preserved.</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Yes, Remove
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50 py-2">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Log Sale Form */}
        {showEarn && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-5">
            <h3 className="font-bold text-gray-700 mb-1 flex items-center gap-2"><Droplets size={16} className="text-blue-500" /> Log Loyalty Sale</h3>
            <p className="text-xs text-gray-400 mb-4">Enter amount OR litres — price/litre auto-converts. Points are earned from litres.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Product *</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRODUCTS.map(p => (
                    <button key={p} onClick={() => setEarnForm(f => ({ ...f, product: p }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${earnForm.product === p ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Amount (₦)</label>
                <input type="number" value={earnForm.amountSpent} onChange={e => handleEarnField("amountSpent", e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Litres (L)</label>
                <input type="number" value={earnForm.litres} onChange={e => handleEarnField("litres", e.target.value)}
                  placeholder="e.g. 5.0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Price / Litre (₦)</label>
                <input type="number" value={earnForm.pricePerLitre}
                  onChange={e => handleEarnField("pricePerLitre", e.target.value)}
                  placeholder={settings?.pricePerLitre?.[earnForm.product] || "e.g. 800"}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Note (optional)</label>
                <input value={earnForm.note} onChange={e => setEarnForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Pump 2, morning shift..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            {earnForm.litres && settings && (
              <div className="mt-3 bg-blue-50 rounded-xl p-3">
                <p className="text-sm text-blue-700 font-semibold">
                  Points to earn: <span className="text-blue-900">{(Number(earnForm.litres) * (settings.pointsPerLitre || 1)).toFixed(2)} pts</span>
                  <span className="text-xs font-normal text-blue-500 ml-2">({earnForm.litres} L × {settings.pointsPerLitre} pt/L)</span>
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={handleEarn} disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Add Points
              </button>
              <button onClick={() => { setShowEarn(false); setError(null); }}
                className="px-5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {/* Redeem Form */}
        {showRedeem && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 mb-5">
            <h3 className="font-bold text-gray-700 mb-1 flex items-center gap-2"><RotateCcw size={16} className="text-emerald-500" /> Request Redemption</h3>
            <p className="text-xs text-gray-400 mb-4">This will submit a redemption request for manager approval.</p>
            {settings && (
              <div className="bg-emerald-50 rounded-xl p-3 mb-4">
                <p className="text-sm text-emerald-700">
                  <span className="font-bold">{customer.totalPoints} pts</span> available →{" "}
                  <span className="font-bold">{(customer.totalPoints * settings.litresPerRedemptionPoint).toFixed(2)} L</span> of free fuel
                </p>
                <p className="text-xs text-emerald-500 mt-0.5">Rate: {settings.litresPerRedemptionPoint} L per point · Min: {settings.minPointsToRedeem} pts</p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Redeem for Product</label>
              <div className="grid grid-cols-4 gap-2">
                {PRODUCTS.map(p => (
                  <button key={p} onClick={() => setRedeemProduct(p)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${redeemProduct === p ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleRedeem} disabled={saving || customer.totalPoints < (settings?.minPointsToRedeem || 100)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                Submit Request
              </button>
              <button onClick={() => { setShowRedeem(false); setError(null); }}
                className="px-5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="font-bold text-gray-700">Transaction History</p>
          </div>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-300 py-8 text-sm">No transactions yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map(t => (
                <div key={t._id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.type === "earn" ? "bg-blue-100 text-blue-600" : t.type === "redeem" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {t.type === "earn" ? "+" : t.type === "redeem" ? "−" : "±"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                      {t.type} {t.product && `· ${t.product}`}
                      {t.litres && <span className="text-xs font-normal text-gray-400 ml-1">{Number(t.litres).toFixed(2)} L</span>}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${t.type === "earn" ? "text-blue-600" : "text-red-500"}`}>
                      {t.type === "earn" ? "+" : "−"}{t.points} pts
                    </p>
                    <p className="text-xs text-gray-400">Bal: {t.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  ArrowLeft, Flame, User, Phone, Mail, MapPin, Star,
  TrendingUp, ShoppingBag, Edit2, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import useGasCustomerStore from "@/store/useGasCustomerStore";

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TierBadge({ tier }) {
  const map = {
    Bronze:   { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-400" },
    Silver:   { bg: "bg-gray-100",   text: "text-gray-600",   bar: "bg-gray-400"   },
    Gold:     { bg: "bg-yellow-100", text: "text-yellow-700", bar: "bg-yellow-500" },
    Platinum: { bg: "bg-purple-100", text: "text-purple-700", bar: "bg-purple-500" },
  };
  const s = map[tier] || map.Bronze;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${s.bg} ${s.text}`}>
      <Star size={12} />
      {tier}
    </span>
  );
}

// Points needed for next tier
function nextTierInfo(tier, points) {
  if (tier === "Bronze")   return { next: "Silver",   needed: 500  - points };
  if (tier === "Silver")   return { next: "Gold",     needed: 2000 - points };
  if (tier === "Gold")     return { next: "Platinum", needed: 5000 - points };
  return null;
}

export default function GasCustomerDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const { fetchCustomer, fetchLoyaltyTransactions, loyaltyTxns, updateCustomer } = useGasCustomerStore();

  const [customer,    setCustomer]    = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);
  const [success,     setSuccess]     = useState(null);
  const [editForm,    setEditForm]    = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchCustomer(id);
      if (data) {
        setCustomer(data.customer);
        setRecentSales(data.recentSales || []);
        setEditForm({
          firstName:         data.customer.firstName,
          lastName:          data.customer.lastName,
          email:             data.customer.email || "",
          address:           data.customer.address || "",
          usualCylinderSize: data.customer.usualCylinderSize || "",
        });
      }
      await fetchLoyaltyTransactions(id);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const result = await updateCustomer(id, editForm);
    setSaving(false);
    if (result.success) {
      setCustomer(result.data);
      setEditing(false);
      setSuccess("Profile updated");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (!customer) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-700">Customer not found</p>
        <button onClick={() => router.back()} className="mt-4 text-orange-500 hover:underline text-sm">← Go back</button>
      </div>
    </DashboardLayout>
  );

  const nextTier = nextTierInfo(customer.tier, customer.loyaltyPoints);
  const tierProgressPct = {
    Bronze:   Math.min(100, (customer.loyaltyPoints / 500)  * 100),
    Silver:   Math.min(100, ((customer.loyaltyPoints - 500)  / 1500) * 100),
    Gold:     Math.min(100, ((customer.loyaltyPoints - 2000) / 3000) * 100),
    Platinum: 100,
  }[customer.tier] || 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">{customer.firstName} {customer.lastName}</h1>
            <p className="text-xs text-gray-500 font-mono">{customer.customerId}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={14} />
            <span className="hidden sm:inline">{editing ? "Cancel" : "Edit"}</span>
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — Profile */}
          <div className="lg:col-span-2 space-y-5">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                  {customer.firstName?.[0]}{customer.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-800">{customer.firstName} {customer.lastName}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <TierBadge tier={customer.tier} />
                    {!customer.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Inactive</span>}
                  </div>
                </div>
              </div>

              {editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "firstName",         label: "First Name" },
                    { key: "lastName",          label: "Last Name"  },
                    { key: "email",             label: "Email"      },
                    { key: "address",           label: "Address"    },
                    { key: "usualCylinderSize", label: "Usual Cylinder" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
                      <input
                        value={editForm[f.key] || ""}
                        onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  ))}
                  {error && <p className="text-xs text-red-600 col-span-2">{error}</p>}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="col-span-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: <Phone size={14} />,    label: "Phone",           value: customer.phone              },
                    { icon: <Mail size={14} />,     label: "Email",           value: customer.email || "—"       },
                    { icon: <MapPin size={14} />,   label: "Address",         value: customer.address || "—"     },
                    { icon: <Flame size={14} />,    label: "Usual Cylinder",  value: customer.usualCylinderSize || "—" },
                    { icon: <User size={14} />,     label: "Registered",      value: new Date(customer.registeredAt).toLocaleDateString("en-NG") },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                      <span className="text-gray-400 mt-0.5 shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm font-medium text-gray-700 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-orange-500" />
                  Recent Purchases
                </h3>
              </div>
              {recentSales.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">No purchases yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentSales.map(s => (
                    <div key={s._id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-orange-500">{s.receiptNumber}</p>
                        <p className="text-sm font-semibold text-gray-700">{s.cylinderSize} · {s.quantityKg?.toFixed(2)} kg</p>
                        <p className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString("en-NG")} · {s.cashier?.firstName} {s.cashier?.lastName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-800">₦{fmt(s.amountPaid)}</p>
                        <p className="text-xs text-green-600">+{Math.floor(s.amountPaid / 100)} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Loyalty */}
          <div className="space-y-5">

            {/* Points Card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg">
              <p className="text-xs font-semibold opacity-80 mb-1">Loyalty Points</p>
              <p className="text-4xl font-bold">{customer.loyaltyPoints?.toLocaleString()}</p>
              <p className="text-xs opacity-70 mt-1">≈ ₦{fmt(Math.floor(customer.loyaltyPoints / 500) * 500)} redemption value</p>
              <div className="mt-4">
                <TierBadge tier={customer.tier} />
              </div>
              {nextTier && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs opacity-80 mb-1">
                    <span>{customer.tier}</span>
                    <span>{nextTier.next}</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${tierProgressPct}%` }} />
                  </div>
                  <p className="text-[10px] opacity-70 mt-1">{nextTier.needed} more points to {nextTier.next}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
              <h3 className="font-bold text-gray-700 text-sm">Purchase Stats</h3>
              {[
                { label: "Total Spent",    value: `₦${fmt(customer.totalAmountSpent)}`,     icon: <TrendingUp size={16} className="text-orange-500" /> },
                { label: "Total Volume",   value: `${(customer.totalKgPurchased||0).toFixed(1)} kg`, icon: <Flame size={16} className="text-amber-500" /> },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {s.icon}{s.label}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Loyalty Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <Star size={14} className="text-orange-500" />
                  Points Log
                </h3>
              </div>
              {loyaltyTxns.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">No transactions yet</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {loyaltyTxns.map(t => (
                    <div key={t._id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 capitalize">{t.type}</p>
                        <p className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleDateString("en-NG")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${t.points > 0 ? "text-green-600" : "text-red-500"}`}>
                          {t.points > 0 ? "+" : ""}{t.points}
                        </p>
                        <p className="text-[10px] text-gray-400">Bal: {t.balanceAfter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

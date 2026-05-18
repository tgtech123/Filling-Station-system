"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Flame, Plus, Search, User, Star, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import useGasCustomerStore from "@/store/useGasCustomerStore";
import Link from "next/link";

function fmt(n) { return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function TierBadge({ tier }) {
  const map = {
    Bronze:   { bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-400"  },
    Silver:   { bg: "bg-gray-100",    text: "text-gray-600",    dot: "bg-gray-400"    },
    Gold:     { bg: "bg-yellow-100",  text: "text-yellow-700",  dot: "bg-yellow-500"  },
    Platinum: { bg: "bg-purple-100",  text: "text-purple-700",  dot: "bg-purple-500"  },
  };
  const s = map[tier] || map.Bronze;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {tier}
    </span>
  );
}

const EMPTY = { firstName:"", lastName:"", phone:"", email:"", address:"", usualCylinderSize:"" };

export default function GasCustomersPage() {
  const { customers, total, loading, registerCustomer, fetchCustomers } = useGasCustomerStore();

  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [search,    setSearch]    = useState("");
  const [tierFilter,setTierFilter]= useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers({ search, tier: tierFilter }), 400);
    return () => clearTimeout(t);
  }, [search, tierFilter]);

  const handleRegister = async () => {
    setError(null);
    if (!form.firstName || !form.lastName || !form.phone) {
      return setError("First name, last name and phone are required");
    }
    setSaving(true);
    const result = await registerCustomer(form);
    setSaving(false);
    if (result.success) {
      setForm(EMPTY);
      setShowForm(false);
      fetchCustomers({ search, tier: tierFilter });
      setSuccess(`Customer ${result.data.customerId} registered!`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error);
    }
  };

  const tierCounts = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 };
  customers.forEach(c => { if (tierCounts[c.tier] !== undefined) tierCounts[c.tier]++; });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800">Loyalty Customers</h1>
            <p className="text-sm text-gray-500">{total} registered customers</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <Plus size={16} />
            <span className="hidden sm:inline">Register Customer</span>
          </button>
        </div>

        {/* Tier Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(tierCounts).map(([tier, count]) => (
            <button key={tier} onClick={() => setTierFilter(tierFilter === tier ? "" : tier)}
              className={`bg-white rounded-2xl p-3 shadow-sm border-2 transition-all text-center ${tierFilter === tier ? "border-orange-400" : "border-gray-100"}`}>
              <TierBadge tier={tier} />
              <p className="text-xl font-bold text-gray-800 mt-1">{count}</p>
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Registration Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 mb-6">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <User size={18} className="text-orange-500" />
              Register New Customer
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "firstName",          label: "First Name *",    type: "text", placeholder: "e.g. Chisom" },
                { key: "lastName",           label: "Last Name *",     type: "text", placeholder: "e.g. Eze"    },
                { key: "phone",              label: "Phone Number *",  type: "tel",  placeholder: "08012345678" },
                { key: "email",              label: "Email",           type: "email",placeholder: "optional"    },
                { key: "usualCylinderSize",  label: "Usual Cylinder",  type: "text", placeholder: "e.g. 12.5kg" },
                { key: "address",            label: "Address",         type: "text", placeholder: "optional"    },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              ))}
            </div>
            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={handleRegister} disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Register
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); setError(null); }}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone or ID..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        {/* Customer List */}
        {loading.list ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No customers found</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    {["ID","Name","Phone","Tier","Points","Kg Purchased","Total Spent","Cylinder"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map(c => (
                    <tr key={c._id} className="hover:bg-orange-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-mono text-xs text-orange-600">{c.customerId}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        <Link href={`/dashboard/gas/customers/${c._id}`} className="hover:text-orange-600">
                          {c.firstName} {c.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                      <td className="px-4 py-3"><TierBadge tier={c.tier} /></td>
                      <td className="px-4 py-3 font-semibold text-purple-600">{c.loyaltyPoints?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{c.totalKgPurchased?.toFixed(1)} kg</td>
                      <td className="px-4 py-3 font-semibold">₦{fmt(c.totalAmountSpent)}</td>
                      <td className="px-4 py-3 text-gray-500">{c.usualCylinderSize || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden space-y-3">
              {customers.map(c => (
                <Link key={c._id} href={`/dashboard/gas/customers/${c._id}`}
                  className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {c.firstName?.[0]}{c.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{c.firstName} {c.lastName}</p>
                        <TierBadge tier={c.tier} />
                      </div>
                      <p className="text-xs text-gray-500">{c.customerId} · {c.phone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-purple-600">{c.loyaltyPoints?.toLocaleString()} pts</p>
                      <p className="text-xs text-gray-400">₦{fmt(c.totalAmountSpent)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

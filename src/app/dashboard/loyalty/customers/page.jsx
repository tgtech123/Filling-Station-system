"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Users, Plus, Search, Fuel, CheckCircle2, AlertCircle, Loader2, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";

function TierBadge({ tier }) {
  const map = {
    Bronze:   { bg: "bg-orange-100",  text: "text-orange-700"  },
    Silver:   { bg: "bg-gray-100",    text: "text-gray-600"    },
    Gold:     { bg: "bg-yellow-100",  text: "text-yellow-700"  },
    Platinum: { bg: "bg-purple-100",  text: "text-purple-700"  },
  };
  const s = map[tier] || map.Bronze;
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{tier}</span>;
}

const EMPTY = { name: "", phone: "", plateNumber: "" };

export default function LoyaltyCustomersPage() {
  const { customers, total, loading, fetchCustomers, registerCustomer } = useFuelLoyaltyStore();
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [search, setSearch]       = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers({ search, tier: tierFilter }), 400);
    return () => clearTimeout(t);
  }, [search, tierFilter]);

  const handleRegister = async () => {
    setError(null);
    if (!form.phone && !form.plateNumber) return setError("At least a phone number or plate number is required");
    setSaving(true);
    const result = await registerCustomer(form);
    setSaving(false);
    if (result.success) {
      setForm(EMPTY);
      setShowForm(false);
      fetchCustomers({ search, tier: tierFilter });
      setSuccess(`Customer ${result.data.customerId} registered!`);
      setTimeout(() => setSuccess(null), 4000);
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
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">Loyalty Customers</h1>
            <p className="text-sm text-gray-500">{total} registered</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <Plus size={16} />
            <span className="hidden sm:inline">Register</span>
          </button>
        </div>

        {/* Tier filter pills */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {Object.entries(tierCounts).map(([tier, count]) => (
            <button key={tier} onClick={() => setTierFilter(tierFilter === tier ? "" : tier)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${tierFilter === tier ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
              <TierBadge tier={tier} />
              <span>{count}</span>
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Register Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <Fuel size={18} className="text-blue-500" /> Register New Loyalty Customer
              </h2>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); setError(null); }}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">At least a phone number OR plate number is required. Both can be entered.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: "name",        label: "Customer Name",    placeholder: "e.g. Emeka Eze (optional)" },
                { key: "phone",       label: "Phone Number",     placeholder: "e.g. 08012345678" },
                { key: "plateNumber", label: "Plate Number",     placeholder: "e.g. AGL-123-AA" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                  <input value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase-plate"
                    style={f.key === "plateNumber" ? { textTransform: "uppercase" } : {}}
                  />
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Register Customer
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); setError(null); }}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, plate or ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        {/* Customer List */}
        {loading.customers ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No customers found</p>
            <p className="text-gray-300 text-sm mt-1">Register your first loyalty customer</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    {["ID", "Name / Plate", "Phone", "Tier", "Points", "Litres", "Spent"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map(c => (
                    <tr key={c._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">{c.customerId}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{c.name || "—"}</p>
                        {c.plateNumber && <p className="text-xs text-gray-400 font-mono">{c.plateNumber}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                      <td className="px-4 py-3"><TierBadge tier={c.tier} /></td>
                      <td className="px-4 py-3 font-bold text-blue-700">{Number(c.totalPoints).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{Number(c.totalLitresPurchased || 0).toFixed(1)} L</td>
                      <td className="px-4 py-3 font-semibold text-gray-700">₦{Number(c.totalAmountSpent || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/loyalty/customers/${c._id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700">
                          View <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {customers.map(c => (
                <Link key={c._id} href={`/dashboard/loyalty/customers/${c._id}`}
                  className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(c.name || c.plateNumber || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 truncate">{c.name || c.plateNumber || c.customerId}</p>
                        <TierBadge tier={c.tier} />
                      </div>
                      <p className="text-xs text-gray-400">{c.phone || ""} {c.plateNumber ? `· ${c.plateNumber}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-blue-600">{Number(c.totalPoints).toLocaleString()} pts</p>
                      <p className="text-xs text-gray-400">{Number(c.totalLitresPurchased || 0).toFixed(1)} L</p>
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

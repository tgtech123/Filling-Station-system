"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Flame, TrendingUp, TrendingDown, BarChart2, Users, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import useGasAnalyticsStore from "@/store/useGasAnalyticsStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

function fmt(n) { return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtShort(n) {
  if (n >= 1000000) return `₦${(n/1000000).toFixed(1)}M`;
  if (n >= 1000)    return `₦${(n/1000).toFixed(1)}K`;
  return `₦${n}`;
}

function StatCard({ label, value, sub, icon, colorClass }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="text-gray-200">{icon}</div>
      </div>
    </div>
  );
}

export default function GasAnalyticsPage() {
  const {
    revenue, dailySales, profitLoss, ordersVsSales, cashierPerformance,
    fetchRevenue, fetchDailySales, fetchProfitLoss, fetchOrdersVsSales, fetchCashierPerformance,
    loading,
  } = useGasAnalyticsStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchRevenue(dateRange);
    fetchDailySales();
    fetchProfitLoss(dateRange);
    fetchOrdersVsSales();
    fetchCashierPerformance();
  }, []);

  const handleApplyFilter = () => {
    fetchRevenue(dateRange);
    fetchProfitLoss(dateRange);
  };

  const summary = ordersVsSales?.summary || {};

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Gas Analytics</h1>
            <p className="text-sm text-gray-500">Revenue, profit & loss, daily sales</p>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">From</label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">To</label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <button onClick={handleApplyFilter}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors">
            Apply
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 gap-1 overflow-x-auto">
          {[
            { id: "overview",    label: "Overview"     },
            { id: "daily",       label: "Daily Sales"  },
            { id: "reconcile",   label: "Reconciliation" },
            { id: "cashiers",    label: "Cashiers"     },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 whitespace-nowrap py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab===t.id?"bg-white shadow text-orange-600":"text-gray-500"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Revenue"   value={`₦${fmt(revenue?.totalRevenue || 0)}`}   sub={`${(revenue?.totalSales||0)} sales`}  icon={<TrendingUp size={32}/>}    colorClass="border-l-orange-400" />
              <StatCard label="Gas Sold"        value={`${(revenue?.totalKg||0).toFixed(1)} kg`} sub="Dispensed volume"                     icon={<Flame size={32}/>}         colorClass="border-l-amber-400"  />
              <StatCard label="Gross Profit"    value={`₦${fmt(profitLoss?.grossProfit || 0)}`}  sub={`${profitLoss?.marginPercent||0}% margin`} icon={<BarChart2 size={32}/>} colorClass="border-l-green-400"  />
              <StatCard label="Total Cost"      value={`₦${fmt(profitLoss?.totalCost || 0)}`}   sub="Procurement cost"                     icon={<TrendingDown size={32}/>}  colorClass="border-l-blue-400"   />
            </div>

            {/* P&L Breakdown */}
            {profitLoss && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-700 mb-4">Profit & Loss Summary</h2>
                <div className="space-y-3">
                  {[
                    { label: "Revenue",        value: profitLoss.totalRevenue,  color: "bg-green-500", textColor: "text-green-700"  },
                    { label: "Procurement Cost",value: -profitLoss.totalCost,   color: "bg-red-400",   textColor: "text-red-600"    },
                    { label: "Gross Profit",   value: profitLoss.grossProfit,   color: "bg-orange-500",textColor: "text-orange-700" },
                  ].map(item => {
                    const max = profitLoss.totalRevenue || 1;
                    const pct = Math.min(100, Math.abs(item.value / max) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">{item.label}</span>
                          <span className={`text-sm font-bold ${item.textColor}`}>₦{fmt(Math.abs(item.value))}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Sales Tab */}
        {activeTab === "daily" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-700 mb-4">Daily Sales — Last 30 Days</h2>
            {loading.dailySales ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : dailySales.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No sales data available</div>
            ) : (
              <>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySales} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v, n) => [n==="totalAmount" ? `₦${fmt(v)}` : `${v} kg`, n==="totalAmount" ? "Revenue" : "Volume"]} />
                      <Bar dataKey="totalAmount" fill="#f97316" radius={[4,4,0,0]} name="totalAmount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-48">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Volume (kg/day)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySales} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={v => [`${v} kg`, "Volume"]} />
                      <Line type="monotone" dataKey="totalKg" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* Reconciliation Tab */}
        {activeTab === "reconcile" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Orders Submitted",   value: summary.ordersSubmitted  || 0, sub: `₦${fmt(summary.ordersTotal||0)}`,    color: "bg-blue-50 border-blue-200 text-blue-700"   },
                { label: "Sales Confirmed",    value: summary.salesConfirmed   || 0, sub: `₦${fmt(summary.salesTotal||0)}`,     color: "bg-orange-50 border-orange-200 text-orange-700" },
                { label: "Gas Dispensed",      value: summary.gasDispensed     || 0, sub: `₦${fmt(summary.dispensedTotal||0)}`, color: "bg-green-50 border-green-200 text-green-700" },
              ].map(c => (
                <div key={c.label} className={`rounded-2xl p-4 border-2 ${c.color}`}>
                  <p className="text-xs font-semibold opacity-70 mb-1">{c.label}</p>
                  <p className="text-3xl font-bold">{c.value}</p>
                  <p className="text-xs mt-1 opacity-70">{c.sub}</p>
                </div>
              ))}
            </div>

            {(summary.pendingSales > 0 || summary.kgDiscrepancy > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-bold text-amber-700 text-sm">Discrepancies Detected</p>
                  {summary.pendingSales > 0 && <p className="text-xs text-amber-600 mt-0.5">{summary.pendingSales} sale(s) not yet dispensed by attendant</p>}
                  {summary.kgDiscrepancy > 0 && <p className="text-xs text-amber-600">{summary.kgDiscrepancy.toFixed(2)} kg discrepancy between cashier and attendant</p>}
                </div>
              </div>
            )}

            {/* Transaction log */}
            {ordersVsSales?.sales && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-700 text-sm">Today's Transaction Log</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr>
                        {["Receipt","Customer","Kg","Amount","Cashier","Attendant","Status"].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ordersVsSales.sales.map(s => (
                        <tr key={s._id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-mono text-orange-600">{s.receiptNumber}</td>
                          <td className="px-3 py-2.5">{s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : (s.walkInName || "Walk-in")}</td>
                          <td className="px-3 py-2.5 font-semibold">{s.quantityKg?.toFixed(2)}</td>
                          <td className="px-3 py-2.5 font-semibold">₦{fmt(s.amountPaid)}</td>
                          <td className="px-3 py-2.5">{s.cashier?.firstName} {s.cashier?.lastName}</td>
                          <td className="px-3 py-2.5">{s.attendant ? `${s.attendant.firstName} ${s.attendant.lastName}` : "—"}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              s.status === "dispensed"            ? "bg-green-100 text-green-700" :
                              s.status === "confirmed"            ? "bg-blue-100 text-blue-700"   :
                              s.status === "pending_confirmation" ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                              {s.status === "pending_confirmation" ? "Pending" :
                               s.status === "confirmed" ? "Confirmed" :
                               s.status === "dispensed" ? "✓ Dispensed" : s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cashiers Tab */}
        {activeTab === "cashiers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-700">Cashier Performance (Last 30 Days)</h3></div>
            {cashierPerformance.length === 0 ? (
              <div className="py-10 text-center text-gray-400">No data available</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {cashierPerformance.map((c, idx) => (
                  <div key={c._id} className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{c.cashierName}</p>
                      <p className="text-xs text-gray-500">{c.totalSales} sales · {c.totalKg?.toFixed(1)} kg</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-orange-600">₦{fmt(c.totalRevenue)}</p>
                      <p className="text-xs text-gray-400">avg ₦{fmt(c.avgSale)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

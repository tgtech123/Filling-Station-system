"use client";
import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { api } from "@/lib/config";
import { useSocket } from "@/hooks/useSocket";
import { Loader2, Users, Eye, Fuel, Droplet, ShoppingBasket, Flame } from "lucide-react";

/**
 * Who sold what, across every channel, on one page.
 *
 * Read-only by design and by route: the endpoint exposes GET and nothing else.
 * The person answerable for the money needs to see it, not move it.
 *
 * Cards rather than a table, because the question being asked is per person
 * ("what did Musa take today"), and a row of eight columns answers it worse
 * than one card does.
 */

const DURATIONS = [
  { value: "today",     label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisweek",  label: "This week" },
  { value: "thismonth", label: "This month" },
  { value: "lastmonth", label: "Last month" },
];

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const CHANNELS = [
  { key: "fuel",      label: "Fuel",      icon: Fuel,            colour: "text-blue-500",   bg: "bg-blue-50" },
  { key: "lubricant", label: "Lubricant", icon: Droplet,         colour: "text-amber-600",  bg: "bg-amber-50" },
  { key: "store",     label: "Store",     icon: ShoppingBasket,  colour: "text-emerald-600",bg: "bg-emerald-50" },
  { key: "gas",       label: "Gas",       icon: Flame,           colour: "text-orange-500", bg: "bg-orange-50" },
];

const when = (iso) => {
  if (!iso) return "No sales";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

export default function StaffSalesPage() {
  const [duration, setDuration] = useState("today");
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async (d) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/accountant/staff-sales", { params: { duration: d } });
      setData(res.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load staff sales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(duration); }, [duration, load]);

  // Same live signal the dashboards use, so a sale rung up now lands here
  // without a reload.
  useSocket({
    "dashboard:refresh": () => load(duration),
    "shift:ended":       () => load(duration),
  });

  const staff  = data?.staff  ?? [];
  const totals = data?.totals ?? {};

  return (
    <DashboardLayout>
      <div className="px-1 sm:px-4 pb-10">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sales by Staff</h1>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5">
                <Eye size={11} /> Read only
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Every channel in one place: fuel, lubricant, store and gas
            </p>
          </div>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 w-full sm:w-auto"
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Station total first, so the cards below have something to add up to. */}
        {data && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Station total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{naira(totals.total)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totals.transactions || 0} sale{totals.transactions === 1 ? "" : "s"} · {staff.length} staff
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {CHANNELS.filter((c) => c.key !== "gas" || data.gasEnabled).map((c) => (
                  <div key={c.key}>
                    <p className={`text-[11px] font-semibold uppercase ${c.colour}`}>{c.label}</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{naira(totals[c.key])}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">{error}</p>
        ) : staff.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            Nobody recorded a sale in this period.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {staff.map((s) => (
              <div
                key={s.staffId}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{s.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{naira(s.total)}</p>
                    <p className="text-[11px] text-gray-400">
                      {s.transactions} sale{s.transactions === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {/* Only the channels this person actually sold in. A cashier who
                    never touched a pump should not be shown an empty Fuel line. */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {CHANNELS.filter((c) => Number(s[c.key]) > 0).map((c) => {
                    const Icon = c.icon;
                    return (
                      <span
                        key={c.key}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg ${c.bg} ${c.colour}`}
                      >
                        <Icon size={12} />
                        {c.label} {naira(s[c.key])}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <span>
                    {s.litres > 0 && `${s.litres.toLocaleString()} L`}
                    {s.litres > 0 && s.kg > 0 && " · "}
                    {s.kg > 0 && `${s.kg.toLocaleString()} kg`}
                    {s.litres === 0 && s.kg === 0 && (s.products || []).join(", ")}
                  </span>
                  <span>Last: {when(s.lastSaleAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

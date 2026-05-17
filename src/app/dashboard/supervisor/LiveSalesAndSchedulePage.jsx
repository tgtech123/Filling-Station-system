"use client";
import React from "react";
import ScheduledAttendantsCard from "./ScheduledAttendantsCard";
import useSupervisorStore from "@/store/useSupervisorStore";

// ── Live indicator dot ────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
      <span className="text-sm font-bold text-green-700">Live</span>
    </div>
  );
}

// ── Single sale row formatted ─────────────────────────────────────────────────
function saleRow(sale) {
  return {
    pump:      sale.pumpNo        ?? "—",
    price:     `₦${(sale.pricePerLtr ?? 0).toLocaleString()}/L`,
    litres:    `${(sale.litres ?? 0).toLocaleString()} L`,
    amount:    `₦${(sale.amount ?? 0).toLocaleString()}`,
    time:      sale.timestamp ? new Date(sale.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    attendant: sale.attendant ?? "Unknown",
  };
}

const LiveSalesAndSchedulePage = () => {
  const { dashboard, loading } = useSupervisorStore();
  const feed = (dashboard?.liveSalesFeed ?? []).map(saleRow);

  return (
    <div className="flex flex-col lg:flex-row gap-4 mt-3 w-full">

      {/* ── Live Sales Feed ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl flex-1 min-w-0 p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-gray-100 leading-tight">
              Live Sales Feed
            </h2>
            <p className="text-sm text-neutral-500 dark:text-gray-400 mt-0.5">
              Sales transactions by attendant
            </p>
          </div>
          <LiveDot />
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading live sales…</div>
        ) : feed.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No sales recorded yet</div>
        ) : (
          <>
            {/* Mobile cards (< sm) */}
            <div className="sm:hidden space-y-3">
              {feed.map((s, i) => (
                <div
                  key={i}
                  className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      Pump {s.pump}
                    </span>
                    <span className="text-xs text-gray-400">{s.time}</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{s.amount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.litres} · {s.price}
                  </p>
                  <p className="text-xs text-gray-600 mt-1.5 font-medium truncate">
                    {s.attendant}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop table (sm+) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <tr>
                    {["Pump", "Price/Ltr", "Litres", "Amount", "Time", "Attendant"].map((h) => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {feed.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">{s.pump}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.price}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.litres}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{s.amount}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.time}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.attendant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Scheduled Attendants ────────────────────────────────────── */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
        <ScheduledAttendantsCard />
      </div>
    </div>
  );
};

export default LiveSalesAndSchedulePage;
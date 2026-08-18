"use client";

import { useEffect, useState } from "react";
import { subscribeToCustomerDisplay } from "@/lib/customerDisplay";

/**
 * The customer-facing screen on a dual-output till.
 *
 * Shows exactly what a customer is entitled to see and nothing else: what is in
 * their basket, what each line costs, and the total. No stock figures, no cost
 * prices, no margins, no other customer's sale, no navigation — a second monitor
 * facing the shop floor is effectively a public display, and anything on it is
 * public.
 *
 * Deliberately large type on a dark ground: it is read from a metre away, across
 * a counter, often at an angle, by someone checking they are not being
 * overcharged. That is the entire job.
 */
export default function CustomerDisplayPage() {
  const [state, setState] = useState({ items: [], total: 0, status: "idle" });

  useEffect(() => subscribeToCustomerDisplay((msg) => setState(msg)), []);

  // Full screen on the first click, since a popup cannot start that way.
  useEffect(() => {
    const goFullscreen = () => {
      document.documentElement.requestFullscreen?.().catch(() => {});
      window.removeEventListener("click", goFullscreen);
    };
    window.addEventListener("click", goFullscreen);
    return () => window.removeEventListener("click", goFullscreen);
  }, []);

  const items = state.items || [];
  const naira = (n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
        <p className="text-2xl font-bold tracking-tight">{state.stationName || "Welcome"}</p>
        {state.status === "paid" && (
          <span className="text-sm font-bold bg-green-500 text-white px-3 py-1.5 rounded-full">PAID — THANK YOU</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <p className="text-5xl font-bold text-white/90">Welcome</p>
          <p className="text-xl text-white/40 mt-3">Your items will appear here</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-8 py-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-6 py-4 border-b border-white/10"
              >
                <div className="min-w-0">
                  <p className="text-3xl font-semibold truncate">{item.name}</p>
                  <p className="text-lg text-white/50 mt-1">
                    {item.quantity} {item.unitName || ""}
                    {item.quantity > 1 && item.unitName ? "s" : ""} × {naira(item.unitPrice)}
                  </p>
                </div>
                <p className="text-3xl font-bold tabular-nums shrink-0">{naira(item.amount)}</p>
              </div>
            ))}
          </div>

          <div className="px-8 py-6 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between gap-6">
              <p className="text-3xl font-semibold text-white/70">Total</p>
              <p className="text-6xl font-bold tabular-nums text-green-400">{naira(state.total)}</p>
            </div>
            {/* Loyalty points are the customer's own business and worth showing:
                it is the moment they can see the programme working. */}
            {state.loyalty?.name && (
              <p className="text-lg text-white/50 mt-3">
                {state.loyalty.name} · {Number(state.loyalty.points || 0).toLocaleString()} points
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

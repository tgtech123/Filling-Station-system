"use client";
import { useEffect, useState } from "react";
import { Loader2, Package, Minus, Plus } from "lucide-react";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";

/**
 * Choosing what a shop reward is taken as.
 *
 * A fuel reward needs none of this — it is litres out of a pump. A shop reward
 * is a specific bottle off a specific shelf, and until someone names it the
 * stock count and the rack disagree with no explanation.
 *
 * Only shows what is in stock and within the reward's value, and caps each
 * stepper at what the reward covers, so the person releasing cannot walk into a
 * refusal after choosing. The server checks all of this again — this is the
 * courtesy layer, not the control.
 */
export default function ShopRewardPicker({ redemptionId, onConfirm, confirming }) {
  const { fetchShopRewardOptions } = useFuelLoyaltyStore();

  const [loading, setLoading] = useState(true);
  const [worth, setWorth]     = useState(0);
  const [options, setOptions] = useState([]);
  const [picked, setPicked]   = useState({}); // { [id]: qty }
  const [error, setError]     = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const result = await fetchShopRewardOptions(redemptionId);
      if (!alive) return;
      if (result.success) {
        setWorth(result.data.worth || 0);
        setOptions(result.data.options || []);
      } else {
        setError(result.error);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [redemptionId]);

  const spent = options.reduce((sum, o) => sum + (picked[o._id] || 0) * o.unitPrice, 0);
  const remaining = worth - spent;

  const step = (option, delta) => {
    setPicked(p => {
      const next = Math.max(0, (p[option._id] || 0) + delta);
      // Never let the running total pass what the reward is worth.
      if (delta > 0 && spent + option.unitPrice > worth + 0.01) return p;
      if (next > option.maxQty) return p;
      return { ...p, [option._id]: next };
    });
  };

  const chosen = Object.entries(picked)
    .filter(([, qty]) => qty > 0)
    .map(([lubricantId, quantity]) => ({ lubricantId, quantity }));

  if (loading) {
    return (
      <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>;
  }

  if (options.length === 0) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
        Nothing in stock is within this reward's value (₦{Number(worth).toLocaleString()}).
        Restock, or give the reward as fuel instead.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600">Choose what the customer is taking</p>
        <p className="text-xs text-gray-500">
          ₦{Number(remaining).toLocaleString()} <span className="text-gray-400">of ₦{Number(worth).toLocaleString()} left</span>
        </p>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {options.map(o => {
          const qty = picked[o._id] || 0;
          return (
            <div key={o._id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <Package size={16} className="text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{o.productName}</p>
                <p className="text-xs text-gray-400">
                  ₦{Number(o.unitPrice).toLocaleString()} · {o.qtyInStock} in stock
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => step(o, -1)} disabled={qty === 0}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 flex items-center justify-center">
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center text-sm font-bold text-gray-700">{qty}</span>
                <button type="button" onClick={() => step(o, 1)}
                  disabled={qty >= o.maxQty || spent + o.unitPrice > worth + 0.01}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 flex items-center justify-center">
                  <Plus size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => onConfirm(chosen)} disabled={chosen.length === 0 || confirming}
        className="w-full mt-3 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
        {confirming ? <Loader2 size={15} className="animate-spin" /> : <Package size={15} />}
        {chosen.length === 0
          ? "Pick what they are taking"
          : `Hand over ${chosen.reduce((n, c) => n + c.quantity, 0)} item(s) — ₦${Number(spent).toLocaleString()}`}
      </button>
      <p className="text-xs text-gray-400 mt-1.5 text-center">
        This takes the goods off stock and books what they cost.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useLubricantStore } from "@/store/lubricantStore";

/** Whole naira. Kobo cannot be tendered at a counter. */
const naira = (n) => Math.round((Number(n) || 0) + Number.EPSILON);

/**
 * Prices for one delivered product, settled at the door.
 *
 * A delivery is the moment the real cost is known — the invoice is in the
 * validator's hand — so it is the right and only moment to re-price. Two routes,
 * because the goods reach the shelf two different ways:
 *
 *   CARTON (bought)  the supplier charges for one, so enter that cost and the
 *                    carton's own markup gives the price.
 *   PACK   (broken)  no supplier ever charged for a pack, so it is priced off
 *                    the single's new price less a discount.
 *
 * Everything computes and everything stays editable: the formula is a starting
 * point, and the person holding the invoice may know better than it does.
 */
export default function ReceivePricing({ product, unitCost, value, onChange }) {
  const { pricingSettings, fetchPricingSettings } = useLubricantStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!pricingSettings) fetchPricingSettings();
  }, []);

  const cost = Number(unitCost) || 0;
  const pct = Number(value?.sellingPercentage ?? product?.sellingPercentage ?? 0);
  const singlePrice = value?.unitPrice != null ? Number(value.unitPrice) : naira(cost * (1 + pct / 100));

  const units = value?.saleUnits || product?.saleUnits || [];

  const setSingle = (patch) => onChange({ ...value, ...patch });

  const setUnit = (index, patch) =>
    onChange({
      ...value,
      saleUnits: units.map((u, i) => (i === index ? { ...u, ...patch } : u)),
    });

  /** The computed price for a unit at the numbers currently on screen. */
  const computed = (u) => {
    const factor = Number(u.factor) || 1;
    if ((u.pricingMode || "derived") === "cost") {
      const unitBuyCost = Number(u.unitCost) > 0 ? Number(u.unitCost) : cost * factor;
      return naira(unitBuyCost * (1 + (Number(u.sellingPercentage) || 0) / 100));
    }
    return naira(singlePrice * factor * (1 - (Number(u.discountPercentage) || 0) / 100));
  };

  // Buying bigger should never cost more per piece. Because carton and pack are
  // priced by different routes, this can happen with nothing obviously wrong
  // typed anywhere — so it is worth saying out loud rather than validating away.
  const dearer = units.filter((u) => {
    const price = Number(u.price ?? computed(u));
    return price / (Number(u.factor) || 1) > singlePrice;
  });

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Sells at</span>
          <input
            type="number"
            min={0}
            value={singlePrice}
            onChange={(e) => setSingle({ unitPrice: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-24 border border-green-200 dark:border-green-700 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 text-sm font-bold text-green-700 dark:text-green-300 outline-none focus:border-green-500"
          />
          <span className="text-[11px] text-gray-400">
            = cost + <input
              type="number"
              min={0}
              max={100}
              value={pct}
              onChange={(e) => {
                const next = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                setSingle({ sellingPercentage: next, unitPrice: naira(cost * (1 + next / 100)) });
              }}
              className="w-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-1 py-0.5 text-[11px] text-center outline-none"
            />%
          </span>
        </div>

        {units.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 shrink-0"
          >
            {open ? "Hide" : `${units.length} pack price${units.length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 space-y-2">
          {units.map((u, i) => {
            const mode = u.pricingMode || "derived";
            const price = u.price != null ? Number(u.price) : computed(u);
            return (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {u.name} <span className="font-normal text-gray-400">of {u.factor}</span>
                  </p>
                  <select
                    value={mode}
                    onChange={(e) => setUnit(i, { pricingMode: e.target.value, price: undefined })}
                    className="text-[10px] border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded px-1.5 py-0.5 outline-none"
                  >
                    <option value="cost">Bought — price from its cost</option>
                    <option value="derived">Broken down — price off the single</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {mode === "cost" ? (
                    <>
                      <label className="text-[10px] text-gray-400">Supplier cost</label>
                      <input
                        type="number"
                        min={0}
                        value={u.unitCost || ""}
                        placeholder={String(naira(cost * (Number(u.factor) || 1)))}
                        onChange={(e) =>
                          setUnit(i, { unitCost: Math.max(0, parseInt(e.target.value) || 0), price: undefined })
                        }
                        className="w-24 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded px-2 py-1 text-xs outline-none"
                      />
                      <label className="text-[10px] text-gray-400">+</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={u.sellingPercentage ?? 0}
                        onChange={(e) =>
                          setUnit(i, {
                            sellingPercentage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                            price: undefined,
                          })
                        }
                        className="w-12 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded px-1 py-1 text-xs text-center outline-none"
                      />
                      <span className="text-[10px] text-gray-400">% profit</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-gray-400">
                        {u.factor} × ₦{singlePrice.toLocaleString()} = ₦{(singlePrice * (Number(u.factor) || 1)).toLocaleString()} less
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={u.discountPercentage ?? 0}
                        onChange={(e) =>
                          setUnit(i, {
                            discountPercentage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                            price: undefined,
                          })
                        }
                        className="w-12 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded px-1 py-1 text-xs text-center outline-none"
                      />
                      <span className="text-[10px] text-gray-400">% discount</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">Sells at</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setUnit(i, { price: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-28 border border-green-200 dark:border-green-700 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 text-sm font-bold text-green-700 dark:text-green-300 outline-none focus:border-green-500"
                    />
                    <span className="text-[10px] text-gray-400 w-20 text-right">
                      ₦{naira(price / (Number(u.factor) || 1)).toLocaleString()} each
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {dearer.length > 0 && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              {dearer.map((u) => u.name).join(", ")} works out dearer per piece than a single — check the numbers unless that is intended.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

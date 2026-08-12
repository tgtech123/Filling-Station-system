"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Plus, Percent } from "lucide-react";
import { useLubricantStore } from "@/store/lubricantStore";

const CATEGORY_LABEL = {
  lubricant: "Lubricants (oils, greases)",
  drinks: "Store — Drinks",
  snacks: "Store — Snacks",
  other: "Store — Other",
};

/**
 * The station's standing margins, in one place.
 *
 * Margin is a decision made once — "we make 25% on oil, 20% on drinks, 15% on
 * snacks" — and then applied to everything registered afterwards. Asking for it
 * again on every product is how a shelf ends up with three different margins on
 * the same kind of goods, none of them chosen.
 *
 * These are defaults, not rules. A product that needs its own margin still gets
 * one, and saving here never re-prices anything already on the shelf — that is
 * said on the screen, because it is the thing a manager would reasonably fear
 * this button does.
 */
export default function PricingDefaultsModal({ onClose }) {
  const { pricingSettings, fetchPricingSettings, updatePricingSettings } = useLubricantStore();

  const [categoryMarkups, setCategoryMarkups] = useState({});
  const [unitMarkups, setUnitMarkups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const settings = pricingSettings || (await fetchPricingSettings());
      if (!settings) return;
      setCategoryMarkups({ ...(settings.categoryMarkups || {}) });
      setUnitMarkups((settings.unitMarkups || []).map((u) => ({ ...u })));
    })();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const result = await updatePricingSettings({ categoryMarkups, unitMarkups });
    setSaving(false);
    if (result.success) {
      setMessage(result.message);
      setTimeout(onClose, 1600);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-[520px] p-4 lg:p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Pricing defaults</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The profit you expect, by category and by unit. New products start here.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
        </div>

        {message && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5 mb-3">{message}</p>
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3">{error}</p>
        )}

        {/* ── By category ── */}
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Profit on a single item</p>
        <div className="space-y-2 mb-5">
          {Object.keys(CATEGORY_LABEL).map((category) => (
            <div key={category} className="flex items-center gap-3">
              <p className="flex-1 text-sm text-gray-600 dark:text-gray-300">{CATEGORY_LABEL[category]}</p>
              <div className="relative w-24">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={categoryMarkups[category] ?? ""}
                  onChange={(e) =>
                    setCategoryMarkups((m) => ({ ...m, [category]: e.target.value }))
                  }
                  className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-1.5 pr-7 rounded-[6px] text-sm"
                />
                <Percent size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* ── By unit ── */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Profit on a bigger unit</p>
            <p className="text-xs text-gray-400">
              Lower than the single is what makes a pack worth buying.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUnitMarkups((u) => [...u, { name: "", sellingPercentage: "" }])}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {unitMarkups.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={u.name}
                onChange={(e) =>
                  setUnitMarkups((rows) => rows.map((r, x) => (x === i ? { ...r, name: e.target.value } : r)))
                }
                placeholder="Pack, Carton, Dozen…"
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-1.5 rounded-[6px] text-sm"
              />
              <div className="relative w-24">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={u.sellingPercentage}
                  onChange={(e) =>
                    setUnitMarkups((rows) =>
                      rows.map((r, x) => (x === i ? { ...r, sellingPercentage: e.target.value } : r))
                    )
                  }
                  className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-1.5 pr-7 rounded-[6px] text-sm"
                />
                <Percent size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setUnitMarkups((rows) => rows.filter((_, x) => x !== i))}
                className="text-xs font-semibold text-red-500 hover:text-red-600 px-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Products already registered keep the percentage they were given — saving this
          does not re-price your shelf. When a supplier's cost changes, prices are
          recalculated from each product's own percentage at goods receipt.
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save defaults
        </button>
      </div>
    </div>
  );
}

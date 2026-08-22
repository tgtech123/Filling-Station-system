"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ArrowDownCircle, ArrowUpCircle, Settings2, AlertTriangle } from "lucide-react";
import { useLubricantStore } from "@/store/lubricantStore";
import { getCurrentUser } from "@/lib/currentUser";
import { API_URL } from "@/lib/config";

const REASONS = [
  { value: "miscount",            label: "Miscounted before" },
  { value: "damaged",             label: "Damaged / expired" },
  { value: "theft",               label: "Theft or loss" },
  { value: "received_unrecorded", label: "Came in without being recorded" },
  { value: "sold_unrecorded",     label: "Sold without being rung up" },
  { value: "returned",            label: "Customer returned it" },
  { value: "staff_use",           label: "Taken for station use" },
  { value: "other",               label: "Something else" },
];

const EVENT_STYLE = {
  sale:       { icon: ArrowDownCircle, colour: "text-blue-500",    label: "Sold" },
  purchase:   { icon: ArrowUpCircle,   colour: "text-green-600",   label: "Bought" },
  delivery:   { icon: ArrowUpCircle,   colour: "text-emerald-600", label: "Delivered" },
  adjustment: { icon: Settings2,       colour: "text-amber-600",   label: "Adjusted" },
};

/**
 * Everything that ever happened to one product, and the means to correct it.
 *
 * The two belong on the same screen: someone opens this BECAUSE the shelf and
 * the system disagree, and the first useful question is not "what is the right
 * number" but "where did they diverge". The history answers that; the
 * adjustment closes it. Splitting them would mean correcting a count without
 * ever looking at what caused it, which is how the same discrepancy comes back
 * every week.
 */
export default function ProductTrackerModal({ product, onClose }) {
  const { fetchProductHistory, adjustStock, updateProductPricing } = useLubricantStore();

  const [loading, setLoading]   = useState(true);
  const [data, setData]         = useState(null);
  const [error, setError]       = useState(null);

  const [showAdjust, setShowAdjust] = useState(false);
  const [newQty, setNewQty]         = useState("");
  const [reason, setReason]         = useState("miscount");
  const [note, setNote]             = useState("");
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState(null);
  const [retiring, setRetiring]     = useState(false);

  /**
   * Adding a bigger selling unit to a product that never had one.
   *
   * A product registered as singles could not later be sold by the pack: the
   * endpoint accepted units all along, but nothing in the app ever called it.
   * So a shop that started stocking cartons had to delete and re-register the
   * item, losing its whole history to add a size.
   */
  const [addingUnit, setAddingUnit] = useState(false);
  const [unitName, setUnitName]     = useState("");
  const [unitFactor, setUnitFactor] = useState("");
  const [unitPrice, setUnitPrice]   = useState("");
  const [savingUnit, setSavingUnit] = useState(false);

  const existingUnits = data?.product?.saleUnits || product.saleUnits || [];

  const saveUnit = async () => {
    const name = unitName.trim();
    const factor = Number(unitFactor);
    const price = Number(unitPrice);

    if (!name) return setError("Give the unit a name, such as Pack or Carton.");
    if (!Number.isFinite(factor) || factor < 2) {
      return setError("A bigger unit must hold at least 2. One that holds a single is just the single under another name.");
    }
    if (!Number.isFinite(price) || price <= 0) {
      return setError("Enter what one of these sells for.");
    }
    if (existingUnits.some((u) => String(u.name).toLowerCase() === name.toLowerCase())) {
      return setError(`This product already sells by the ${name}.`);
    }

    setSavingUnit(true);
    setError(null);
    const res = await updateProductPricing(product._id, {
      // Every existing unit is sent back unchanged; omitting them would drop
      // the sizes the product already had.
      saleUnits: [
        ...existingUnits.map((u) => ({ ...u })),
        { name, factor, price, pricingMode: "cost" },
      ],
    });
    setSavingUnit(false);

    if (!res.success) return setError(res.error);

    setUnitName(""); setUnitFactor(""); setUnitPrice("");
    setAddingUnit(false);
    setSuccess(`${name} of ${factor} added. The till can sell it now.`);
    await load();
  };

  /**
   * Retiring lives here rather than on the inventory table, because this is the
   * screen where somebody has just read the product's whole history and can see
   * what they are about to take off the shelf.
   */
  const canRetire = ["manager", "supervisor"].includes(getCurrentUser()?.role);
  const isRetired = data?.product?.isActive === false;

  const retire = async () => {
    const name = data?.product?.productName || product.productName;
    if (!window.confirm(
      `Retire ${name}?

It disappears from the till, the reorder list and the product list. Nothing is deleted: every sale, purchase and correction stays exactly as it is, and you can restore it later.`
    )) return;

    setRetiring(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/lubricant/${product._id}/retire`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not retire this product");
      setSuccess(body.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRetiring(false);
    }
  };

  const restore = async () => {
    setRetiring(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/lubricant/${product._id}/restore`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not restore this product");
      setSuccess(body.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRetiring(false);
    }
  };

  const load = async () => {
    const result = await fetchProductHistory(product._id);
    if (result.success) setData(result.data);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => { load(); }, [product._id]);

  const current = data?.product?.qtyInStock ?? product.qtyInStock ?? 0;
  const unit = data?.product?.baseUnit || product.baseUnit || "piece";
  const difference = newQty === "" ? 0 : Number(newQty) - Number(current);

  const handleAdjust = async () => {
    setError(null);
    setSaving(true);
    const result = await adjustStock(product._id, {
      quantityAfter: Number(newQty),
      reason,
      note,
      // What we were looking at. If a sale lands mid-count the server refuses
      // rather than letting a stale figure reverse it.
      expectedBefore: Number(current),
    });
    setSaving(false);
    if (result.success) {
      setSuccess(result.message);
      setShowAdjust(false);
      setNewQty("");
      setNote("");
      setLoading(true);
      load();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.productName}</h3>
            <p className="text-sm text-gray-500">
              {current} {unit}{current === 1 ? "" : "s"} in stock
              {product.barcode ? <span className="font-mono text-xs text-gray-400"> · {product.barcode}</span> : null}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
        </div>

        {success && (
          <p className="mx-5 mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">{success}</p>
        )}
        {error && (
          <p className="mx-5 mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>
        )}

        {/* ── Selling units ───────────────────────────────────────────── */}
        {data?.product?.isActive !== false && (
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Selling units</p>
                <p className="text-xs text-gray-400">
                  {existingUnits.length === 0
                    ? `Sold only by the ${unit}.`
                    : existingUnits.map((u) => `${u.name} of ${u.factor}`).join(" · ")}
                </p>
              </div>
              {canRetire && !addingUnit && (
                <button
                  onClick={() => { setAddingUnit(true); setError(null); }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                >
                  Add a size
                </button>
              )}
            </div>

            {addingUnit && (
              <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">Name</label>
                    <input
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      placeholder="Pack, Carton, Roll"
                      className="w-full min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">
                      How many {unit}s
                    </label>
                    <input
                      type="number" min="2"
                      value={unitFactor}
                      onChange={(e) => setUnitFactor(e.target.value)}
                      placeholder="12"
                      className="w-full min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">Price (₦)</label>
                    <input
                      type="number" min="0"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="4104"
                      className="w-full min-w-0 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Stock is never re-counted: a carton of 12 is 12 of the same
                    pieces already on the shelf, not 12 more. */}
                <p className="text-xs text-gray-400 mt-2">
                  This changes how the item is SOLD, not how much is in stock.
                  Selling one takes {unitFactor || "n"} {unit}s off the shelf.
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={saveUnit}
                    disabled={savingUnit}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold"
                  >
                    {savingUnit ? "Saving…" : "Add it"}
                  </button>
                  <button
                    onClick={() => { setAddingUnit(false); setError(null); }}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Adjust */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          {data?.product?.isActive === false ? (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-500 flex-1 min-w-[220px]">
                This product is retired. Its history below is complete and
                unchanged; the count can no longer be corrected.
              </p>
              {canRetire && (
                <button
                  onClick={restore}
                  disabled={retiring}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {retiring ? "Working…" : "Put back on the shelf"}
                </button>
              )}
            </div>
          ) : !showAdjust ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => { setShowAdjust(true); setNewQty(String(current)); setSuccess(null); }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                The shelf says something different — correct the count
              </button>
              {/* Retiring is a quiet action, not a red one: nothing is
                  destroyed, so it should not wear the styling of something
                  that is. */}
              {canRetire && (
                <button
                  onClick={retire}
                  disabled={retiring}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {retiring ? "Working…" : "Stop stocking this product"}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Actual count on the shelf
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-28 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-1.5 text-sm font-bold"
                  />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Why does it differ?</p>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-1.5 text-sm"
                  >
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything worth remembering about this (optional)"
                className="w-full mt-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-1.5 text-sm"
              />

              {newQty !== "" && difference !== 0 && (
                <p className={`text-xs mt-2 font-semibold ${difference < 0 ? "text-red-600" : "text-green-600"}`}>
                  {difference > 0 ? "+" : ""}{difference} {unit}
                  {Math.abs(difference) === 1 ? "" : "s"} — {current} becomes {newQty}.
                  {difference < 0 && " This is a write-off and your manager is told."}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAdjust}
                  disabled={saving || newQty === "" || difference === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save correction
                </button>
                <button
                  onClick={() => setShowAdjust(false)}
                  className="text-sm text-gray-500 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
          ) : !data?.events?.length ? (
            <p className="text-sm text-gray-400 text-center py-10">
              Nothing has moved this product's stock yet.
            </p>
          ) : (
            <>
              {/* The number that matters most: stock that moved with no record
                  behind it. Anything other than zero is the discrepancy itself. */}
              {Math.abs(data.openingBalance) > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">{Math.abs(data.openingBalance)} {unit}
                    {Math.abs(data.openingBalance) === 1 ? "" : "s"} unaccounted for.</span>{" "}
                    The records below do not fully explain today's count — either stock existed
                    before this history begins, or some movement was never recorded.
                  </p>
                </div>
              )}

              {/* Table on anything with room for one. Every fact the cards
                  carried gets its own column, so a run of movements can be read
                  down a line instead of unpicked card by card. Phones keep the
                  cards below: six columns on a 360px screen is unreadable. */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-3 font-semibold">Date</th>
                      <th className="py-2 pr-3 font-semibold">Event</th>
                      <th className="py-2 pr-3 font-semibold">Who</th>
                      <th className="py-2 pr-3 font-semibold text-right">Change</th>
                      <th className="py-2 pr-3 font-semibold text-right">Left</th>
                      <th className="py-2 font-semibold">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.map((e, i) => {
                      const style = EVENT_STYLE[e.type] || EVENT_STYLE.adjustment;
                      const Icon = style.icon;
                      return (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 align-top">
                          <td className="py-2 pr-3 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(e.at).toLocaleString("en-NG", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2 pr-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-100">
                              <Icon size={14} className={`${style.colour} shrink-0`} />
                              {style.label}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-xs text-gray-600 dark:text-gray-300">{e.by}</td>
                          <td className={`py-2 pr-3 text-right font-bold whitespace-nowrap ${e.change < 0 ? "text-red-600" : "text-green-600"}`}>
                            {e.change > 0 ? "+" : ""}{e.change}
                          </td>
                          <td className="py-2 pr-3 text-right text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {e.balanceAfter} {unit}{e.balanceAfter === 1 ? "" : "s"}
                          </td>
                          <td className="py-2 text-xs text-gray-500">
                            {e.detail}
                            {e.reference ? <span className="block text-gray-400 font-mono">{e.reference}</span> : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 sm:hidden">
                {data.events.map((e, i) => {
                  const style = EVENT_STYLE[e.type] || EVENT_STYLE.adjustment;
                  const Icon = style.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 border border-gray-100 dark:border-gray-700 rounded-xl p-3">
                      <Icon size={18} className={`${style.colour} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {style.label}
                            <span className={`ml-2 font-bold ${e.change < 0 ? "text-red-600" : "text-green-600"}`}>
                              {e.change > 0 ? "+" : ""}{e.change}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 shrink-0">
                            {new Date(e.at).toLocaleString("en-NG", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{e.detail}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          by {e.by}
                          {e.reference ? ` · ${e.reference}` : ""}
                          {" · "}left {e.balanceAfter} {unit}{e.balanceAfter === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

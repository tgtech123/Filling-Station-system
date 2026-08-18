"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLubricantStore } from "@/store/lubricantStore";
import { getCurrentUser } from "@/lib/currentUser";

export default function AddLubricantModal({ onclose, defaultBarcode = "" }) {
  const { addLubricant, loading, pricingSettings, fetchPricingSettings } = useLubricantStore();

  /** The station's standing margin for a category, if one is set. */
  const markupForCategory = (category) => {
    const value = pricingSettings?.categoryMarkups?.[category];
    return Number.isFinite(Number(value)) ? String(value) : "";
  };

  /** …and for a unit, matched on the name as it is typed. */
  const markupForUnitName = (name) => {
    const match = (pricingSettings?.unitMarkups || []).find(
      (u) => String(u.name).toLowerCase() === String(name || "").trim().toLowerCase()
    );
    return match ? String(match.sellingPercentage) : "";
  };

  const [formData, setFormData] = useState({
    // Prefilled when the POS opens this after a scan found nothing — retyping a
    // barcode with a customer waiting is how the same item gets registered twice.
    barcode: defaultBarcode,
    productName: "",
    productType: "Lubricant",
    category: "lubricant",
    brand: "",
    qtyInStock: "",
    reOrderLevel: "",
    unitCost: "",
    sellingPrice: "",
    unitPrice: "", // auto-calculated
    // What the stock figure above is counted in. Everything — cost, price,
    // re-order level, the shelf itself — is measured in this.
    baseUnit: "piece",
  });

  /**
   * Bigger ways to sell the same stock: a pack of 12, a carton of 24.
   *
   * Stock stays counted in base units, so 240 pieces is still 240 pieces — a
   * pack sale simply takes 12 of them.
   *
   * Priced the way the single is, one level up: the unit's cost is the piece
   * cost × how many it holds, and its own markup is applied to that. Nobody
   * types a price, so it cannot land below cost and it re-prices itself when the
   * cost changes. A smaller markup on a bigger unit is what makes a pack cheaper
   * per piece — which is the whole reason to buy one.
   */
  const [saleUnits, setSaleUnits] = useState([]);

  const addSaleUnit = () =>
    setSaleUnits((u) => [
      // Starts at the product's own markup: the same margin as singles is the
      // honest default until someone decides on a volume discount.
      ...u,
      { name: "", factor: "", sellingPercentage: formData.sellingPrice || "", barcode: "" },
    ]);

  /** What one of this unit costs and sells for, at the numbers typed so far. */
  const unitMaths = (u) => {
    const factor = Number(u.factor) || 0;
    const cost = Number(formData.unitCost) || 0;
    const pct = Number(u.sellingPercentage);
    if (!factor || !cost || !Number.isFinite(pct)) return null;

    const unitCost = cost * factor;
    const price = unitCost * (1 + pct / 100);
    const perPiece = price / factor;
    const singlePrice = Number(formData.unitPrice) || 0;

    return {
      unitCost,
      price,
      perPiece,
      profit: price - unitCost,
      // Negative means a pack costs the customer MORE per piece than buying
      // singles — legal, occasionally deliberate, usually a mistake.
      savingPerPiece: singlePrice ? singlePrice - perPiece : 0,
    };
  };

  const updateSaleUnit = (index, field, value) =>
    setSaleUnits((u) =>
      u.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [field]: value };

        // Naming a unit "Carton" brings the station's carton margin with it —
        // the same courtesy the category gets. Never overwrites a percentage
        // that has been edited away from the previous name's default.
        if (field === "name") {
          const previousDefault = markupForUnitName(row.name);
          const nextDefault = markupForUnitName(value);
          if (nextDefault && (!row.sellingPercentage || row.sellingPercentage === previousDefault)) {
            next.sellingPercentage = nextDefault;
          }
        }
        return next;
      })
    );

  const removeSaleUnit = (index) =>
    setSaleUnits((u) => u.filter((_, i) => i !== index));

  const [message, setMessage] = useState({ type: "", text: "" });

  /**
   * A cashier says WHAT the item is; a manager says what it is worth.
   *
   * Every money field is hidden from them rather than merely ignored on the
   * server — showing a cost box that is silently discarded would be a lie about
   * what the form does, and they would fill it in.
   */
  const [role, setRole] = useState(null);
  useEffect(() => setRole(getCurrentUser()?.role || null), []);
  const canPrice = role !== "cashier";

  useEffect(() => {
    if (!pricingSettings) fetchPricingSettings();
  }, []);

  // The form opens on a category before the settings have arrived, so fill that
  // first percentage in when they do — otherwise the standing margin would only
  // ever reach someone who changes category.
  useEffect(() => {
    if (!pricingSettings) return;
    setFormData((prev) =>
      prev.sellingPrice
        ? prev
        : { ...prev, sellingPrice: markupForCategory(prev.category) || prev.sellingPrice }
    );
  }, [pricingSettings]);

  // 🔥 Auto-calc unitPrice whenever unitCost or sellingPrice changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      /**
       * Choosing a category brings the station's margin for it with it.
       *
       * The percentage stays editable — this product may be the exception — but
       * the default is the policy already agreed, so nobody has to remember that
       * snacks are 15%. Only fills a BLANK box or one still holding the previous
       * category's default: a figure typed by hand is a decision, and switching
       * category must not quietly discard it.
       */
      if (name === "category") {
        const previousDefault = markupForCategory(prev.category);
        const nextDefault = markupForCategory(value);
        if (nextDefault && (!prev.sellingPrice || prev.sellingPrice === previousDefault)) {
          updated.sellingPrice = nextDefault;
        }
      }

      const unitCostNum = parseFloat(updated.unitCost);
      const percentageNum = parseFloat(updated.sellingPrice);

      if (!isNaN(unitCostNum) && !isNaN(percentageNum) && percentageNum >= 1 && percentageNum <= 100) {
        updated.unitPrice = (unitCostNum + (unitCostNum * percentageNum) / 100).toFixed(2);
      } else {
        updated.unitPrice = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      // Blank rows are a half-typed unit, not a unit — drop them rather than
      // let the server refuse the whole product over one empty line.
      const units = saleUnits
        .filter((u) => String(u.name).trim() && Number(u.factor) > 1)
        .map((u) => ({
          name: String(u.name).trim(),
          factor: Number(u.factor),
          // The percentage is the input; the server computes the price from it
          // and from the cost, so the two can never disagree.
          sellingPercentage: Number(u.sellingPercentage || 0),
          barcode: String(u.barcode || "").trim() || undefined,
        }));

      const res = await addLubricant({ ...formData, saleUnits: units });

      setMessage({
        type: "success",
        text: res?.message || "Lubricant added successfully!",
      });

      // Clear form
      setFormData({
        barcode: "",
        productName: "",
        productType: "Lubricant",
    category: "lubricant",
        brand: "",
        qtyInStock: "",
        reOrderLevel: "",
        unitCost: "",
        sellingPrice: "",
        unitPrice: "",
        baseUnit: "piece",
      });
      setSaleUnits([]);

      setTimeout(() => {
        onclose();
      }, 1500);
    } catch (err) {
      // The store throws a plain Error, so the axios-shaped `err.response.data`
      // read here never existed — every failure showed the generic fallback and
      // the reason was lost. `err.message` is where the server's words are.
      setMessage({
        type: "error",
        text:
          err?.message ||
          err?.response?.data?.error ||
          "Failed to add lubricant. Please try again.",
      });
    }
  };

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px] lg:max-w-[500px] p-3 lg:p-6 max-h-[80vh] overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          {/* Neutral wording: this form now stocks drinks and snacks as well as
              oil, and a cashier adding Coca-Cola should not be told they are
              adding a lubricant. */}
          <h4 className="font-semibold text-lg">
            {formData.category === "lubricant" ? "Add Lubricant" : "Add Store Item"}
          </h4>
          <p>
            {formData.category === "lubricant"
              ? "Add new lubricant to stock"
              : "Add a drink, snack or other shop item to stock"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
          {/* Feedback */}
          {message.text && (
            <p
              className={`text-sm font-medium mb-2 ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Barcode (optional)</p>
              <input
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="code"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">Product name *</p>
              <input
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="e.g Mobil 20w50"
                required
              />
            </div>
          </div>

          {/* Category drives which revenue and cost accounts the sale posts to.
              Without it a crate of Coca-Cola is reported as lubricant revenue,
              and the owner cannot tell whether the shop or the oil rack is
              making the money. */}
          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Category *</p>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 p-2 rounded-[8px] bg-white"
              >
                <option value="lubricant">Lubricant (oils, greases)</option>
                <option value="drinks">Store — Drinks</option>
                <option value="snacks">Store — Snacks</option>
                <option value="other">Store — Other</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Store items are reported separately from lubricants in your accounts.
                {markupForCategory(formData.category) && (
                  <> Your standing margin for this category is {markupForCategory(formData.category)}%.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Brand *</p>
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="e.g Mobil"
                required
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">Qty in Stock</p>
              <input
                name="qtyInStock"
                value={formData.qtyInStock}
                onChange={handleChange}
                type="number"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Counted in {formData.baseUnit || "piece"}s — the smallest thing you sell.
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Counted in</p>
              <input
                name="baseUnit"
                value={formData.baseUnit}
                onChange={handleChange}
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="piece, bottle, sachet…"
              />
              <p className="text-xs text-gray-400 mt-1">
                Stock, cost and price are all per one of these.
              </p>
            </div>
          </div>

          {/* Everything below is money, so a cashier does not see it — the
              product goes in unpriced and a manager prices it. Hidden rather
              than ignored server-side: a box that is silently discarded is a lie
              about what the form does, and they would fill it in. */}
          {!canPrice && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-[8px] p-3 mt-1">
              <p className="text-sm font-semibold text-amber-800">Pricing is set by your manager</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Save this and your manager is alerted to price it. It can be sold as soon as they do.
              </p>
            </div>
          )}

          {canPrice && (
          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Re-order Level</p>
              <input
                name="reOrderLevel"
                value={formData.reOrderLevel}
                onChange={handleChange}
                type="number"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 20"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">Unit Cost *</p>
              <input
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
                type="number"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 2500"
                required
              />
            </div>
          </div>
          )}

          {canPrice && (
          <div className="flex gap-2 flex-col lg:flex-row w-full">
            <div className="flex-1">
              <p className="text-sm font-semibold">Selling Percentage (1–100%) *</p>
              <input
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                type="number"
                min="1"
                max="100"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="e.g 20 for 20%"
                required
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">Unit Price (Auto)</p>
              <input
                name="unitPrice"
                value={formData.unitPrice}
                readOnly
                className="w-full border-2 border-gray-300 p-2 rounded-[8px] bg-gray-100 cursor-not-allowed"
                placeholder="Auto calculated"
              />
            </div>
          </div>
          )}

          {/* ── Bigger selling units ─────────────────────────────────────── */}
          {canPrice && (
          <div className="border-2 border-gray-200 rounded-[8px] p-3 mt-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Also sold in packs?</p>
                <p className="text-xs text-gray-400">
                  A pack of 12, a carton of 24, a bag. Stock stays in{" "}
                  {formData.baseUnit || "piece"}s — selling one pack of 12 takes 12 off the shelf.
                  Set the profit you want on each unit and the price is worked out from the cost.
                </p>
              </div>
              <button
                type="button"
                onClick={addSaleUnit}
                className="shrink-0 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50"
              >
                + Add unit
              </button>
            </div>

            {saleUnits.length > 0 && (
              <div className="mt-3 space-y-3">
                {saleUnits.map((u, i) => (
                  <div key={i} className="border border-gray-200 rounded-[8px] p-2.5 bg-gray-50">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600">Unit name</p>
                        <input
                          value={u.name}
                          onChange={(e) => updateSaleUnit(i, "name", e.target.value)}
                          className="w-full border-2 border-gray-300 p-1.5 rounded-[6px] text-sm"
                          placeholder="Pack, Carton, Dozen…"
                        />
                      </div>
                      <div className="w-24">
                        <p className="text-xs font-semibold text-gray-600">
                          {formData.baseUnit || "piece"}s in it
                        </p>
                        <input
                          value={u.factor}
                          onChange={(e) => updateSaleUnit(i, "factor", e.target.value)}
                          type="number"
                          min="2"
                          className="w-full border-2 border-gray-300 p-1.5 rounded-[6px] text-sm"
                          placeholder="12"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600">Profit on this unit (%)</p>
                        <input
                          value={u.sellingPercentage}
                          onChange={(e) => updateSaleUnit(i, "sellingPercentage", e.target.value)}
                          type="number"
                          min="0"
                          max="100"
                          className="w-full border-2 border-gray-300 p-1.5 rounded-[6px] text-sm"
                          placeholder="e.g 15"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600">Its own barcode (optional)</p>
                        <input
                          value={u.barcode}
                          onChange={(e) => updateSaleUnit(i, "barcode", e.target.value)}
                          className="w-full border-2 border-gray-300 p-1.5 rounded-[6px] text-sm"
                          placeholder="scan the carton"
                        />
                      </div>
                    </div>

                    {/* The whole calculation, shown as it is typed. A price is
                        never entered here, so this is the only way to see what
                        the markup actually produces — and to catch a percentage
                        that makes the pack dearer per piece than singles. */}
                    {(() => {
                      const m = unitMaths(u);
                      if (!m) return null;
                      return (
                        <div className="mt-2 bg-white border border-gray-200 rounded-[6px] p-2">
                          <p className="text-xs text-gray-500">
                            Cost {u.factor} × ₦{Number(formData.unitCost).toLocaleString()} ={" "}
                            <span className="font-semibold">₦{m.unitCost.toLocaleString()}</span>
                            {" "}+ {u.sellingPercentage}% profit
                          </p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">
                            Sells for ₦{m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            <span className="text-xs font-normal text-gray-500">
                              {" "}(₦{m.perPiece.toLocaleString(undefined, { maximumFractionDigits: 2 })} per{" "}
                              {formData.baseUnit || "piece"}, ₦{m.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })} profit)
                            </span>
                          </p>
                          {m.savingPerPiece > 0 ? (
                            <p className="text-xs text-green-600 mt-0.5">
                              Customer saves ₦{m.savingPerPiece.toLocaleString(undefined, { maximumFractionDigits: 2 })} per{" "}
                              {formData.baseUnit || "piece"} versus buying singly.
                            </p>
                          ) : m.savingPerPiece < 0 ? (
                            <p className="text-xs text-amber-600 mt-0.5">
                              This works out ₦{Math.abs(m.savingPerPiece).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                              per {formData.baseUnit || "piece"} DEARER than singles — lower the percentage if that is not intended.
                            </p>
                          ) : null}
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => removeSaleUnit(i)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 text-sm flex justify-center p-3 cursor-pointer bg-[#0080ff] hover:bg-blue-400 text-white font-semibold rounded-md ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Adding..." : "Add Lubricant"}
          </button>
        </form>
      </div>
    </div>
  );
}

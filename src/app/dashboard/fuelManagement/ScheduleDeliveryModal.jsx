"use client";
import { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useTankStore } from "@/store/tankStore";
import NumericInput from "@/components/inputs/NumericInput";

/**
 * Schedule a product delivery. One purchase (single price + supplier) can be
 * split across SEVERAL tanks — e.g. a 30,000L PMS load filling three PMS tanks.
 * Each tank line is sent in `allocations`; the server ties them under one
 * purchase reference so the supplier's single invoice 3-way matches the lot.
 */
export default function ScheduleDeliveryModal({ onclose }) {
  const [product, setProduct] = useState(""); // fuelType, e.g. "PMS"
  const [rows, setRows] = useState([{ tank: "", quantity: "" }]);
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const { tanks, fetchTanks, loading: tankLoading } = useTankStore();
  const API_URL = process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  // Distinct products (fuel types) available across the station's tanks
  const products = useMemo(
    () => Array.from(new Set(tanks.map((t) => t.fuelType).filter(Boolean))),
    [tanks]
  );

  // Tanks that hold the chosen product — these are what a purchase can be split across
  const productTanks = useMemo(
    () => tanks.filter((t) => t.fuelType === product),
    [tanks, product]
  );

  // Reset allocation rows when the product changes
  useEffect(() => {
    setRows([{ tank: "", quantity: "" }]);
  }, [product]);

  const totalQty = rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const usedTankIds = rows.map((r) => r.tank).filter(Boolean);

  // Free space a tank can still accept = its limit minus what's already in it.
  const tankFree = (t) => Math.max(0, Number(t.limit || 0) - Number(t.currentQuantity || 0));
  const totalFree = productTanks.reduce((s, t) => s + tankFree(t), 0);

  // Per-row over-allocation: entered litres exceed that tank's free space
  const overRows = rows.map((r) => {
    if (!r.tank || !r.quantity) return false;
    const t = productTanks.find((x) => x._id === r.tank);
    return t ? Number(r.quantity) > tankFree(t) : false;
  });
  const hasOver = overRows.some(Boolean);

  const updateRow = (i, key, val) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const addRow = () => setRows((rs) => [...rs, { tank: "", quantity: "" }]);
  const removeRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const allocations = rows
      .filter((r) => r.tank && Number(r.quantity) > 0)
      .map((r) => ({ tank: r.tank, quantity: Number(r.quantity) }));

    if (!product) return fail("Select a product");
    if (allocations.length === 0) return fail("Add at least one tank with a quantity");
    if (new Set(allocations.map((a) => a.tank)).size !== allocations.length)
      return fail("Each tank can only be used once");
    if (hasOver) return fail("One or more tanks are over their free space. Reduce those amounts or add more tanks.");
    if (!price || !supplier || !deliveryDate) return fail("Fill price, supplier and delivery date");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return fail("Authorization token missing!");

      const response = await fetch(`${API_URL}/api/delivery/add-supply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          allocations,
          pricePerLtr: price,
          supplier,
          deliveryDate,
          status: "Pending",
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Delivery scheduled successfully!");
        setMessageType("success");
        setTimeout(() => onclose(), 1500);
      } else {
        fail(data.error || data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error scheduling delivery:", error);
      fail("Network error, please try again!");
    } finally {
      setLoading(false);
    }
  };

  const fail = (msg) => {
    setMessage(msg);
    setMessageType("error");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 lg:px-0">
      <div className="bg-white border-2 rounded-lg w-full max-w-[440px] p-4 max-h-[92vh] overflow-y-auto">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-lg">Schedule Product Delivery</h4>
            <p className="text-sm text-gray-500">One purchase can fill several tanks of the same product</p>
          </div>
          <X className="cursor-pointer shrink-0" onClick={onclose} />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {/* Product */}
          <div>
            <p className="text-sm font-semibold">Product</p>
            <select
              className="w-full border-2 p-2 rounded-[8px] border-gray-300 bg-white"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              disabled={tankLoading}
            >
              <option value="">{tankLoading ? "Loading…" : "Select product"}</option>
              {products.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Tank allocations */}
          {product && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">Fill Tanks</p>
                <span className="text-xs text-gray-500">
                  Allocated {totalQty.toLocaleString()} L · {totalFree.toLocaleString()} L free across {productTanks.length} tank{productTanks.length === 1 ? "" : "s"}
                </span>
              </div>

              {productTanks.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No {product} tanks found. Add one in Product Management first.
                </p>
              ) : (
                <div className="space-y-2">
                  {rows.map((row, i) => {
                    const tankOptions = productTanks.filter(
                      (t) => t._id === row.tank || !usedTankIds.includes(t._id)
                    );
                    const selected = productTanks.find((t) => t._id === row.tank);
                    const free = selected ? tankFree(selected) : null;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex gap-2 items-start">
                          <select
                            className="flex-1 border-2 border-gray-300 p-2 rounded-[8px] text-sm bg-white min-w-0"
                            value={row.tank}
                            onChange={(e) => updateRow(i, "tank", e.target.value)}
                          >
                            <option value="">Select tank</option>
                            {tankOptions.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.title || "Tank"} — {tankFree(t).toLocaleString()} L free ({(t.currentQuantity || 0).toLocaleString()}/{(t.limit || 0).toLocaleString()})
                              </option>
                            ))}
                          </select>
                          <NumericInput
                            variant="numeric"
                            className={`w-28 border-2 p-2 rounded-[8px] text-sm ${overRows[i] ? "border-red-400" : "border-gray-300"}`}
                            placeholder="Litres"
                            value={row.quantity}
                            onChange={(e) => updateRow(i, "quantity", e.target.value)}
                          />
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(i)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                              title="Remove tank"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        {overRows[i] ? (
                          <p className="text-xs text-red-500">
                            Exceeds free space — this tank can only take {free.toLocaleString()} L more. Put the rest in another tank.
                          </p>
                        ) : (
                          selected && (
                            <button
                              type="button"
                              onClick={() => updateRow(i, "quantity", String(free))}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Fill to capacity ({free.toLocaleString()} L)
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}

                  {rows.length < productTanks.length && (
                    <button
                      type="button"
                      onClick={addRow}
                      className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <Plus size={14} /> Add another tank
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price per litre */}
          <div>
            <p className="text-sm font-semibold">Price / litre (₦)</p>
            <NumericInput
              variant="decimal"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Supplier */}
          <div>
            <p className="text-sm font-semibold">Supplier</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Supplier name"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
            />
          </div>

          {/* Delivery date */}
          <div>
            <p className="text-sm font-semibold">Delivery Date</p>
            <input
              type="date"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className={`text-sm text-center ${messageType === "error" ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || hasOver}
            className="flex justify-center p-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : hasOver ? "Fix over-capacity tanks" : totalQty > 0 ? `Schedule Delivery (${totalQty.toLocaleString()} L)` : "Schedule Delivery"}
          </button>
        </form>
      </div>
    </div>
  );
}

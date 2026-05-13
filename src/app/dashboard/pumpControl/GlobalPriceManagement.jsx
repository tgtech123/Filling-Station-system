"use client";
import { useEffect, useState } from "react";
import usePumpStore from "@/store/pumpStore";

export default function GlobalPriceManagement() {
  const { pumps, getPumps, updatePriceByFuel } = usePumpStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  const [prices, setPrices] = useState({
    PMS: "",
    Diesel: "",
    Kerosene: "",
    Gas: "",
  });

  useEffect(() => {
    getPumps();
  }, [getPumps]);

  // Auto-fill from existing pump data
  useEffect(() => {
    if (pumps.length > 0) {
      const map = {};
      pumps.forEach((pump) => {
        if (pump.fuelType && pump.pricePerLtr) map[pump.fuelType] = pump.pricePerLtr;
      });
      setPrices((prev) => ({ ...prev, ...map }));
    }
  }, [pumps]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrices((prev) => ({ ...prev, [name]: value }));
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateAll = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);
    try {
      await updatePriceByFuel(prices);
      await getPumps();
      showMessage({ type: "success", text: "Prices updated successfully!" });
    } catch (err) {
      showMessage({ type: "error", text: err?.message || "Failed to update prices. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-[10px] border border-gray-300 p-4">
      <h3 className="text-2xl font-semibold">Global Price Management</h3>
      <p className="text-sm text-gray-500 mt-0.5">Update fuel prices across multiple pumps</p>

      {message && (
        <div
          className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium border ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form className="mt-6" onSubmit={handleUpdateAll}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {["PMS", "Diesel", "Kerosene", "Gas"].map((fuel) => (
            <div key={fuel}>
              <p className="font-semibold text-sm mb-1">{fuel}</p>
              <input
                type="text"
                name={fuel}
                value={prices[fuel] || ""}
                onChange={handleChange}
                className="border-2 border-gray-400 focus:border-[#0080ff] focus:outline-none p-2 rounded-[8px] w-full text-sm"
                placeholder={`Enter ${fuel} price`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            disabled={isUpdating}
            type="submit"
            className="cursor-pointer font-semibold hover:bg-[#0a71d8] bg-[#0080ff] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-3 px-4 rounded-[8px] transition-colors"
          >
            {isUpdating ? "Updating..." : "Update All Prices"}
          </button>
        </div>
      </form>
    </div>
  );
}

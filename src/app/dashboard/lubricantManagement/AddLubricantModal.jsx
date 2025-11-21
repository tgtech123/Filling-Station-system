

import { useState } from "react";
import { X } from "lucide-react";
import { useLubricantStore } from "@/store/lubricantStore";

export default function AddLubricantModal({ onclose }) {
  const { addLubricant, loading } = useLubricantStore();

  const [formData, setFormData] = useState({
    barcode: "",
    productName: "",
    productType: "Lubricant",
    brand: "",
    qtyInStock: "",
    reOrderLevel: "",
    unitCost: "",
    sellingPrice: "",
    unitPrice: "", // auto-calculated
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔥 Auto-calc unitPrice whenever unitCost or sellingPrice changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

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
      const res = await addLubricant(formData);

      setMessage({
        type: "success",
        text: res?.message || "Lubricant added successfully!",
      });

      // Clear form
      setFormData({
        barcode: "",
        productName: "",
        productType: "Lubricant",
        brand: "",
        qtyInStock: "",
        reOrderLevel: "",
        unitCost: "",
        sellingPrice: "",
        unitPrice: "",
      });

      setTimeout(() => {
        onclose();
      }, 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Failed to add lubricant. Please try again.",
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
          <h4 className="font-semibold text-lg">Add Lubricant</h4>
          <p>Add new lubricant to stock</p>
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
            </div>
          </div>

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

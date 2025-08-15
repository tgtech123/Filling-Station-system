// components/FilterModal.jsx
'use client';
import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

const FilterModal = ({ isOpen, onClose, products, paymentTypes, onApply }) => {
  const [selectedProducts, setSelectedProducts] = useState(["All"]);
  const [selectedPayments, setSelectedPayments] = useState(["All"]);

  if (!isOpen) return null;

  // ✅ Toggle product selection
  const handleProductChange = (item) => {
    if (item === "All") {
      setSelectedProducts(["All"]);
    } else {
      const updated = selectedProducts.includes(item)
        ? selectedProducts.filter((p) => p !== item)
        : [...selectedProducts.filter((p) => p !== "All"), item];
      setSelectedProducts(updated);
    }
  };

  // ✅ Toggle payment selection
  const handlePaymentChange = (item) => {
    if (item === "All") {
      setSelectedPayments(["All"]);
    } else {
      const updated = selectedPayments.includes(item)
        ? selectedPayments.filter((p) => p !== item)
        : [...selectedPayments.filter((p) => p !== "All"), item];
      setSelectedPayments(updated);
    }
  };

  // ✅ Apply filter
  const applyFilter = () => {
    onApply({ products: selectedProducts, payments: selectedPayments });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:bg-neutral-100 p-1 rounded-full"
        >
          <IoCloseOutline size={24} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">Customize Filter</h2>
        <hr className="mb-4" />

        {/* Filter Content */}
        <div className="grid grid-cols-2 gap-6">
          {/* Products */}
          <div>
            <h3 className="font-semibold mb-2">Products</h3>
            {["All", ...products].map((item) => (
              <label key={item} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(item)}
                  onChange={() => handleProductChange(item)}
                  className="accent-blue-500"
                />
                {item}
              </label>
            ))}
          </div>

          {/* Payment Types */}
          <div>
            <h3 className="font-semibold mb-2">Payment type</h3>
            {["All", ...paymentTypes].map((item) => (
              <label key={item} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedPayments.includes(item)}
                  onChange={() => handlePaymentChange(item)}
                  className="accent-blue-500"
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilter}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default FilterModal;

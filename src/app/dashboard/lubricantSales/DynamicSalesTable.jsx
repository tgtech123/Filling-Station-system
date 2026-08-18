"use client";
import React, { useState } from "react";
import { LuPlus } from "react-icons/lu";

// Modal Component
const MixedPaymentModal = ({ totalAmount, onClose, onConfirm }) => {
  const [cash, setCash] = useState(0);
  const [transfer, setTransfer] = useState(0);
  const [pos, setPos] = useState(0);

  const handleConfirm = () => {
    const sum = Number(cash) + Number(transfer) + Number(pos);

    if (sum !== totalAmount) {
      alert(`Breakdown must equal ₦${totalAmount.toLocaleString()}`);
      return;
    }

    onConfirm({
      cash: Number(cash),
      transfer: Number(transfer),
      POS: Number(pos),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-[400px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Mixed Payment Breakdown</h2>

        <div className="flex flex-col gap-3">
          {/* CASH */}
          <div>
            <label className="font-semibold">Cash</label>
            <input
              type="number"
              className="w-full border mt-1 py-2 px-3 rounded-lg"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
            />
          </div>

          {/* TRANSFER */}
          <div>
            <label className="font-semibold">Transfer</label>
            <input
              type="number"
              className="w-full border mt-1 py-2 px-3 rounded-lg"
              value={transfer}
              onChange={(e) => setTransfer(e.target.value)}
            />
          </div>

          {/* POS */}
          <div>
            <label className="font-semibold">POS</label>
            <input
              type="number"
              className="w-full border mt-1 py-2 px-3 rounded-lg"
              value={pos}
              onChange={(e) => setPos(e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const DynamicSalesTable = ({
  totalAmount,
  paymentMethod,
  setPaymentMethod,
  onSubmit,
  onCancel,
  copies,
  setCopies,
  loading = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);

  const handleSubmit = ({ print }) => {
    if (paymentMethod === "mixed") {
      if (!paymentBreakdown) {
        alert("Please enter mixed payment breakdown");
        return;
      }

      onSubmit({
        paymentMethod: "mixed",
        paymentBreakdown,
        print,
      });
    } else {
      onSubmit({
        paymentMethod,
        print,
      });
    }
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);

    if (value === "mixed") {
      setShowModal(true);
    } else {
      setPaymentBreakdown(null);
    }
  };

  return (
    <>
      {/* Main UI */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <form className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Total Amount */}
            <div className="flex flex-col w-full sm:max-w-xs">
              <label className="font-bold mb-1 text-sm">Total Amount</label>
              <input
                type="number"
                disabled
                value={totalAmount || ""}
                className="bg-neutral-200 dark:bg-gray-700 dark:text-gray-200 w-full py-2 px-3 rounded-lg outline-none"
                placeholder="₦0.00"
              />
            </div>

            {/* Payment Method */}
            <div className="flex flex-col w-full sm:max-w-xs">
              <label className="font-bold mb-1 text-sm">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="w-full py-2 pl-3 rounded-lg border border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 outline-none"
              >
                <option value="POS">POS</option>
                <option value="transfer">Transfer</option>
                <option value="cash">Cash</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            {/* Receipt Copies */}
            <div className="flex flex-col w-full sm:max-w-[8rem]">
              <label className="font-bold mb-1 text-sm">Copies</label>
              <select
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
                className="w-full py-2 pl-3 rounded-lg border border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 outline-none"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </form>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => handleSubmit({ print: true })}
              disabled={loading}
              className={`text-white flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold w-full sm:w-auto transition-colors ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-[#0080FF] hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  Recording...
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <>
                  Record and Print <LuPlus size={20} />
                </>
              )}
            </button>

            <button
              onClick={() => handleSubmit({ print: false })}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold w-full sm:w-auto border-2 transition-colors ${
                loading
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-[#0080FF] text-[#0080FF] hover:bg-blue-50 dark:hover:bg-blue-900/20"
              }`}
            >
              Save
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white w-full sm:w-auto transition-colors ${
                loading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <MixedPaymentModal
          totalAmount={totalAmount}
          onClose={() => setShowModal(false)}
          onConfirm={(data) => {
            setPaymentBreakdown(data);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default DynamicSalesTable;

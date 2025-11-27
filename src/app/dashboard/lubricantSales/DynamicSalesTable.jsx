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
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] sm:w-[400px] shadow-lg">
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
}) => {
  const [showModal, setShowModal] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);

  const handleSubmit = () => {
    if (paymentMethod === "mixed") {
      if (!paymentBreakdown) {
        alert("Please enter mixed payment breakdown");
        return;
      }

      onSubmit({
        paymentMethod: "mixed",
        paymentBreakdown,
      });
    } else {
      onSubmit({
        paymentMethod,
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
      <div className="mt-20 w-full px-4 sm:px-6 md:px-0">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
          <form className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
            {/* Total Amount */}
            <div className="flex flex-col w-full md:max-w-md">
              <label className="font-bold mb-1">Total Amount</label>
              <input
                type="number"
                disabled
                value={totalAmount || ""}
                className="bg-neutral-200 w-full py-2 px-3 rounded-lg outline-none"
                placeholder="₦0.00"
              />
            </div>

            {/* Payment Method */}
            <div className="flex flex-col w-full md:max-w-md">
              <label className="font-bold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="w-full py-2 pl-3 rounded-lg border border-neutral-300 outline-none"
              >
                <option value="POS">POS</option>
                <option value="transfer">Transfer</option>
                <option value="cash">Cash</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </form>

          {/* Record Button */}
          <div className="mt-2 md:mt-0">
            <button
              onClick={handleSubmit}
              className="bg-[#0080FF] hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2 rounded-lg font-semibold"
            >
              Record <LuPlus size={20} />
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

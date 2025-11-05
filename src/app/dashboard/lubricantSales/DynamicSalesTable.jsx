
"use client";
import React from "react";
import { LuPlus } from "react-icons/lu";

const DynamicSalesTable = ({ totalAmount, paymentMethod, setPaymentMethod, onSubmit }) => {
  return (
    <div className="mt-20 w-full px-4 sm:px-6 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
        <form className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
          {/* Total Amount */}
          <div className="flex flex-col w-full md:max-w-md">
            <label className="font-bold mb-1">Total Amount</label>
            <input
              type="number"
              inputMode="numeric"
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
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full py-2 pl-3 rounded-lg border border-neutral-300 outline-none"
            >
              <option value="POS">POS</option>
              <option value="Transfer">Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </form>

        {/* Record Button */}
        <div className="mt-2 md:mt-0">
          <button
            onClick={onSubmit}
            className="bg-[#0080FF] hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2 rounded-lg font-semibold w-full md:w-auto justify-center"
          >
            Record <LuPlus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicSalesTable;

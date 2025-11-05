'use client';
import React, { useEffect } from 'react';
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { BsPrinter } from "react-icons/bs";
import Image from 'next/image';

const ReceiptModal = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen) return null;

  const {
    cashier = "Unknown",
    station = "Default Station",
    address = "",
    date = new Date().toLocaleString(),
    transactionId = "N/A",
    paymentType = "N/A",
    items = [],
    total = 0,
  } = receiptData || {};

  console.log("receipt data is: ", receiptData)
  // ✅ Auto close after 4 seconds
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     onClose();
  //   }, 4000);
  //   return () => clearTimeout(timer);
  // }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-[460px] max-w-md md:max-w-lg lg:max-w-xl z-50">

        {/* ✅ Checkmark Icon */}
        <div className="absolute flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 place-self-center -top-8 text-white bg-green-700 rounded-full shadow-lg">
          <IoMdCheckmark size={36} className="sm:size-[50px]" />
        </div>

        {/* ✅ Header / Logo */}
        <div className="text-center mt-6">
          <Image
            src="/station-logo.png"
            alt="logo"
            width={200}
            height={150}
            className="object-contain mx-auto"
          />
          <p className="text-xl sm:text-2xl font-bold mb-4">Lubricant Sales Receipt</p>
        </div>

        {/* ✅ Details */}
        <div className="text-xs sm:text-sm text-gray-700 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p>Cashier: {cashier}</p>
            <p>Date: {date}</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p>Transaction ID: {transactionId}</p>
            <p>Payment Type: {paymentType}</p>
          </div>
          {station && <p className="mt-2 text-center">{station}</p>}
          {address && <p className="text-center">{address}</p>}
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-xs sm:text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">S/N</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">Unit Price</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index} className="text-neutral-800">
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2 text-right">₦{item.unitPrice?.toLocaleString()}</td>
                    <td className="border p-2 text-center">{item.quantity}</td>
                    <td className="border p-2 text-right">
                      ₦{(item.unitPrice * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border p-3 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Total */}
        <div className="flex justify-between text-neutral-800 font-bold mb-2">
          <p>TOTAL</p>
          <span className="text-right">
            <p>₦{total?.toLocaleString()}</p>
            <p className="text-xs text-neutral-600">
              {total > 0 ? `${total.toLocaleString()} naira only` : ""}
            </p>
          </span>
        </div>

        {/* ✅ Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-6 sm:px-10 font-semibold py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50"
          >
            <LiaTimesSolid size={18} /> Close
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-6 sm:px-10 font-semibold bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            <BsPrinter size={18} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

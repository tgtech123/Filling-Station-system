'use client';
import React from 'react';
import { IoCloseOutline } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { BsPrinter } from "react-icons/bs";
import Image from 'next/image';

const ReceiptModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-[460px] max-w-md md:max-w-lg lg:max-w-xl z-50">
        
        {/* Close Button */}
        {/* <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-800 hover:text-black"
        >
          <IoCloseOutline size={24} />
        </button> */}

        {/* Checkmark Icon */}
        <div className="absolute flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 place-self-center -top-8 text-white bg-green-700 rounded-full shadow-lg">
          <IoMdCheckmark size={36} className="sm:size-[50px]" />
        </div>

        {/* Title */}
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

        {/* Receipt Details */}
        <div className="text-xs sm:text-sm text-gray-700 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p>Cashier: John Dumelo</p>
            <p>Date: 12/12/2025, 5:24PM</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p>Transaction ID: LUB001</p>
            <p>Payment type: Transfer</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-xs sm:text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">S/N</th>
                <th className="border p-2">PRODUCT</th>
                <th className="border p-2">Unit price</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">AMT</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((item) => (
                <tr key={item} className='text-neutral-800'>
                  <td className="border p-2">{item}</td>
                  <td className="border p-2">Engine Oil (1L)</td>
                  <td className="border p-2">₦1,500</td>
                  <td className="border p-2">28 Unit</td>
                  <td className="border p-2">₦20,000.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-between text-neutral-800 font-bold mb-2">
          <p>TOTAL</p>
            <span>
                <p>₦60,000</p>
                <p className="text-xs text-neutral-800 mb-4">Sixty thousand naira only</p>

            </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col place-self-center sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-6 sm:px-10 font-semibold py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50"
          >
            <LiaTimesSolid size={18} /> Cancel
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-6 sm:px-10 font-semibold bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            <BsPrinter size={18} /> Print receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

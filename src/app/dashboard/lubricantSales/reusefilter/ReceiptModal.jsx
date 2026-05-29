"use client";
import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { LiaTimesSolid } from "react-icons/lia";
import { BsPrinter } from "react-icons/bs";
import { toWords } from "number-to-words";

const QUOTES = [
  "Quality service is not a coincidence — it's a commitment.",
  "Every great journey begins with a single step.",
  "Excellence is not an act, but a habit.",
  "Integrity is doing the right thing, even when no one is watching.",
  "Your loyalty drives us to serve better every day.",
  "Small steps, big progress. Thank you for choosing us.",
  "Great things are built one transaction at a time.",
  "The secret of getting ahead is getting started.",
  "Your trust is our greatest asset.",
  "Powered by purpose, driven by service.",
];

const Divider = ({ dashed }) => (
  <div className={`w-full border-t ${dashed ? "border-dashed border-gray-300" : "border-gray-200"} my-3`} />
);

const ReceiptModal = ({ isOpen, onClose, receiptData }) => {
  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen]
  );

  if (!isOpen) return null;

  const {
    cashier = "Unknown",
    station = "Filling Station",
    address = "",
    logo = null,
    date = new Date().toLocaleString(),
    txnId = "N/A",
    paymentType = "N/A",
    items = [],
    total = 0,
  } = receiptData || {};

  const handlePrint = () => window.print();

  return createPortal(
    <>
      <style>{`
        @page { size: 80mm auto; margin: 2mm 3mm; }
        @media print {
          /* Hide every sibling of the receipt root */
          body > *:not(#receipt-print-root) { display: none !important; }

          /* Root: static so content flows naturally onto thermal roll */
          #receipt-print-root {
            display: block !important;
            position: static !important;
            width: 72mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide overlay + action buttons */
          #receipt-print-root .no-print { display: none !important; }

          /* Card: flat, static, no clipping */
          #receipt-print-root .receipt-card {
            position: static !important;
            width: 72mm !important;
            max-width: 72mm !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }

          /* Inner content padding */
          #receipt-print-root .receipt-inner {
            padding: 2mm 3mm !important;
          }

          /* Nuclear black: every element in the card prints pure black */
          #receipt-print-root .receipt-card,
          #receipt-print-root .receipt-card * {
            color: #000000 !important;
            opacity: 1 !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 7pt !important;
            background-color: transparent !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Give the card an explicit white backing so text renders maximum contrast */
          #receipt-print-root .receipt-card {
            background-color: #ffffff !important;
          }

          /* Station name slightly bigger */
          #receipt-print-root .receipt-station-name {
            font-size: 8.5pt !important;
            font-weight: bold !important;
          }

          /* Total amount: stand-out size */
          #receipt-print-root .receipt-total-amount {
            font-size: 9pt !important;
            font-weight: 900 !important;
          }

          /* Fix item name: no truncation */
          #receipt-print-root .receipt-item-name {
            max-width: none !important;
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: unset !important;
          }

          /* Dividers: solid black */
          #receipt-print-root .receipt-card .border-t {
            border-color: #000 !important;
            border-top-width: 0.5pt !important;
          }

          /* Logo */
          .receipt-logo-wrap {
            width: 12mm !important;
            height: 12mm !important;
          }

          /* Hide decorative gradient bars */
          .receipt-top-bar,
          .receipt-bottom-bar { display: none !important; }
        }
      `}</style>

      <div id="receipt-print-root" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <div className="no-print absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Receipt card */}
        <div className="receipt-card relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 overflow-hidden">

          {/* Top accent bar */}
          <div className="receipt-top-bar h-1.5 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500" />

          <div className="receipt-inner px-6 py-5">

            {/* Station header */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="receipt-logo-wrap w-20 h-20 rounded-full overflow-hidden border-4 border-green-100 shadow-md mb-3 flex items-center justify-center bg-gray-50">
                {logo ? (
                  <img src={logo} alt="Station logo" className="w-full h-full object-contain" />
                ) : (
                  <img src="/station-logo.png" alt="Station logo" className="w-full h-full object-contain" />
                )}
              </div>
              <h2 className="receipt-station-name text-lg font-bold text-gray-900 leading-tight">{station}</h2>
              {address && (
                <p className="text-xs text-gray-500 mt-0.5 max-w-[240px] leading-snug">{address}</p>
              )}
            </div>

            <Divider />

            {/* Receipt title */}
            <div className="text-center mb-3">
              <span className="inline-block bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-green-200">
                Lubricant Sales Receipt
              </span>
            </div>

            {/* Transaction meta */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-600 space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Transaction ID</span>
                <span className="font-semibold text-gray-800">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Date</span>
                <span className="font-semibold text-gray-800">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Cashier</span>
                <span className="font-semibold text-gray-800">{cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Payment</span>
                <span className="font-semibold text-gray-800">{paymentType}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs mb-1">
                <thead>
                  <tr className="text-gray-400 uppercase tracking-wide border-b border-dashed border-gray-200">
                    <th className="text-left pb-2 font-semibold">Item</th>
                    <th className="text-center pb-2 font-semibold">Qty</th>
                    <th className="text-right pb-2 font-semibold">Unit (₦)</th>
                    <th className="text-right pb-2 font-semibold">Amt (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-100">
                  {items.length > 0 ? (
                    items.map((item, i) => (
                      <tr key={i} className="text-gray-700">
                        <td className="receipt-item-name py-2 font-medium max-w-[110px] truncate">{item.name}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{Number(item.unitPrice).toLocaleString()}</td>
                        <td className="py-2 text-right font-semibold">
                          {(Number(item.unitPrice) * Number(item.quantity)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Divider dashed />

            {/* Total */}
            <div className="flex items-end justify-between mb-1">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Total</span>
              <div className="text-right">
                <p className="receipt-total-amount text-xl font-extrabold text-gray-900">
                  ₦{Number(total).toLocaleString()}
                </p>
                {total > 0 && (
                  <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                    {toWords(total)} naira only
                  </p>
                )}
              </div>
            </div>

            <Divider />

            {/* Quote */}
            <div className="text-center px-2 mb-4">
              <p className="text-[11px] italic text-gray-400 leading-relaxed">"{quote}"</p>
              <p className="text-[10px] text-gray-300 mt-2 font-medium tracking-wide uppercase">
                Thank you for your business
              </p>
            </div>

            {/* Bottom accent bar */}
            <div className="receipt-bottom-bar h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 rounded-full mb-4" />

            {/* Action buttons */}
            <div className="no-print flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-red-400 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
              >
                <LiaTimesSolid size={16} /> Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                <BsPrinter size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ReceiptModal;

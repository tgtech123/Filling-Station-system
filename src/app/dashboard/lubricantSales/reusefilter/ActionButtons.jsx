"use client";
import React, { useState } from "react";
import { Eye, Printer } from "lucide-react";
import ReceiptModal from "./ReceiptModal";

const API_URL = process.env.NEXT_PUBLIC_API;

const ActionButtons = ({ transactionId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTransactionDetails = async () => {
    if (!transactionId) {
      console.error("Missing transaction ID");
      alert("Invalid transaction ID");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/lubricant/transactions/${transactionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (res.ok && result.data) {
        const txn = result.data;

        const formatted = {
          _id: txn._id,
          txnId: txn.txnId || "N/A",
          cashier: txn.staff
            ? `${txn.staff.firstName || ""} ${txn.staff.lastName || ""}`.trim()
            : "N/A",
          station: txn.fillingStationName || "Your Station Name",
          address: txn.fillingStationAddress || "Station Address",
          date: new Date(txn.createdAt).toLocaleString(),
          paymentType: txn.paymentMethod || "N/A",
          items: txn.items.map((item, index) => ({
            sn: index + 1,
            name: item.productName,
            unitPrice: item.priceSold,
            quantity: item.qtySold,
            amount: item.amount,
          })),
          total: txn.totalAmount || 0,
        };

        setReceiptData(formatted);
        setIsModalOpen(true);
      } else {
        console.error(result.error || "Failed to load transaction");
        alert(result.error || "Failed to load receipt");
      }
    } catch (err) {
      console.error("Error fetching transaction:", err);
      alert("Error loading receipt");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    await fetchTransactionDetails();
    setTimeout(() => window.print(), 500);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={fetchTransactionDetails}
          disabled={loading}
          className="text-gray-600 border-[1.5px] cursor-pointer py-1.5 px-2 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          title="View Receipt"
        >
          <Eye size={22} />
        </button>

        <button
          onClick={handlePrint}
          disabled={loading}
          className="border-[1.5px] cursor-pointer py-1.5 px-2 rounded-xl text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          title="Print Receipt"
        >
          <Printer size={22} />
        </button>
      </div>

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receiptData={receiptData}
      />
    </>
  );
};

export default ActionButtons;

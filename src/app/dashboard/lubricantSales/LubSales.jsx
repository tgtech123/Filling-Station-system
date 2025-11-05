"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import DynamicSalesTable from "./DynamicSalesTable";
import ReceiptModal from "./reusefilter/ReceiptModal";

const API_URL = process.env.NEXT_PUBLIC_API;

const LubSales = () => {
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("POS");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [lubricantId, setLubricantId] = useState(null);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 4000);

      // cleanup in case component unmounts early
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchLubricant = async (code) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/lubricant/get-lubricant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barcode: code }),
      });

      const result = await res.json();

      if (res.ok && result.data) {
        const item = result.data;
        const price = item.sellingPrice || item.unitPrice || 0;

        setProductName(item.productName || "");
        setUnitPrice(price.toString());
        setAmount((price * quantity).toString());
        setLubricantId(item._id);
      } else {
        setProductName("");
        setUnitPrice("");
        setAmount("");
        setLubricantId(null);
        setMessage(result.error || "Product not found");
      }
    } catch (error) {
      setMessage("Error fetching lubricant");
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await fetch(`${API_URL}/api/lubricant/sell-lubricant`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         lubricantId,
  //         paymentMethod,
  //         priceSold: Number(unitPrice),
  //         qtySold: Number(quantity),
  //       }),
  //     });

  //     const result = await res.json();

  //     if (res.ok) {
  //       setMessage("✅ Sale recorded successfully!");
  //       setIsModalOpen(true); // open receipt modal after success
  //       // clear fields
  //       setBarcode("");
  //       setProductName("");
  //       setUnitPrice("");
  //       setQuantity("1");
  //       setAmount("");
  //       setLubricantId("");
  //     } else {
  //       setMessage(result.error || result.message || "❌ Error recording sale");
  //     }
  //   } catch (err) {
  //     setMessage("❌ Server error, please try again.");
  //   }
  // };


  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")); // ✅ get logged-in user
    const res = await fetch(`${API_URL}/api/lubricant/sell-lubricant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lubricantId,
        paymentMethod,
        priceSold: Number(unitPrice),
        qtySold: Number(quantity),
      }),
    });

    const result = await res.json();

    if (res.ok) {
      // ✅ Build receipt data manually
      const receiptPayload = {
        cashier: `${user.firstName} ${user.lastName}`,
        station: user.station?.name || "N/A",
        address: user.station?.address || "N/A",
        date: new Date().toLocaleString(),
        transactionId: result.transactionId || "N/A",
        paymentType: paymentMethod,
        items: [
          {
            sn: 1,
            product: productName,
            unitPrice: unitPrice,
            qty: quantity,
            amount: amount,
          },
        ],
        total: amount,
      };

      // ✅ Pass to modal
      setMessage("✅ Sale recorded successfully!");
      setIsModalOpen(true);
      setReceiptData(receiptPayload); // <--- add this new state

      // clear fields
      setBarcode("");
      setProductName("");
      setUnitPrice("");
      setQuantity("1");
      setAmount("");
      setLubricantId("");
    } else {
      setMessage(result.error || result.message || "❌ Error recording sale");
    }
  } catch (err) {
    setMessage("❌ Server error, please try again.");
  }
};


  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setBarcode(value);
    if (value.length >= 5) fetchLubricant(value);
  };

  const handleQtyChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    const qtyNum = parseFloat(value) || 0;
    const total = qtyNum * (parseFloat(unitPrice) || 0);
    setAmount(total.toString());
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 flex flex-col rounded-xl gap-8 text-neutral-800 w-full">
      {/* Header */}
      <div className="mb-2 flex flex-col text-neutral-800 gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Lubricant Sales</h1>
        <p className="text-lg sm:text-xl font-medium">
          Record, print and export all sales receipt
        </p>
      </div>

      {/* ✅ Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-semibold ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-100 pb-4">
        <table className="min-w-[700px] text-sm text-left text-gray-700 w-full">
          <thead className="bg-gray-100 text-md font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Barcode</th>
              <th className="px-4 py-3">Product name</th>
              <th className="px-4 py-3">Unit price (₦)</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="text-sm">
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={barcode || ""}
                  onChange={handleBarcodeChange}
                  placeholder="Enter barcode"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl mt-2"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={productName || ""}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="text"
                  value={unitPrice || ""}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                />
              </td>
              <td className="px-5 py-2">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQtyChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl mt-2"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={amount || ""}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                />
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1 text-red-500 font-semibold cursor-pointer hover:text-red-400 mt-2">
                  Delete <X size={16} />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DynamicSalesTable
        totalAmount={amount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onSubmit={handleSubmit}
      />

      {/* ✅ Receipt Modal */}
      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receiptData={receiptData}
        // isOpen={isModalOpen}
        // onClose={() => setIsModalOpen(false)}
        // receiptData={{
        //   cashier: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        //   station: user?.station?.name || "N/A",
        //   address: user?.station?.address || "",
        //   date: new Date().toLocaleString(),
        //   transactionId: lubricantId || "N/A",
        //   paymentType: paymentMethod,
        //   items: [
        //     {
        //       sn: 1,
        //       product: productName,
        //       unitPrice: unitPrice,
        //       qty: quantity,
        //       amount: amount,
        //     },
        //   ],
        //   total: amount,
        // }}
      />
    </div>
  );
};

export default LubSales;

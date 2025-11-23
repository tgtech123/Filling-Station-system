"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import DynamicSalesTable from "./DynamicSalesTable";
import ReceiptModal from "./reusefilter/ReceiptModal";
import { useLubricantStore } from "@/store/lubricantStore";

const API_URL = process.env.NEXT_PUBLIC_API;

const LubSales = () => {
  const [rows, setRows] = useState([
    {
      barcode: "",
      productName: "",
      unitPrice: "",
      quantity: "1",
      amount: "",
      lubricantId: null,
    },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("POS");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  // 🆕 Get selected product from store
  const { selectedProductForSale, clearSelectedProductForSale } = useLubricantStore();

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
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  useEffect(() => {
    if (selectedProductForSale) {
      addProductToTable(selectedProductForSale);
      clearSelectedProductForSale(); // Clear after adding
    }
  }, [selectedProductForSale]);

  const addProductToTable = (product) => {
   const price = Number(product.unitPrice ?? 0);
    
    // Find the first empty row
    const emptyRowIndex = rows.findIndex(row => !row.barcode && !row.productName);
    
    if (emptyRowIndex !== -1) {
      // Fill the empty row
      const updatedRows = [...rows];
      updatedRows[emptyRowIndex] = {
        barcode: product.barcode || "",
        productName: product.productName || "",
        unitPrice: price.toString(),
        quantity: "1",
        amount: price.toString(),
        lubricantId: product._id,
      };
      setRows(updatedRows);
      
      // If this was the last row, add a new blank row
      if (emptyRowIndex === rows.length - 1) {
        setRows([
          ...updatedRows,
          {
            barcode: "",
            productName: "",
            unitPrice: "",
            quantity: "1",
            amount: "",
            lubricantId: null,
          },
        ]);
      }
    } else {
      // No empty row found, add to the end
      setRows([
        ...rows,
        {
          barcode: product.barcode || "",
          productName: product.productName || "",
          unitPrice: price.toString(),
          quantity: "1",
          amount: price.toString(),
          lubricantId: product._id,
        },
        // Add another blank row for next product
        {
          barcode: "",
          productName: "",
          unitPrice: "",
          quantity: "1",
          amount: "",
          lubricantId: null,
        },
      ]);
    }
    
    // Show success message
    setMessage(`✅ ${product.productName} added to cart`);
  };

  // 🔍 Fetch a single lubricant
  const fetchLubricant = async (code, index) => {
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
        const price = Number(item.unitPrice ?? 0);

        const updatedRows = [...rows];
        updatedRows[index] = {
          ...updatedRows[index],
          productName: item.productName || "",
          unitPrice: price.toString(),
          amount: (price * updatedRows[index].quantity).toString(),
          lubricantId: item._id,
        };

        setRows(updatedRows);

        // 🧩 Automatically add a new blank row for next product
        const lastRow = updatedRows[updatedRows.length - 1];
        if (lastRow.barcode && lastRow.productName) {
          setRows([
            ...updatedRows,
            {
              barcode: "",
              productName: "",
              unitPrice: "",
              quantity: "1",
              amount: "",
              lubricantId: null,
            },
          ]);
        }
      } else {
        setMessage(result.error || "Product not found");
      }
    } catch (error) {
      setMessage("Error fetching lubricant");
    }
  };

  // 🧠 Update barcode on input (no fetch yet)
  const handleBarcodeChange = (e, index) => {
    const value = e.target.value;
    const updatedRows = [...rows];
    updatedRows[index].barcode = value;
    setRows(updatedRows);
  };

  // ⌨️ Trigger fetch when Enter key is pressed
  const handleBarcodeKeyPress = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = rows[index].barcode.trim();
      if (code) fetchLubricant(code, index);
    }
  };

  // 🖱️ Trigger fetch when user clicks away (blur)
  const handleBarcodeBlur = (e, index) => {
    const code = rows[index].barcode.trim();
    if (code) fetchLubricant(code, index);
  };

  const handleQtyChange = (e, index) => {
    const value = e.target.value;
    const updatedRows = [...rows];
    updatedRows[index].quantity = value;
    const qtyNum = parseFloat(value) || 0;
    const total = qtyNum * (parseFloat(updatedRows[index].unitPrice) || 0);
    updatedRows[index].amount = total.toString();
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(
      updatedRows.length
        ? updatedRows
        : [
            {
              barcode: "",
              productName: "",
              unitPrice: "",
              quantity: "1",
              amount: "",
              lubricantId: null,
            },
          ]
    );
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const validItems = rows.filter((row) => row.lubricantId);
      if (!validItems.length) {
        setMessage("❌ Please scan at least one valid product");
        return;
      }

      const normalizedPaymentMethod =
        paymentMethod === "POS" ? "POS" : paymentMethod.toLowerCase();

      // ✅ Send ALL items in ONE request
      const response = await fetch(
        `${API_URL}/api/lubricant/sell-lubricant-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: validItems.map((item) => ({
              lubricantId: item.lubricantId,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
            })),
            paymentMethod: normalizedPaymentMethod,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || "Failed to record sale"
        );
      }

      const totalAmount = validItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

      // Generate receipt
      const receiptPayload = {
        cashier: `${user.firstName} ${user.lastName}`,
        station: user.station?.name || "N/A",
        address: user.station?.address || "N/A",
        date: new Date().toLocaleString(),
        paymentType: paymentMethod,
        txnId: result.data.txnId,
        items: validItems.map((item, i) => ({
          sn: i + 1,
          name: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          amount: item.amount,
        })),
        total: totalAmount,
      };

      setMessage("✅ Sale recorded successfully!");

      setTimeout(() => {
        setReceiptData(receiptPayload);
        setIsModalOpen(true);
        setRows([
          {
            barcode: "",
            productName: "",
            unitPrice: "",
            quantity: "1",
            amount: "",
            lubricantId: null,
          },
        ]);
        setMessage("");
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.message || "Server error, please try again."}`);
      console.error("Sale error:", err);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 flex flex-col rounded-xl gap-8 text-neutral-800 w-full">
      <div className="mb-2 flex flex-col text-neutral-800 gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Lubricant Sales</h1>
        <p className="text-lg sm:text-xl font-medium">
          Record, print and export all sales receipt
        </p>
      </div>

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
            {rows.map((row, index) => (
              <tr key={index} className="text-sm">
                <td className="px-5 py-2">
                  <input
                    type="text"
                    value={row.barcode}
                    onChange={(e) => handleBarcodeChange(e, index)}
                    onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                    onBlur={(e) => handleBarcodeBlur(e, index)}
                    placeholder="Enter barcode and press Enter"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl mt-2"
                  />
                </td>
                <td className="px-5 py-2">
                  <input
                    type="text"
                    value={row.productName}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                  />
                </td>
                <td className="px-5 py-2">
                  <input
                    type="text"
                    value={row.unitPrice}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                  />
                </td>
                <td className="px-5 py-2">
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => handleQtyChange(e, index)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl mt-2"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.amount}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl mt-2"
                  />
                </td>
                <td className="px-4 py-2">
                  <div
                    onClick={() => handleDeleteRow(index)}
                    className="flex items-center gap-1 text-red-500 font-semibold cursor-pointer hover:text-red-400 mt-2"
                  >
                    Delete <X size={16} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DynamicSalesTable
        totalAmount={rows.reduce(
          (sum, r) => sum + (parseFloat(r.amount) || 0),
          0
        )}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onSubmit={handleSubmit}
      />

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receiptData={receiptData}
      />
    </div>
  );
};

export default LubSales;
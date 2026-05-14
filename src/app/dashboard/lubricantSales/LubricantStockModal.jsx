"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Save,
  Search,
  X,
  Edit2,
  Trash2,
  SquarePen,
  AlertCircle,
} from "lucide-react";
import { useLubricantStore } from "@/store/lubricantStore";
import NumericInput from "@/components/inputs/NumericInput";

export default function LubricantStockModal({ onClose }) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const {
    getLubricantByBarcode,
    searchLubricants,
    saveLubricantPurchase,
    loading,
  } = useLubricantStore();

  const [rows, setRows] = useState([
    {
      barcode: "",
      productName: "",
      unitCost: "",
      quantity: "1",
      amount: "",
      oldUnitCost: "",
      sellingPercentage: "",
      unitPrice: "",
      lubricantId: null,
      isEditing: false,
      error: "", // Row-specific error
    },
  ]);

  const [supplier, setSupplier] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState(""); // Search error
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate total amount from all rows (sum of amounts)
  const calculateTotalAmount = () => {
    return rows
      .reduce((total, row) => {
        return total + (parseFloat(row.amount) || 0);
      }, 0)
      .toFixed(2);
  };

  // Handle barcode input change
  const handleBarcodeChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].barcode = e.target.value;
    newRows[index].error = ""; // Clear error on change
    setRows(newRows);
  };

  // Handle barcode Enter key press
  const handleBarcodeKeyPress = async (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await fetchLubricantByBarcode(index);
    }
  };

  // Fetch lubricant by barcode
  const fetchLubricantByBarcode = async (index) => {
    const barcode = rows[index].barcode.trim();
    if (!barcode) return;

    try {
      const response = await getLubricantByBarcode(barcode);

      if (response && response.data) {
        const lubricant = response.data;

        setRows((prevRows) => {
          const newRows = [...prevRows];
          const unitCostValue = lubricant.unitCost || "0";
          
          // Get sellingPercentage from database, or calculate if not present
          let sellingPercentageValue = lubricant.sellingPercentage || "0";
          
          const cost = parseFloat(lubricant.unitCost || 0);
          const price = parseFloat(lubricant.unitPrice || lubricant.sellingPrice || 0);
          
          // If sellingPercentage is 0 or not set, calculate it from existing prices
          if (!sellingPercentageValue || sellingPercentageValue === "0" || sellingPercentageValue === 0) {
            if (cost > 0 && price > cost) {
              sellingPercentageValue = (((price - cost) / cost) * 100).toFixed(2);
            }
          }

          newRows[index] = {
            ...newRows[index],
            barcode: barcode,
            productName: lubricant.productName || "",
            unitCost: "",
            oldUnitCost: unitCostValue,
            sellingPercentage: sellingPercentageValue,
            unitPrice: "",
            amount: "",
            lubricantId: lubricant._id,
            isEditing: false,
            error: "", // Clear error on success
          };

          // Add new empty row if this is the last row
          if (index === prevRows.length - 1) {
            newRows.push({
              barcode: "",
              productName: "",
              unitCost: "",
              quantity: "1",
              amount: "",
              oldUnitCost: "",
              sellingPercentage: "",
              unitPrice: "",
              lubricantId: null,
              isEditing: false,
              error: "",
            });
          }

          return newRows;
        });
      } else {
        // Product not found
        const newRows = [...rows];
        newRows[index].error = `Product with barcode "${barcode}" not found`;
        setRows(newRows);
      }
    } catch (error) {
      console.error("Error fetching lubricant:", error);
      const newRows = [...rows];
      newRows[index].error = error.message || "Failed to fetch product";
      setRows(newRows);
    }
  };

  // Handle amount change (entered by cashier)
  const handleAmountChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].amount = e.target.value;
    
    // Recalculate unit cost and unit price
    calculateUnitCostAndPrice(index, newRows);
    setRows(newRows);
  };

  // Handle quantity change
  const handleQtyChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].quantity = e.target.value;
    
    // Recalculate unit cost and unit price
    calculateUnitCostAndPrice(index, newRows);
    setRows(newRows);
  };

  // Calculate unit cost and unit price based on amount and quantity
  const calculateUnitCostAndPrice = (index, rowsArray) => {
    const row = rowsArray[index];
    const amount = parseFloat(row.amount) || 0;
    const quantity = parseFloat(row.quantity) || 0;
    const sellingPercentage = parseFloat(row.sellingPercentage) || 0;

    if (quantity > 0 && amount >= 0) {
      // Calculate new unit cost = amount / quantity
      const newUnitCost = amount / quantity;
      rowsArray[index].unitCost = newUnitCost.toFixed(2);

      // Calculate new unit price = unit cost * (1 + sellingPercentage / 100)
      const newUnitPrice = newUnitCost * (1 + sellingPercentage / 100);
      rowsArray[index].unitPrice = newUnitPrice.toFixed(2);
    } else {
      rowsArray[index].unitCost = "";
      rowsArray[index].unitPrice = "";
    }
  };

  // Handle selling percentage change
  const handleSellingPercentageChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].sellingPercentage = e.target.value;
    
    // Recalculate unit price
    calculateUnitCostAndPrice(index, newRows);
    setRows(newRows);
  };

  // Handle unit price change (manual override when editing)
  const handleUnitPriceChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].unitPrice = e.target.value;
    setRows(newRows);
  };

  // Toggle edit mode
  const toggleEdit = (index) => {
    const newRows = [...rows];
    newRows[index].isEditing = !newRows[index].isEditing;
    setRows(newRows);
  };

  // Delete row
  const handleDeleteRow = (index) => {
    if (rows.length === 1) {
      alert("You must have at least one row");
      return;
    }
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // Handle search by product name
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSearchError(""); // Clear previous error

    if (term.trim().length > 0) {
      try {
        const results = await searchLubricants(term);
        
        if (results.length === 0) {
          setSearchError(`No products found matching "${term}"`);
          setSearchResults([]);
          setShowSearchDropdown(false);
        } else {
          setSearchResults(results);
          setShowSearchDropdown(true);
        }
      } catch (error) {
        setSearchError("Failed to search products");
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Select product from search
  const selectProductFromSearch = (lubricant) => {
    setSearchError(""); // Clear search error

    setRows((prevRows) => {
      const newRows = [...prevRows];

      // Find first empty row
      let targetIndex = newRows.findIndex((row) => !row.lubricantId);

      if (targetIndex === -1) {
        targetIndex = newRows.length;
        newRows.push({
          barcode: "",
          productName: "",
          unitCost: "",
          quantity: "1",
          amount: "",
          oldUnitCost: "",
          sellingPercentage: "",
          unitPrice: "",
          lubricantId: null,
          isEditing: false,
          error: "",
        });
      }

      const unitCostValue = lubricant.unitCost || "0";
      
      // Get sellingPercentage from database, or calculate if not present
      let sellingPercentageValue = lubricant.sellingPercentage || "0";
      
      // If sellingPercentage is 0 or not set, calculate it from existing prices
      if (!sellingPercentageValue || sellingPercentageValue === "0" || sellingPercentageValue === 0) {
        const cost = parseFloat(lubricant.unitCost || 0);
        const price = parseFloat(lubricant.sellingPrice || 0);
        if (cost > 0 && price > cost) {
          sellingPercentageValue = (((price - cost) / cost) * 100).toFixed(2);
        }
      }

      newRows[targetIndex] = {
        ...newRows[targetIndex],
        barcode: lubricant.barcode || "",
        productName: lubricant.productName || "",
        unitCost: "",
        oldUnitCost: unitCostValue,
        sellingPercentage: sellingPercentageValue,
        unitPrice: "",
        amount: "",
        lubricantId: lubricant._id,
        quantity: "1",
        isEditing: false,
        error: "",
      };

      // Add another empty row
      newRows.push({
        barcode: "",
        productName: "",
        unitCost: "",
        quantity: "1",
        amount: "",
        oldUnitCost: "",
        sellingPercentage: "",
        unitPrice: "",
        lubricantId: null,
        isEditing: false,
        error: "",
      });

      return newRows;
    });

    setSearchTerm("");
    setShowSearchDropdown(false);
  };

  // Handle save
  const handleSave = async () => {
    // Validate required fields
    if (!supplier || !invoiceNo || !paymentMethod) {
      alert("Please fill in supplier, invoice number, and payment method");
      return;
    }

    // Filter valid rows
    const validRows = rows.filter(
      (row) => row.lubricantId && row.unitCost && row.quantity && row.amount
    );

    if (validRows.length === 0) {
      alert("Please add at least one valid lubricant purchase");
      return;
    }

    const purchaseData = {
      supplier,
      invoiceNo,
      paymentMethod,
      purchaseDate: formattedDate,
      items: validRows.map((row) => ({
        lubricantId: row.lubricantId,
        barcode: row.barcode,
        productName: row.productName,
        unitCost: parseFloat(row.unitCost),
        oldUnitCost: parseFloat(row.oldUnitCost || row.unitCost),
        quantity: parseInt(row.quantity),
        sellingPercentage: parseFloat(row.sellingPercentage || "0"),
        sellingPrice: parseFloat(row.unitPrice),
        amount: parseFloat(row.amount),
      })),
      totalAmount: parseFloat(calculateTotalAmount()),
    };

    try {
      setIsSaving(true);

      // Call API to save
      const response = await saveLubricantPurchase(purchaseData);

      if (response.success) {
        setMessage(`✅ Purchase saved successfully! Invoice No: ${invoiceNo}`);
        // Optional: reset form after delay
        setTimeout(() => {
          onClose();
          setMessage("");
        }, 3000);
      } else {
        setMessage(`❌ ${response.error || "Failed to save purchase"}`);
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="flex min-h-full items-start sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-[#f6f6f6] dark:bg-gray-900 rounded-b-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-7xl max-h-screen sm:max-h-[92vh] overflow-y-auto">

          {/* ── Header ── */}
          <div className="sticky top-0 bg-[#f6f6f6] dark:bg-gray-900 z-10 px-4 sm:px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-2xl font-semibold leading-tight">
                  Add Lubricant Stock Purchase
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Record purchased lubricants in your station</p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="border-2 w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2.5 pr-10 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Search product by name to add to stock..."
              />
              <Search size={18} className="text-gray-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />

              {searchError && (
                <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-300 rounded-md mt-1 p-3 z-50 shadow-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle size={16} />
                    <p className="text-sm font-medium">{searchError}</p>
                  </div>
                </div>
              )}

              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-52 overflow-y-auto z-50 shadow-lg">
                  {searchResults.map((lubricant) => (
                    <div
                      key={lubricant._id}
                      onClick={() => selectProductFromSearch(lubricant)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      <p className="font-semibold text-sm dark:text-white">{lubricant.productName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Barcode: {lubricant.barcode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-6">

            {/* ── Purchase details ── */}
            <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-xl">
              <div className="flex items-center gap-1.5 mb-4">
                <Calendar size={16} className="text-purple-600" />
                <p className="text-purple-600 text-sm font-semibold">{formattedDate}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-sm font-semibold mb-1">Supplier</p>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Enter supplier name"
                    className="border-2 w-full p-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Invoice No.</p>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="Enter invoice number"
                    className="border-2 w-full p-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Payment Method</p>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="border-2 w-full p-2 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:border-blue-400 focus:outline-none"
                  >
                    <option value="">Select Method</option>
                    <option value="POS">POS</option>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Items section ── */}
            <div className="bg-white dark:bg-gray-800 mt-4 p-4 rounded-xl">
              {message && (
                <div className={`p-3 rounded-lg text-sm font-semibold mb-4 ${
                  message.startsWith("✅")
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}>
                  {message}
                </div>
              )}

              {/* Mobile card layout */}
              <div className="flex flex-col gap-3 sm:hidden">
                {rows.map((row, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">Item {index + 1}</span>
                      <div className="flex items-center gap-3">
                        <SquarePen
                          size={16}
                          className={`cursor-pointer ${row.isEditing ? "text-green-600" : "text-blue-500"}`}
                          onClick={() => toggleEdit(index)}
                        />
                        <Trash2
                          size={16}
                          className="cursor-pointer text-red-500 hover:text-red-400"
                          onClick={() => handleDeleteRow(index)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Barcode */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Barcode</label>
                        <input
                          type="text"
                          value={row.barcode}
                          onChange={(e) => handleBarcodeChange(e, index)}
                          onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                          onBlur={() => fetchLubricantByBarcode(index)}
                          placeholder="Scan or type barcode"
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            row.error ? "border-red-300 bg-red-50" : "border-neutral-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white"
                          }`}
                        />
                      </div>

                      {/* Product name */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Product Name</label>
                        <input
                          type="text"
                          value={row.productName}
                          disabled
                          className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded-lg text-sm"
                        />
                      </div>

                      {/* Amount + Quantity */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Amount (₦)</label>
                          <NumericInput
                            variant="decimal"
                            value={row.amount}
                            onChange={(e) => handleAmountChange(e, index)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Quantity</label>
                          <NumericInput
                            variant="numeric"
                            value={row.quantity}
                            onChange={(e) => handleQtyChange(e, index)}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-600 dark:text-white rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* Unit cost + Old unit cost */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Unit Cost</label>
                          <input
                            type="text"
                            value={row.unitCost}
                            disabled
                            className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Old Unit Cost</label>
                          <input
                            type="text"
                            value={row.oldUnitCost}
                            disabled
                            className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* % Selling + Unit price */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">% Selling Price</label>
                          <NumericInput
                            variant="decimal"
                            value={row.sellingPercentage}
                            onChange={(e) => handleSellingPercentageChange(e, index)}
                            disabled={!row.isEditing}
                            className={`w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm ${!row.isEditing ? "bg-neutral-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200" : "dark:bg-gray-600 dark:border-gray-500 dark:text-white"}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Unit Price</label>
                          <NumericInput
                            variant="decimal"
                            value={row.unitPrice}
                            onChange={(e) => handleUnitPriceChange(e, index)}
                            disabled={!row.isEditing}
                            className={`w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm ${!row.isEditing ? "bg-neutral-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200" : "dark:bg-gray-600 dark:border-gray-500 dark:text-white"}`}
                          />
                        </div>
                      </div>

                      {row.error && (
                        <div className="bg-red-50 border border-red-300 rounded-lg p-2 flex items-center gap-2 text-red-700">
                          <AlertCircle size={14} />
                          <p className="text-xs font-medium">{row.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table layout */}
              <div className="hidden sm:block w-full overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700 pb-4">
                <table className="min-w-[1100px] text-sm text-left text-gray-700 dark:text-gray-200 w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-3">Barcode</th>
                      <th className="px-4 py-3">Product name</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Unit Cost</th>
                      <th className="px-4 py-3">Old unit cost</th>
                      <th className="px-4 py-3">% Selling price</th>
                      <th className="px-4 py-3">Unit price</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {rows.map((row, index) => (
                      <React.Fragment key={index}>
                        <tr className="text-sm">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={row.barcode}
                              onChange={(e) => handleBarcodeChange(e, index)}
                              onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                              onBlur={() => fetchLubricantByBarcode(index)}
                              placeholder="Enter barcode + Enter"
                              className={`w-full px-3 py-2 border rounded-xl ${row.error ? "border-red-300 bg-red-50" : "border-neutral-300 dark:border-gray-500 dark:bg-gray-700 dark:text-white"}`}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input type="text" value={row.productName} disabled className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 rounded-xl" />
                          </td>
                          <td className="px-4 py-2">
                            <NumericInput variant="decimal" value={row.amount} onChange={(e) => handleAmountChange(e, index)} placeholder="Enter amount" className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-700 dark:text-white rounded-xl" />
                          </td>
                          <td className="px-4 py-2">
                            <NumericInput variant="numeric" value={row.quantity} onChange={(e) => handleQtyChange(e, index)} className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-700 dark:text-white rounded-xl" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={row.unitCost} disabled className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 rounded-xl" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="text" value={row.oldUnitCost} disabled className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 rounded-xl" />
                          </td>
                          <td className="px-4 py-2">
                            <NumericInput variant="decimal" value={row.sellingPercentage} onChange={(e) => handleSellingPercentageChange(e, index)} disabled={!row.isEditing} className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${!row.isEditing ? "bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300" : "dark:bg-gray-700 dark:border-gray-500 dark:text-white"}`} />
                          </td>
                          <td className="px-4 py-2">
                            <NumericInput variant="decimal" value={row.unitPrice} onChange={(e) => handleUnitPriceChange(e, index)} disabled={!row.isEditing} className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${!row.isEditing ? "bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300" : "dark:bg-gray-700 dark:border-gray-500 dark:text-white"}`} />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <SquarePen size={18} className={`cursor-pointer ${row.isEditing ? "text-green-600 hover:text-green-800" : "text-blue-600 hover:text-blue-800"}`} onClick={() => toggleEdit(index)} />
                              <Trash2 size={18} className="cursor-pointer text-red-500 hover:text-red-400" onClick={() => handleDeleteRow(index)} />
                            </div>
                          </td>
                        </tr>
                        {row.error && (
                          <tr>
                            <td colSpan="9" className="px-4 py-2">
                              <div className="bg-red-50 border border-red-300 rounded-lg p-2 flex items-center gap-2 text-red-700">
                                <AlertCircle size={16} />
                                <p className="text-xs font-medium">{row.error}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="bg-[#d9edff] py-4 px-5 rounded-xl">
                  <p className="text-[#1a71f6] text-sm">Total Amount</p>
                  <p className="text-2xl text-blue-500 font-semibold">₦{calculateTotalAmount()}</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex gap-2 items-center justify-center py-3 font-semibold px-8 rounded-xl text-white transition-colors ${isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {isSaving ? "Saving..." : "Save"}
                  <Save size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
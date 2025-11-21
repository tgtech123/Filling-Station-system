"use client";

import {
  Calendar,
  Save,
  Search,
  X,
  Edit2,
  Trash2,
  SquarePen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLubricantStore } from "@/store/lubricantStore";

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
    },
  ]);

  const [supplier, setSupplier] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
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
      console.log("Fetching barcode:", barcode);
      const response = await getLubricantByBarcode(barcode);

      if (response && response.data) {
        const lubricant = response.data;
        console.log("🔍 Full Lubricant data:", lubricant);
        console.log("📊 unitCost:", lubricant.unitCost);
        console.log("💰 sellingPrice:", lubricant.sellingPrice);
        console.log("💵 unitPrice:", lubricant.unitPrice);
        console.log("📈 sellingPercentage from DB:", lubricant.sellingPercentage);

        setRows((prevRows) => {
          const newRows = [...prevRows];
          const unitCostValue = lubricant.unitCost || "0";
          
          // Get sellingPercentage from database, or calculate if not present
          let sellingPercentageValue = lubricant.sellingPercentage || "0";
          
          const cost = parseFloat(lubricant.unitCost || 0);
          // Use unitPrice instead of sellingPrice for calculation
          const price = parseFloat(lubricant.unitPrice || lubricant.sellingPrice || 0);
          
          console.log("🧮 Parsed cost:", cost);
          console.log("🧮 Parsed price:", price);
          
          // If sellingPercentage is 0 or not set, calculate it from existing prices
          if (!sellingPercentageValue || sellingPercentageValue === "0" || sellingPercentageValue === 0) {
            if (cost > 0 && price > cost) {
              sellingPercentageValue = (((price - cost) / cost) * 100).toFixed(2);
              console.log("✅ Calculated sellingPercentage:", sellingPercentageValue);
            } else {
              console.log("❌ Cannot calculate: cost or price invalid");
            }
          } else {
            console.log("✅ Using DB sellingPercentage:", sellingPercentageValue);
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
          };

          console.log("Updated row:", newRows[index]);

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
            });
          }

          return newRows;
        });
      } else {
        alert("Lubricant not found with this barcode");
      }
    } catch (error) {
      console.error("Error fetching lubricant:", error);
      alert("Failed to fetch lubricant: " + error.message);
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

    if (term.trim().length > 0) {
      const results = await searchLubricants(term);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Select product from search
  const selectProductFromSearch = (lubricant) => {
    console.log("Selecting product:", lubricant);

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
    console.log("Purchase data to save:", purchaseData);

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
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#f6f6f6] p-6 rounded-lg shadow-xl max-w-7xl w-full mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <section className="flex flex-col lg:flex-row gap-8 relative items-center">
          <div className="w-3/8">
            <h3 className="text-2xl mb-2 font-semibold">
              Add Lubricant Stock Purchase
            </h3>
            <p>Record purchased lubricants in your station</p>
          </div>
          {/* Search */}
          <div className="relative w-3/8">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="border-2 w-full border-gray-300 rounded-md p-2"
              placeholder="Search product name"
            />
            <Search className="text-gray-300 absolute top-3 right-3" />

            {/* Search dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                {searchResults.map((lubricant) => (
                  <div
                    key={lubricant._id}
                    onClick={() => selectProductFromSearch(lubricant)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                  >
                    <p className="font-semibold">{lubricant.productName}</p>
                    <p className="text-sm text-gray-600">
                      Barcode: {lubricant.barcode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Close */}
          <div className="absolute right-0 top-0 cursor-pointer">
            <X onClick={onClose} />
          </div>
        </section>

        {/* Main */}
        <section className="mt-10 bg-white p-3 rounded-lg">
          <div className="flex mb-8 items-center gap-1">
            <Calendar className="text-purple-600" />
            <p className="text-purple-600 text-sm font-semibold">
              {formattedDate}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            {/* Supplier */}
            <div className="w-full">
              <p className="font-semibold mb-1">Supplier</p>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Enter supplier name"
                className="border-2 w-full p-2 rounded-md border-gray-300"
              />
            </div>
            {/* Invoice number */}
            <div className="w-full">
              <p className="font-semibold mb-1">Invoice No.</p>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Enter no"
                className="border-2 w-full p-2 rounded-md border-gray-300"
              />
            </div>
            {/* Payment method */}
            <div className="w-full">
              <p className="font-semibold mb-1">Payment Method</p>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border-2 w-full p-2 rounded-md border-gray-300"
              >
                <option value="">Select Method</option>
                <option value="POS">POS</option>
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white mt-10 p-4 rounded-md">
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-semibold mb-4 ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message}
            </div>
          )}

          <div className="w-full overflow-x-auto rounded-lg border border-gray-100 pb-4">
            <table className="min-w-[1200px] text-sm text-left text-gray-700 w-full">
              <thead className="bg-gray-100 text-md font-semibold text-gray-700">
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

              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, index) => (
                  <tr key={index} className="text-sm">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.barcode}
                        onChange={(e) => handleBarcodeChange(e, index)}
                        onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                        placeholder="Enter barcode + Enter"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.productName}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl text-gray-700"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleAmountChange(e, index)}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleQtyChange(e, index)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row.unitCost}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl text-gray-700"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.oldUnitCost}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl text-gray-700"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row.sellingPercentage}
                        onChange={(e) =>
                          handleSellingPercentageChange(e, index)
                        }
                        disabled={!row.isEditing}
                        className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${
                          !row.isEditing ? "bg-neutral-100 text-gray-700" : ""
                        }`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row.unitPrice}
                        onChange={(e) => handleUnitPriceChange(e, index)}
                        disabled={!row.isEditing}
                        className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${
                          !row.isEditing ? "bg-neutral-100 text-gray-700" : ""
                        }`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <SquarePen
                          size={18}
                          className={`cursor-pointer ${
                            row.isEditing
                              ? "text-green-600 hover:text-green-800"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                          onClick={() => toggleEdit(index)}
                        />
                        <Trash2
                          size={18}
                          className="cursor-pointer text-red-500 hover:text-red-400"
                          onClick={() => handleDeleteRow(index)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center">
            {/* Total Amount */}
            <div className="bg-[#d9edff] py-4 pl-4 pr-20 rounded-lg">
              <p className="text-[#1a71f6] text-sm">Total Amount</p>
              <p className="text-2xl text-blue-500 font-semibold">
                ₦{calculateTotalAmount()}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex gap-2 items-center ${
                isSaving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white py-3 font-semibold px-6 rounded-lg`}
            >
              {isSaving ? "Saving..." : "Save"}
              <Save />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
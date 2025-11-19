// "use client";

// import { Calendar, Save, Search, X, Edit2, Trash2, SquarePen } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useLubricantStore } from "@/store/lubricantStore";

// export default function LubricantStockModal({ onClose }) {
//   const d = new Date();
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   const formattedDate = `${day}/${month}/${year}`;

//   const { getLubricantByBarcode, searchLubricants, loading } =
//     useLubricantStore();

//   const [rows, setRows] = useState([
//     {
//       barcode: "",
//       productName: "",
//       unitCost: "",
//       quantity: "1",
//       amount: "",
//       oldUnitCost: "",
//       sellingPercentage: "",
//       unitPrice: "",
//       lubricantId: null,
//       isEditing: false, // Single edit mode for both fields
//     },
//   ]);

//   const [supplier, setSupplier] = useState("");
//   const [invoiceNo, setInvoiceNo] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSearchDropdown, setShowSearchDropdown] = useState(false);

//   // Calculate total amount from all rows
//   const calculateTotalAmount = () => {
//     return rows.reduce((total, row) => {
//       return total + (parseFloat(row.amount) || 0);
//     }, 0).toFixed(2);
//   };

//   // Handle barcode input change
//   const handleBarcodeChange = (e, index) => {
//     const newRows = [...rows];
//     newRows[index].barcode = e.target.value;
//     setRows(newRows);
//   };

//   // Handle barcode Enter key press
//   const handleBarcodeKeyPress = async (e, index) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       await fetchLubricantByBarcode(index);
//     }
//   };

//   // Fetch lubricant by barcode
//   const fetchLubricantByBarcode = async (index) => {
//     const barcode = rows[index].barcode.trim();
//     if (!barcode) return;

//     try {
//       console.log("Fetching barcode:", barcode);
//       const response = await getLubricantByBarcode(barcode);

//       if (response && response.data) {
//         const lubricant = response.data;
//         console.log("Lubricant data:", lubricant);

//         setRows(prevRows => {
//           const newRows = [...prevRows];
//           const unitCostValue = lubricant.unitCost || "0";
//           const unitPriceValue = lubricant.sellingPrice || "0";
//           const quantity = parseFloat(newRows[index].quantity) || 1;

//           newRows[index] = {
//             ...newRows[index],
//             barcode: barcode,
//             productName: lubricant.productName || "",
//             unitCost: unitCostValue,
//             oldUnitCost: unitCostValue,
//             sellingPercentage: "0",
//             unitPrice: unitPriceValue,
//             amount: (parseFloat(unitPriceValue) * quantity).toFixed(2),
//             lubricantId: lubricant._id,
//             isEditing: false,
//           };

//           console.log("Updated row:", newRows[index]);

//           // Add new empty row if this is the last row
//           if (index === prevRows.length - 1) {
//             newRows.push({
//               barcode: "",
//               productName: "",
//               unitCost: "",
//               quantity: "1",
//               amount: "",
//               oldUnitCost: "",
//               sellingPercentage: "",
//               unitPrice: "",
//               lubricantId: null,
//               isEditing: false,
//             });
//           }

//           return newRows;
//         });
//       } else {
//         alert("Lubricant not found with this barcode");
//       }
//     } catch (error) {
//       console.error("Error fetching lubricant:", error);
//       alert("Failed to fetch lubricant: " + error.message);
//     }
//   };

//   // Handle quantity change
//   const handleQtyChange = (e, index) => {
//     const newRows = [...rows];
//     newRows[index].quantity = e.target.value;
//     calculateAmount(index, newRows);
//     setRows(newRows);
//   };

//   // Handle unit cost change
//   const handleUnitCostChange = (e, index) => {
//     const newRows = [...rows];
//     const newUnitCost = e.target.value;

//     newRows[index].unitCost = newUnitCost;

//     // Set oldUnitCost same as unitCost by default
//     if (!newRows[index].oldUnitCost || newRows[index].oldUnitCost === "0") {
//       newRows[index].oldUnitCost = newUnitCost;
//     }

//     calculateAmount(index, newRows);
//     setRows(newRows);
//   };

//   // Calculate amount (unitPrice × quantity) - NOT EDITABLE
//   const calculateAmount = (index, rowsArray) => {
//     const row = rowsArray[index];
//     const unitPrice = parseFloat(row.unitPrice) || 0;
//     const quantity = parseFloat(row.quantity) || 0;

//     // Amount = unitPrice × quantity (auto-calculated, not editable)
//     rowsArray[index].amount = (unitPrice * quantity).toFixed(2);

//     // If selling percentage is being used, calculate unit price
//     const percentage = parseFloat(row.sellingPercentage) || 0;
//     const unitCost = parseFloat(row.unitCost) || 0;

//     if (percentage > 0 && unitCost > 0) {
//       const newUnitPrice = unitCost + (unitCost * percentage) / 100;
//       rowsArray[index].unitPrice = newUnitPrice.toFixed(2);
//       rowsArray[index].amount = (newUnitPrice * quantity).toFixed(2);
//       // Update old unit cost when selling price changes
//       rowsArray[index].oldUnitCost = unitCost.toFixed(2);
//     }
//   };

//   // Handle selling percentage change
//   const handleSellingPercentageChange = (e, index) => {
//     const newRows = [...rows];
//     newRows[index].sellingPercentage = e.target.value;
//     if (newRows[index].unitCost) {
//       calculateAmount(index, newRows);
//     }
//     setRows(newRows);
//   };

//   // Handle unit price change
//   const handleUnitPriceChange = (e, index) => {
//     const newRows = [...rows];
//     const newUnitPrice = e.target.value;
//     newRows[index].unitPrice = newUnitPrice;

//     // Recalculate amount when unit price changes
//     const quantity = parseFloat(newRows[index].quantity) || 0;
//     newRows[index].amount = (parseFloat(newUnitPrice) * quantity).toFixed(2);

//     // Update old unit cost when unit price is manually changed
//     if (newRows[index].unitCost) {
//       newRows[index].oldUnitCost = newRows[index].unitCost;
//     }

//     setRows(newRows);
//   };

//   // Toggle edit mode (single edit icon for both fields)
//   const toggleEdit = (index) => {
//     const newRows = [...rows];
//     newRows[index].isEditing = !newRows[index].isEditing;
//     setRows(newRows);
//   };

//   // Delete row
//   const handleDeleteRow = (index) => {
//     if (rows.length === 1) {
//       alert("You must have at least one row");
//       return;
//     }
//     const newRows = rows.filter((_, i) => i !== index);
//     setRows(newRows);
//   };

//   // Add new row
//   const addNewRow = () => {
//     setRows([
//       ...rows,
//       {
//         barcode: "",
//         productName: "",
//         unitCost: "",
//         quantity: "1",
//         amount: "",
//         oldUnitCost: "",
//         sellingPercentage: "",
//         unitPrice: "",
//         lubricantId: null,
//         isEditing: false,
//       },
//     ]);
//   };

//   // Handle search by product name
//   const handleSearch = async (e) => {
//     const term = e.target.value;
//     setSearchTerm(term);

//     if (term.trim().length > 0) {
//       const results = await searchLubricants(term);
//       setSearchResults(results);
//       setShowSearchDropdown(true);
//     } else {
//       setSearchResults([]);
//       setShowSearchDropdown(false);
//     }
//   };

//   // Select product from search
//   const selectProductFromSearch = (lubricant) => {
//     console.log("Selecting product:", lubricant);

//     setRows(prevRows => {
//       const newRows = [...prevRows];

//       // Find first empty row (one without lubricantId)
//       let targetIndex = newRows.findIndex((row) => !row.lubricantId);

//       // If no empty row found, use the last index + 1 (we'll add it)
//       if (targetIndex === -1) {
//         targetIndex = newRows.length;
//         newRows.push({
//           barcode: "",
//           productName: "",
//           unitCost: "",
//           quantity: "1",
//           amount: "",
//           oldUnitCost: "",
//           sellingPercentage: "",
//           unitPrice: "",
//           lubricantId: null,
//           isEditing: false,
//         });
//       }

//       const unitCostValue = lubricant.unitCost || "0";
//       const unitPriceValue = lubricant.sellingPrice || "0";
//       const quantity = parseFloat(newRows[targetIndex].quantity) || 1;

//       newRows[targetIndex] = {
//         ...newRows[targetIndex],
//         barcode: lubricant.barcode || "",
//         productName: lubricant.productName || "",
//         unitCost: unitCostValue,
//         oldUnitCost: unitCostValue,
//         sellingPercentage: "0",
//         unitPrice: unitPriceValue,
//         amount: (parseFloat(unitPriceValue) * quantity).toFixed(2),
//         lubricantId: lubricant._id,
//         quantity: "1",
//         isEditing: false,
//       };

//       // Add another empty row
//       newRows.push({
//         barcode: "",
//         productName: "",
//         unitCost: "",
//         quantity: "1",
//         amount: "",
//         oldUnitCost: "",
//         sellingPercentage: "",
//         unitPrice: "",
//         lubricantId: null,
//         isEditing: false,
//       });

//       console.log("Updated rows:", newRows);
//       return newRows;
//     });

//     setSearchTerm("");
//     setShowSearchDropdown(false);
//   };

//   // Handle save
//   const handleSave = () => {
//     if (!supplier || !invoiceNo || !paymentMethod) {
//       alert("Please fill in supplier, invoice number, and payment method");
//       return;
//     }

//     const validRows = rows.filter(
//       (row) => row.lubricantId && row.unitCost && row.quantity
//     );
//     if (validRows.length === 0) {
//       alert("Please add at least one valid lubricant purchase");
//       return;
//     }

//     const purchaseData = {
//       supplier,
//       invoiceNo,
//       paymentMethod,
//       date: formattedDate,
//       items: validRows.map((row) => ({
//         lubricantId: row.lubricantId,
//         barcode: row.barcode,
//         productName: row.productName,
//         unitCost: parseFloat(row.unitCost),
//         quantity: parseInt(row.quantity),
//         amount: parseFloat(row.amount),
//         oldUnitCost: parseFloat(row.oldUnitCost),
//         sellingPercentage: parseFloat(row.sellingPercentage),
//         sellingPrice: parseFloat(row.unitPrice),
//       })),
//       totalAmount: parseFloat(calculateTotalAmount()),
//     };

//     console.log("Purchase data to save:", purchaseData);
//     alert("Save functionality will be implemented with API endpoint");
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-[#f6f6f6] p-6 rounded-lg shadow-xl max-w-7xl w-full mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide">
//         {/* Header */}
//         <section className="flex flex-col lg:flex-row gap-8 relative items-center">
//           <div className="w-3/8">
//             <h3 className="text-2xl mb-2 font-semibold">
//               Add Lubricant Stock Purchase
//             </h3>
//             <p>Record purchased lubricants in your station</p>
//           </div>
//           {/* Search */}
//           <div className="relative w-3/8">
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={handleSearch}
//               className="border-2 w-full border-gray-300 rounded-md p-2"
//               placeholder="Search product name"
//             />
//             <Search className="text-gray-300 absolute top-3 right-3" />

//             {/* Search dropdown */}
//             {showSearchDropdown && searchResults.length > 0 && (
//               <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
//                 {searchResults.map((lubricant) => (
//                   <div
//                     key={lubricant._id}
//                     onClick={() => selectProductFromSearch(lubricant)}
//                     className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
//                   >
//                     <p className="font-semibold">{lubricant.productName}</p>
//                     <p className="text-sm text-gray-600">
//                       Barcode: {lubricant.barcode}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           {/* Close */}
//           <div className="absolute right-0 top-0 cursor-pointer">
//             <X onClick={onClose} />
//           </div>
//         </section>

//         {/* Main */}
//         <section className="mt-10 bg-white p-3 rounded-lg">
//           <div className="flex mb-8 items-center gap-1">
//             <Calendar className="text-purple-600" />
//             <p className="text-purple-600 text-sm font-semibold">
//               {formattedDate}
//             </p>
//           </div>

//           <div className="flex flex-col lg:flex-row gap-3">
//             {/* Supplier */}
//             <div className="w-full">
//               <p className="font-semibold mb-1">Supplier</p>
//               <input
//                 type="text"
//                 value={supplier}
//                 onChange={(e) => setSupplier(e.target.value)}
//                 placeholder="Enter supplier name"
//                 className="border-2 w-full p-2 rounded-md border-gray-300"
//               />
//             </div>
//             {/* Invoice number */}
//             <div className="w-full">
//               <p className="font-semibold mb-1">Invoice No.</p>
//               <input
//                 type="text"
//                 value={invoiceNo}
//                 onChange={(e) => setInvoiceNo(e.target.value)}
//                 placeholder="Enter no"
//                 className="border-2 w-full p-2 rounded-md border-gray-300"
//               />
//             </div>
//             {/* Payment method */}
//             <div className="w-full">
//               <p className="font-semibold mb-1">Payment Method</p>
//               <select
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 className="border-2 w-full p-2 rounded-md border-gray-300"
//               >
//                 <option value="">Select Method</option>
//                 <option value="POS">POS</option>
//                 <option value="Cash">Cash</option>
//                 <option value="Transfer">Transfer</option>
//               </select>
//             </div>
//           </div>
//         </section>

//         <section className="bg-white mt-10 p-4 rounded-md">
//           <div className="w-full overflow-x-auto rounded-lg border border-gray-100 pb-4">
//             <table className="min-w-[1200px] text-sm text-left text-gray-700 w-full">
//               <thead className="bg-gray-100 text-md font-semibold text-gray-700">
//                 <tr>
//                   <th className="px-4 py-3">Barcode</th>
//                   <th className="px-4 py-3">Product name</th>
//                   <th className="px-4 py-3">Amount</th>
//                   <th className="px-4 py-3">Quantity</th>
//                   <th className="px-4 py-3">Unit Cost</th>
//                   <th className="px-4 py-3">Old unit cost</th>
//                   <th className="px-4 py-3">% Selling price</th>
//                   <th className="px-4 py-3">Unit price</th>
//                   <th className="px-4 py-3">Action</th>
//                 </tr>
//               </thead>

//               <tbody className="bg-white divide-y divide-gray-200">
//                 {rows.map((row, index) => (
//                   <tr key={index} className="text-sm">
//                     <td className="px-4 py-2">
//                       <input
//                         type="text"
//                         value={row.barcode}
//                         onChange={(e) => handleBarcodeChange(e, index)}
//                         onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
//                         placeholder="Enter barcode + Enter"
//                         className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <input
//                         type="text"
//                         value={row.productName}
//                         disabled
//                         className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl text-gray-700"
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <input
//                         type="text"
//                         value={row.amount}
//                         disabled
//                         className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl text-gray-700"
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <input
//                         type="number"
//                         min="1"
//                         value={row.quantity}
//                         onChange={(e) => handleQtyChange(e, index)}
//                         className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <input
//                         type="number"
//                         value={row.unitCost}
//                         onChange={(e) => handleUnitCostChange(e, index)}
//                         placeholder="Enter unit cost"
//                         className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <input
//                         type="text"
//                         value={row.oldUnitCost}
//                         disabled
//                         className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl text-gray-700"
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <input
//                         type="number"
//                         value={row.sellingPercentage}
//                         onChange={(e) =>
//                           handleSellingPercentageChange(e, index)
//                         }
//                         disabled={!row.isEditing}
//                         className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${
//                           !row.isEditing ? "bg-neutral-100 text-gray-700" : ""
//                         }`}
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <input
//                         type="number"
//                         value={row.unitPrice}
//                         onChange={(e) => handleUnitPriceChange(e, index)}
//                         disabled={!row.isEditing}
//                         className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${
//                           !row.isEditing ? "bg-neutral-100 text-gray-700" : ""
//                         }`}
//                       />
//                     </td>
//                     <td className="px-4 py-2">
//                       <div className="flex items-center gap-2">
//                         <SquarePen
//                           size={18}
//                           className={`cursor-pointer ${
//                             row.isEditing
//                               ? "text-green-600 hover:text-green-800"
//                               : "text-blue-600 hover:text-blue-800"
//                           }`}
//                           onClick={() => toggleEdit(index)}
//                         />
//                         <Trash2
//                           size={18}
//                           className="cursor-pointer text-red-500 hover:text-red-400"
//                           onClick={() => handleDeleteRow(index)}
//                         />
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-6 flex justify-between items-center">
//             {/* Total Amount */}
//             <div className="bg-[#d9edff] py-4 pl-4 pr-20 rounded-lg">
//               <p className="text-[#1a71f6] text-sm">Total Amount</p>
//               <p className="text-2xl text-blue-500 font-semibold">
//                 ₦{calculateTotalAmount()}
//               </p>
//             </div>

//             <button
//               onClick={handleSave}
//               className="flex gap-2 items-center bg-blue-600 text-white py-3 font-semibold px-6 rounded-lg hover:bg-blue-700"
//             >
//               Save
//               <Save />
//             </button>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

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

  // Calculate total amount from all rows
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
        console.log("Lubricant data:", lubricant);

        setRows((prevRows) => {
          const newRows = [...prevRows];
          const unitCostValue = lubricant.unitCost || "0";
          const unitPriceValue = lubricant.sellingPrice || "0";
          const quantity = parseFloat(newRows[index].quantity) || 1;

          newRows[index] = {
            ...newRows[index],
            barcode: barcode,
            productName: lubricant.productName || "",
            unitCost: unitCostValue,
            oldUnitCost: unitCostValue,
            sellingPercentage: "0",
            unitPrice: unitPriceValue,
            amount: (parseFloat(unitPriceValue) * quantity).toFixed(2),
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

  // Handle quantity change
  const handleQtyChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].quantity = e.target.value;
    calculateAmount(index, newRows);
    setRows(newRows);
  };

  // Handle unit cost change
  const handleUnitCostChange = (e, index) => {
    const newRows = [...rows];
    const newUnitCost = e.target.value;

    newRows[index].unitCost = newUnitCost;

    // Set oldUnitCost same as unitCost by default
    if (!newRows[index].oldUnitCost || newRows[index].oldUnitCost === "0") {
      newRows[index].oldUnitCost = newUnitCost;
    }

    calculateAmount(index, newRows);
    setRows(newRows);
  };

  // Calculate amount (unitPrice × quantity)
  const calculateAmount = (index, rowsArray) => {
    const row = rowsArray[index];
    const unitPrice = parseFloat(row.unitPrice) || 0;
    const quantity = parseFloat(row.quantity) || 0;

    // Amount = unitPrice × quantity
    rowsArray[index].amount = (unitPrice * quantity).toFixed(2);

    // If selling percentage is being used, calculate unit price
    const percentage = parseFloat(row.sellingPercentage) || 0;
    const unitCost = parseFloat(row.unitCost) || 0;

    if (percentage > 0 && unitCost > 0) {
      const newUnitPrice = unitCost + (unitCost * percentage) / 100;
      rowsArray[index].unitPrice = newUnitPrice.toFixed(2);
      rowsArray[index].amount = (newUnitPrice * quantity).toFixed(2);
      // Update old unit cost when selling price changes
      rowsArray[index].oldUnitCost = unitCost.toFixed(2);
    }
  };

  // Handle selling percentage change
  const handleSellingPercentageChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].sellingPercentage = e.target.value;
    if (newRows[index].unitCost) {
      calculateAmount(index, newRows);
    }
    setRows(newRows);
  };

  // Handle unit price change
  const handleUnitPriceChange = (e, index) => {
    const newRows = [...rows];
    const newUnitPrice = e.target.value;
    newRows[index].unitPrice = newUnitPrice;

    // Recalculate amount when unit price changes
    const quantity = parseFloat(newRows[index].quantity) || 0;
    newRows[index].amount = (parseFloat(newUnitPrice) * quantity).toFixed(2);

    // Update old unit cost when unit price is manually changed
    if (newRows[index].unitCost) {
      newRows[index].oldUnitCost = newRows[index].unitCost;
    }

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
      const unitPriceValue = lubricant.sellingPrice || "0";
      const quantity = parseFloat(newRows[targetIndex].quantity) || 1;

      newRows[targetIndex] = {
        ...newRows[targetIndex],
        barcode: lubricant.barcode || "",
        productName: lubricant.productName || "",
        unitCost: unitCostValue,
        oldUnitCost: unitCostValue,
        sellingPercentage: "0",
        unitPrice: unitPriceValue,
        amount: (parseFloat(unitPriceValue) * quantity).toFixed(2),
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
      (row) => row.lubricantId && row.unitCost && row.quantity
    );

    if (validRows.length === 0) {
      alert("Please add at least one valid lubricant purchase");
      return;
    }

  

    const purchaseData = {
      supplier,
      invoiceNo,
      paymentMethod,
      purchaseDate: formattedDate, // <-- rename key
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
          setMessage(""); // clear message
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
                        type="text"
                        value={row.amount}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl text-gray-700"
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
                        onChange={(e) => handleUnitCostChange(e, index)}
                        placeholder="Enter unit cost"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
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

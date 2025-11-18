// "use client";

// import { Calendar, Save, Search, X, Edit2, Trash2 } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useLubricantStore } from "@/store/lubricantStore";

// export default function LubricantStockModal({ onClose }) {
//   const d = new Date();
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   const formattedDate = `${day}/${month}/${year}`;

//   const { getLubricantByBarcode, searchLubricants } = useLubricantStore();

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
//       isEditing: false, // controls editing of percentage & unit price
//     },
//   ]);

//   const [supplier, setSupplier] = useState("");
//   const [invoiceNo, setInvoiceNo] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [message, setMessage] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSearchDropdown, setShowSearchDropdown] = useState(false);

//   useEffect(() => {
//     if (message) {
//       const timer = setTimeout(() => setMessage(""), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   const handleBarcodeChange = (e, index) => {
//     const newRows = [...rows];
//     newRows[index].barcode = e.target.value;
//     setRows(newRows);
//   };

//   const handleBarcodeKeyPress = async (e, index) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       await fetchLubricantByBarcode(index);
//     }
//   };

//   const fetchLubricantByBarcode = async (index) => {
//     const barcode = rows[index].barcode.trim();
//     if (!barcode) return;

//     try {
//       const response = await getLubricantByBarcode(barcode);

//        if (response.error) {
//     setMessage(`❌ ${response.error}`); // <-- display backend error
//     return;
//   }

//       if (response && response.data) {
//         const lubricant = response.data;
//         const newRows = [...rows];

//         newRows[index] = {
//           ...newRows[index],
//           productName: lubricant.productName || "",
//           unitCost: lubricant.unitPrice || "0",
//           oldUnitCost: lubricant.unitPrice || "0",
//           sellingPercentage: lubricant.sellingPercentage || "0",
//           unitPrice: lubricant.sellingPrice || "0",
//           lubricantId: lubricant.id,
//           isEditing: false,
//         };

//         const qty = parseFloat(newRows[index].quantity) || 1;
//         const uc = parseFloat(newRows[index].unitCost) || 0;
//         newRows[index].amount = (uc * qty).toFixed(2);

//         setRows([
//           ...newRows,
//           {
//             barcode: "",
//             productName: "",
//             unitCost: "",
//             quantity: "1",
//             amount: "",
//             oldUnitCost: "",
//             sellingPercentage: "",
//             unitPrice: "",
//             lubricantId: null,
//             isEditing: false,
//           },
//         ]);
//       } else {
//         setMessage("Lubricant not found with this barcode");
//       }
//     } catch (err) {
//       setMessage("Failed to fetch lubricant: " + err.message);
//     }
//   };

//   const handleQtyChange = (e, index) => {
//     const newRows = [...rows];
//     newRows[index].quantity = e.target.value;

//     const qty = parseFloat(newRows[index].quantity) || 1;
//     const uc = parseFloat(newRows[index].unitCost) || 0;
//     newRows[index].amount = (uc * qty).toFixed(2);

//     setRows(newRows);
//   };

//   const handleSellingPercentageChange = (e, index) => {
//     const newRows = [...rows];
//     newRows[index].sellingPercentage = e.target.value;

//     const uc = parseFloat(newRows[index].unitCost) || 0;
//     const percentage = parseFloat(e.target.value) || 0;
//     newRows[index].unitPrice = (uc + (uc * percentage) / 100).toFixed(2);

//     setRows(newRows);
//   };

//   const handleUnitPriceChange = (e, index) => {
//     const newRows = [...rows];
//     newRows[index].unitPrice = e.target.value;
//     setRows(newRows);
//   };

//   const toggleEdit = (index) => {
//     const newRows = [...rows];
//     newRows[index].isEditing = !newRows[index].isEditing;
//     setRows(newRows);
//   };

//   const handleDeleteRow = (index) => {
//     if (rows.length === 1) return;
//     const newRows = rows.filter((_, i) => i !== index);
//     setRows(newRows);
//   };

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

//   const selectProductFromSearch = (lubricant) => {
//     // Find first row that does NOT have a barcode yet
//     let index = rows.findIndex((row) => !row.barcode);
//     if (index === -1) index = rows.length - 1; // if all rows filled, append at the end

//     const newRows = [...rows];
//     newRows[index] = {
//       ...newRows[index],
//       barcode: lubricant.barcode || "",
//       productName: lubricant.productName || "",
//       unitCost: lubricant.unitPrice || "0",
//       oldUnitCost: lubricant.unitPrice || "0",
//       sellingPercentage: lubricant.sellingPercentage || "0",
//       unitPrice: lubricant.sellingPrice || "0",
//       lubricantId: lubricant.id,
//       isEditing: false,
//     };

//     const qty = parseFloat(newRows[index].quantity) || 1;
//     const uc = parseFloat(newRows[index].unitCost) || 0;
//     newRows[index].amount = (uc * qty).toFixed(2);

//     // Only add a new empty row if the last row is already filled
//     if (rows[rows.length - 1].barcode) {
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
//     }

//     setRows(newRows);
//     setSearchTerm("");
//     setShowSearchDropdown(false);
//   };

//   const handleSave = () => {
//     if (!supplier || !invoiceNo || !paymentMethod) {
//       setMessage("Fill supplier, invoice number, and payment method");
//       return;
//     }

//     const validRows = rows.filter((row) => row.lubricantId);

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
//         quantity: parseFloat(row.quantity),
//         oldUnitCost: parseFloat(row.oldUnitCost),
//         sellingPercentage: parseFloat(row.sellingPercentage),
//         sellingPrice: parseFloat(row.unitPrice),
//       })),
//     };

//     console.log("Purchase to save", purchaseData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <div className="bg-[#f6f6f6] p-6 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
//         {/* HEADER */}
//         <section className="flex flex-col lg:flex-row gap-8 relative items-center">
//           <div className="w-3/8">
//             <h3 className="text-2xl mb-2 font-semibold">
//               Add Lubricant Stock Purchase
//             </h3>
//             <p>Record purchased lubricants in your station</p>
//           </div>

//           <div className="relative w-3/8">
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={handleSearch}
//               className="border-2 w-full border-gray-300 rounded-md p-2"
//               placeholder="Search product name"
//             />
//             <Search className="text-gray-300 absolute top-3 right-3" />
//             {showSearchDropdown && searchResults.length > 0 && (
//               <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
//                 {searchResults.map((lub) => (
//                   <div
//                     key={lub._id}
//                     onClick={() => selectProductFromSearch(lub)}
//                     className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
//                   >
//                     <p className="font-semibold">{lub.productName}</p>
//                     {/* <p className="text-sm text-gray-600">
//                       Barcode: {lub.barcode}
//                     </p> */}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="absolute right-0 top-0 cursor-pointer">
//             <X onClick={onClose} />
//           </div>
//         </section>

//         {/* DATE + INPUTS */}
//         <section className="mt-10 bg-white p-3 rounded-lg">
//           <div className="flex mb-8 items-center gap-1">
//             <Calendar className="text-purple-600" />
//             <p className="text-purple-600 text-sm font-semibold">
//               {formattedDate}
//             </p>
//           </div>

//           <div className="flex flex-col lg:flex-row gap-3">
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

//             <div className="w-full">
//               <p className="font-semibold mb-1">Invoice No.</p>
//               <input
//                 type="text"
//                 value={invoiceNo}
//                 onChange={(e) => setInvoiceNo(e.target.value)}
//                 className="border-2 w-full p-2 rounded-md border-gray-300"
//               />
//             </div>

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

//         {/* TABLE */}
//         <section className="bg-white mt-10 p-4 rounded-md">
//           {message && (
//             <div
//               className={`p-3 rounded-lg text-sm font-semibold mb-4 ${
//                 message.startsWith("✅")
//                   ? "bg-green-100 text-green-700 border border-green-300"
//                   : "bg-red-100 text-red-700 border border-red-300"
//               }`}
//             >
//               {message}
//             </div>
//           )}

//           <div className="w-full overflow-x-auto rounded-lg border border-gray-100 pb-4">
//             <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-md">
//               <thead className="bg-gray-100 text-md font-semibold text-gray-700">
//                 <tr>
//                   <th className="px-4 py-3">Barcode</th>
//                   <th className="px-4 py-3">Product Name</th>
//                   <th className="px-4 py-3">Amount</th>
//                   <th className="px-4 py-3">Quantity</th>
//                   <th className="px-4 py-3">Unit Cost</th>
//                   <th className="px-4 py-3">Old Unit Cost</th>
//                   <th className="px-4 py-3">% Selling Price</th>
//                   <th className="px-4 py-3">Unit Price</th>
//                   <th className="px-4 py-3">Action</th>
//                 </tr>
//               </thead>

//               <tbody>
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
//                         className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl"
//                       />
//                     </td>

//                     <td className="px-4 py-2">
//                       <input
//                         type="number"
//                         value={row.amount}
//                         onChange={() => {}}
//                         placeholder="Amount"
//                         className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
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
//                         type="text"
//                         value={row.unitCost}
//                         disabled
//                         className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl"
//                       />
//                     </td>

//                     <td className="px-4 py-2">
//                       <input
//                         type="text"
//                         value={row.oldUnitCost}
//                         disabled
//                         className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl"
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
//                           !row.isEditing ? "bg-neutral-100" : ""
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
//                           !row.isEditing ? "bg-neutral-100" : ""
//                         }`}
//                       />
//                     </td>

//                     <td className="px-4 py-2">
//                       <div className="flex items-center gap-4">
//                         <Edit2
//                           size={18}
//                           className="text-blue-600 cursor-pointer hover:text-blue-800"
//                           onClick={() => toggleEdit(index)}
//                         />
//                         <Trash2
//                           size={18}
//                           className="text-red-500 cursor-pointer hover:text-red-400"
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
//             <div className="bg-[#d9edff] py-4 pl-4 pr-30 rounded-lg">
//                 <p className="text-[#1a71f6] text-sm">Total Amount</p>
//                 <p className="text-2xl text-blue-500 font-semibold">amount</p>
//             </div>

//             <button
//               onClick={handleSave}
//               className="flex gap-2 items-center bg-blue-600 text-white py-3 font-semibold px-6 rounded-lg hover:bg-blue-700"
//             >
//               Save <Save />
//             </button>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

"use client";

import { Calendar, Save, Search, X, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLubricantStore } from "@/store/lubricantStore"; // Adjust path as needed

export default function LubricantStockModal({ onClose }) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const { getLubricantByBarcode, searchLubricants, loading } =
    useLubricantStore();

  // Test if store is working
  useEffect(() => {
    console.log("Store functions:", {
      getLubricantByBarcode,
      searchLubricants,
    });
  }, []);

  const [rows, setRows] = useState([
    {
      barcode: "",
      productName: "",
      unitCost: "", // Cost per item from supplier
      quantity: "1",
      amount: "", // Calculated: unitCost × quantity
      oldUnitCost: "", // Previous unit cost from database
      sellingPercentage: "", // % markup
      unitPrice: "", // Selling price
      lubricantId: null,
      isEditingPercentage: false,
      isEditingUnitPrice: false,
    },
  ]);

  const [supplier, setSupplier] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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
      console.log("Enter key pressed for index:", index); // Debug
      console.log("Barcode value:", rows[index].barcode); // Debug
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

      console.log("Response:", response);

      if (response && response.data) {
        const lubricant = response.data;
        console.log("Lubricant data:", lubricant);

        const newRows = [...rows];
        newRows[index] = {
          ...newRows[index],
          productName: lubricant.productName || "",
          oldUnitCost: lubricant.unitCost || "0",
          sellingPercentage: "0", // Cashier will set this
          unitPrice: lubricant.sellingPrice || "0",
          lubricantId: lubricant._id,
          unitCost: "", // Cashier will fill this
        };
        setRows(newRows);
      } else {
        console.log("No data in response");
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
    // Recalculate amount (unitCost × qty)
    calculateAmount(index, newRows);
    setRows(newRows);
  };

  // Handle unit cost change
  const handleUnitCostChange = (e, index) => {
    const newRows = [...rows];
    newRows[index].unitCost = e.target.value;
    calculateAmount(index, newRows);
    setRows(newRows);
  };

  // Calculate amount and selling price
  const calculateAmount = (index, rowsArray) => {
    const row = rowsArray[index];
    const unitCost = parseFloat(row.unitCost) || 0;
    const quantity = parseFloat(row.quantity) || 0;

    // Amount = unitCost × quantity
    rowsArray[index].amount = (unitCost * quantity).toFixed(2);

    // Calculate selling price based on percentage
    const percentage = parseFloat(row.sellingPercentage) || 0;
    const sellingPrice = unitCost + (unitCost * percentage) / 100;
    rowsArray[index].unitPrice = sellingPrice.toFixed(2);
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
    newRows[index].unitPrice = e.target.value;
    setRows(newRows);
  };

  // Toggle edit mode for percentage
  const toggleEditPercentage = (index) => {
    const newRows = [...rows];
    newRows[index].isEditingPercentage = !newRows[index].isEditingPercentage;
    setRows(newRows);
  };

  // Toggle edit mode for unit price
  const toggleEditUnitPrice = (index) => {
    const newRows = [...rows];
    newRows[index].isEditingUnitPrice = !newRows[index].isEditingUnitPrice;
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

  // Add new row
  const addNewRow = () => {
    setRows([
      ...rows,
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
        isEditingPercentage: false,
        isEditingUnitPrice: false,
      },
    ]);
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
    // Find first empty row or add new row
    let targetIndex = rows.findIndex((row) => !row.lubricantId);
    if (targetIndex === -1) {
      addNewRow();
      targetIndex = rows.length;
    }

    const newRows = [...rows];
    newRows[targetIndex] = {
      ...newRows[targetIndex],
      barcode: lubricant.barcode || "",
      productName: lubricant.productName || "",
      oldUnitCost: lubricant.unitPrice || "0",
      sellingPercentage: lubricant.sellingPercentage || "0",
      unitPrice: lubricant.sellingPrice || "0",
      lubricantId: lubricant.id,
      amount: "",
    };
    setRows(newRows);
    setSearchTerm("");
    setShowSearchDropdown(false);
  };

  // Handle save (placeholder for now)
  const handleSave = () => {
    // Validate
    if (!supplier || !invoiceNo || !paymentMethod) {
      alert("Please fill in supplier, invoice number, and payment method");
      return;
    }

    const validRows = rows.filter(
      (row) => row.lubricantId && row.unitCost && row.quantity
    );
    if (validRows.length === 0) {
      alert("Please add at least one valid lubricant purchase");
      return;
    }

    // Prepare data for API
    const purchaseData = {
      supplier,
      invoiceNo,
      paymentMethod,
      date: formattedDate,
      items: validRows.map((row) => ({
        lubricantId: row.lubricantId,
        barcode: row.barcode,
        productName: row.productName,
        unitCost: parseFloat(row.unitCost),
        quantity: parseInt(row.quantity),
        amount: parseFloat(row.amount),
        oldUnitCost: parseFloat(row.oldUnitCost),
        sellingPercentage: parseFloat(row.sellingPercentage),
        sellingPrice: parseFloat(row.unitPrice),
      })),
    };

    console.log("Purchase data to save:", purchaseData);
    alert("Save functionality will be implemented with API endpoint");
    // TODO: Call API to save purchase
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
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="border-2 w-full p-2 rounded-md border-gray-300"
              >
                <option value="">Select Supplier</option>
                <option value="AA Rano">AA Rano</option>
                <option value="Conoil">Conoil</option>
              </select>
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
                        className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.amount}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl"
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
                        className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 rounded-xl"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={row.sellingPercentage}
                          onChange={(e) =>
                            handleSellingPercentageChange(e, index)
                          }
                          disabled={!row.isEditingPercentage}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${
                            !row.isEditingPercentage ? "bg-neutral-100" : ""
                          }`}
                        />
                        <Edit2
                          size={16}
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                          onClick={() => toggleEditPercentage(index)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={row.unitPrice}
                          onChange={(e) => handleUnitPriceChange(e, index)}
                          disabled={!row.isEditingUnitPrice}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-xl ${
                            !row.isEditingUnitPrice ? "bg-neutral-100" : ""
                          }`}
                        />
                        <Edit2
                          size={16}
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                          onClick={() => toggleEditUnitPrice(index)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div
                        onClick={() => handleDeleteRow(index)}
                        className="flex items-center gap-1 text-red-500 font-semibold cursor-pointer hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center">
           {/* Total Amount */}
             <div className="bg-[#d9edff] py-4 pl-4 pr-30 rounded-lg">
                 <p className="text-[#1a71f6] text-sm">Total Amount</p>
                 <p className="text-2xl text-blue-500 font-semibold">amount</p>
             </div>

            <button
              onClick={handleSave}
              className="flex gap-2 items-center bg-blue-600 text-white py-3 font-semibold px-6 rounded-lg hover:bg-blue-700"
            >
              Save
              <Save />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// import React, { useState } from "react";

// const initialRow = ["", "", "", "", "", ""];

// const DynamicSalesTable = () => {
//   const [rows, setRows] = useState([initialRow]);
//   const [total, setTotal] = useState(0);

//   const handleChange = (value, rowIndex, colIndex) => {
//     const updatedRows = [...rows];
//     updatedRows[rowIndex][colIndex] = value;

//     // If barcode is filled and it's the last row, add a new row
//     if (colIndex === 0 && value.trim() !== "" && rowIndex === rows.length - 1) {
//       updatedRows.push([...initialRow]);
//     }

//     // Dummy product fetch logic
//     if (colIndex === 0 && value.trim() !== "") {
//       const dummyProduct = {
//         "1100": ["Engine Oil (5L)", "8000"],
//         "1200": ["Brake Fluid", "1000"],
//         "1300": ["Car Battery", "10000"],
//         "1400": ["Spark Plug", "200"],
//       };
//       const product = dummyProduct[value.trim()];
//       if (product) {
//         updatedRows[rowIndex][1] = product[0]; // Product Name
//         updatedRows[rowIndex][2] = product[1]; // Unit Price
//         updatedRows[rowIndex][3] = "1";         // Default Quantity
//       }
//     }

//     // Auto-calculate amount if unit price and quantity are filled
//     const unitPrice = parseFloat(updatedRows[rowIndex][2]);
//     const quantity = parseFloat(updatedRows[rowIndex][3]);

//     if (!isNaN(unitPrice) && !isNaN(quantity)) {
//       const amount = unitPrice * quantity;
//       updatedRows[rowIndex][4] = amount.toLocaleString();
//     }

//     // Update state
//     setRows(updatedRows);

//     // Update total
//     const newTotal = updatedRows.reduce((acc, row) => {
//       const amt = parseFloat(row[4].replace(/,/g, ""));
//       return acc + (isNaN(amt) ? 0 : amt);
//     }, 0);
//     setTotal(newTotal);
//   };

//   const handleDelete = (rowIndex) => {
//     let updatedRows = [...rows];
//     if (updatedRows.length === 1) {
//       updatedRows = [initialRow];
//     } else {
//       updatedRows.splice(rowIndex, 1);
//     }
//     setRows(updatedRows);

//     const newTotal = updatedRows.reduce((acc, row) => {
//       const amt = parseFloat(row[4].replace(/,/g, ""));
//       return acc + (isNaN(amt) ? 0 : amt);
//     }, 0);
//     setTotal(newTotal);
//   };

//   return (
//     <div className="w-full p-4">
//       <div className="overflow-x-auto rounded-lg border border-gray-200">
//         <table className="min-w-full text-sm text-left text-gray-700">
//           <thead className="bg-gray-100 text-md font-semibold text-gray-600">
//             <tr>
//               <th className="px-4 py-3">Barcode</th>
//               <th className="px-4 py-3">Product name</th>
//               <th className="px-4 py-3">Unit price (naira)</th>
//               <th className="px-4 py-3">Quantity</th>
//               <th className="px-4 py-3">Amount</th>
//               <th className="px-4 py-3">Action</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-100">
//             {rows.map((row, rowIndex) => (
//               <tr key={rowIndex} className="hover:bg-gray-50">
//                 {row.map((cell, colIndex) => (
//                   <td key={colIndex} className="px-4 py-2">
//                     {colIndex !== 4 && colIndex !== 5 ? (
//                       <input
//                         type={colIndex === 2 || colIndex === 3 ? "number" : "text"}
//                         className="w-full border rounded px-2 py-1"
//                         value={cell}
//                         onChange={(e) => handleChange(e.target.value, rowIndex, colIndex)}
//                       />
//                     ) : colIndex === 4 ? (
//                       <span>{cell}</span>
//                     ) : (
//                       <button
//                         className="text-red-500 underline"
//                         onClick={() => handleDelete(rowIndex)}
//                       >
//                         Delete
//                       </button>
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-4 text-right font-bold text-lg">
//         Total: ₦{total.toLocaleString()}
//       </div>
//     </div>
//   );
// };

// export default DynamicSalesTable;

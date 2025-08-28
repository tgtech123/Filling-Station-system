// components/Table.jsx
import { Check, CheckCheck, TriangleAlert } from "lucide-react";
import React from "react";

const Table = ({
  columns = [],
  data = [],
  renderActions,
  highlightedColumnIndex,
}) => {
  return (
    <div className="overflow-x-auto w-full rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-md font-semibold text-gray-600">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-400"
              >
                No matching records found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => {
                  // Check if this is the Status column (last column)
                  if (cellIndex === row.length - 1) {
                    const cellString = cell.toString().toLowerCase();
                    const isMatched = cellString === "matched";
                    return (
                      <td key={cellIndex} className="px-4 py-5 whitespace-nowrap">
                        <span
                          className={`p-2 flex gap-1 items-center justify-center rounded-[10px]  text-xs font-medium ${
                            isMatched ? "bg-[#dcd2ff] text-[#7f27ff]" : "bg-[#ffdcdc] text-[#f00]"
                          }`}
                        >
                          {cell}{isMatched ? <Check size={18} /> : <TriangleAlert size={18} />}
                        </span>
                      </td>
                    );
                  }
                  
                  // Check if this is the discrepancies column (second to last)
                  if (cellIndex === row.length - 2) {
                    const value = parseFloat(cell.toString().replace(/[^-\d.]/g, ''));
                    let textColor = "text-gray-500"; // default for 0
                    
                    if (value > 0) {
                      textColor = "text-green-600";
                    } else if (value < 0) {
                      textColor = "text-red-600";
                    }
                    
                    return (
                      <td
                        key={cellIndex}
                        className={`px-4 py-5 whitespace-nowrap font-semibold ${textColor}`}
                      >
                        {cell}
                      </td>
                    );
                  }
                  
                  return (
                    <td key={cellIndex} className="px-4 py-5 whitespace-nowrap">
                      {cell}
                    </td>
                  );
                })}
                {renderActions && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
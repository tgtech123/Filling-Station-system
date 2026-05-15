// components/Table.jsx
import React from "react";

const Table = ({
  columns = [],
  data = [],
  renderActions,
  highlightedColumnIndex,
  highlightedRowIndices = [],
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
            data.map((row, rowIndex) => {
              const isHighlighted = highlightedRowIndices.includes(rowIndex);

              return (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 ${
                    isHighlighted ? "font-bold bg-white" : ""
                  }`}
                >
                  {row.map((cell, cellIndex) => {
                    const cellText = String(cell).trim();

                    // Apply sign-based colour to ANY cell, not just the last column.
                    // "-₦50,000.00" starts with "-" → red
                    // "+2.50%"       starts with "+" → green
                    // "₦50,000.00"   no sign       → default
                    let colorClass = "";
                    if (cellText.startsWith("-")) colorClass = "text-red-600";
                    else if (cellText.startsWith("+")) colorClass = "text-green-600";

                    return (
                      <td
                        key={cellIndex}
                        className={`px-4 py-5 whitespace-nowrap ${
                          cellIndex === highlightedColumnIndex ? "text-red-500" : ""
                        } ${colorClass}`}
                      >
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

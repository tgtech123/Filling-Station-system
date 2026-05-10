// components/Table.jsx
import React from "react";

const Table = ({
  columns = [],
  data = [],
  renderActions,
  highlightedColumnIndex,
}) => {
  return (
    <div className="overflow-x-auto w-full rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-700 text-md font-semibold text-gray-600 dark:text-gray-300">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-400 dark:text-gray-500"
              >
                No matching records found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {row.map((cell, cellIndex) => {
                  // Check if this is the Profit/Loss column (last column)
                  if (cellIndex === row.length - 1 ) {
                    const isNegative = cell.toString().trim().startsWith("-");
                    return (
                      <td
                        key={cellIndex}
                        className={`px-4 py-5 whitespace-nowrap font-semibold ${
                          cellIndex === highlightedColumnIndex
                            ? "text-red-500"
                            : ""
                        } 
                        ${isNegative ? "text-red-600" : "text-green-600"}
                        `}
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


import React from "react";

const TableWithoutBorder = ({ columns = [], data = [] }) => {
  return (
    <div className="overflow-x-auto w-full rounded-xl">
      <table className="min-w-full text-sm text-left border-[1px]  border-neutral-50 text-gray-700">
        {/* Table Header */}
        <thead className="text-md font-semibold text-gray-600">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 bg-neutral-100 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-400"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 py-5">
                {row.map((cell, cellIndex) => {
                  // Status column (last column)
                  if (cellIndex === row.length - 1) {
                    const isApproved = cell.toLowerCase().includes("approved");
                    return (
                      <td
                        key={cellIndex}
                        className={`px-3 py-2 whitespace-nowrap flex rounded-lg ${
                          isApproved
                            ? "bg-[#B2FFB4] text-[#04901C] font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {cell}
                      </td>
                    );
                  }

                  return (
                    <td key={cellIndex} className="px-4 py-4 whitespace-nowrap">
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableWithoutBorder;

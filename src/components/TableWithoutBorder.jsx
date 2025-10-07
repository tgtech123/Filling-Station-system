"use client";
import React, { useState } from "react";
import StatusModal from "./StatusModal ";

const TableWithoutBorder = ({ columns = [], data = [], enableStatus = false }) => {
  // If enableStatus is true → replace last column with "Pending"
  const [tableData, setTableData] = useState(
    data.map((row) => {
      if (!enableStatus) return row;
      const updatedRow = [...row];
      updatedRow[updatedRow.length - 1] = "Pending";
      return updatedRow;
    })
  );

  const [selectedRow, setSelectedRow] = useState(null);

  const updateStatus = (row, status) => {
    const rowIndex = tableData.indexOf(row);
    if (rowIndex !== -1) {
      const newData = [...tableData];
      newData[rowIndex][newData[rowIndex].length - 1] = status;
      setTableData(newData);
    }
    setSelectedRow(null); // close modal
  };

  return (
    <div className="max-w-full overflow-x-auto rounded-xl">
      <table className="min-w-full rounded-t-2xl text-sm text-left border-[1px] border-neutral-50 text-gray-700">
        {/* Table Header */}
        <thead className="text-md font-semibold text-gray-600">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-3 bg-neutral-100 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-400"
              >
                No records found.
              </td>
            </tr>
          ) : (
            tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 py-5">
                {row.map((cell, cellIndex) => {
                  const isLastCol = cellIndex === row.length - 1;

                  if (isLastCol) {
                    const status = cell?.toString().toLowerCase();
                    const isApproved = status.includes("approved");
                    const isRejected = status.includes("rejected");
                    const isPending = status.includes("pending");
                    const isSuccess = status.includes("success");
                    const isFailed = status.includes("failed");

                    return (
                      <td
                        key={cellIndex}
                        className={`px-3 py-2 whitespace-nowrap flex rounded-lg cursor-pointer ${
                          isApproved || isSuccess
                            ? "bg-[#B2FFB4] text-[#04901C] font-semibold"
                            : isRejected || isFailed
                            ? "bg-red-50 text-red-600 font-semibold"
                            : isPending
                            ? "bg-yellow-50 text-yellow-600 font-semibold"
                            : ""
                        }`}
                        onClick={() =>
                          enableStatus && isPending && setSelectedRow(row)
                        } // only open modal if enableStatus is true
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

      {/* Modal (if row is selected) */}
      {selectedRow !== null && (
        <StatusModal
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          onApprove={() => updateStatus(selectedRow, "Approved ✓")}
          onReject={() => updateStatus(selectedRow, "Rejected")}
        />
      )}
    </div>
  );
};

export default TableWithoutBorder;

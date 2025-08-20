// components/Table.js
  'use client'
import React, { useState } from "react";

const Table = ({ columns, data }) => {
  const [rows, setRows] = useState(data);

  // toggle isPaid value
  const handleToggle = (index) => {
    const updated = [...rows];
    updated[index].isPaid = !updated[index].isPaid;
    setRows(updated);
  };

  return (
    <div className="overflow-x-auto rounded-tl-xl mt-3">
      <table className="min-w-full border border-neutral-200 rounded-xl">
        <thead className="bg-neutral-100 text-left">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-4 text-sm font-semibold text-neutral-700 border-b"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-neutral-50">
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="px-3 py-4 text-sm text-neutral-600 border-b-[1px] border-gray-100"
                >
                  {/* Special rendering for action column */}
                  {col.accessor === "isPaid" ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={` mt-2 ${
                          row.isPaid ? "text-neutral-600 font-medium text-md bottom-2 " : "text-neutral-600 font-medium text-md"
                        }`}
                      >
                        {row.isPaid ? "Paid" : "Pay"}
                        <input
                          type="checkbox"
                          checked={row.isPaid}
                          onChange={() => handleToggle(rowIndex)}
                          className="cursor-pointer ml-2 top-[-10px] w-4 h-4  "
                        />
                      </span>
                    </div>
                  ) : (
                    row[col.accessor]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

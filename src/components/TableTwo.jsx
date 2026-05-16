'use client'
import React from "react";
import { CheckCircle2 } from "lucide-react";

const TableTwo = ({ columns, data, onMarkPaid, markingPaid }) => {
  return (
    <div className="overflow-x-auto rounded-xl mt-3">
      <table className="min-w-full border border-neutral-200 rounded-xl">
        <thead className="bg-neutral-100 text-left">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-3.5 text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-neutral-50 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="px-4 py-3.5 text-sm text-neutral-600 border-b border-gray-100"
                >
                  {col.accessor === "isPaid" ? (
                    row.isPaid ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        <CheckCircle2 size={12} />
                        Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => onMarkPaid && onMarkPaid(row._id, row.staffName)}
                        disabled={markingPaid}
                        className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {markingPaid ? "Saving…" : "Mark as Paid"}
                      </button>
                    )
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

export default TableTwo;

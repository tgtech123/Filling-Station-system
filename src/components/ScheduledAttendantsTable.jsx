"use client";
import React from "react";

const ScheduledAttendantsTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-hidden rounded-2xl border border-gray-100 mt-4">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead>
          <tr className="bg-gray-50 text-gray-500 font-semibold">
            {columns.map((col, index) => (
              <th key={index} className="px-3 py-3 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-400"
              >
                No attendants scheduled.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="text-[0.875rem] hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 whitespace-nowrap">
                    {typeof cell === "object" && cell.status ? (
                      <span
                        className={`flex items-start gap-2 ${
                          cell.status === "active"
                            ? "text-green-600"
                            : cell.status === "inactive"
                            ? "text-neutral-800"
                            : "text-red-500"
                        }`}
                      >
                        {/* Status dot */}
                        <span
                          className={`h-2.5 w-2.5 mt-1 rounded-full flex-shrink-0 ${
                            cell.status === "active"
                              ? "bg-green-500"
                              : cell.status === "inactive"
                              ? "bg-neutral-200"
                              : "bg-red-500"
                          }`}
                        ></span>

                        {/* Split name vertically */}
                        <span className="flex flex-col leading-tight">
                          {cell.name.split(" ").map((part, index) => (
                            <span
                              key={index}
                              className={index === 0 ? "medium" : ""}
                            >
                              {part}
                            </span>
                          ))}
                        </span>
                      </span>
                    ) : (
                      <span>{cell}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduledAttendantsTable;

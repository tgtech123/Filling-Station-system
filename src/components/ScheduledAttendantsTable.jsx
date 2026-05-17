"use client";
import React from "react";

// Status dot + coloured name
function AttendantCell({ cell }) {
  const colorMap = {
    active:   { text: "text-green-600",  dot: "bg-green-500"   },
    inactive: { text: "text-neutral-500", dot: "bg-neutral-300" },
    closed:   { text: "text-red-500",    dot: "bg-red-500"      },
  };
  const { text, dot } = colorMap[cell.status] ?? colorMap.inactive;

  return (
    <span className={`flex items-center gap-1.5 ${text}`}>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dot}`} />
      <span className="font-medium text-sm leading-tight">{cell.name}</span>
    </span>
  );
}

function renderCell(cell) {
  if (typeof cell === "object" && cell !== null && "status" in cell) {
    return <AttendantCell cell={cell} />;
  }
  return <span className="text-sm text-gray-700">{cell ?? "—"}</span>;
}

const ScheduledAttendantsTable = ({ columns = [], data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm mt-3">
        No attendants scheduled.
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* ── Mobile card list (< sm) ───────────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {data.map((row, i) => (
          <div
            key={i}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-2"
          >
            {columns.map((col, j) => {
              const cell = row[j];
              if (cell === undefined || cell === null) return null;
              return (
                <div key={j} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                    {col}
                  </span>
                  <span className="text-right">{renderCell(cell)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Desktop table (sm+) ──────────────────────────────────── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-semibold">
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-3 whitespace-nowrap text-xs uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 whitespace-nowrap">
                    {renderCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduledAttendantsTable;
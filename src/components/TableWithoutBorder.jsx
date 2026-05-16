"use client";
import React, { useState } from "react";
import StatusModal from "./StatusModal ";

// ── Status helpers ────────────────────────────────────────────────────────────
function statusMeta(cell) {
  const s = String(cell ?? "").toLowerCase();
  if (s.includes("approved") || s.includes("success"))
    return { bg: "bg-green-100 text-green-700",  dot: "bg-green-500"  };
  if (s.includes("rejected") || s.includes("failed"))
    return { bg: "bg-red-50 text-red-600",       dot: "bg-red-500"    };
  if (s.includes("pending"))
    return { bg: "bg-yellow-50 text-yellow-600", dot: "bg-yellow-400" };
  return { bg: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
}

// ── Component ─────────────────────────────────────────────────────────────────
const TableWithoutBorder = ({
  columns = [],
  data = [],
  dataWithIds = [],
  enableStatus = false,
  onApprove,
  onReject,
}) => {
  const [selectedRow, setSelectedRow]         = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const handleApprove = () => {
    if (selectedRow !== null && selectedRowIndex !== null && onApprove) {
      onApprove(dataWithIds[selectedRowIndex]);
    }
    setSelectedRow(null);
    setSelectedRowIndex(null);
  };

  const handleReject = () => {
    if (selectedRow !== null && selectedRowIndex !== null && onReject) {
      onReject(dataWithIds[selectedRowIndex]);
    }
    setSelectedRow(null);
    setSelectedRowIndex(null);
  };

  const openModal = (row, rowIndex) => {
    const status = String(row[row.length - 1] ?? "").toLowerCase();
    if (enableStatus && status.includes("pending")) {
      setSelectedRow(row);
      setSelectedRowIndex(rowIndex);
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No records found.
      </div>
    );
  }

  // Last column index — holds the status value
  const lastIdx = columns.length - 1;

  return (
    <>
      {/* ── Mobile card list (hidden on sm+) ─────────────────────── */}
      <div className="sm:hidden space-y-3">
        {data.map((row, rowIndex) => {
          const statusCell = row[lastIdx];
          const meta       = statusMeta(statusCell);
          const isPending  = String(statusCell ?? "").toLowerCase().includes("pending");

          return (
            <div
              key={rowIndex}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
            >
              {/* Top row: EXP_ID + Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-semibold text-blue-600">
                  {row[1] ?? "—"}
                </span>
                <button
                  onClick={() => openModal(row, rowIndex)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${meta.bg} ${isPending && enableStatus ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {statusCell}
                </button>
              </div>

              {/* Category pill */}
              {row[2] && (
                <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 mb-2">
                  {row[2]}
                </span>
              )}

              {/* Description */}
              {row[3] && (
                <p className="text-sm text-gray-700 mb-2 leading-snug">{row[3]}</p>
              )}

              {/* Amount */}
              {row[4] && (
                <p className="text-base font-bold text-gray-900 mb-1">{row[4]}</p>
              )}

              {/* Footer: Submitted by + Date */}
              <div className="flex items-center justify-between gap-2 mt-1.5 pt-2 border-t border-gray-50">
                <p className="text-[11px] text-gray-400 truncate">{row[5] ?? "—"}</p>
                <p className="text-[11px] text-gray-400 shrink-0">{row[0] ?? "—"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (hidden below sm) ──────────────────────── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl">
        <table className="min-w-full text-sm text-left border border-neutral-100 text-gray-700">
          <thead className="text-sm font-semibold text-gray-600 bg-neutral-100">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {row.map((cell, cellIndex) => {
                  const isLast = cellIndex === lastIdx;

                  if (isLast) {
                    const meta      = statusMeta(cell);
                    const isPending = String(cell ?? "").toLowerCase().includes("pending");
                    return (
                      <td key={cellIndex} className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => openModal(row, rowIndex)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${meta.bg} ${isPending && enableStatus ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {cell}
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status modal */}
      {selectedRow !== null && (
        <StatusModal
          row={selectedRow}
          onClose={() => { setSelectedRow(null); setSelectedRowIndex(null); }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
};

export default TableWithoutBorder;

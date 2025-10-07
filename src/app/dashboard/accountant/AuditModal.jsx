// AuditModal.jsx
import { X } from "lucide-react";
import React from "react";

const AuditModal = ({ isOpen, onClose, record, onAudit, isAudited }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-4">
            <X onClick={onclose} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Shift Summary
        </h2>
        <div className="flex justify-between text-gray-700">
            <p>Sales summary of {record.attendant}</p>
            <p>{record.date}</p>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
          </p>
          <p>
            <span className="font-medium">Attendant:</span> {record.attendant}
          </p>
          <p>
            <span className="font-medium">Shift:</span> {record.shiftType}
          </p>
          <p>
            <span className="font-medium">Pump No:</span> {record.pumpNo}
          </p>
          <p>
            <span className="font-medium">Litres Sold:</span> {record.litres}
          </p>
          <p>
            <span className="font-medium">Amount:</span> ₦{record.amount}
          </p>
          <p>
            <span className="font-medium">Cash Received:</span> ₦{record.cashReceived}
          </p>
          <p>
            <span className="font-medium">Discrepancy:</span> {record.discrepancy}
          </p>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>

          <button
            onClick={onAudit}
            disabled={isAudited}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${
              isAudited
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0080ff]"
            }`}
          >
            {isAudited ? "Audited" : "Audit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;

import React, { useState } from "react";
import { Eye, Check, AlertTriangle } from "lucide-react";
import AuditModal from "./AuditModal";

const salesData = [
  { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 1, litres: 30, amount: "123,000,000", cashReceived: "120,000,000", discrepancy: -3000, status: "Flagged" },
  { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 2, litres: 40, amount: "110,000,000", cashReceived: "110,000,000", discrepancy: 0, status: "Matched" },
  { date: "04/18/23", attendant: "Jane Doe", shiftType: "Afternoon", pumpNo: 3, litres: 25, amount: "100,000,000", cashReceived: "99,000,000", discrepancy: -1000, status: "Flagged" },
  { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 1, litres: 30, amount: "123,000,000", cashReceived: "120,000,000", discrepancy: -3000, status: "Flagged" },
  { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 2, litres: 40, amount: "110,000,000", cashReceived: "110,000,000", discrepancy: 0, status: "Matched" },
  { date: "04/18/23", attendant: "Jane Doe", shiftType: "Afternoon", pumpNo: 3, litres: 25, amount: "100,000,000", cashReceived: "99,000,000", discrepancy: -1000, status: "Flagged" },
  { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 1, litres: 30, amount: "123,000,000", cashReceived: "120,000,000", discrepancy: -3000, status: "Flagged" },
  { date: "04/17/23", attendant: "John Dave", shiftType: "Morning", pumpNo: 2, litres: 40, amount: "110,000,000", cashReceived: "110,000,000", discrepancy: 0, status: "Matched" },
  { date: "04/18/23", attendant: "Jane Doe", shiftType: "Afternoon", pumpNo: 3, litres: 25, amount: "100,000,000", cashReceived: "99,000,000", discrepancy: -1000, status: "Flagged" },
];

const AuditReconciledSales = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditedRecords, setAuditedRecords] = useState({});

  const handleView = (record, index) => {
    setSelectedRecord({ ...record, index });
    setIsModalOpen(true);
  };

  const handleAudit = () => {
    setAuditedRecords((prev) => ({
      ...prev,
      [selectedRecord.index]: true,
    }));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Audit Reconciled Sales</h2>
          <p className="text-sm text-gray-500">
            Verify and audit daily attendant sales
          </p>
        </div>
        <button className="border border-gray-400 font-semibold rounded-lg text-sm px-4 py-2 text-gray-600 hover:bg-gray-100 transition">
          View all report
        </button>
      </div>

      {/* Table */}
      <div className="mt-10 overflow-x-auto scrollbar-hide rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-center">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Attendant</th>
              <th className="py-3 px-4">Shift type</th>
              <th className="py-3 px-4">Pump no</th>
              <th className="py-3 px-4">Litres sold</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Cash received</th>
              <th className="py-3 px-4">Discrepancies</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, i) => {
              const isAudited = auditedRecords[i];
              return (
                <tr
                  key={i}
                  className="border-t border-gray-100 hover:bg-gray-50 text-center"
                >
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">{item.attendant}</td>
                  <td className="py-3 px-4">{item.shiftType}</td>
                  <td className="py-3 px-4">{item.pumpNo}</td>
                  <td className="py-3 px-4">{item.litres}</td>
                  <td className="py-3 px-4">{item.amount}</td>
                  <td className="py-3 px-4">{item.cashReceived}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      item.discrepancy > 0
                        ? "text-green-600"
                        : item.discrepancy < 0
                        ? "text-red-500"
                        : "text-gray-600"
                    }`}
                  >
                    {item.discrepancy}
                  </td>
                  <td className="py-3 px-4">
                    {item.status === "Matched" ? (
                      <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
                        <Check size={12} />
                        <span>Matched</span>
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-md inline-flex justify-center items-center space-x-1">
                        <AlertTriangle size={12} />
                        <span>Flagged</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 flex items-center justify-center space-x-3">
                    <Eye
                      size={16}
                      onClick={() => handleView(item, i)}
                      className="text-gray-500 cursor-pointer hover:text-gray-700"
                    />
                    <input
                      type="checkbox"
                      checked={isAudited || false}
                      readOnly
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AuditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={selectedRecord || {}}
        onAudit={handleAudit}
        isAudited={
          selectedRecord ? auditedRecords[selectedRecord.index] : false
        }
      />
    </div>
  );
};

export default AuditReconciledSales;

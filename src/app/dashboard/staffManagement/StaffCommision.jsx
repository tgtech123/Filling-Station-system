"use client";
import React, { useState, useEffect, useMemo } from 'react';
import TableWithoutBorder from '@/components/TableWithoutBorder';
import { FiEdit, FiSave } from "react-icons/fi";
import useCommissionStore from '@/store/useCommissionStore';

const COMMISSION_HEADERS = ["Role", "Base Rate %", "Tier 1", "Tier 2"];
const BONUS_HEADERS = ["Achievement", "Bonus Amount", "Frequency"];

// ── Conversions between backend objects and display rows ──────────────────────

const commissionToRow = (s) => [
  s.role.charAt(0).toUpperCase() + s.role.slice(1),
  `${s.baseRate}%`,
  s.tier1 != null ? `${s.tier1}%` : "-",
  s.tier2 != null ? `${s.tier2}%` : "-",
];

const bonusToRow = (s) => [
  s.achievement,
  `₦${Number(s.bonusAmount).toLocaleString()}`,
  s.frequency,
];

const rowToCommission = (row) => ({
  role: row[0].toLowerCase(),
  baseRate: parseFloat(row[1]) || 0,
  tier1: row[2] === "-" || row[2] === "" ? null : parseFloat(row[2]) || null,
  tier2: row[3] === "-" || row[3] === "" ? null : parseFloat(row[3]) || null,
});

const rowToBonus = (row) => ({
  achievement: row[0],
  bonusAmount: parseFloat(row[1].replace(/[^0-9.]/g, "")) || 0,
  frequency: row[2],
});

// ─────────────────────────────────────────────────────────────────────────────

const StaffCommision = () => {
  const {
    commissionStructure,
    bonusStructure,
    loading,
    fetchCommissionStructure,
    fetchBonusStructure,
    updateCommissionStructure,
    updateBonusStructure,
  } = useCommissionStore();

  const [isEditMode, setIsEditMode]         = useState(false);
  const [editableCommission, setEditableCommission] = useState([]);
  const [editableBonus, setEditableBonus]   = useState([]);
  const [saveMessage, setSaveMessage]       = useState("");

  // Fetch from backend on mount
  useEffect(() => {
    fetchCommissionStructure();
    fetchBonusStructure();
  }, []);

  // Derive table rows from store data
  const commissionRows = useMemo(
    () => commissionStructure.map(commissionToRow),
    [commissionStructure]
  );
  const bonusRows = useMemo(
    () => bonusStructure.map(bonusToRow),
    [bonusStructure]
  );

  const handleEdit = () => {
    setEditableCommission(commissionRows.map(row => [...row]));
    setEditableBonus(bonusRows.map(row => [...row]));
    setSaveMessage("");
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setSaveMessage("");
  };

  const handleSave = async () => {
    try {
      await Promise.all([
        updateCommissionStructure(editableCommission.map(rowToCommission)),
        updateBonusStructure(editableBonus.map(rowToBonus)),
      ]);
      setIsEditMode(false);
      setSaveMessage("✅ Changes saved successfully!");
    } catch {
      setSaveMessage("❌ Failed to save. Please try again.");
    } finally {
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const updateCommissionCell = (rowIndex, cellIndex, value) => {
    const next = editableCommission.map(r => [...r]);
    next[rowIndex][cellIndex] = value;
    setEditableCommission(next);
  };

  const updateBonusCell = (rowIndex, cellIndex, value) => {
    const next = editableBonus.map(r => [...r]);
    next[rowIndex][cellIndex] = value;
    setEditableBonus(next);
  };

  const isFetching = loading.commissionStructure || loading.bonusStructure;
  const isSaving   = loading.updatingCommission  || loading.updatingBonus;

  const editBtnRow = (
    <div className="flex gap-4">
      <button
        onClick={handleCancel}
        className="text-[1rem] px-3 py-1 h-[2.5rem] w-[5.75rem] rounded-md font-semibold bg-red-500 hover:scale-105 text-white"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="h-[2.5rem] w-[10.75rem] bg-[#0080FF] text-white text-[0.875rem] font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60 flex justify-center items-center gap-2"
      >
        {isSaving ? "Saving…" : "Save changes"}
        {!isSaving && <FiSave size={24} />}
      </button>
    </div>
  );

  if (isFetching) {
    return (
      <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-2xl text-gray-500 dark:text-gray-400">
        Loading commission data…
      </div>
    );
  }

  return (
    <div>
      {saveMessage && (
        <div className={`mb-3 px-4 py-2 rounded-lg text-sm font-semibold ${
          saveMessage.startsWith("✅")
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-red-100 text-red-700 border border-red-300"
        }`}>
          {saveMessage}
        </div>
      )}

      {/* ── Commission Structure ─────────────────────────────────────────── */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5">
        <div className="flex justify-between">
          <span className="flex flex-col sm:flex-row lg:flex-col gap-1.5">
            <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
              Commission Structure
            </h1>
            <h3 className="font-normal text-neutral-600 dark:text-neutral-400 mb-4">
              Staff commission rate by roles
            </h3>
          </span>

          {!isEditMode ? (
            <FiEdit
              className="text-blue-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg p-1"
              size={38}
              onClick={handleEdit}
            />
          ) : editBtnRow}
        </div>

        {!isEditMode ? (
          <TableWithoutBorder columns={COMMISSION_HEADERS} data={commissionRows} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  {COMMISSION_HEADERS.map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editableCommission.map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-100 dark:border-gray-700">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-4 px-4">
                        {ci === 0 ? (
                          <span className="text-sm text-gray-700 dark:text-gray-200">{cell}</span>
                        ) : (
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCommissionCell(ri, ci, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Bonus Structure ──────────────────────────────────────────────── */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-5">
        <div className="flex justify-between">
          <span className="flex flex-col sm:flex-row lg:flex-col mb-4">
            <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
              Bonus Structure
            </h1>
          </span>

          {!isEditMode ? (
            <FiEdit
              className="text-blue-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg p-1"
              size={38}
              onClick={handleEdit}
            />
          ) : editBtnRow}
        </div>

        {!isEditMode ? (
          <TableWithoutBorder columns={BONUS_HEADERS} data={bonusRows} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  {BONUS_HEADERS.map((h, i) => (
                    <th key={i} className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editableBonus.map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-100 dark:border-gray-700">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-4 px-4">
                        {ci === 0 ? (
                          <span className="text-sm text-gray-700 dark:text-gray-200">{cell}</span>
                        ) : ci === 2 ? (
                          <select
                            value={cell}
                            onChange={(e) => updateBonusCell(ri, ci, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="One-time">One-time</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateBonusCell(ri, ci, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffCommision;

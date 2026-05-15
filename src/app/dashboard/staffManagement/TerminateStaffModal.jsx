"use client"
import React, { useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";

const TerminateStaffModal = ({ isOpen, onClose, staffId, deleteStaff, token, staffName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stationName] = useState(() => {
    if (typeof window === "undefined") return "your station";
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.station?.name || "your station";
    } catch {
      return "your station";
    }
  });

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteStaff(staffId, token);
      onClose();
    } catch (error) {
      console.log("Failed to delete staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black opacity-50" />

      <div className="relative bg-white dark:bg-gray-800 text-neutral-800 dark:text-gray-100 shadow-xl rounded-2xl p-6 w-full max-w-[420px]">
        <span className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold">Terminate Staff Member</h1>
          <LiaTimesSolid
            onClick={onClose}
            size={23}
            className="cursor-pointer hover:text-neutral-400"
          />
        </span>

        <p className="py-4 text-[15px] leading-relaxed dark:text-gray-300">
          You are about to remove{" "}
          <span className="font-bold text-blue-600 text-lg">{staffName}</span>{" "}
          from {''}
          <span className="font-bold text-gray-900 dark:text-white">{stationName}</span>
          . This will permanently delete the account and revoke all access to
          login or perform any operations.{" "}
          <span className="text-red-500 font-semibold">
            This action cannot be undone.
          </span>{" "}
          Are you sure?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border-2 border-[#1a7af6] font-bold text-[#1a7af6] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            No, Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Deleting..." : "Yes, Delete Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminateStaffModal;

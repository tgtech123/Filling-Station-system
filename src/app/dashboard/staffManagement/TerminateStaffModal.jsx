"use client"
import React, { useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";

const TerminateStaffModal = ({ isOpen, onClose, staffId, deleteStaff, token, staffName }) => {
  if (!isOpen) return null;

  const [isLoading, setIsLoading] = useState(false)
  const handleDelete = async () =>{
      try {
        setIsLoading(true)
        await deleteStaff(staffId, token)
        setIsLoading(false)
        onClose();
      } catch (error) {
        console.log("Failed to delete staff:", error)
        setIsLoading(false)
      }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        
        className="absolute inset-0 bg-black opacity-50"
      ></div>

      {/* the modal box now */}

      <div className="relative bg-white text-neutral-800 shadow-xl rounded-2xl p-6 w-[420px] sm:w-[420px] h-auto max-w-lg">
        <span className="flex justify-between">
          <h1 className="text-xl font-bold">Terminate Staff Member</h1>
          <LiaTimesSolid
            onClick={onClose}
            size={23}
            className="cursor-pointer hover:text-neutral-400"
          />
        </span>

        <p className="py-4 text-[15px]">
          Terminating <span className="font-bold ">{staffName}</span> account would remove the details from your
          lists of staff, and will deny the staff access to login or perform his
          necessary operations
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Cancel button */}
            <button
                onClick={onClose}
                className="w-full px-4 py-2 rounded-xl border-2 border-[#1a7af6] font-bold text-[#1a7af6]"
            >
                Cancel
            </button>

            {/* Delete staff button */}
            <button
            onClick={handleDelete}
                className="w-full px-4 py-2 rounded-xl bg-[#F00] text-white font-bold hover:bg-red-300"
            >
                {isLoading ? "Deleting" : "Delete Staff"}
            </button>
        </div>

      </div>
    </div>
  );
};

export default TerminateStaffModal;

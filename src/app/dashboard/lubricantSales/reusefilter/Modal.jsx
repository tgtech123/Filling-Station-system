'use client';
import React from 'react';
import { IoCloseOutline } from "react-icons/io5";
import Table from '@/components/Table';
import { columns, data } from "./ReceiptData";
import ActionButtons from './ActionButtons';

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Transparent background outside modal */}
      <div 
        className="absolute inset-0 bg-black opacity-50" 
        // onClick={onClose} // click outside closes modal
      ></div>

      {/* Modal box */}
      <div className="relative bg-white rounded shadow-lg p-6 w-[90%] max-w-5xl max-h-[85%] overflow-auto z-50">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:bg-neutral-100 p-1 rounded-full"
        >
          <IoCloseOutline size={24} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <p className="text-lg font-semibold">Reprint receipt</p>
          <p className="text-sm text-gray-500">Print and export all sales receipts</p>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={data}
          renderActions={(row) => (
            <ActionButtons
              onView={() => console.log("View", row)}
              onPrint={() => console.log("Print", row)}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Modal;

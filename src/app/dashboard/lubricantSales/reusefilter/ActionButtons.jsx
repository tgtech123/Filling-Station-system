'use client'
import React, { useState } from "react";
import { Eye, Printer } from "lucide-react";
import ReceiptModal from "./ReceiptModal";

const ActionButtons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        {/* View Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-gray-600 border-[1.5px] cursor-pointer py-1.5 px-2 rounded-xl"
          title="View"
        >
          <Eye size={22} />
        </button>

        {/* Print Button */}
        <button
          className="border-[1.5px] cursor-pointer py-1.5 px-2 rounded-xl text-blue-600"
          title="Print"
        >
          <Printer size={22} />
        </button>
      </div>

      {/* Modal */}
      <ReceiptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default ActionButtons;

// import { Download } from "lucide-react";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";
// import logo from "../../../../public/station-logo.png"

export default function FilterModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white w-full max-w-[500px] scrollbar-hide rounded-2xl shadow-2xl border p-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
       
            {/* Header */}
            <div className="flex items-center justify-between p-5">
              <h2 className="text-xl mt-10 font-semibold text-gray-800">
                Customize Filter
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

             <hr className="border-gray-200" />

        {/* Filter content */}
        <div className="p-5 grid grid-cols-2 gap-8">
          {/* Supplier */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Supplier</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#0080ff]" />
                <span>All</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>AJ Rano Oil</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>Ebuka and Sons Lubricant</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>MadGiz Oil and Gas</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>MadGiz Oil and Gas</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>MadGiz Oil and Gas</span>
              </label>
            </div>
          </div>

          {/* Payment type */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Payment type</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#0080ff]" />
                <span>All</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>Cash</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>POS</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>Transfer</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#0080ff]" />
                <span>Credit</span>
              </label>
            </div>
          </div>
        </div>

         <div className="px-5 pb-5">
          <button className="w-full py-3 rounded-lg text-white font-medium" style={{ backgroundColor: "#0080ff" }}>
            Apply Filter
          </button>
        </div>

      </div>
    </div>
  );
}

"use client";

import { ArrowRight, Check, Clock } from "lucide-react";
import { useState } from "react";
import { IoWarning } from "react-icons/io5";

export default function TankCard({
  tankName,
  productType,
  lastUpdated,
  status,
  systemReading,
}) {
  const [manualReading, setManualReading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(true);

  

  return (
    <div className="border-2  p-3 rounded-[20px] border-[#e7e7e7]">
      {/* First */}
      <div className="flex justify-between">
        <div>
          <h4 className="text-2xl mb-2 font-medium">Tank {tankName}</h4>
          <p className="font-medium">{productType}</p>
        </div>
        <div className="flex flex-col items-end">
          <button
            className={`mb-4 flex w-fit items-center text-[12px] font-semibold gap-1 p-2 rounded-lg ${
              status === "Pending"
                ? "bg-[#fec6aa] text-[#eb2b0b]"
                : status === "Deviation"
                ? "bg-[#ffdcdc] text-[#ff0000]"
                : "bg-[#b2ffb4] text-[#04910c]"
            }`}
          >
            {status}
            {status === "Pending" ? (
              <Clock size={18} />
            ) : status === "Deviation" ? (
              <IoWarning size={18} />
            ) : (
              <Check size={18} />
            )}
          </button>
          <p className="text-[#888888] font-medium">
            Last Updated - {lastUpdated}
          </p>
        </div>
      </div>

      {/* Second */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="col-span-3 relative w-full lg:w-fit flex flex-col lg:flex-row items-start lg:items-end gap-6 border-2 px-[16px] py-[8px] rounded-[12px] border-[#e7e7e7]">
          {/* System Reading */}
          <div>
            <p className="text-sm font-semibold mb-2">System Reading</p>
            <input
              type="text"
              disabled
              value={systemReading}
              className="bg-[#e7e7e7] p-4 rounded-[12px] text-sm border-2 border-[#d5d3d3]"
            />
          </div>
          {/* Manual Reading */}
          <div>
            <p className="text-sm font-semibold mb-2">Manual Reading</p>
            <input
              type="text"
              value={manualReading}
              onChange={(e) => setManualReading(e.target.value)}
              className="bg-white p-4 rounded-[12px] text-sm border-2 border-[#d5d3d3] placeholder:text-[#e7e7e7]"
              placeholder="Enter Reading"
            />
          </div>
          {/* Update */}
          <button className="cursor-pointer hover:bg-[#004cff] py-4 px-6 text-white text-sm font-semibold w-fit rounded-[12px] bg-[#0080ff]">
            Update
          </button>
          {/* Arrow */}
          <div className="mx-4 absolute right-[-100px] hidden lg:flex items-end">
            <span>
              <ArrowRight />
            </span>
          </div>
        </div>
        <div className="col-span-2 border-2 px-[16px] py-[8px] rounded-[12px] border-[#e7e7e7]">
          <p className="text-sm font-semibold mb-2">Comparison</p>
          <input
            type="text"
            value={message}
            className="bg-white p-4 w-full rounded-[12px] text-sm border-2 border-[#d5d3d3] placeholder:text-[#e7e7e7]"
            placeholder="Awaiting Manual Reading"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-[#ffdcdc] text-[#ff0000] w-fit p-2 flex gap-2 items-center">
            <IoWarning />
            <p className="text-[15px]">Manual Reading differs from system reading by 100 Litres. Please verify the reading and investigate if necessary.</p>
        </div>
      )}
    </div>
  );
}

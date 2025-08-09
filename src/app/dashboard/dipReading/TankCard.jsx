"use client";

import { ArrowRightLeft, Check, Clock } from "lucide-react";
import { useState } from "react";
import { IoWarning } from "react-icons/io5";

export default function TankCard({
  tankName,
  productType,
  lastUpdated,
  systemReading,
}) {
  const [manualReading, setManualReading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpdate = () => {
    const systemVal = parseFloat(systemReading);
    const manualVal = parseFloat(manualReading);

    if (isNaN(manualVal)) {
      setMessage("Please enter a valid manual reading.");
      setError(true);
      setStatus("Deviation");
      return;
    }

    const diff = Math.abs(systemVal - manualVal);

    if (diff !== 0) {
      setMessage(`${diff} Ltrs Deviation`);
      setErrorMessage(
        `Manual Reading differs from system reading by ${diff} Litres. Please verify the reading and investigate if necessary.`
      );
      setError(true);
      setStatus("Deviation");
    } else {
      setMessage("Reading Matched");
      setError(false);
      setStatus("Matched");
    }
  };

  return (
    <div className="border-2 my-3 p-3 rounded-[20px] border-[#e7e7e7]">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <div>
          <h4 className="text-xl sm:text-2xl mb-2 font-medium">
            Tank {tankName}
          </h4>
          <p className="font-medium">{productType}</p>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <button
            className={`mb-2 flex w-fit items-center text-[12px] font-semibold gap-1 p-2 rounded-lg ${
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
          <p className="text-[#888888] font-medium text-sm">
            Last Updated - {lastUpdated}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <div className="col-span-3 flex w-full lg:w-3/6 flex-col lg:flex-row items-stretch lg:items-end gap-4 border-2 px-4 py-3 rounded-[12px] border-[#e7e7e7] relative">
          {/* System Reading */}
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">System Reading</p>
            <input
              type="text"
              disabled
              value={`${systemReading} Litres`}
              className="bg-[#e7e7e7] w-full p-3 rounded-[12px] text-sm border-2 border-[#d5d3d3]"
            />
          </div>
          {/* Manual Reading */}
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">Manual Reading</p>
            <input
              type="text"
              value={manualReading}
              onChange={(e) => setManualReading(e.target.value)}
              className="bg-white w-full p-3 rounded-[12px] text-sm border-2 border-[#d5d3d3] placeholder:text-[#e7e7e7]"
              placeholder="Enter Reading"
            />
          </div>
          {/* Update Button */}
          <button
            onClick={handleUpdate}
            className="self-center w-full lg:w-fit lg:self-end cursor-pointer hover:bg-[#004cff] py-3 px-5 text-white text-sm font-semibold rounded-[12px] bg-[#0080ff] transition-colors"
          >
            Update
          </button>
        </div>
        {/* Arrow (only visible on large screens) */}
        <div className="w-full lg:w-1/6 flex justify-center items-center">
          <ArrowRightLeft />
        </div>
        {/* Comparison */}
        <div className="col-span-2 w-full lg:w-2/6 border-2 px-4 py-3 rounded-[12px] border-[#e7e7e7]">
          <p className="text-sm font-semibold mb-2">Comparison</p>
          <input
            type="text"
            value={message}
            readOnly
            className="bg-white w-full p-3 rounded-[12px] text-sm border-2 border-[#d5d3d3] placeholder:text-[#e7e7e7]"
            placeholder="Awaiting Manual Reading"
          />
        </div>
      </div>
      {/* Error Message */}
      {error && message && (
        <div className="mt-3 bg-[#ffdcdc] text-[#ff0000] w-full sm:w-fit p-2 flex gap-2 items-center rounded">
          <IoWarning />
          <p className="text-[15px]">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

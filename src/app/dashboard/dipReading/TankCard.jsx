"use client";

import { ArrowRightLeft, Check, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { IoWarning } from "react-icons/io5";
import NumericInput from "@/components/inputs/NumericInput";
import useSupervisorStore from "@/store/useSupervisorStore";
import { extractApiError } from "@/lib/config";

export default function TankCard({
  tankId,
  tankName,
  productType,
  lastUpdated,
  systemReading,
  initialStatus = "Pending",
  onReadingSubmitted,
}) {
  const [manualReading, setManualReading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitDipReading } = useSupervisorStore();

  const handleUpdate = async () => {
    const systemVal = parseFloat(systemReading);
    const manualVal = parseFloat(manualReading);

    // Validation
    if (isNaN(manualVal)) {
      setMessage("Please enter a valid manual reading.");
      setError(true);
      setStatus("Deviation");
      return;
    }

    if (manualVal < 0) {
      setMessage("Reading cannot be negative.");
      setError(true);
      setStatus("Deviation");
      return;
    }

    // Rounded to 2 dp — tank quantities carry floating-point noise, so a raw
    // difference could read "0.030000000000001 Ltrs Deviation".
    const diff = Math.round((Math.abs(systemVal - manualVal) + Number.EPSILON) * 100) / 100;
    const diffFmt = diff.toLocaleString(undefined, { maximumFractionDigits: 2 });

    // Update UI based on comparison
    if (diff !== 0) {
      setMessage(`${diffFmt} Ltrs Deviation`);
      setErrorMessage(
        `Manual Reading differs from system reading by ${diffFmt} Litres. Please verify the reading and investigate if necessary.`
      );
      setError(true);
      setStatus("Deviation");
    } else {
      setMessage("Reading Matched");
      setError(false);
      setStatus("Matched");
      setErrorMessage("");
    }

    // Submit to API
    try {
      setIsSubmitting(true);
      
      // Backend expects: { tankId, manualReading, notes (optional) }
      const readingData = {
        tankId,
        manualReading: manualVal,
        notes: diff !== 0 
          ? `Deviation detected: ${diff}L difference from system reading` 
          : "Reading matched system reading",
      };

      await submitDipReading(readingData);
      
      // Notify parent component if callback provided
      if (onReadingSubmitted) {
        onReadingSubmitted({
          tankId,
          tankName,
          manualReading: manualVal,
          deviation: diff,
          status: diff !== 0 ? "Deviation" : "Matched",
        });
      }

      // Always confirm the save.
      //
      // This only ran when diff === 0 — an exact match, which almost never
      // happens with a physical dip rod. So the normal case saved the reading
      // and showed only a red "X Ltrs Deviation", which reads as a rejection.
      // The feature worked; it just never said so.
      if (diff === 0) {
        setMessage("Reading recorded - matched system");
      } else {
        setMessage(`Reading recorded - ${diffFmt} Ltrs deviation`);
        setErrorMessage(
          `Saved. Manual reading differs from the system by ${diffFmt} Litres — worth investigating.`
        );
      }
    } catch (err) {
      setError(true);
      setStatus("Deviation");
      setErrorMessage(
        extractApiError(err) || 
        "Failed to submit reading. Please try again."
      );
      setMessage("Submission Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`border-2 my-3 p-3 rounded-[20px] border-[#e7e7e7] relative ${
      isSubmitting ? "opacity-75" : ""
    }`}>
      {/* Loading Overlay for this specific tank */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[20px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-blue-600">Submitting Reading...</p>
          </div>
        </div>
      )}

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
        <div className="flex w-full lg:w-3/6 flex-col sm:flex-row items-stretch sm:items-end gap-4 border-2 px-4 py-3 rounded-[12px] border-[#e7e7e7] relative">
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
            <NumericInput
              variant="numeric"
              value={manualReading}
              onChange={(e) => setManualReading(e.target.value)}
              className="bg-white w-full p-3 rounded-[12px] text-sm border-2 border-[#d5d3d3] placeholder:text-[#e7e7e7]"
              placeholder="Enter Reading"
              disabled={isSubmitting}
            />
          </div>
          {/* Update Button */}
          <button
            onClick={handleUpdate}
            disabled={isSubmitting || !manualReading}
            className={`w-full sm:w-fit sm:self-end py-3 px-5 text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2 ${
              isSubmitting || !manualReading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0080ff] hover:bg-[#004cff] cursor-pointer"
            }`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Update"}
          </button>
        </div>
        {/* Arrow — hidden on mobile */}
        <div className="hidden lg:flex w-1/6 justify-center items-center">
          <ArrowRightLeft />
        </div>
        {/* Comparison */}
        <div className="w-full lg:w-2/6 border-2 px-4 py-3 rounded-[12px] border-[#e7e7e7]">
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
      {error && errorMessage && (
        <div className="mt-3 bg-[#ffdcdc] text-[#ff0000] w-full sm:w-fit p-2 flex gap-2 items-center rounded">
          <IoWarning />
          <p className="text-[15px]">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
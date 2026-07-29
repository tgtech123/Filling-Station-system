"use client";
import React, { useState, useEffect } from "react";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import useShiftStore from "@/store/useShiftStore";

const SHIFT_LABELS = {
  "One-Day-Morning": "Morning (6AM – 3PM)",
  "One-Day-Evening": "Evening (3PM – 10PM)",
  "Day-Off":         "Day-Off",
  "Full-Time":       "Full-Time (6AM – 10PM)",
};

const StartShiftCard = ({ onClose, onStart }) => {
  const { fetchTodaySchedule, startShift, loading } = useShiftStore();

  const [schedule, setSchedule]   = useState(null);   // today's scheduled shift data
  const [fetching, setFetching]   = useState(true);
  const [openingReading, setOpeningReading] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    (async () => {
      setFetching(true);
      const result = await fetchTodaySchedule();
      setFetching(false);
      if (result.success && result.data) {
        setSchedule(result.data);
        // Prefill opening meter from last completed shift on this pump
        if (result.data.lastClosingMeterReading !== null && result.data.lastClosingMeterReading !== undefined) {
          setOpeningReading(String(result.data.lastClosingMeterReading));
          setPrefilled(true);
        }
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!openingReading || parseFloat(openingReading) < 0) {
      setError("Please enter a valid opening meter reading");
      return;
    }

    const result = await startShift({
      openingMeterReading: parseFloat(openingReading),
    });

    if (result.success) {
      onStart();
      onClose();
    } else {
      setError(result.error || "Failed to start shift");
    }
  };

  return (
    <div className="fixed top-28 right-4 w-[94vw] sm:w-[32rem] max-w-[90vw] md:max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Start Shift</h2>
          <p className="text-xs sm:text-sm text-gray-500">Confirm your meter reading to begin</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">×</button>
      </div>

      {/* Loading scheduled shift */}
      {fetching && (
        <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Checking today's schedule...</span>
        </div>
      )}

      {/* No schedule */}
      {!fetching && !schedule && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">No shift scheduled for today</p>
              <p className="text-xs text-red-500 mt-1">
                Your supervisor has not scheduled you for a shift today. Contact them to have your shift assigned before you can start.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="mt-4 w-full border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      )}

      {/* Shift found — show details + form */}
      {!fetching && schedule && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shift details card (read-only from supervisor's schedule) */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Today's Scheduled Shift</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <BsFillFuelPumpFill size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{schedule.scheduledShift.pumpTitle}</p>
                <p className="text-xs text-gray-500">{schedule.scheduledShift.product} · ₦{schedule.scheduledShift.pricePerLtr?.toLocaleString()}/L</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                {SHIFT_LABELS[schedule.scheduledShift.shiftType] || schedule.scheduledShift.shiftType}
              </span>
            </div>
          </div>

          {/* Opening Meter Reading */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Opening Meter Reading
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={openingReading}
              onChange={(e) => { setOpeningReading(e.target.value); setPrefilled(false); }}
              placeholder="Enter current meter reading"
              step="0.01"
              min="0"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            {prefilled && schedule.lastClosingMeterReading !== null && (
              <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Pre-filled from last closing reading on {schedule.scheduledShift.pumpTitle}
                  {schedule.lastShiftEndTime && (
                    <span className="text-amber-500 ml-1">
                      ({new Date(schedule.lastShiftEndTime).toLocaleDateString("en-NG", { day: "numeric", month: "short" })})
                    </span>
                  )}. Verify this matches the pump before starting.
                </p>
              </div>
            )}
            {!prefilled && schedule.lastClosingMeterReading === null && (
              <p className="text-xs text-gray-400 mt-1">No previous reading on this pump — enter the current meter display.</p>
            )}

            {/*
              Typing over the prefill means litres went through the pump that no
              shift accounts for. It is allowed — the physical meter is the
              truth and a pump can be reset or repaired — but it must be
              visible, not silent. This station already has one such gap: a
              shift closed at 189 and the next opened at 300.
            */}
            {!prefilled &&
              schedule.lastClosingMeterReading !== null &&
              openingReading !== "" &&
              parseFloat(openingReading) !== Number(schedule.lastClosingMeterReading) && (
                <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    This does not match the last closing reading of{" "}
                    <strong>{Number(schedule.lastClosingMeterReading).toLocaleString()}</strong> on{" "}
                    {schedule.scheduledShift.pumpTitle}.{" "}
                    {(() => {
                      const diff =
                        parseFloat(openingReading) - Number(schedule.lastClosingMeterReading);
                      const abs = Math.abs(diff).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      });
                      return diff > 0
                        ? `${abs} L would be unaccounted for.`
                        : `The reading is ${abs} L lower than the last close.`;
                    })()}{" "}
                    Only continue if the pump really shows this — your supervisor will see the gap.
                  </p>
                </div>
              )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !openingReading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {loading ? "Starting..." : "Start Shift"}
          </button>
        </form>
      )}
    </div>
  );
};

export default StartShiftCard;

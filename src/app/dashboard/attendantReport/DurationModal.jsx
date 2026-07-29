"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Date-range picker for the attendant report.
 *
 * It previously accepted no props at all — the parent passed onClose and onApply
 * and both were ignored, and none of the buttons had handlers. So it opened, did
 * nothing, and there was no way to dismiss it. The presets and Save now work,
 * and it closes on Escape, on an outside click, and from the X.
 */
export default function DurationModal({ onClose, onApply }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  const iso = (d) => d.toISOString().slice(0, 10);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // Deferred by a tick so the click that opened the panel doesn't close it.
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      clearTimeout(t);
    };
  }, [onClose]);

  const applyPreset = (preset) => {
    const end = new Date();
    const start = new Date();

    if (preset === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (preset === "week") {
      // Monday-start, matching the weekly summaries elsewhere in the app.
      const day = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
    } else if (preset === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (preset === "quarter") {
      start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
      start.setHours(0, 0, 0, 0);
    }

    onApply?.(iso(start), iso(end));
  };

  const applyCustom = () => {
    if (!from || !to) return setError("Pick both a start and an end date.");
    if (from > to) return setError("The start date cannot be after the end date.");
    setError("");
    onApply?.(from, to);
  };

  const presetCls =
    "text-left border-2 border-neutral-200 hover:bg-blue-600 hover:text-white font-semibold p-2 rounded-lg hover:shadow-md transition-colors";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Choose a date range"
      className="absolute z-50 top-50 right-4 sm:right-20 lg:right-20 lg:top-72 bg-white border-2 rounded-lg w-[min(20rem,92vw)] p-3 shadow-xl"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm text-neutral-700">Duration</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="min-w-0 flex-1 px-2 py-2 rounded-md border border-neutral-300 outline-none focus:border-blue-500"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="min-w-0 flex-1 px-2 py-2 rounded-md border border-neutral-300 outline-none focus:border-blue-500"
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <hr className="border-[1px] mt-2" />

      <div className="flex flex-col gap-2 mt-3">
        <button type="button" className={presetCls} onClick={() => applyPreset("today")}>Today</button>
        <button type="button" className={presetCls} onClick={() => applyPreset("week")}>This week</button>
        <button type="button" className={presetCls} onClick={() => applyPreset("month")}>This month</button>
        <button type="button" className={presetCls} onClick={() => applyPreset("quarter")}>This quarter</button>
      </div>

      <hr className="border-[1px] mt-2" />

      <button
        type="button"
        onClick={applyCustom}
        className="mt-2 w-full hover:bg-blue-500 justify-center cursor-pointer p-2 bg-blue-600 text-white font-semibold rounded-md transition-colors"
      >
        Save
      </button>
    </div>
  );
}

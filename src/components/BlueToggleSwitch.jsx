"use client";
import usePumpStore from "@/store/pumpStore";
import { useState } from "react";

export default function BlueToggleSwitch({ enabled, pumpId }) {
  const { updatePump, getPumps } = usePumpStore();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleUpdate = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await updatePump({ pumpId, status: enabled ? "Inactive" : "Active" });
      await getPumps();
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div
        onClick={handleUpdate}
        className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
          busy ? "opacity-50 cursor-not-allowed" : ""
        } ${enabled ? "bg-[#1154d4]" : "bg-gray-300"}`}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      {failed && (
        <span className="text-[10px] text-red-500 font-medium">Update failed</span>
      )}
    </div>
  );
}

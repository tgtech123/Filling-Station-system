"use client";
import { X } from "lucide-react";
import useEmergencyStore from "@/store/useEmergencyStore";
import toast from "react-hot-toast";

export default function EmergencyModal({ onclose }) {
  const { emergencyMode, loading, activateEmergency, deactivateEmergency } =
    useEmergencyStore();

  const handleConfirm = async () => {
    const action = emergencyMode ? deactivateEmergency : activateEmergency;
    const res = await action();
    if (res.success) {
      toast.success(emergencyMode ? "System restored" : "Emergency mode activated");
      onclose();
    } else {
      toast.error(res.error || "Action failed");
    }
  };

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 border-2 rounded-lg w-full max-w-[350px] lg:max-w-[450px] p-3 lg:p-4 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">
            {emergencyMode
              ? "Deactivate Emergency Stop?"
              : "🚨 Activate Emergency Stop?"}
          </h4>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">
          {emergencyMode
            ? "This will restore normal access for all staff."
            : "This will immediately log out ALL staff and prevent them from logging in. Only you (manager) can login during this period."}
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={onclose}
            type="button"
            className="mt-6 flex justify-center py-2 px-12 border-3 border-[#0080ff] text-[#0080ff] font-semibold rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            type="button"
            className={`mt-6 flex justify-center items-center py-2 px-12 text-white font-semibold rounded-md disabled:opacity-50 transition-colors ${
              emergencyMode
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#f00] hover:bg-red-700"
            }`}
          >
            {loading
              ? "Please wait..."
              : emergencyMode
              ? "Yes, Deactivate"
              : "Yes, Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

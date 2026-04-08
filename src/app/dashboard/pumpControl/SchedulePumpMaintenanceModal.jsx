"use client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import usePumpStore from "@/store/pumpStore";
import axios from "axios";
import toast from "react-hot-toast";

export default function SchedulePumpMaintenanceModal({ onclose }) {
  const { pumps, getPumps } = usePumpStore();

  const [form, setForm] = useState({
    pumpId: "",
    reason: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPumps();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pumpId || !form.reason || !form.startDate || !form.endDate) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/pump/schedule-maintenance`,
        {
          pumpId: form.pumpId,
          reason: form.reason,
          startDate: form.startDate,
          endDate: form.endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const selectedPump = pumps.find((p) => p.pumpId === form.pumpId);
      const pumpName = selectedPump?.title || "Pump";
      toast.success(`${pumpName} scheduled for maintenance`);
      getPumps();
      onclose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule maintenance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 rounded-lg w-full max-w-[350px] lg:max-w-[450px] p-3 lg:p-4 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Schedule Pump Maintenance</h4>
          <p className="text-sm text-gray-500">Enter maintenance details</p>
        </div>

        <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm font-semibold mb-1">Select Pump</p>
            <select
              name="pumpId"
              value={form.pumpId}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-2 rounded-[8px] text-sm"
            >
              <option value="">-- Choose a pump --</option>
              {pumps.map((pump) => (
                <option key={pump.pumpId} value={pump.pumpId}>
                  {pump.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Reason for Maintenance</p>
            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-2 rounded-[8px] text-sm"
              placeholder="e.g. Routine service, leak repair..."
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Start Date</p>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-2 rounded-[8px] text-sm"
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">End Date</p>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-2 rounded-[8px] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 flex justify-center p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-md transition-colors"
          >
            {submitting ? "Scheduling..." : "Schedule Maintenance"}
          </button>
        </form>
      </div>
    </div>
  );
}

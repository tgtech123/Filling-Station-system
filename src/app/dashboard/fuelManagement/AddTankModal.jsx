"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function AddTankModal({ onclose }) {
  const [title, setTitle] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [cappedLimit, setCappedLimit] = useState("");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddTank = async () => {
    if (!title || !fuelType || !cappedLimit || !threshold) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/tank/add-tank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          fuelType,
          limit: cappedLimit,
          threshold,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add tank");
      }

      setSuccess("Tank added successfully!");
      setTitle("");
      setFuelType("");
      setCappedLimit("");
      setThreshold("");

      setTimeout(() => {
        onclose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px] p-3 max-h-[80vh] overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Add Fuel Tank</h4>
          <p>Add new tank to your station</p>
        </div>

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <p className="text-sm font-semibold">Title</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Fuel Type</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g Diesel"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Capped Limit (in litres)</p>
            <input
              type="number"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g 10000"
              value={cappedLimit}
              onChange={(e) => setCappedLimit(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <p className="text-sm font-semibold">Threshold</p>
            <input
              type="number"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g 2000"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={handleAddTank}
            className="flex justify-center p-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md"
          >
            {loading ? "Adding..." : "Add Tank"}
          </button>
        </form>
      </div>
    </div>
  );
}

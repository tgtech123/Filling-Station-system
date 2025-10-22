// import { X } from "lucide-react";

// export default function AddNewPumpModal({ onclose }) {
//   return (
//     // overlay
//     <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
//       {/* modal box */}
//       <div className="bg-white border-2 rounded-lg w-full max-w-[350px]  lg:max-w-[400px] p-3 max-h-[80vh] scrollbar-hide overflow-y-auto">
//         <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
//           <X className="cursor-pointer" />
//         </div>

//         <div className="mb-4">
//           <h4 className="font-semibold text-lg">Add Fuel Pump</h4>
//           <p>Enter new pump details</p>
//         </div>

//         <form className="flex flex-col gap-2 w-full">
//             <div>
//               <p className="text-sm font-semibold">
//                 Fuel Type
//               </p>
//               <input
//                 type="text"
//                 className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
//                 placeholder="e.g Diesel"
//               />
//             </div>
//             <div>
//               <p className="text-sm font-semibold">
//                 Price/litre
//               </p>
//               <input
//                 type="text"
//                 className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
//                 placeholder="E.g 120"
//               />
//             </div>

//             <div>
//               <p className="text-sm font-semibold">
//                 Start Date
//               </p>
//               <input
//                 type="date"
//                 className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
//                 placeholder="E.g Dave Company"
//               />
//             </div>
            
          
//           <button
//             type="button"
//             className="mt-6 flex justify-center p-2 bg-blue-600 hover:bg-blue-400 text-white font-semibold rounded-md"
//           >
//             Add Pump
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTankStore } from "@/store/tankStore";

export default function AddNewPumpModal({ onclose }) {
  const { tanks, fetchTanks } = useTankStore();
  const [selectedTank, setSelectedTank] = useState("");
  const [pricePerLtr, setPricePerLtr] = useState("");
  const [startDate, setStartDate] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // fetch tanks when modal opens
  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const handleAddPump = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to perform this action.");
        setLoading(false);
        return;
      }

      if (!selectedTank) {
        setError("Please select a tank.");
        setLoading(false);
        return;
      }

      const res = await fetch("https://your-backend-url.com/api/pump/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tankId: selectedTank,
          pricePerLtr: Number(pricePerLtr),
          startDate,
          title,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to add pump. Please try again.");
      } else {
        setMessage(data?.message || "Pump added successfully!");
        // reset form
        setSelectedTank("");
        setPricePerLtr("");
        setStartDate("");
        setTitle("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 rounded-lg w-full max-w-[350px] lg:max-w-[400px] p-3 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Add Fuel Pump</h4>
          <p>Enter new pump details</p>
        </div>

        <form className="flex flex-col gap-2 w-full" onSubmit={handleAddPump}>
          {/* Tank dropdown */}
          <div>
            <p className="text-sm font-semibold">Select Tank</p>
            <select
              value={selectedTank}
              onChange={(e) => setSelectedTank(e.target.value)}
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              required
            >
              <option value="">-- Select Tank --</option>
              {tanks.length > 0 ? (
                tanks.map((tank) => (
                  <option key={tank._id} value={tank._id}>
                    {tank.title || tank.tankName} ({tank.fuelType})
                  </option>
                ))
              ) : (
                <option disabled>Loading tanks...</option>
              )}
            </select>
          </div>

          {/* Title (optional) */}
          <div>
            <p className="text-sm font-semibold">Pump Title (optional)</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g Pump A"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
            />
          </div>

          {/* Price */}
          <div>
            <p className="text-sm font-semibold">Price/litre</p>
            <input
              type="number"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g 120"
              value={pricePerLtr}
              onChange={(e) => setPricePerLtr(e.target.value)}
              required
            />
          </div>

          {/* Start Date */}
          <div>
            <p className="text-sm font-semibold">Start Date</p>
            <input
              type="date"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* ✅ Messages */}
          {error && (
            <p className="text-red-500 text-sm font-semibold mt-2">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm font-semibold mt-2">
              {message}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 flex justify-center p-2 ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-400"
            } text-white font-semibold rounded-md`}
          >
            {loading ? "Adding..." : "Add Pump"}
          </button>
        </form>
      </div>
    </div>
  );
}



import { X } from "lucide-react";
import usePumpStore from "@/store/pumpStore";
import { useTankStore } from "@/store/tankStore";
import { useEffect, useState } from "react";

export default function AddNewPumpModal({ onclose }) {

  const { tanks, fetchTanks, loading: tankLoading } = useTankStore();

  const { addPump, loading, error, getPumps } = usePumpStore();
  const [formData, setFormData] = useState({
    tankId: "",
    pricePerLtr: "",
    startDate: "",
    title: "",
  });
  const [message, setMessage] = useState(null);
  const [fuelType, setFuelType] = useState("");



  useEffect(()=>{
    fetchTanks();
  }, [fetchTanks])


  const uniqueFuelTypes = [...new Set(tanks.map((t) => t.fuelType))];
  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tankId || !formData.pricePerLtr || !formData.startDate) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }
    await addPump(formData);

    if (error) {
      setMessage({ type: "error", text: error });
    } else {
      setMessage({ type: "Sucess", text: "Pump added sucessfully!" });
      //clears fields after pump added successfully
      setFormData({ tank: "", pricePerLtr: "", startDate: "", title: "" });

      await getPumps ()
      //closes the modal too
      setTimeout(() => {
        setMessage(null); 
        onclose();
      }, 1500);
    }
  };

  return (
    // overlay
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[350px]  lg:max-w-[400px] p-3 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer hover:bg-red-200 hover:rounded-full hover:text-red-500" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-[1.125rem]">Add Fuel Pump</h4>
          <p>Enter new pump details</p>
        </div>

        {/* feedbacks message */}

        {message && (
          <div
            className={`p-2 mb-3 text-sm rounded-md ${
              message.type === "error"
                ? "text-red-600 bg-red-100 border border-red-300"
                : "text-green-700 bg-green-100 border border-green-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
          {/* <div>
            <p className="text-sm font-semibold">Fuel Type</p>
            <input
              type="text"
              name="tankId"
              value={formData.tankId}
              onChange={handleChange}
              className="w-full outline-none border-2 border-gray-300 focus:border-blue-600 p-2 rounded-[8px]"
              placeholder="e.g Diesel or tank ID"
            />
          </div> */}

         <div>
                  <p className="text-sm font-semibold">Tank</p>
                  {/* <select
                    className="w-full border-2 p-2 rounded-[8px] border-gray-300"
                    value={formData.tankId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tankId: e.target.value }))
                    }
                    required
                    disabled={tankLoading}
                  >
                    <option value="">
                      {tankLoading ? "Loading tanks..." : "Select type"}
                    </option>

                    {uniqueFuelTypes.map((t, index) => (
                      <option key={index} value={t._id}>
                        {t || "Untitled fuel Type"}
                      </option>
                    ))}
                  </select> */}

                  <select
                    className="w-full border-2 p-2 rounded-[8px] border-gray-300"
                    value={formData.tankId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tankId: e.target.value }))
                    }
                    required
                    disabled={tankLoading}
                  >
                    <option value="">
                      {tankLoading ? "Loading tanks..." : "Select tank"}
                    </option>

                    {tanks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} — {t.fuelType}
                      </option>
                    ))}
                  </select>

          </div>


          <div>
            <p className="text-sm font-semibold">Pump name</p>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 outline-none focus:border-blue-600 p-2 rounded-[8px]"
              placeholder="E.g Pump 1"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Price/litre</p>
            <input
              type="text"
              name="pricePerLtr"
              value={formData.pricePerLtr}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 outline-none focus:border-blue-600 p-2 rounded-[8px]"
              placeholder="E.g 120"
            />
          </div>

          <div>
            <p className="text-sm font-semibold">Start Date</p>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="E.g Dave Company"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-5 flex justify-center p-2 bg-blue-600 hover:bg-blue-400 text-white font-semibold rounded-md ${loading ? "opacity-70 cursor-not-allowed" :""}`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add Pump"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

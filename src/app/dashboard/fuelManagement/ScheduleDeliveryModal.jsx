// "use client";
// import { useState, useEffect } from "react";
// import { X } from "lucide-react";
// import { useTankStore } from "@/store/tankStore";
// import { ChevronDown, ChevronUp } from "lucide-react";

// export default function ScheduleDeliveryModal({ onclose }) {
//   const [tank, setTank] = useState("");
//   const [fuelType, setFuelType] = useState("");
//   const [price, setPrice] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [supplier, setSupplier] = useState("");
//   const [deliveryDate, setDeliveryDate] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState(""); // "error" or "success"

//   const { tanks, fetchTanks, loading: tankLoading } = useTankStore();
//   const API_URL = process.env.NEXT_PUBLIC_API;

//   useEffect(() => {
//     fetchTanks();
//   }, [fetchTanks]);

//   // ✅ When tank changes, auto-display its fuelType
//   useEffect(() => {
//     const selectedTank = tanks.find((t) => t._id === tank);
//     setFuelType(selectedTank?.fuelType || "");
//   }, [tank, tanks]);

//   // ✅ Handle form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     setMessageType("");

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setMessage("Authorization token missing!");
//         setMessageType("error");
//         setLoading(false);
//         return;
//       }

//       const response = await fetch(`${API_URL}/api/delivery/add-supply`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           tank, // ✅ send tank _id
//           pricePerLtr: price,
//           quantity, // ✅ changed from amount
//           supplier,
//           deliveryDate,
//           status: "Pending",
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage("✅ Delivery scheduled successfully!");
//         setMessageType("success");
//         // Reset fields
//         setTank("");
//         setFuelType("");
//         setPrice("");
//         setQuantity("");
//         setSupplier("");
//         setDeliveryDate("");
//         setTimeout(() => {
//           onclose(); // close modal after short delay
//         }, 1500);
//       } else {
//         setMessage(data.error || data.message || "❌ Something went wrong!");
//         setMessageType("error");
//       }
//     } catch (error) {
//       console.error("Error scheduling delivery:", error);
//       setMessage("Network error, please try again!");
//       setMessageType("error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
//       {/* Modal box */}
//       <div className="bg-white border-2 rounded-lg w-full max-w-[400px] p-3">
//         <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
//           <X className="cursor-pointer" />
//         </div>

//         <div className="mb-4">
//           <h4 className="font-semibold text-lg">Schedule Fuel Delivery</h4>
//           <p>Schedule a new fuel delivery for your station</p>
//         </div>

//         <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
//           <div>
//             <p className="text-sm font-semibold">Select Tank</p>
//             <select
//               className="w-full border-2 p-2 rounded-[8px] border-gray-300"
//               value={formData.tankId}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, tankId: e.target.value }))
//               }
//               required
//               disabled={tankLoading}
//             >
//               <option value="">
//                 {tankLoading ? "Loading tanks..." : "Select tank"}
//               </option>

//               {tanks.map((t) => (
//                 <option key={t._id} value={t._id}>
//                   {t.fuelType
//                     ? `${t.fuelType} ${t.title ? `— ${t.title}` : ""}`
//                     : t.title || "Untitled Tank"}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <p className="text-sm font-semibold">Fuel Type</p>
//             <input
//               value={fuelType || ""}
//               readOnly
//               className="w-full border-2 border-gray-300 p-2 rounded-[8px] bg-gray-100 cursor-not-allowed"
//             />
//           </div>

//           <div>
//             <p className="text-sm font-semibold">Price / litre (₦)</p>
//             <input
//               type="number"
//               className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
//               placeholder="Enter price"
//               value={price}
//               onChange={(e) => setPrice(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <p className="text-sm font-semibold">Quantity (Litres)</p>
//             <input
//               type="number"
//               className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
//               placeholder="Enter quantity"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <p className="text-sm font-semibold">Supplier</p>
//             <input
//               type="text"
//               className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
//               placeholder="Supplier name"
//               value={supplier}
//               onChange={(e) => setSupplier(e.target.value)}
//               required
//             />
//           </div>

//           <div className="mb-6">
//             <p className="text-sm font-semibold">Delivery Date</p>
//             <input
//               type="date"
//               className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
//               value={deliveryDate}
//               onChange={(e) => setDeliveryDate(e.target.value)}
//               required
//             />
//           </div>

//           {message && (
//             <p
//               className={`text-sm text-center mb-2 ${
//                 messageType === "error" ? "text-red-600" : "text-green-600"
//               }`}
//             >
//               {message}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="flex justify-center p-2 bg-blue-600 hover:bg-blue-400 text-white font-semibold rounded-md"
//           >
//             {loading ? "Submitting..." : "Add Supply"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTankStore } from "@/store/tankStore";

export default function ScheduleDeliveryModal({ onclose }) {
  const [tank, setTank] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"

  const { tanks, fetchTanks, loading: tankLoading } = useTankStore();
  const API_URL = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  // ✅ Auto-update fuelType when tank changes
  useEffect(() => {
    const selectedTank = tanks.find((t) => t._id === tank);
    setFuelType(selectedTank?.fuelType || "");
  }, [tank, tanks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Authorization token missing!");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/delivery/add-supply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tank, // ✅ send tank _id
          pricePerLtr: price,
          quantity,
          supplier,
          deliveryDate,
          status: "Pending",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Delivery scheduled successfully!");
        setMessageType("success");
        // Reset form
        setTank("");
        setFuelType("");
        setPrice("");
        setQuantity("");
        setSupplier("");
        setDeliveryDate("");
        setTimeout(() => onclose(), 1500);
      } else {
        setMessage(data.error || data.message || "❌ Something went wrong!");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error scheduling delivery:", error);
      setMessage("Network error, please try again!");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 lg:px-0">
      {/* Modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[400px] p-3">
        <div className="mt-2 mb-4 flex justify-end">
          <X className="cursor-pointer" onClick={onclose} />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Schedule Fuel Delivery</h4>
          <p>Schedule a new fuel delivery for your station</p>
        </div>

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          {/* Tank selection */}
          <div>
            <p className="text-sm font-semibold">Select Tank</p>
            <select
              className="w-full border-2 p-2 rounded-[8px] border-gray-300"
              value={tank}
              onChange={(e) => setTank(e.target.value)}
              required
              disabled={tankLoading}
            >
              <option value="">
                {tankLoading ? "Loading tanks..." : "Select tank"}
              </option>

              {tanks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fuelType
                    ? `${t.fuelType} ${t.title ? `— ${t.title}` : ""}`
                    : t.title || "Untitled Tank"}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel type (read-only) */}
          <div>
            <p className="text-sm font-semibold">Fuel Type</p>
            <input
              value={fuelType || ""}
              readOnly
              className="w-full border-2 border-gray-300 p-2 rounded-[8px] bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Price per litre */}
          <div>
            <p className="text-sm font-semibold">Price / litre (₦)</p>
            <input
              type="number"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold">Quantity (Litres)</p>
            <input
              type="number"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {/* Supplier */}
          <div>
            <p className="text-sm font-semibold">Supplier</p>
            <input
              type="text"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              placeholder="Supplier name"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
            />
          </div>

          {/* Delivery date */}
          <div className="mb-6">
            <p className="text-sm font-semibold">Delivery Date</p>
            <input
              type="date"
              className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-sm text-center mb-2 ${
                messageType === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center p-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md"
          >
            {loading ? "Submitting..." : "Add Supply"}
          </button>
        </form>
      </div>
    </div>
  );
}

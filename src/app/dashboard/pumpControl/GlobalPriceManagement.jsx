import { useEffect, useState } from "react";
import usePumpStore from "@/store/pumpStore";

export default function GlobalPriceManagement() {
  const {pumps, getPumps, updatePriceByFuel, } = usePumpStore();
  const [isUpdating, setIsUpdating] =useState(false)

  // each fuel type state
  const [prices, setPrices] = useState({
    PMS: "",
    Diesel: "",
    Petrol: "",
    Kerosene: "",
    Gas: "",
  });

  //load currrent prices from pumps
  useEffect(() => {
    getPumps();
  }, [getPumps]);

  //auto fill form fields based on pump data
  useEffect(() =>{
    if(pumps.length > 0 ) {
        const fuelPriceMap = {};
        pumps.forEach((pump) => {
            if (pump.fuelType && pump.pricePerLtr) {
                fuelPriceMap[pump.fuelType] = pump.pricePerLtr;
            }
        });
        setPrices((prev) => ({
            ...prev,
            ...fuelPriceMap
        }));
    }
  }, [pumps])

  //  Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrices((prev) => ({ ...prev, [name]: value }));
  };

  //  Handle submit
  const handleUpdateAll = async (e) => {
    e.preventDefault();
    setIsUpdating(true)
    await updatePriceByFuel(prices);
    setIsUpdating(false)
  };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPrices((prev) => ({ ...prev, [name]: value }));
//   };

//   // handle submitting form
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validate input fields
//     if (!prices.PMS && !prices.Diesel && !prices.Kerosene && !prices.Gas) {
//       window.alert("Please enter at least one fuel price before updating.");
//       return;
//     }

//     try {
//       await updatePriceByFuel(prices);
//       window.alert("All prices updated successfully!");
//       setPrices({
//         PMS: "",
//         Diesel: "",
//         Petrol: "",
//         Kerosene: "",
//         Gas: "",
//       });
//     } catch (error) {
//       window.alert("Failed to update prices. Please try again.");
//     }
//   };

  return (
    <div className="rounded-[10px] border-1 border-gray-300 p-4">
      <h3 className="text-2xl font-semibold">Global Price Management</h3>
      <p>Update fuel prices across multiple pumps</p>

      <form className="mt-6" onSubmit={handleUpdateAll}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {["PMS", "Diesel", "Kerosene", "Gas"].map((fuel) =>(
            <div key={fuel}>
                <p className="font-semibold text-sm">{fuel}</p>
                <input
                type="text"
                name={fuel}
                value={prices[fuel] || ""}
                onChange={handleChange}
                className=" border-2 border-gray-400 focus:border-[#0080ff] focus:outline-none p-2 rounded-[8px] w-full"
                placeholder={`Enter ${fuel} price`}
                />
            </div>

            ))}
          {/* <div>
            <p className="font-semibold text-sm">Diesel</p>
            <input
              type="text"
              name="Diesel"
              value={prices.Diesel || ""}
              onChange={handleChange}
              className="border-2 border-gray-400 focus:border-[#0080ff] focus:outline-none p-2 rounded-[8px] w-full"
              placeholder="250"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">Kerosense</p>
            <input
              type="text"
              name="Kerosene"
              value={prices.Kerosene || ""}
              onChange={handleChange}
              className="border-2 border-gray-400 focus:outline-none focus:border-[#0080ff] p-2 rounded-[8px] w-full"
              placeholder="180"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">Gas</p>
            <input
              type="text"
              name="Gas"
              value={prices.Gas || ""}
              onChange={handleChange}
              className="border-2 focus:outline-none focus:border-[#0080ff] border-gray-400 p-2 rounded-[8px] w-full"
              placeholder="120"
            />
          </div> */}
        </div>

        <div className="flex justify-end mt-10">
          <button
            disabled={isUpdating}
            type="submit"
            className="cursor-pointer font-semibold hover:bg-[#0a71d8] bg-[#0080ff] text-white text-sm py-3 px-4 rounded-[8px]"
          >
            {isUpdating ? "Updating..." : "Update All Prices"}
          </button>
        </div>
      </form>
    </div>
  );
}

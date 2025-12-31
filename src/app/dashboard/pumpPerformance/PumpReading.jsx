// import PumpCard from "./PumpCard"
// import { pumpData as data } from "./pumpData"

// export default function PumpReading() {
  
//     return (
//         <div className="bg-white rounded-[24px] p-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {data.map((item) => (
//                     <PumpCard 
//                         key={item.id}
//                         name={item.pumpName}
//                         product={item.pumpProduct}
//                         status={item.pumpStatus}
//                         price={item.pricePerLtr}
//                         litresSold={item.LtrSold}
//                         totalDaySales={item.todaySales}
//                     /> 
//                 ))}
//             </div>
//         </div>
//     )
// }



"use client";

import { useEffect } from "react";
import PumpCard from "./PumpCard";
import useSupervisorStore from "@/store/useSupervisorStore";

export default function PumpReading() {
  const { pumpPerformance, loading, error, fetchPumpPerformance } = useSupervisorStore();

  useEffect(() => {
    fetchPumpPerformance();
  }, [fetchPumpPerformance]);

  // Transform API data to match PumpCard props
  const pumpData = pumpPerformance?.pumps?.map((pump) => ({
    id: pump._id,
    pumpName: pump.pumpTitle,
    pumpProduct: pump.fuelType,
    pricePerLtr: pump.pricePerLtr,
    LtrSold: pump.litresSoldToday,
    todaySales: pump.salesToday,
    pumpStatus: pump.status,
  })) || [];

  // Loading state
  if (loading && !pumpPerformance) {
    return (
      <div className="bg-white rounded-[24px] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border-2 border-gray-300 rounded-[10px] p-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-[24px] p-4">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => fetchPumpPerformance()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (pumpData.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">No pumps found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pumpData.map((item) => (
          <PumpCard 
            key={item.id}
            name={item.pumpName}
            product={item.pumpProduct}
            status={item.pumpStatus}
            price={item.pricePerLtr}
            litresSold={item.LtrSold}
            totalDaySales={item.todaySales}
          />
        ))}
      </div>
    </div>
  );
}
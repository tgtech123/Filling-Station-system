// "use client"
// import { readingData as data } from "./readingData"
// import TankCard from "./TankCard"

// export default function ReadingPage() {
//     return (
//         <div className="mt-3 bg-white p-3 lg:p-6 rounded-[24px]">
//             {data.map((item) => (
//                 <TankCard 
//                     key={item.id}
//                     tankName={item.tankName}
//                     productType={item.productType}
//                     status={item.status}
//                     lastUpdated={item.lastUpdated}
//                     systemReading={item.systemReading}
//                 />
//             ))}
//         </div>
//     )
// }

"use client";

import { useEffect } from "react";
import TankCard from "./TankCard";
import useSupervisorStore from "@/store/useSupervisorStore";

export default function ReadingPage() {
  const { dipReadings, fetchDipReadings, loading } = useSupervisorStore();

  useEffect(() => {
    // Fetch real dip readings from API
    fetchDipReadings();
  }, [fetchDipReadings]);

  if (loading && !dipReadings) {
    return (
      <div className="mt-3 bg-white p-3 lg:p-6 rounded-[24px] flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading dip readings...</p>
      </div>
    );
  }

  if (!dipReadings?.tanks || dipReadings.tanks.length === 0) {
    return (
      <div className="mt-3 bg-white p-3 lg:p-6 rounded-[24px] flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No tanks found.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white p-3 lg:p-6 rounded-[24px]">
      {dipReadings.tanks.map((tank) => (
        <TankCard
          key={tank._id}
          tankId={tank._id}  // ← THIS IS THE CRITICAL FIX!
          tankName={tank.tankTitle}
          productType={tank.fuelType}
          systemReading={tank.systemReading}
          lastUpdated={new Date(tank.lastUpdated).toLocaleDateString()}
          initialStatus={tank.status}
          onReadingSubmitted={(data) => {
            console.log("Reading submitted:", data);
            // Optionally refresh the readings after submission
            fetchDipReadings();
          }}
        />
      ))}
    </div>
  );
}

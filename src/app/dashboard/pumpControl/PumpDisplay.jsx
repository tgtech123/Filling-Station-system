import DisplayCard from "@/components/Dashboard/DisplayCard";
// import { pumpDisplayData } from "./pumpControlData";
import PumpControlCard from "./PumpControlCard";
import GlobalPriceManagement from "./GlobalPriceManagement";
import usePumpStore from "@/store/pumpStore";
import { useEffect } from "react";


export default function PumpDisplay({fuelType}) {
  const {pumps, getPumps, loading, error} = usePumpStore()


  // fetch pumps when the component mounts
  useEffect(()=> {
    getPumps();
  }, [getPumps])

  return (
    <DisplayCard>

        <div className="flex justify-between items-center mb-4 ">
            <h2 className="text-[1.125rem] font-semibold"> Pumps Overview</h2>
        </div>

        {/* handle loading and error */}
        {loading && <p className="text-neutral-500">Loading pumps...</p>}
        {error && <p className="text-neutral-500">{error}</p>}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {pumps && pumps.length > 0 ? (
          pumps.map((pump, index) => (
            <PumpControlCard
              key={pump.pumpId || index}
              pumpId={pump.pumpId}
              pumpName={pump.title || `Pump ${index + 1}`}
              productType={pump.fuelType || "Unknown"}
              status={pump.status}
              pricePerLtr={`₦${pump.pricePerLtr}`}
              salesToday={`₦${pump.totalSales || 0}`}
              ltsSold={`${pump.totalLtrSold || 0} Ltrs`}
              lastMaintenance={
                pump.lastMaintenance
                  ? new Date(pump.lastMaintenance).toLocaleDateString()
                  : "N/A"
              }
            />
          ))
        ) : (
          !loading && (
            <p className="text-gray-500 text-center w-full">
              No pumps found. Add a new one to get started.
            </p>
          )
        )}
      </div>

      <div className="mt-2">
        <GlobalPriceManagement />
      </div>
    </DisplayCard>
  );
}

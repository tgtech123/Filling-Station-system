import DisplayCard from "@/components/Dashboard/DisplayCard";
import { pumpDisplayData } from "./pumpControlData";
import PumpControlCard from "./PumpControlCard";
import GlobalPriceManagement from "./GlobalPriceManagement";
export default function PumpDisplay() {
  return (
    <DisplayCard>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {pumpDisplayData.map((item) => (
          <PumpControlCard 
            key={item.id} 
            pumpName={item.pumpName}
            productType={item.productType}
            status={item.status}
            pricePerLtr={item.pricePerLtr}
            salesToday={item.salesToday}
            ltsSold={item.ltsSold}
            lastMaintenance={item.lastMaintenance}
          />
        ))}
      </div>

      <div className="mt-2">
        <GlobalPriceManagement />
      </div>
    </DisplayCard>
  );
}

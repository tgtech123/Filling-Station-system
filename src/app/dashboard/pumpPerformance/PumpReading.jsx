import PumpCard from "./PumpCard"
import { pumpData as data } from "./pumpData"

export default function PumpReading() {
  
    return (
        <div className="bg-white rounded-[24px] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item) => (
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
    )
}
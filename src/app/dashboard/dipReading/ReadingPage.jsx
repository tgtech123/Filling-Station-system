import { readingData as data } from "./readingData"
import TankCard from "./TankCard"

export default function ReadingPage() {
    return (
        <div className="mt-3 bg-white p-3 lg:p-6 rounded-[24px]">
            {data.map((item) => (
                <TankCard 
                    key={item.id}
                    tankName={item.tankName}
                    productType={item.productType}
                    status={item.status}
                    lastUpdated={item.lastUpdated}
                    systemReading={item.systemReading}
                />
            ))}
        </div>
    )
}
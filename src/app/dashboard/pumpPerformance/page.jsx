import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import PumpReading from "./PumpReading";

export default function PumpPerformance() {
    return (
        <DashboardLayout>
            <header className="mb-4">
                <h2 className="text-2xl font-semibold mb-1">Pump performance</h2>
                <p>Pump performance and fuel utilization</p>
            </header>

            <PumpReading />
        
        </DashboardLayout>
    )
}
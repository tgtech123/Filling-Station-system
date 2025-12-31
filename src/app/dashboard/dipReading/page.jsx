import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReadingPage from "./ReadingPage";


export default function DipReading() {
    return (
        <DashboardLayout>
            <h2 className="text-[1.5rem] text-neutral-800 font-semibold mt-4 mb-2">Dip Reading Comparison</h2>
            <p className="text-[1.18rem] text-neutral-800">Manual dip reading to compare with system</p>
            <ReadingPage />
        </DashboardLayout>
    )
}
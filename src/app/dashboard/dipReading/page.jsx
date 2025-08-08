import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReadingPage from "./ReadingPage";


export default function DipReading() {
    return (
        <DashboardLayout>
            <h2 className="text-2xl font-semibold mt-4 mb-2">Dip Reading Comparison</h2>
            <p>Manual dip reading to compare with system</p>
            <ReadingPage />
        </DashboardLayout>
    )
}
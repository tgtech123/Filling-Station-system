import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import SalesReport from "./SalesReport";

export default function Sales() {
    return (
        <DashboardLayout>
           <h2 className="text-2xl font-semibold mb-2">Sales Report Page</h2>
           <p className="mb-2 font-medium">Preview and export your sales report</p>

            <SalesReport />
        </DashboardLayout>
     
    )
}
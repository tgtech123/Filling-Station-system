import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { IoMdArrowDropright } from "react-icons/io";
import StaffTable from "./StaffTable";

export default function StaffTracking() {
    return (
        <DashboardLayout>
            <h2 className="text-2xl font-semibold text-gray-600">Commissions</h2>
            <div className="my-4 flex items-center gap-1 font-semibold">
                <h4 className="text-gray-500">Commission</h4>
                <IoMdArrowDropright className="text-gray-600" size={24}/>
                <h4 className="text-[#1a71f6]">Staff Tracking</h4>
            </div>
            <StaffTable />
        </DashboardLayout>
    )
}
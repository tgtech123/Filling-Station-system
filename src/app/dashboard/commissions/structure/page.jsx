import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RxTriangleRight } from "react-icons/rx";
import CommStructure from "./CommStructure";


export default function Structure() {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold text-neutral-800 mt-5">Commissions</h1>
            <span className="flex gap-1 items-center mb-5">
                <p className="text-lg text-neutral-400">Commission</p>
                <RxTriangleRight size={28} className="text-neutral-500"/>
                <p className="text-blue-600 font-bold">Commission structure</p>
            </span>

            <CommStructure/>
        </DashboardLayout>
    )
}
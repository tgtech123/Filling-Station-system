'use client'
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RxTriangleRight } from "react-icons/rx";
import OverviewCard from "./OverviewCard";


export default function Overview() {
    return (
        <DashboardLayout>
            <div className="flex flex-col mt-6">
                <h1 className="text-2xl text-neutral-800 font-bold mb-1">Commissions</h1>
                <span className="flex">
                    <p className="text-neutral-400 font-medium">Commission </p>
                    <RxTriangleRight size={28} className="text-neutral-500"/>
                    <p className="text-blue-600 font-semibold">Overview</p>
                </span>
                <OverviewCard/>
            </div>
        </DashboardLayout>
    )
}
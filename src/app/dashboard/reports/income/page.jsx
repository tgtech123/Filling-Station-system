import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ExportButton from "@/components/ExportButton";
import { RxTriangleRight } from "react-icons/rx";
import IncomeCards from "./IncomeCards";
import FuelIncome from "./FuelIncome";
import DurationBtn from "./DurationBtn";

export default function Income() {
    return (
        <DashboardLayout>
            <div className="w-full px-4 sm:px-6 lg:px-1">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-lg lg:text-xl text-neutral-700 font-bold mb-2">
                    Reports
                </h1>
                <div className="flex flex-wrap items-center gap-1 text-sm sm:text-base">
                <p className="text-neutral-400 font-medium">Report</p>
                <RxTriangleRight size={20} className="text-neutral-500" />
                <p className="text-blue-600 font-semibold">Income</p>
                </div>
            </div>

            {/* Income Section */}
            <div className="bg-white rounded-xl p-4 sm:p-6 ">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left side */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-lg sm:text-xl text-[#525252] font-semibold">
                    Income
                    </h1>
                    <p className="text-sm sm:text-md text-[#525252]">
                    View and export all generated income
                    </p>
                </div>

                {/* Right side buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    <ExportButton />
                    <DurationBtn />
                </div>
                </div>

                {/* Income Cards (auto adjust grid) */}
                <div className="mt-6">
                <IncomeCards />
                </div>
            </div>

            {/* Fuel Income Section */}
            <div className="mt-3">
                <FuelIncome />
            </div>
            </div>
        </DashboardLayout>
    )
}
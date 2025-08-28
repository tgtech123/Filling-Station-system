"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, Filter, ListFilter, Search } from "lucide-react";
import { fuelSalesColumns, fuelSalesData } from "./attendantReportData";
import { useState } from "react";
import DurationModal from "./DurationModal";

export default function AttendantReport() {
    const [openDurationModal, setOpenDurationModal] = useState(false)
    return (
        <DashboardLayout>
            <header className="mt-2 mb-6">
                <h2 className="text-2xl font-semibold">Reconciled Attendant Report</h2>
                <p>Summary of reconciled attendant sales</p>
            </header>

            <DisplayCard>
                <section className="flex flex-col lg:flex-row gap-3 lg;gap-0 justify-between items-center">
                    <div className="relative w-full lg:w-[40%]">
                        <input 
                            type="text"
                            className="p-2 rounded-[8px] border-2 border-gray-300 w-full" 
                            placeholder="Search by attendant/product"
                        />
                        <Search className="absolute text-gray-300 top-2 right-4" />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]" onClick={() => setOpenDurationModal(true)}>
                            Duration
                            <ChevronDown />
                        </button>
                        <button className="flex gap-2 border-2 border-gray-300 p-2 rounded-[12px]">
                            Filter
                            <ListFilter />
                        </button>
                        <button className="flex gap-2 bg-[#0080ff] text-white py-2 px-4 rounded-[12px]">
                            Export
                            <Download />
                        </button>
                    </div>
                </section>

                <Table 
                    columns={fuelSalesColumns}
                    data={fuelSalesData}
                />
            </DisplayCard>

            {openDurationModal && (
                <DurationModal />
            )}
               
        </DashboardLayout>
    )
}
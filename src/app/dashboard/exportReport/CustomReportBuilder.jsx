"use client";

import CustomDropdown from "@/components/CustomDropdown";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import { reportTypeOptions, pumpNoOptions, prodTypeOptions, shiftTypeOptions } from "./exportReportData";
import { useState } from "react";
import DurationDropdown from "@/components/DurationDropdown";


export default function CustomReportBuilder() {
    const [ selectedReportType, setSelectedReportType ] = useState(reportTypeOptions[0]);
    const [ selectedPumpNo, setSelectedPumpNo ] = useState(pumpNoOptions[0]);
    const [ selectedProdType, setSelectedProdType ] = useState(prodTypeOptions[0]);
    const [ selectedShiftType, setSelectedShiftType ] = useState(shiftTypeOptions[0]);
    return (
        <DisplayCard>
            <section>
                <h3 className="mb-2 text-2xl font-semibold">Custom Report Builder</h3>
                <p className="text-gray-600">Create and generate report</p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                <CustomDropdown 
                    label="Report type"
                    options={reportTypeOptions}
                    selected={selectedReportType}
                />
                <DurationDropdown />

                <CustomDropdown 
                    label="Report type"
                    options={reportTypeOptions}
                    selected={selectedReportType}
                />

                <CustomDropdown 
                    label="Pump no"
                    options={pumpNoOptions}
                    selected={selectedPumpNo}
                />

                <CustomDropdown 
                    label="Product Type"
                    options={prodTypeOptions}
                    selected={selectedProdType}
                />

                <CustomDropdown 
                    label="Shift Type"
                    options={shiftTypeOptions}
                    selected={selectedShiftType}
                />
            </div>
            <div className="flex justify-end">
                <button className="bg-[#0080ff] text-white text-sm py-2 px-6 rounded-[8px] ">Export Report</button>
            </div>
        </DisplayCard>
    )
}
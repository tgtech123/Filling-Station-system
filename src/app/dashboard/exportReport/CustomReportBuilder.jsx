"use client";

import CustomDropdown from "@/components/CustomDropdown";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import { reportTypeOptions } from "./exportReportData";
import { useState } from "react";


export default function CustomReportBuilder() {
    const [ selectedReportType, setSelectedReportType ] = useState(reportTypeOptions[0]);
    return (
        <DisplayCard>
            <section>
                <h3 className="mb-2 text-2xl font-semibold">Custom Report Builder</h3>
                <p className="text-gray-600">Create and generate report</p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3">

                <CustomDropdown 
                    label="Report type"
                    options={reportTypeOptions}
                    selected={selectedReportType}
                />
            </div>
        </DisplayCard>
    )
}
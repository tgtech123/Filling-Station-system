"use client";
import { useState } from "react";
import useManagerReportsStore from "@/store/useManagerReportsStore";
import CustomDropdown from "@/components/CustomDropdown";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import DurationDropdown from "@/components/DurationDropdown";
import {
  reportTypeOptions,
  pumpNoOptions,
  prodTypeOptions,
  shiftTypeOptions,
  Role,
} from "./exportReportData";

// ── Map dropdown labels → API reportType strings ──────────────────────────────
const LABEL_TO_API_TYPE = {
  "Sales report":         "sales",
  "Cash reconciliation":  "cash_reconciliation",
  "Lubricant sales":      "lubricant_inventory",
  "Inventory report":     "fuel_inventory",
  "Shift report":         "shift",
  "Staff performance":    "staff_performance",
  "Financial summary":    "financial_summary",
  "System activity logs": "activity_logs",
};

export default function CustomReportBuilder() {
  const [selectedReportType, setSelectedReportType] = useState(reportTypeOptions[0]);
  const [selectedRole,       setSelectedRole]       = useState(Role[0]);
  const [selectedPumpNo,     setSelectedPumpNo]     = useState(pumpNoOptions[4]);
  const [selectedProdType,   setSelectedProdType]   = useState(prodTypeOptions[0]);
  const [selectedShiftType,  setSelectedShiftType]  = useState(shiftTypeOptions[3]);
  const [dateRange,          setDateRange]          = useState({ startDate: "", endDate: "" });

  const downloadReportCsv = useManagerReportsStore((state) => state.downloadReportCsv);
  const exportLoading     = useManagerReportsStore((state) => state.loading.export);
  const exportError       = useManagerReportsStore((state) => state.errors.export);
  const clearError        = useManagerReportsStore((state) => state.clearError);

  const handleExport = async () => {
    const reportType = LABEL_TO_API_TYPE[selectedReportType.value];

    if (!reportType) {
      alert("Please select a valid report type.");
      return;
    }

    const params = {
      reportType,
      ...(dateRange.startDate && { startDate: dateRange.startDate }),
      ...(dateRange.endDate   && { endDate:   dateRange.endDate   }),
      ...(!dateRange.startDate && !dateRange.endDate && { duration: "thismonth" }),
      ...(selectedPumpNo.value    !== "All" && { pumpNumber:  selectedPumpNo.value    }),
      ...(selectedProdType.value  !== "All" && { productType: selectedProdType.value  }),
      ...(selectedShiftType.value !== "All" && { shiftType:   selectedShiftType.value }),
      ...(selectedRole.value.trim() !== "All" && { role:      selectedRole.value.trim() }),
    };

    const filename = `${reportType}_${new Date().toISOString().split("T")[0]}.csv`;

    try {
      await downloadReportCsv(params, filename);
    } catch {
      // Error is already surfaced in exportError via the store
    }
  };

  return (
    <DisplayCard>
      <section>
        <h3 className="mb-2 text-2xl font-semibold">Custom Report Builder</h3>
        <p className="text-gray-600">Create and generate a tailored report</p>
      </section>

      {/* Error banner */}
      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex justify-between items-center">
          <span>{exportError}</span>
          <button
            onClick={() => clearError("export")}
            className="ml-4 text-red-400 hover:text-red-600 font-bold text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <CustomDropdown
          label="Report type"
          options={reportTypeOptions}
          selected={selectedReportType}
          onSelect={setSelectedReportType}
        />

        <DurationDropdown onDateChange={(dates) => setDateRange(dates)} />

        <CustomDropdown
          label="Role"
          options={Role}
          selected={selectedRole}
          onSelect={setSelectedRole}
        />

        <CustomDropdown
          label="Pump no"
          options={pumpNoOptions}
          selected={selectedPumpNo}
          onSelect={setSelectedPumpNo}
        />

        <CustomDropdown
          label="Product Type"
          options={prodTypeOptions}
          selected={selectedProdType}
          onSelect={setSelectedProdType}
        />

        <CustomDropdown
          label="Shift Type"
          options={shiftTypeOptions}
          selected={selectedShiftType}
          onSelect={setSelectedShiftType}
        />
      </div>

      {/* Export button */}
      <div className="flex items-center justify-end mt-2">
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className={`text-white text-md py-2 px-6 rounded-[8px] font-semibold  transition-colors ${
            exportLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0080ff] hover:bg-blue-600"
          }`}
        >
          {exportLoading ? "Exporting…" : "Export Report as CSV"}
        </button>
      </div>

      {exportLoading && (
        <p className="text-sm text-blue-600 text-right mt-2">
          Generating your report, please wait…
        </p>
      )}
    </DisplayCard>
  );
}
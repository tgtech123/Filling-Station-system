"use client";

import { useState } from "react";
import useReportStore from "@/store/useReportStore";
import CustomDropdown from "@/components/CustomDropdown";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import DurationDropdown from "@/components/DurationDropdown";
import { reportTypeOptions, pumpNoOptions, prodTypeOptions, shiftTypeOptions, Role } from "./exportReportData";

export default function CustomReportBuilder() {
  const [selectedReportType, setSelectedReportType] = useState(reportTypeOptions[0]);
  const [selectedRole, setSelectedRole] = useState(Role[0]);
  const [selectedPumpNo, setSelectedPumpNo] = useState(pumpNoOptions[4]); // "All"
  const [selectedProdType, setSelectedProdType] = useState(prodTypeOptions[0]); // "All"
  const [selectedShiftType, setSelectedShiftType] = useState(shiftTypeOptions[3]); // "All"
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isExporting, setIsExporting] = useState(false);

  const {
    generateSalesReport,
    generateCashReconciliationReport,
    generateShiftReport,
    generateFuelInventoryReport,
    generateStaffPerformanceReport,
    generateActivityLogsReport,
    generateLubricantInventoryReport,
    exportReportAsCSV,
    getAllReports,
  } = useReportStore();

  const handleExport = async () => {
    const reportType = selectedReportType.value.toLowerCase();

    // Validate date range for reports that need it
    const needsDateRange = ![
      "all reports",
      "inventory report",
      "lubricant sales",
    ].includes(reportType);

    if (needsDateRange && (!dateRange.startDate || !dateRange.endDate)) {
      alert("Please select a date range for this report type");
      return;
    }

    setIsExporting(true);

    try {
      let reportData;
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      // Generate report based on selected type
      if (reportType === "sales report") {
        reportData = await generateSalesReport({
          ...params,
          productType: selectedProdType.value !== "All" ? selectedProdType.value : undefined,
          pumpNo: selectedPumpNo.value !== "All" ? selectedPumpNo.value : undefined,
        });
      } else if (reportType === "cash reconciliation") {
        reportData = await generateCashReconciliationReport(params);
      } else if (reportType === "shift report") {
        reportData = await generateShiftReport({
          ...params,
          shiftType: selectedShiftType.value !== "All" ? selectedShiftType.value : undefined,
        });
      } else if (reportType === "inventory report") {
        reportData = await generateFuelInventoryReport();
      } else if (reportType === "staff performance") {
        reportData = await generateStaffPerformanceReport({
          ...params,
          role: selectedRole.value !== "All " ? selectedRole.value : undefined,
        });
      } else if (reportType === "system activity logs") {
        reportData = await generateActivityLogsReport(params);
      } else if (reportType === "lubricant sales") {
        reportData = await generateLubricantInventoryReport();
      } else if (reportType === "all reports") {
        alert("Please select a specific report type");
        return;
      } else {
        alert("Report type not supported yet");
        return;
      }

      // Download the report as CSV (Excel format)
      if (reportData) {
        const filename = `${selectedReportType.value.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }`;
        exportReportAsCSV(reportData, filename);
        alert("✅ Report exported successfully as CSV! Check your downloads folder. You can open it in Excel.");
      }
    } catch (error) {
      console.error("Export error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to export report. Please try again.";
      alert(`❌ Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

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

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`${
            isExporting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0080ff] hover:bg-blue-600"
          } text-white text-sm py-2 px-6 rounded-[8px] transition-colors`}
        >
          {isExporting ? "Exporting..." : "Export Report"}
        </button>
      </div>

      {isExporting && (
        <p className="text-sm text-blue-600 text-right mt-2">
          Generating your report, please wait...
        </p>
      )}
    </DisplayCard>
  );
}
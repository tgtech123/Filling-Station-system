"use client";
import { CupSoda, Download } from "lucide-react";
import useManagerReportsStore from "@/store/useManagerReportsStore";

// ── Map card titles → API reportType strings 
// API accepted values (from docs): sales | cash_reconciliation | shift |
// fuel_inventory | staff_performance | activity_logs | lubricant_inventory | financial_summary
const TITLE_TO_REPORT_TYPE = {
  "Sales Report":          "sales",
  "Cash Reconciliation":   "cash_reconciliation",
  "Shift Reports":         "shift",
  "Fuel Inventory":        "fuel_inventory",
  "Staff Performance":     "staff_performance",
  "System Activity Logs":  "activity_logs",
  "Lubricant Inventory":   "lubricant_inventory",
};

export default function ExportReportCard({ title, desc }) {
  const downloadReportCsv = useManagerReportsStore((state) => state.downloadReportCsv);
  const exportLoading     = useManagerReportsStore((state) => state.loading.export);

  const handleExport = async () => {
    const reportType = TITLE_TO_REPORT_TYPE[title];
    if (!reportType) {
      alert(`Export not configured for: ${title}`);
      return;
    }

    try {
      // Downloads CSV directly to the browser — no state stored
      await downloadReportCsv(
        { reportType, duration: "thismonth", format: "csv" },
        `${reportType}_${new Date().toISOString().split("T")[0]}.csv`
      );
    } catch (error) {
      // Error is already stored in errors.export by the store;
      // the banner in ExportReport.jsx will surface it
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="border-2 border-gray-300 p-4 rounded-[10px]">
      <section className="mb-10 flex gap-3 justify-start">
        <div className="h-10 w-10 rounded-full flex justify-center items-center bg-[#0080ff] text-white flex-shrink-0">
          <CupSoda />
        </div>
        <div>
          <h5 className="text-lg font-semibold mb-2">{title}</h5>
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
      </section>

      <button
        onClick={handleExport}
        disabled={exportLoading}
        className={`flex justify-center font-semibold items-center gap-2 w-full py-2 text-sm rounded-[8px] transition-colors ${
          exportLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#0080ff] text-white hover:bg-blue-600 cursor-pointer"
        }`}
      >
        {exportLoading ? "Exporting…" : "Export Report"}
        <Download size={16} />
      </button>
    </div>
  );
}







// import { CupSoda, Download } from "lucide-react";

// export default function ExportReportCard({title, desc}) {
//     return (
//         <div className="border-2 border-gray-300 p-4 rounded-[10px]">
//             <section className="mb-10 flex gap-3 justify-start">
//                 <div className="h-10 w-10 rounded-full flex justify-center items-center bg-[#0080ff] text-white">
//                     <CupSoda />
//                 </div>
//                 <div>
//                     <h5 className="text-lg font-semibold mb-2">{title}</h5>
//                     <p className="text-sm text-gray-600">
//                         {desc}
//                     </p>
//                 </div>
//             </section>

//             <button className="flex justify-center font-semibold cursor-pointer items-center gap-2 w-full py-2 text-sm bg-[#0080ff] text-white rounded-[8px]">
//                 Export Report
//                 <Download />
//             </button> 
//         </div>
//     )
// }
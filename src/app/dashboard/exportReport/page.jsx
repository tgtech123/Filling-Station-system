// "use client";

// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";
// import { reportType } from "./exportReportData";
// import ExportReportCard from "./ExportReportCard";
// import CustomReportBuilder from "./CustomReportBuilder";
// import { useState } from "react";
// import ManagerProfileModal from "./ManagerProfileModal";


// export default function ExportReport() {
//   const [showProfileModal, setShowProfileModal] = useState(false)

//   function toggleProfileModal() {
//     setShowProfileModal(true)
//   }
//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[150px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
//         <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
//           <Link
//             href="/dashboard"
//             className="cursor-pointer border-3 flex  gap-2 border-none lg:border-[#0080ff]  py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold"
//           >
//             <ArrowLeft />
//             Back to Dashboard
//           </Link>
//           <h4 className="text-2xl font-semibold">Export Reports</h4>
//           <div onClick={toggleProfileModal} className="cursor-pointer text-[#0080ff]">View Profile</div>
//         </div>
        
//       </header>


//         <div className="px-6 lg:px-[40px]">
//             <DisplayCard>
//                 <h4 className="text-2xl font-semibold text-gray-700">Export Reports</h4>
//                 <p>
//                     Generate and export comprehensive station reports 
//                 </p>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                     {reportType.map((item) => (
//                         <ExportReportCard 
//                             key={item.id}
//                             title={item.title}
//                             desc={item.desc}
//                         />
//                     ))}
//                 </div>
//             </DisplayCard>
//         </div>

//         <div className="mt-10 px-6 lg:px-[40px] pb-20">
//             <CustomReportBuilder />
//         </div>


//         {showProfileModal && (
//           <ManagerProfileModal onclose={() => setShowProfileModal(false)} />
//         )}
//     </div>
//   );
// }


"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import { ArrowLeft, Download, FileText, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { reportType } from "./exportReportData";
import ExportReportCard from "./ExportReportCard";
import CustomReportBuilder from "./CustomReportBuilder";
import { useState, useEffect } from "react";
import ManagerProfileModal from "./ManagerProfileModal";
import useReportStore from "@/store/useReportStore";

export default function ExportReport() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [showReportViewer, setShowReportViewer] = useState(false);

  const {
    currentReport,
    reports,
    loading,
    error,
    pagination,
    getAllReports,
    getReportById,
    clearError,
    clearCurrentReport,
    downloadReportAsJSON,
    exportReportAsCSV,
  } = useReportStore();

  // Fetch all reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const fetchReports = async () => {
    try {
      await getAllReports({ page: 1, limit: 20 });
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  function toggleProfileModal() {
    setShowProfileModal(true);
  }

  const handleReportGenerated = (reportData) => {
    setShowReportViewer(true);
    // Refresh the reports list
    fetchReports();
  };

  const handleDownloadJSON = () => {
    if (currentReport) {
      const reportType = currentReport.reportType || selectedReportType || 'report';
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${reportType}_${dateStr}`;
      downloadReportAsJSON(currentReport, filename);
    }
  };

  const handleExportCSV = () => {
    if (!currentReport) return;

    let dataToExport = [];
    const reportData = currentReport;

    // Extract appropriate data based on report structure
    if (reportData.productBreakdown && Array.isArray(reportData.productBreakdown)) {
      // Sales Report
      dataToExport = reportData.productBreakdown.flatMap(product => 
        product.pumpBreakdown?.map(pump => ({
          product: product.product,
          pump: pump.pump,
          date: pump.date,
          litres: pump.litres,
          amount: pump.amount,
          shifts: pump.shifts,
          avgPrice: pump.avgPrice
        })) || []
      );
    } else if (reportData.reconciliations && Array.isArray(reportData.reconciliations)) {
      // Cash Reconciliation Report
      dataToExport = reportData.reconciliations;
    } else if (reportData.attendantBreakdown && Array.isArray(reportData.attendantBreakdown)) {
      // Shift Report
      dataToExport = reportData.attendantBreakdown.flatMap(attendant =>
        attendant.shifts?.map(shift => ({
          attendant: attendant.attendantName,
          date: shift.date,
          shiftType: shift.shiftType,
          pump: shift.pump,
          product: shift.product,
          litres: shift.litres,
          amount: shift.amount
        })) || []
      );
    } else if (reportData.inventory && Array.isArray(reportData.inventory)) {
      // Inventory Reports (Fuel or Lubricant)
      dataToExport = reportData.inventory;
    } else if (reportData.staffPerformance && Array.isArray(reportData.staffPerformance)) {
      // Staff Performance Report
      dataToExport = reportData.staffPerformance.map(staff => ({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        totalShifts: staff.metrics?.totalShifts,
        totalSales: staff.metrics?.totalSales,
        totalLitres: staff.metrics?.totalLitres,
        avgSalesPerShift: staff.metrics?.avgSalesPerShift
      }));
    } else if (reportData.recentLogs && Array.isArray(reportData.recentLogs)) {
      // Activity Logs Report
      dataToExport = reportData.recentLogs;
    } else if (reportData.summary) {
      // Fallback to summary
      dataToExport = [reportData.summary];
    }

    if (dataToExport.length > 0) {
      const reportType = currentReport.reportType || selectedReportType || 'report';
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${reportType}_${dateStr}`;
      exportReportAsCSV(dataToExport, filename);
    }
  };

  const handleCloseReportViewer = () => {
    setShowReportViewer(false);
    clearCurrentReport();
    setSelectedReportType(null);
  };

  const handleViewReport = async (reportId) => {
    try {
      await getReportById(reportId);
      setShowReportViewer(true);
    } catch (err) {
      console.error("Failed to load report:", err);
    }
  };

  const formatReportType = (type) => {
    return type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Unknown";
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[150px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className="mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link
            href="/dashboard"
            className="cursor-pointer border-3 flex gap-2 border-none lg:border-[#0080ff] py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold"
          >
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-2xl font-semibold">Export Reports</h4>
          <div
            onClick={toggleProfileModal}
            className="cursor-pointer text-[#0080ff] hover:underline"
          >
            View Profile
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="mx-6 lg:mx-[40px] mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader2 className="w-12 h-12 animate-spin text-[#0080ff]" />
            <p className="text-lg font-semibold text-gray-800">Generating Report...</p>
            <p className="text-sm text-gray-500">Please wait while we process your data</p>
          </div>
        </div>
      )}

      {/* Report Viewer Modal */}
      {showReportViewer && currentReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {formatReportType(currentReport.reportType || selectedReportType)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Generated on {new Date().toLocaleString()}
                </p>
                {currentReport.dateRange && (
                  <p className="text-xs text-gray-500 mt-1">
                    Period: {new Date(currentReport.dateRange.startDate).toLocaleDateString()} - {new Date(currentReport.dateRange.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                  title="Download as JSON"
                >
                  <Download size={16} />
                  JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg"
                  title="Export as CSV"
                >
                  <FileText size={16} />
                  CSV
                </button>
                <button
                  onClick={handleCloseReportViewer}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <pre className="text-xs lg:text-sm overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(currentReport, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Cards Section */}
      <div className="px-6 lg:px-[40px]">
        <DisplayCard>
          <h4 className="text-2xl font-semibold text-gray-700">
            Export Reports
          </h4>
          <p className="text-gray-600 mb-6">
            Generate and export comprehensive station reports
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {reportType.map((item) => (
              <ExportReportCard
                key={item.id}
                title={item.title}
                desc={item.desc}
                onReportGenerated={handleReportGenerated}
                onReportTypeSelected={(type) => setSelectedReportType(type)}
              />
            ))}
          </div>
        </DisplayCard>
      </div>

      {/* Custom Report Builder */}
      <div className="mt-10 px-6 lg:px-[40px] pb-20">
        <CustomReportBuilder onReportGenerated={handleReportGenerated} />
      </div>

      {/* Recent Reports Section */}
      {reports.length > 0 && (
        <div className="mt-10 px-6 lg:px-[40px] pb-20">
          <DisplayCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-700">
                  Recent Reports
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  View and download your previously generated reports
                </p>
              </div>
              <button
                onClick={fetchReports}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-[#0080ff] hover:text-blue-700 font-medium disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                      Report Type
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                      Date Range
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                      Generated
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.slice(0, 10).map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          {formatReportType(report.reportType)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(report.dateRange.startDate).toLocaleDateString()} - {new Date(report.dateRange.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.status === "Generated"
                              ? "bg-green-100 text-green-800"
                              : report.status === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewReport(report._id)}
                          className="text-[#0080ff] hover:text-blue-700 hover:underline text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {reports.length} of {pagination.total} reports
                </span>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
            )}
          </DisplayCard>
        </div>
      )}

      {showProfileModal && (
        <ManagerProfileModal onclose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
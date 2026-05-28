"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useSalaryStore from "@/store/useSalaryStore";
import {
  Building2, Users, DollarSign, ChevronDown, ChevronUp,
  Download, Printer, AlertCircle, ArrowLeft, Calendar,
} from "lucide-react";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const monthLabel = (m) => {
  if (!m) return "N/A";
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("default", {
    month: "long", year: "numeric",
  });
};

const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-xs text-gray-400 italic">No payroll</span>;
  const map = {
    draft: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    submitted: "bg-blue-100 text-blue-700 border border-blue-200",
    validated: "bg-green-100 text-green-700 border border-green-200",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const roleColor = (role) => {
  const map = {
    manager: "bg-purple-100 text-purple-700",
    accountant: "bg-blue-100 text-blue-700",
    supervisor: "bg-indigo-100 text-indigo-700",
    attendant: "bg-teal-100 text-teal-700",
    cashier: "bg-orange-100 text-orange-700",
  };
  return map[role?.toLowerCase()] || "bg-gray-100 text-gray-600";
};

const StationSection = ({ station, index }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Station header */}
      <div
        className={`flex items-center justify-between px-5 py-4 cursor-pointer ${
          station.isParent
            ? "bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
            : "bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
        }`}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${station.isParent ? "bg-blue-600" : "bg-gray-600"}`}>
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {station.stationName}
              </span>
              {station.isParent && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                  Main
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">{station.stationCity}</span>
              <StatusBadge status={station.status} />
              {station.month && (
                <span className="text-xs text-gray-400">{monthLabel(station.month)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {station.entries.length} staff
            </p>
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {fmt(station.subtotal)}
            </p>
          </div>
          {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Table */}
      {!collapsed && (
        station.entries.length === 0 ? (
          <div className="flex items-center gap-2 px-5 py-6 text-gray-400 text-sm">
            <AlertCircle size={16} />
            <span>No payroll prepared for this station yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left font-semibold">Staff</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-right font-semibold">Basic Salary</th>
                  <th className="px-4 py-3 text-right font-semibold">Bonus</th>
                  <th className="px-4 py-3 text-right font-semibold">Tax</th>
                  <th className="px-4 py-3 text-right font-semibold">Pension</th>
                  <th className="px-4 py-3 text-right font-semibold">Shortage</th>
                  <th className="px-4 py-3 text-right font-semibold text-green-700 dark:text-green-400">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {station.entries.map((e, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {e.firstName} {e.lastName}
                      </div>
                      <div className="text-xs text-gray-400">{e.staffCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColor(e.role)}`}>
                        {e.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{fmt(e.basicSalary)}</td>
                    <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">+{fmt(e.totalBonus)}</td>
                    <td className="px-4 py-3 text-right text-red-500">-{fmt(e.taxAmount)}</td>
                    <td className="px-4 py-3 text-right text-orange-500">-{fmt(e.employeePension)}</td>
                    <td className="px-4 py-3 text-right text-red-500">-{fmt(e.shortage)}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">{fmt(e.salaryToPay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-t-2 border-gray-200 dark:border-gray-600">
                  <td colSpan={7} className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {station.stationName} Subtotal
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-base text-gray-900 dark:text-gray-100">
                    {fmt(station.subtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default function ConsolidatedPayrollPage() {
  const router = useRouter();
  const { fetchConsolidatedPayroll } = useSalaryStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(currentMonthValue());
  const printRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchConsolidatedPayroll(month)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load payroll data"))
      .finally(() => setLoading(false));
  }, [month]);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=1200,height=800");
    win.document.write(`
      <html><head><title>Consolidated Payroll - ${monthLabel(month)}</title>
      <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { padding: 24px; font-size: 11px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 11px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #1e3a5f; color: white; padding: 6px 10px; text-align: left; font-size: 10px; }
        td { border-bottom: 1px solid #e5e7eb; padding: 6px 10px; }
        .section-header { background: #f1f5f9; font-weight: bold; padding: 8px 10px; border-top: 2px solid #cbd5e1; }
        .subtotal { background: #f8fafc; font-weight: bold; }
        .grand-total { background: #1e3a5f; color: white; font-weight: bold; font-size: 13px; }
        .badge { font-size: 9px; background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 10px; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Consolidated Payroll
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                All branches combined — super manager view
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-sm">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="text-sm text-gray-700 dark:text-gray-300 bg-transparent outline-none cursor-pointer"
              />
            </div>
            {data && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <Printer size={15} />
                Print
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl px-5 py-4">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Stations", value: data.totalStations, icon: Building2, color: "blue" },
                { label: "Total Staff", value: data.totalStaff, icon: Users, color: "purple" },
                { label: "Period", value: monthLabel(data.month || month), icon: Calendar, color: "indigo" },
                { label: "Grand Total", value: fmt(data.grandTotal), icon: DollarSign, color: "green", large: true },
              ].map(({ label, value, icon: Icon, color, large }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30`}>
                      <Icon size={15} className={`text-${color}-600 dark:text-${color}-400`} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                  <p className={`font-bold text-gray-900 dark:text-gray-100 ${large ? "text-lg" : "text-base"}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Print content */}
            <div ref={printRef}>
              <div className="print-header" style={{ display: "none" }}>
                <h1>Consolidated Payroll Report</h1>
                <p className="meta">Period: {monthLabel(data.month || month)} &nbsp;|&nbsp; Generated: {new Date().toLocaleDateString()}</p>
              </div>

              {/* Station sections */}
              {data.stations.map((station, i) => (
                <StationSection key={station.stationId} station={station} index={i} />
              ))}

              {/* Grand total bar */}
              <div className="rounded-2xl bg-gray-900 dark:bg-gray-950 border border-gray-700 p-5 flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <DollarSign size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Payroll Across All Stations</p>
                    <p className="text-gray-200 text-xs mt-0.5">
                      {data.totalStaff} staff &bull; {data.totalStations} station{data.totalStations !== 1 ? "s" : ""} &bull; {monthLabel(data.month || month)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{fmt(data.grandTotal)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Grand Total</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

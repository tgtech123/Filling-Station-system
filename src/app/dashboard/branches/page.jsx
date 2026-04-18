"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useBranchStore from "@/store/useBranchStore";
import usePaymentStore from "@/store/usePaymentStore";
import AddBranchModal from "@/components/AddBranchModal";
import CrossBranchStaff from "@/components/CrossBranchStaff";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Plus, Crown } from "lucide-react";

export default function BranchesPage() {
  const router = useRouter();
  const { overview, loading, fetchOverview, switchStation, switching } = useBranchStore();
  const { currentPlan, fetchCurrentPlan } = usePaymentStore();
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [pendingInvites, setPendingInvites] = useState({});
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Consolidated report state
  const [reportPeriod, setReportPeriod] = useState("month");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  useEffect(() => {
    if (currentPlan === null) return;
    if (currentPlan?.plan !== "enterprise") {
      router.push("/dashboard/manager");
      return;
    }
    fetchOverview();
  }, [currentPlan]);

  useEffect(() => {
    if (overview?.stations) {
      overview.stations.forEach(async (s) => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/api/branches/${s.id}/invites`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPendingInvites((prev) => ({
            ...prev,
            [s.id]: res.data.invites || [],
          }));
        } catch {}
      });
    }
  }, [overview]);

  const fetchReport = async (period) => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/branches/consolidated-report?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReport(reportPeriod);
    }
  }, [activeTab, reportPeriod]);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Branch Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage and monitor all your filling station branches
            </p>
          </div>
          <button
            onClick={() => setShowAddBranch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Branch
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "overview", label: "Overview" },
            { id: "staff", label: "Staff" },
            { id: "reports", label: "Reports" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20 text-blue-600 font-semibold">
            Loading branch data...
          </div>
        )}

        {/* Overview Tab */}
        {!loading && activeTab === "overview" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overview?.totalBranches || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overview?.totalStaff || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today's Revenue (All)</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₦{(overview?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Branch Cards Grid */}
            {overview?.stations?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {overview.stations.map((station) => (
                  <div
                    key={station.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Station header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Building2 size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {station.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {station.city} · {station.isParent ? "Main Station" : "Branch"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          station.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {station.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {station.staffCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Staff</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {station.todayShifts}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Shifts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">
                          ₦{(station.todayRevenue || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                      </div>
                    </div>

                    {/* Switch Button */}
                    <button
                      onClick={() => switchStation(station.id)}
                      disabled={switching || station.isCurrent}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        station.isCurrent
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {station.isCurrent ? (
                        "Currently Viewing"
                      ) : switching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Switching...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={16} />
                          Switch to this Station
                        </>
                      )}
                    </button>

                    {/* Pending Invites */}
                    {pendingInvites[station.id]?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          ⏳ {pendingInvites[station.id].length} pending invite(s)
                        </p>
                        {pendingInvites[station.id].map((inv) => (
                          <p key={inv.id} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {inv.name} — {inv.email}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {(!overview?.stations || overview.stations.length <= 1) && (
              <div className="text-center py-12">
                <Building2 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Branches Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Create your first branch station to start managing multiple locations
                </p>
                <button
                  onClick={() => setShowAddBranch(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium mx-auto transition-colors"
                >
                  <Plus size={18} />
                  Create First Branch
                </button>
              </div>
            )}

            {/* Branch limit reached upgrade prompt */}
            {upgradeData && !upgradeDismissed && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6 text-center mt-6">
                <Crown size={32} className="text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  Branch Limit Reached
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Your current plan allows {upgradeData.maxBranches || "a limited number of"} branches.
                  Upgrade to add more locations.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => router.push("/pricing")}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    <Crown size={18} />
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setUpgradeDismissed(true)}
                    className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && <CrossBranchStaff />}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Consolidated Report
              </h2>
              <div className="flex gap-2">
                {["week", "month", "year"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setReportPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      reportPeriod === p
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
                  </button>
                ))}
              </div>
            </div>

            {reportLoading ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            ) : report && (
              <>
                {/* Totals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Total Revenue",
                      value: `₦${report.totals.totalRevenue.toLocaleString()}`,
                      color: "text-blue-600",
                    },
                    {
                      label: "Total Litres",
                      value: `${report.totals.totalLitres.toLocaleString()}L`,
                      color: "text-green-600",
                    },
                    {
                      label: "Total Shifts",
                      value: report.totals.totalShifts,
                      color: "text-purple-600",
                    },
                    {
                      label: "Total Staff",
                      value: report.totals.totalStaff,
                      color: "text-amber-600",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {card.label}
                      </p>
                      <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Per station breakdown table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {["Station", "Revenue", "Litres", "Shifts", "Staff"].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {report.stations.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {s.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {s.city}
                                  {s.isParent ? " · Main" : " · Branch"}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-blue-600">
                              ₦{s.revenue.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {s.litresSold.toLocaleString()}L
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {s.totalShifts}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {s.totalStaff}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {showAddBranch && (
        <AddBranchModal
          onClose={() => setShowAddBranch(false)}
          onUpgradeRequired={(data) => {
            setUpgradeData(data);
            setUpgradeDismissed(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
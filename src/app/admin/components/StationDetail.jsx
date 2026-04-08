"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Users, Activity, AlertCircle } from "lucide-react";
import useAdminStore from "@/store/useAdminStore";

const TABS = ["Overview", "Staff", "Shifts", "Tanks", "Activity", "Errors"];

const roleBadgeColor = {
  manager: "bg-blue-100 text-blue-700",
  cashier: "bg-purple-100 text-purple-700",
  attendant: "bg-green-100 text-green-700",
  supervisor: "bg-orange-100 text-orange-700",
  accountant: "bg-yellow-100 text-yellow-700",
};

const statusStyles = {
  Active: "text-green-700 bg-green-100",
  Suspended: "text-red-700 bg-red-100",
  Maintenance: "text-orange-700 bg-orange-100",
};

const StationDetail = ({ stationId, onBack }) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [staffSearch, setStaffSearch] = useState("");
  const [shiftStatusFilter, setShiftStatusFilter] = useState("");

  const {
    stationDetail,
    stationStats,
    stationStaff,
    stationShifts,
    stationTanks,
    stationActivity,
    stationErrors,
    loading,
    fetchStationDetail,
    fetchStationStaff,
    fetchStationShifts,
    fetchStationTanks,
    fetchStationActivity,
    fetchStationErrors,
    updateStationStatus,
  } = useAdminStore();

  useEffect(() => {
    if (!stationId) return;
    fetchStationDetail(stationId);
    fetchStationStaff(stationId);
    fetchStationActivity(stationId);
    fetchStationErrors(stationId);
  }, [stationId]);

  // Lazy-load shifts and tanks when those tabs are first visited
  useEffect(() => {
    if (activeTab === "Shifts" && stationShifts.length === 0) {
      fetchStationShifts(stationId);
    }
    if (activeTab === "Tanks" && stationTanks.length === 0) {
      fetchStationTanks(stationId);
    }
  }, [activeTab]);

  const handleToggleStatus = async () => {
    if (!stationDetail) return;
    const isCurrentlyActive = stationDetail.status === "Active" || stationDetail.isActive;
    await updateStationStatus(stationId, !isCurrentlyActive);
    fetchStationDetail(stationId);
  };

  const isActive = stationDetail?.status === "Active" || stationDetail?.isActive;
  const stationName = stationDetail?.name || stationDetail?.stationName || "Station";

  const filteredStaff = stationStaff.filter((s) => {
    if (!staffSearch) return true;
    const q = staffSearch.toLowerCase();
    return (
      (s.firstName + " " + s.lastName).toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  const filteredShifts = stationShifts.filter((s) => {
    if (!shiftStatusFilter) return true;
    return s.status === shiftStatusFilter;
  });

  if (loading && !stationDetail) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF9D29]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Stations
      </button>

      {/* TOP SECTION */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="bg-blue-500 text-white text-[1.5rem] flex items-center justify-center font-semibold rounded-full h-16 w-16 shrink-0">
              {stationName.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h1 className="text-[1.75rem] font-semibold leading-tight">{stationName}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {stationDetail?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {stationDetail.location}
                  </span>
                )}
                {stationDetail?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {stationDetail.phone}
                  </span>
                )}
                {stationDetail?.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {stationDetail.email}
                  </span>
                )}
              </div>
              <span
                className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                  statusStyles[stationDetail?.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {stationDetail?.status || "—"}
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleStatus}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
              isActive
                ? "border border-[#F57C00] text-[#F57C00] hover:bg-[#FEF2E5]"
                : "border border-[#1A71F6] text-[#1A71F6] hover:bg-blue-50"
            }`}
          >
            {isActive ? "Suspend Station" : "Activate Station"}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: "Staff Count", value: stationStats?.staffCount ?? stationStaff.length },
            { label: "Total Shifts", value: stationStats?.totalShifts ?? "—" },
            { label: "Total Revenue", value: stationStats?.totalRevenue ? `₦${Number(stationStats.totalRevenue).toLocaleString()}` : "—" },
            { label: "Last Activity", value: stationStats?.lastActivity ? new Date(stationStats.lastActivity).toLocaleDateString() : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-lg font-semibold text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? "bg-[#FF9D29] text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────── */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tank levels */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-[1rem] font-semibold mb-4">Tank Levels</h2>
            {stationTanks.length === 0 ? (
              <p className="text-gray-400 text-sm">No tank data available.</p>
            ) : (
              stationTanks.map((tank, i) => {
                const pct = tank.limit > 0
                  ? Math.min(Math.round((tank.currentQuantity / tank.limit) * 100), 100)
                  : 0;
                const barColor = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-500" : "bg-red-500";
                return (
                  <div key={tank._id || i} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{tank.fuelType || tank.title || `Tank ${i + 1}`}</span>
                      <span className="text-gray-500">{tank.currentQuantity?.toLocaleString()}L / {tank.limit?.toLocaleString()}L</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{pct}% remaining</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-[1rem] font-semibold mb-4">Recent Activity</h2>
            {stationActivity.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent activity.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stationActivity.slice(0, 10).map((item, i) => (
                  <div key={item._id || i} className="flex items-start gap-3 text-sm">
                    <Activity size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-700">{item.description || item.message || "Activity recorded"}</p>
                      <p className="text-gray-400 text-xs">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STAFF TAB ──────────────────────────────────────── */}
      {activeTab === "Staff" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[1rem] font-semibold">Staff Members</h2>
            <input
              type="text"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              placeholder="Search by name or role..."
              className="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none w-[220px]"
            />
          </div>
          {filteredStaff.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No staff members found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Role", "Email", "Phone", "Status", "Joined"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s, i) => (
                    <tr key={s._id || i} className="hover:bg-gray-50 border-t border-gray-100">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold capitalize ${roleBadgeColor[s.role] || "bg-gray-100 text-gray-600"}`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.email || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${s.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {s.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SHIFTS TAB ─────────────────────────────────────── */}
      {activeTab === "Shifts" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[1rem] font-semibold">Shifts</h2>
            <select
              value={shiftStatusFilter}
              onChange={(e) => setShiftStatusFilter(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="Matched">Matched</option>
              <option value="Flagged">Flagged</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          {filteredShifts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No shifts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Date", "Attendant", "Pump", "Product", "Litres", "Amount", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredShifts.map((s, i) => {
                    const hasDisc = s.discrepancy && s.discrepancy !== 0;
                    return (
                      <tr
                        key={s._id || i}
                        className={`hover:bg-gray-50 border-t border-gray-100 ${hasDisc ? "bg-amber-50" : ""}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {s.date ? new Date(s.date).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {s.attendant?.firstName || s.attendant?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{s.pumpNo || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{s.product || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {s.litresSold ? `${Number(s.litresSold).toFixed(2)}L` : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {s.amount ? `₦${Number(s.amount).toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            s.status === "Matched" ? "bg-purple-100 text-purple-700"
                            : s.status === "Flagged" ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {s.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TANKS TAB ──────────────────────────────────────── */}
      {activeTab === "Tanks" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-[1rem] font-semibold mb-4">Fuel Tanks</h2>
          {stationTanks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No tank data available.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stationTanks.map((tank, i) => {
                const pct = tank.limit > 0
                  ? Math.min(Math.round((tank.currentQuantity / tank.limit) * 100), 100)
                  : 0;
                const barColor = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-500" : "bg-red-500";
                return (
                  <div key={tank._id || i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800">{tank.fuelType || tank.title || `Tank ${i + 1}`}</h3>
                      <span className="text-sm font-semibold text-gray-500">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                      <div className={`h-3 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">
                      {tank.currentQuantity?.toLocaleString()}L / {tank.limit?.toLocaleString()}L capacity
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVITY TAB ───────────────────────────────────── */}
      {activeTab === "Activity" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-[1rem] font-semibold mb-4">Activity Feed</h2>
          {stationActivity.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No activity recorded.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {stationActivity.map((item, i) => (
                <div key={item._id || i} className="flex items-start gap-3 border-b border-gray-50 pb-3">
                  <div className={`rounded-full p-1.5 shrink-0 ${
                    item.type === "sale" ? "bg-green-100" :
                    item.type === "alert" ? "bg-red-100" :
                    item.type === "maintenance" ? "bg-orange-100" :
                    "bg-blue-100"
                  }`}>
                    <Activity size={14} className={
                      item.type === "sale" ? "text-green-600" :
                      item.type === "alert" ? "text-red-600" :
                      item.type === "maintenance" ? "text-orange-600" :
                      "text-blue-600"
                    } />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.description || item.message || "Activity"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ERRORS TAB ─────────────────────────────────────── */}
      {activeTab === "Errors" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-[1rem] font-semibold mb-4">Critical Errors</h2>
          {stationErrors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-green-500 text-4xl mb-3">✅</div>
              <p className="text-gray-600 font-semibold">No critical errors</p>
              <p className="text-gray-400 text-sm mt-1">This station is operating normally.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {stationErrors.map((err, i) => (
                <div key={err._id || i} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-red-700">{err.title || err.type || "Error"}</p>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        Critical
                      </span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{err.description || err.message || "—"}</p>
                    <p className="text-xs text-red-400 mt-1">
                      {err.createdAt ? new Date(err.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StationDetail;

"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Users,
  Activity,
  AlertCircle,
  User,
  Calendar,
  RefreshCw,
  LayoutGrid,
  Pause,
  Play,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import useAdminStore from "@/store/useAdminStore";
import toast from "react-hot-toast";

const TABS = ["Overview", "Staff", "Shifts", "Tanks", "Activity", "Errors"];

const roleBadgeColor = {
  manager: "bg-blue-100 text-blue-700",
  cashier: "bg-purple-100 text-purple-700",
  attendant: "bg-green-100 text-green-700",
  supervisor: "bg-orange-100 text-orange-700",
  accountant: "bg-yellow-100 text-yellow-700",
};

// ── helpers ────────────────────────────────────────────────────
const planBadge = (plan = "") => {
  const map = {
    free: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    prime: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    max: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    enterprise: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return map[plan.toLowerCase()] ?? "bg-gray-100 text-gray-600";
};

const fmtDate = (raw) => {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
};

// ──────────────────────────────────────────────────────────────
const StationDetail = ({ stationId, onBack }) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [staffSearch, setStaffSearch] = useState("");
  const [shiftStatusFilter, setShiftStatusFilter] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isRestoringDeleted, setIsRestoringDeleted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    resetStaffPassword,
    restoreStation,
    deleteStation,
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

  // ── read from nested backend shape ──────────────────────────
  const station = stationDetail?.station || {};
  const owner = stationDetail?.owner || {};
  const subscription = stationDetail?.subscription || {};

  const isActive = station.isActive !== false;
  const isDeleted = station.isDeleted === true;
  const accessMode = station.accessMode || "full";
  const gracePeriodDaysLeft = station.gracePeriodDaysLeft ?? null;
  const stationName = station.name || "Station";
  const initials = station.initials || stationName.slice(0, 2).toUpperCase();
  const resolvedId = station.id || stationId;

  // ── action handlers ──────────────────────────────────────────
  const handleToggleStatus = async () => {
    setIsSuspending(true);
    try {
      const res = await updateStationStatus(resolvedId, !isActive);
      if (res.success) {
        toast.success(isActive ? "Station suspended" : "Station restored");
        fetchStationDetail(stationId);
      } else {
        toast.error(res.error || "Failed to update station");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSuspending(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      const res = await resetStaffPassword(resolvedId, owner.id);
      if (res.success) toast.success("Password reset email sent to owner");
      else toast.error(res.error || "Failed to reset password");
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${stationName}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await deleteStation(resolvedId);
      if (res.success) {
        toast.success(`"${stationName}" deleted successfully`);
        onBack();
      } else {
        toast.error(res.error || "Failed to delete station");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

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

      {/* ══ SECTION 1 — STATION INFO CARD ══════════════════════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">

        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Initials avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                {stationName}
              </h2>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={12} />
                {[station.city, station.country].filter(Boolean).join(", ") || "—"}
              </div>
            </div>
          </div>

          {/* Maintenance mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Maintenance mode</span>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className="cursor-pointer"
            >
              {maintenanceMode ? (
                <BsToggleOn className="text-blue-700" size={28} />
              ) : (
                <BsToggleOff size={28} className="text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Grace period warning */}
        {isDeleted && accessMode === "read-only" && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Station deleted —{gracePeriodDaysLeft !== null ? ` ${gracePeriodDaysLeft} days` : ""} remaining before permanent block. Restore to reactivate.
            </p>
          </div>
        )}

        {/* Status badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block ${
            isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isActive ? "Active" : "Suspended"}
        </span>

        {/* Email and Phone */}
        <div className="flex items-center gap-6 mb-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Mail size={14} />
            {station.email || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Phone size={14} />
            {station.phone || "—"}
          </span>
        </div>

        {/* Registered date */}
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Calendar size={14} />
          Registered {fmtDate(station.registeredAt)}
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-6" />

        {/* Owner Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[40px] h-[40px] rounded-sm bg-[#fbf2e7] dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-[#FF8C05]" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Owner Information
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">First Name</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {owner.firstName || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Name</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {owner.lastName || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {owner.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {owner.phone || "—"}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-6" />

        {/* Subscription Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[40px] h-[40px] rounded-sm bg-[#fbf2e7] dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <TbTargetArrow size={20} className="text-[#FF8C05]" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Subscription Information
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Plan</p>
              <span
                className={`px-2 py-1 rounded-md text-xs font-semibold ${planBadge(
                  subscription.currentPlan || ""
                )}`}
              >
                {subscription.currentPlan || "—"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <span
                className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  subscription.status?.toLowerCase() === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {subscription.status || "—"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {fmtDate(subscription.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiry Date</p>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {fmtDate(subscription.expiryDate)}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-6" />

        {/* Action Section */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-[40px] h-[40px] rounded-sm bg-[#FFF1F3] dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <LayoutGrid size={18} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Action</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Manage this station's account and subscription
          </p>
          <div className="flex flex-col gap-3">
            {/* Restore Station (grace period) / Suspend / Restore Access */}
            {isDeleted ? (
              <button
                onClick={async () => {
                  setIsRestoringDeleted(true);
                  try {
                    const res = await restoreStation(resolvedId);
                    if (res.success) fetchStationDetail(stationId);
                    else toast.error(res.error || "Failed to restore station");
                  } catch {
                    toast.error("Failed to restore station");
                  } finally {
                    setIsRestoringDeleted(false);
                  }
                }}
                disabled={isRestoringDeleted}
                className="w-full py-3 rounded-lg border border-green-500 text-green-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={16} />
                {isRestoringDeleted ? "Restoring..." : "Restore Station"}
              </button>
            ) : (
              <button
                onClick={handleToggleStatus}
                disabled={isSuspending}
                className={`w-full py-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                  isActive
                    ? "border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    : "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                }`}
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
                {isSuspending
                  ? isActive ? "Suspending..." : "Restoring..."
                  : isActive ? "Temporary Suspend Access" : "Restore Access"}
              </button>
            )}

            {/* Reset password */}
            <button
              onClick={handleResetPassword}
              disabled={isResetting}
              className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} />
              {isResetting ? "Sending..." : "Reset Owner Password"}
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-3 rounded-lg border border-red-400 text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Delete Station"}
            </button>
          </div>
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
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ══ SECTION 2 & 3 — OVERVIEW TAB (tanks + activity) ══ */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tank levels */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {["Name", "Role", "Email", "Phone", "Status", "Joined"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s, i) => (
                    <tr key={s._id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {["Date", "Attendant", "Pump", "Product", "Litres", "Amount", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredShifts.map((s, i) => {
                    const hasDisc = s.discrepancy && s.discrepancy !== 0;
                    return (
                      <tr
                        key={s._id || i}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 ${hasDisc ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
                  <div key={tank._id || i} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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

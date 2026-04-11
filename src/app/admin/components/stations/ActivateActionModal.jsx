"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  User,
  Phone,
  Mail,
  CalendarDays,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  LayoutGrid,
} from "lucide-react";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import ActivateSuccessModal from "./ActivateSuccessModal";
import ActivateErrorModal from "./ActivateErrorModal";
import useAdminStore from "@/store/useAdminStore";
import toast from "react-hot-toast";

// ── helpers ───────────────────────────────────────────────────
const planBadge = (plan = "") => {
  const map = {
    free: "bg-gray-100 text-gray-600",
    pro: "bg-blue-50 text-blue-600",
    prime: "bg-purple-50 text-purple-600",
    max: "bg-amber-50 text-amber-700",
    enterprise: "bg-green-50 text-green-700",
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

// ─────────────────────────────────────────────────────────────
const ActivateActionModal = ({ isOpen, onClose, data }) => {
  const [isToggle, setIsToggle] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    stationDetail,
    loading,
    updateStationStatus,
    deleteStation,
    resetStaffPassword,
    fetchStationDetail,
  } = useAdminStore();

  // Derive station ID from the table row passed in
  const stationId = data?._raw?._id || data?._raw?.id || data?.id;

  // Fetch full detail every time the modal opens
  useEffect(() => {
    if (isOpen && stationId) {
      fetchStationDetail(stationId);
    }
  }, [isOpen, stationId]);

  if (!isOpen) return null;

  // Read from nested response shape
  const station = stationDetail?.station || {};
  const owner = stationDetail?.owner || {};
  const subscription = stationDetail?.subscription || {};

  const isActive = station.isActive !== false;
  const stationName = station.name || data?.stationName || "this station";
  const initials = station.initials || stationName.slice(0, 2).toUpperCase();
  const resolvedId = station.id || stationId;

  // ── action handlers ──────────────────────────────────────
  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const res = await updateStationStatus(resolvedId, true);
      if (res.success) setIsSuccessOpen(true);
      else setIsErrorOpen(true);
    } catch {
      setIsErrorOpen(true);
    } finally {
      setIsActivating(false);
    }
  };

  const handleSuspend = async () => {
    setIsSuspending(true);
    try {
      const res = await updateStationStatus(resolvedId, false);
      if (res.success) toast.success(`"${stationName}" suspended`);
      else toast.error(res.error || "Failed to suspend station");
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
        onClose();
      } else {
        toast.error(res.error || "Failed to delete station");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── render ───────────────────────────────────────────────
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex z-50 justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-gray-800 rounded-md lg:w-[36.8125rem] lg:max-h-[90vh] max-h-[85vh] overflow-y-auto p-8 w-[90vw] scrollbar-hide"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-neutral-200 hover:bg-gray-100 rounded-full p-1 transition"
        >
          <X size={24} className="text-neutral-700" />
        </button>

        <h1 className="text-[1.385rem] font-semibold leading-[100%] mb-[1rem]">
          Station Details
        </h1>
        <hr className="border-1 mb-[2rem]" />

        {/* Loading spinner while fetching */}
        {loading && !stationDetail && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9D29]" />
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="flex justify-between mb-4">
          {/* Left: avatar + name + location */}
          <div className="flex gap-4 items-start">
            <span className="bg-blue-500 text-white text-[1.5rem] flex items-center justify-center font-bold rounded-full h-[56px] w-[56px] flex-shrink-0">
              {initials}
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-[1.125rem] font-bold text-gray-900 dark:text-white">
                {stationName}
              </h2>
              <p className="flex gap-1 items-center text-neutral-500 font-medium text-[0.875rem]">
                <MapPin size={16} />
                {[station.city, station.country].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          </div>

          {/* Right: maintenance toggle */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setIsToggle(!isToggle)}
              className="cursor-pointer"
            >
              {isToggle ? (
                <BsToggleOn className="text-blue-700" size={28} />
              ) : (
                <BsToggleOff size={28} className="text-neutral-400" />
              )}
            </button>
            <p className="text-neutral-500 text-[0.875rem] font-medium">
              Maintenance mode
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-3">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-[#F1F9F1] text-[#07834B]"
                : "bg-[#FEF2F2] text-red-600"
            }`}
          >
            {isActive ? "Active" : "Suspended"}
          </span>
        </div>

        {/* Email + Phone */}
        <div className="flex flex-wrap gap-6 mb-2">
          <span className="flex gap-2 items-center">
            <Mail size={18} className="text-gray-500" />
            <span className="text-[0.9rem] font-medium text-[#616161]">
              {station.email || "—"}
            </span>
          </span>
          <span className="flex gap-2 items-center">
            <Phone size={18} className="text-gray-500" />
            <span className="text-[0.9rem] font-medium text-[#616161]">
              {station.phone || "—"}
            </span>
          </span>
        </div>

        {/* Registered date */}
        <div className="flex gap-2 items-center mb-6">
          <CalendarDays size={18} className="text-gray-500" />
          <span className="text-[0.9rem] font-medium text-[#616161]">
            Registered {fmtDate(station.registeredAt)}
          </span>
        </div>

        {/* ── OWNER INFORMATION ── */}
        <div className="border-t-[2px] border-b-[2px] border-gray-200 p-4 mb-0">
          <div className="flex gap-4 items-center mb-4">
            <div className="bg-[#fbf2e7] w-[40px] h-[40px] flex items-center justify-center rounded-sm flex-shrink-0">
              <User size={22} className="text-[#FF8C05]" />
            </div>
            <h3 className="text-[1rem] font-semibold">Owner Information</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4">
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">First Name</span>
              <span className="text-[0.895rem] font-semibold">{owner.firstName || "—"}</span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">Last Name</span>
              <span className="text-[0.895rem] font-semibold">{owner.lastName || "—"}</span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">Email Address</span>
              <span className="text-[0.895rem] font-semibold">{owner.email || "—"}</span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">Phone</span>
              <span className="text-[0.895rem] font-semibold">{owner.phone || "—"}</span>
            </span>
          </div>
        </div>

        {/* ── SUBSCRIPTION INFORMATION ── */}
        <div className="border-b-[2px] border-gray-200 p-4">
          <div className="flex gap-4 items-center mb-4">
            <div className="bg-[#fbf2e7] w-[40px] h-[40px] flex items-center justify-center rounded-sm flex-shrink-0">
              <TbTargetArrow size={22} className="text-[#FF8C05]" />
            </div>
            <h3 className="text-[1rem] font-semibold">Subscription Information</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4">
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">Current Plan</span>
              <span className={`text-[0.875rem] font-semibold rounded-2xl w-fit px-3 h-[32px] flex items-center ${planBadge(subscription.currentPlan || "")}`}>
                {subscription.currentPlan || "—"}
              </span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">Status</span>
              <span className={`text-[0.875rem] font-semibold rounded-2xl w-fit px-3 h-[32px] flex items-center ${
                subscription.status?.toLowerCase() === "active"
                  ? "bg-[#F1F9F1] text-[#07834B]"
                  : "bg-[#FEF2F2] text-red-600"
              }`}>
                {subscription.status || "—"}
              </span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">Start Date</span>
              <span className="text-[0.895rem] font-semibold">{fmtDate(subscription.startDate)}</span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[#616161] text-[0.875rem]">Expiry Date</span>
              <span className="text-[0.895rem] font-semibold">{fmtDate(subscription.expiryDate)}</span>
            </span>
          </div>
        </div>

        {/* ── ACTION SECTION ── */}
        <div className="mt-4">
          <div className="flex gap-3 items-start mb-4">
            <div className="bg-[#FFF1F3] rounded-md h-[2.5rem] w-[2.5rem] flex items-center justify-center flex-shrink-0">
              <LayoutGrid size={20} className="text-red-500" />
            </div>
            <div>
              <span className="text-[1rem] font-semibold">Action</span>
              <p className="text-neutral-500 text-[0.875rem] font-medium">
                Manage this station's account and subscription
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Activate (primary action for suspended stations) */}
            {!isActive && (
              <button
                onClick={handleActivate}
                disabled={isActivating}
                className="flex gap-2 items-center justify-center cursor-pointer text-green-700 border border-green-600 w-full py-2 rounded-lg text-[0.875rem] font-medium disabled:opacity-50 hover:bg-green-50 transition-colors"
              >
                <Play size={18} />
                {isActivating ? "Activating..." : "Activate Station"}
              </button>
            )}

            {/* Suspend (if currently active) */}
            {isActive && (
              <button
                onClick={handleSuspend}
                disabled={isSuspending}
                className="flex gap-2 items-center justify-center cursor-pointer text-[#F57C00] border border-[#F57C00] w-full py-2 rounded-lg text-[0.875rem] font-medium disabled:opacity-50 hover:bg-amber-50 transition-colors"
              >
                <Pause size={18} />
                {isSuspending ? "Suspending..." : "Temporary Suspend Access"}
              </button>
            )}

            {/* Reset password */}
            <button
              onClick={handleResetPassword}
              disabled={isResetting}
              className="flex gap-2 items-center justify-center cursor-pointer border border-[#D0D5DD] w-full py-2 rounded-lg text-[0.875rem] font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={18} />
              {isResetting ? "Sending..." : "Reset Owner Password"}
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex gap-2 items-center justify-center cursor-pointer text-[#B71C1C] border border-[#B71C1C] w-full py-2 rounded-lg text-[0.875rem] font-medium disabled:opacity-50 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={18} />
              {isDeleting ? "Deleting..." : "Delete Station"}
            </button>
          </div>
        </div>

        <ActivateSuccessModal
          isOpen={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          stationName={stationName}
        />
        <ActivateErrorModal
          isOpen={isErrorOpen}
          onClose={() => setIsErrorOpen(false)}
          stationName={stationName}
        />
      </div>
    </div>
  );
};

export default ActivateActionModal;

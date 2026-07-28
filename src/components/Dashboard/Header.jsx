"use client";

import {
  Bell, BellRing, Mail, Menu, X, Check, CheckCheck,
  TriangleAlert, Info, ChevronRight, Building2, ChevronDown, Plus, Crown,
} from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import Image from "next/image";
import Link from "next/link";
import stroke from "../../assets/stroke.png";
import staticLogo from "../../assets/station-logo.png";
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import useNotificationStore from "@/store/useNotificationStore";
import useAdminNotificationStore from "@/store/useAdminNotificationStore";
import useBranchStore from "@/store/useBranchStore";
import usePaymentStore from "@/store/usePaymentStore";
import AddBranchModal from "../AddBranchModal";
import ManagerProfileModal from "../ManagerProfileModal";
import LogoutConfirmModal from "../LogoutConfirmModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(timestamp) {
  if (!timestamp) return "";
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatFullDate(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function severityStyle(severity) {
  switch (severity) {
    case "critical": return { border: "border-l-red-500",   badge: "bg-red-100 text-red-700",   dot: "bg-red-500"   };
    case "warning":  return { border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
    default:         return { border: "border-l-blue-500",  badge: "bg-blue-100 text-blue-700",  dot: "bg-blue-500"  };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UnreadBadge({ count }) {
  if (!count || count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function DropdownHeader({ title, onMarkAll, markAllLabel = "Mark all read" }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</p>
      <button
        onClick={onMarkAll}
        className="cursor-pointer flex items-center gap-1 text-xs font-semibold text-[#1a71f6] hover:text-blue-800 transition-colors"
      >
        <CheckCheck size={12} />
        {markAllLabel}
      </button>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <Bell size={18} className="text-gray-300" />
      </div>
      <p className="text-sm text-neutral-400 dark:text-gray-500">{message}</p>
    </div>
  );
}

// ── Full-item modal ───────────────────────────────────────────────────────────

function NotifModal({ item, type, onClose }) {
  const sv = type === "alert" ? severityStyle(item.severity) : null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2 flex-wrap">
            {type === "message"
              ? <Mail size={16} className="text-[#1a71f6] shrink-0" />
              : <TriangleAlert size={16} className={`shrink-0 ${item.severity === "critical" ? "text-red-500" : item.severity === "warning" ? "text-amber-500" : "text-blue-500"}`} />
            }
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h3>
            {item.category && (
              <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{item.category}</span>
            )}
            {type === "alert" && item.severity && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sv.badge}`}>{item.severity}</span>
            )}
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-2 shrink-0">
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.body || item.message || item.description || "No content."}</p>
        </div>
        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between">
          <p className="text-xs text-neutral-400">{formatFullDate(item.timestamp || item.createdAt)}</p>
          <button onClick={onClose} className="cursor-pointer text-xs font-semibold text-[#1a71f6] hover:text-blue-800 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Messages dropdown ─────────────────────────────────────────────────────────

function MessagesDropdown({ messages, onMarkAll, onItemClick }) {
  const preview = messages.slice(0, 5);
  return (
    <>
      <DropdownHeader title="Messages" onMarkAll={onMarkAll} />
      {preview.length === 0
        ? <EmptyState message="No new messages" />
        : preview.map((msg) => {
            const id = msg._id || msg.id;
            return (
              <button
                key={id}
                onClick={() => onItemClick(msg)}
                className={`w-full text-left border-l-4 px-4 py-3 border-b border-neutral-50 hover:bg-blue-50/50 transition-colors ${msg.read ? "border-l-transparent bg-white" : "border-l-[#1a71f6] bg-blue-50/30"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug truncate ${msg.read ? "font-normal text-gray-600" : "font-semibold text-gray-900"}`}>
                    {msg.title}
                  </p>
                  <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">{relativeTime(msg.timestamp || msg.createdAt)}</span>
                </div>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{msg.body || msg.message || msg.description || ""}</p>
              </button>
            );
          })
      }
      <div className="px-4 py-2.5 border-t border-neutral-100">
        <button className="cursor-pointer w-full text-xs font-semibold text-[#1a71f6] hover:text-blue-800 flex items-center justify-center gap-1 transition-colors">
          View all messages <ChevronRight size={12} />
        </button>
      </div>
    </>
  );
}

// ── Alerts dropdown ───────────────────────────────────────────────────────────

function AlertsDropdown({ alerts, onMarkAll, onItemClick }) {
  const preview = alerts.slice(0, 5);
  return (
    <>
      <DropdownHeader title="Alerts" onMarkAll={onMarkAll} />
      {preview.length === 0
        ? <EmptyState message="No active alerts" />
        : preview.map((alert) => {
            const id = alert._id || alert.id;
            const sv = severityStyle(alert.severity);
            return (
              <button
                key={id}
                onClick={() => onItemClick(alert)}
                className={`w-full text-left border-l-4 px-4 py-3 border-b border-neutral-50 hover:bg-gray-50 transition-colors ${alert.read ? "border-l-transparent bg-white" : `${sv.border} bg-gray-50/50`}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${sv.dot}`} />
                    <p className={`text-sm leading-snug truncate ${alert.read ? "font-normal text-gray-600" : "font-semibold text-gray-900"}`}>
                      {alert.title}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">{relativeTime(alert.timestamp || alert.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {alert.severity && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sv.badge}`}>{alert.severity}</span>
                  )}
                  <p className="text-xs text-neutral-400 truncate">{alert.body || alert.message || alert.description || ""}</p>
                </div>
              </button>
            );
          })
      }
      <div className="px-4 py-2.5 border-t border-neutral-100">
        <button className="cursor-pointer w-full text-xs font-semibold text-[#1a71f6] hover:text-blue-800 flex items-center justify-center gap-1 transition-colors">
          View all alerts <ChevronRight size={12} />
        </button>
      </div>
    </>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────

export default function Header({ toggleSidebar, showSidebar }) {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  // Station notification store (for all non-admin roles)
  const stationNotif = useNotificationStore();

  // Admin notification store (platform-level, for role=admin)
  const adminNotif = useAdminNotificationStore();

  // Derive which store to use after userData loads; default to station store
  const isAdmin = userData?.role === "admin";

  const messages        = isAdmin ? adminNotif.notifications : stationNotif.messages;
  const alerts          = isAdmin ? [] : stationNotif.alerts;
  const messageUnreadCount = isAdmin ? adminNotif.unreadCount : stationNotif.messageUnreadCount;
  const alertUnreadCount   = isAdmin ? 0 : stationNotif.alertUnreadCount;

  const fetchMessages       = isAdmin ? adminNotif.fetchNotifications : stationNotif.fetchMessages;
  const fetchAlerts         = isAdmin ? (() => {}) : stationNotif.fetchAlerts;
  const markMessageRead     = isAdmin ? adminNotif.markRead : stationNotif.markMessageRead;
  const markAlertRead       = isAdmin ? (() => {}) : stationNotif.markAlertRead;
  const markAllMessagesRead = isAdmin ? adminNotif.markAllRead : stationNotif.markAllMessagesRead;
  const markAllAlertsRead   = isAdmin ? (() => {}) : stationNotif.markAllAlertsRead;
  const startPolling        = isAdmin ? adminNotif.startPolling : stationNotif.startPolling;
  const stopPolling         = isAdmin ? adminNotif.stopPolling : stationNotif.stopPolling;

  const { branches, switching, switchStation, fetchBranches } = useBranchStore();
  const { currentPlan } = usePaymentStore();
  const isEnterprise = currentPlan?.plan?.startsWith("enterprise");
  const canUpgrade = currentPlan?.plan !== "enterprise-max" && userData?.role === "manager";
  const isSuperManager = userData?.isSuperManager === true;

  // Label shown to the user. The station OWNER and a hired manager both have
  // role "manager" — every permission gate depends on that — so the owner must
  // be distinguished by label, not by role, or they appear as just another
  // manager.
  //
  // Falls back to `isOwner` only, never `isSuperManager`: sessions issued
  // before this change set isSuperManager true for EVERY manager, so using it
  // would label hired managers "Owner". A stale session shows "Manager" until
  // the next login, which is the safe direction to be wrong in.
  const roleTitle =
    userData?.displayRole || (userData?.isOwner ? "Owner" : "Manager");

  // dropdown open state
  const [msgOpen, setMsgOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showManagerProfile, setShowManagerProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // selected item for modal
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // refs for click-outside
  const msgRef = useRef(null);
  const alertRef = useRef(null);
  const switcherRef = useRef(null);

  // ── User data
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user?.role) setUserData(user);
        else router.push("/login");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  // ── Notifications mount/unmount
  useEffect(() => {
    fetchMessages();
    fetchAlerts();
    startPolling();
    return () => stopPolling();
  }, [fetchMessages, fetchAlerts, startPolling, stopPolling]);

  // ── Fetch branches for enterprise super manager only
  useEffect(() => {
    if (isEnterprise && isSuperManager) {
      fetchBranches();
    }
  }, [isEnterprise, isSuperManager]);

  // ── Click outside to close dropdowns
  useEffect(() => {
    function handleClick(e) {
      if (msgRef.current && !msgRef.current.contains(e.target)) setMsgOpen(false);
      if (alertRef.current && !alertRef.current.contains(e.target)) setAlertOpen(false);
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setShowSwitcher(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  const handleMsgClick = useCallback((msg) => {
    const id = msg._id || msg.id;
    if (!msg.read) markMessageRead(id);
    setSelectedMsg(msg);
    setMsgOpen(false);
  }, [markMessageRead]);

  const handleAlertClick = useCallback((alert) => {
    const id = alert._id || alert.id;
    if (!alert.read) markAlertRead(id);
    setSelectedAlert(alert);
    setAlertOpen(false);
  }, [markAlertRead]);

  const fullName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData?.firstName || userData?.lastName || "User";

  const userId = userData?._id || userData?.id || userData?.employeeId;

  const handleLogout = () => {
    stopPolling();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!userData) {
    return (
      <div className="sticky top-0 z-30 px-4 shadow-lg h-[90px] w-full bg-[#1a71f6] dark:bg-gray-900 flex items-center justify-end gap-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-10 w-10 bg-white/20 dark:bg-gray-200 rounded-xl" />
          <div className="h-10 w-10 bg-white/20 dark:bg-gray-200 rounded-xl" />
          <div className="h-10 w-24 bg-white/20 dark:bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const stationLogo = userData?.station?.logoUrl || userData?.station?.logo || null;

  return (
    // Sticky + z-30: floats over the scrolling content on every screen size
    // (below the mobile sidebar drawer at z-50 and its overlay at z-40).
    // Brand blue in light mode; dark mode keeps the original gray-900.
    <div className="sticky top-0 z-30 px-4 shadow-lg h-[90px] w-full bg-[#1a71f6] dark:bg-gray-900 flex items-center justify-between gap-3">

      {/* ── Left: hamburger + station logo ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Hamburger — mobile only */}
        <div
          onClick={toggleSidebar}
          className="lg:hidden bg-white/20 hover:bg-white/30 dark:bg-[#0080FF] dark:hover:bg-blue-600 p-2 text-white rounded-md cursor-pointer transition"
        >
          <Menu />
        </div>

        {/* Station logo — white pill so it reads clearly in dark mode too */}
        <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0 max-w-[120px]">
          {stationLogo ? (
            <img
              src={stationLogo}
              alt="station logo"
              className="h-8 w-auto object-contain max-w-[100px]"
            />
          ) : (
            <Image src={staticLogo} width={100} height={32} alt="station logo" className="h-8 w-auto object-contain" />
          )}
        </div>
      </div>

      {/* ── Right side ── */}
      <div className="flex items-center gap-2 ml-auto">

        {/* ── Notification icons — always visible, never overlap ── */}
        <div className="flex items-center gap-1">

          {/* Messages */}
          <div ref={msgRef} className="relative">
            <button
              onClick={() => { setMsgOpen((v) => !v); setAlertOpen(false); }}
              className="cursor-pointer relative bg-white/15 hover:bg-white/25 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors w-10 h-10 rounded-xl flex items-center justify-center"
              aria-label="Messages"
            >
              {/* Envelope = messages. This button opens MessagesDropdown, but
                  was rendering a bell — so the icon users read as "alerts"
                  opened messages, and vice versa on the button beside it. */}
              <Mail size={19} className={messageUnreadCount > 0 ? "text-white dark:text-[#1a71f6]" : "text-white/80 dark:text-gray-300"} />
              <UnreadBadge count={messageUnreadCount} />
            </button>

            {msgOpen && (
              /*
                On mobile this is anchored to the VIEWPORT, not the button.
                These icons sit mid-header — the station switcher and profile
                come after them — so `right-0` pinned the panel's right edge to
                the button, and a 92vw-wide panel then ran off the left of the
                screen. Fixed + inset-x-3 keeps it on screen at any width;
                from sm: up there is room to anchor it to the button again.
                top-[98px] clears the 90px header.
              */
              <div className="fixed left-3 right-3 top-[98px] w-auto sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-gray-700 overflow-y-auto max-h-[75vh] z-50">
                <MessagesDropdown
                  messages={messages}
                  onMarkAll={() => { markAllMessagesRead(); }}
                  onItemClick={handleMsgClick}
                />
              </div>
            )}
          </div>

          {/* Alerts */}
          <div ref={alertRef} className="relative">
            <button
              onClick={() => { setAlertOpen((v) => !v); setMsgOpen(false); }}
              className="cursor-pointer relative bg-white/15 hover:bg-white/25 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors w-10 h-10 rounded-xl flex items-center justify-center"
              aria-label="Alerts"
            >
              {/* Bell = alerts, matching the envelope/messages button above. */}
              <Bell size={19} className={alertUnreadCount > 0 ? "text-amber-300 dark:text-amber-500" : "text-white/80 dark:text-gray-300"} />
              <UnreadBadge count={alertUnreadCount} />
            </button>

            {alertOpen && (
              <div className="fixed left-3 right-3 top-[98px] w-auto sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-gray-700 overflow-y-auto max-h-[75vh] z-50">
                <AlertsDropdown
                  alerts={alerts}
                  onMarkAll={() => { markAllAlertsRead(); }}
                  onItemClick={handleAlertClick}
                />
              </div>
            )}
          </div>

        </div>

        {/* Divider between notifications and station switcher / profile area */}
        <div className="w-px h-6 bg-white/30 dark:bg-gray-700 flex-shrink-0" />

      {/* ── Station Switcher (Enterprise super manager only) ── */}
      {isEnterprise && isSuperManager && branches.length >= 1 && (
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-lg border border-white/30 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            <Building2 size={16} className="text-white dark:text-blue-600 flex-shrink-0" />
            <span className="hidden sm:inline font-medium text-white dark:text-gray-200 max-w-[8rem] truncate">
              {branches.find((b) => b.isCurrent)?.name || "Station"}
            </span>
            <ChevronDown size={14} className="text-white/70 dark:text-gray-400 flex-shrink-0" />
          </button>

          {showSwitcher && (
            <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Switch Station
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {branches.map((station) => (
                  <button
                    key={station.id}
                    onClick={async () => {
                      if (!station.isCurrent) {
                        setShowSwitcher(false);
                        try {
                          await switchStation(station.id);
                        } catch (err) {
                          console.error("Switch failed:", err?.response?.data?.error || err?.message);
                        }
                      }
                    }}
                    disabled={switching || station.isCurrent}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      station.isCurrent ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      station.isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}>
                      {station.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        station.isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-800 dark:text-gray-200"
                      }`}>
                        {station.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {station.city} · {station.isParent ? "Main" : "Branch"}
                      </p>
                    </div>
                    {station.isCurrent && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">
                        Active
                      </span>
                    )}
                    {switching && !station.isCurrent && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {isSuperManager && (
                <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowSwitcher(false);
                      setShowAddBranch(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Add New Branch
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Upgrade Plan button ── */}
      {canUpgrade && (
        <>
          {/* Desktop */}
          <button
            onClick={() => router.push("/pricing")}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Crown size={14} />
            {currentPlan?.plan === "free" ? "Upgrade Plan" : "Upgrade"}
          </button>
          {/* Mobile */}
          <button
            onClick={() => router.push("/pricing")}
            className="sm:hidden p-2 rounded-lg bg-blue-600 text-white"
          >
            <Crown size={16} />
          </button>
        </>
      )}

      <div className="hidden lg:flex">
        <Image src={stroke} alt="stroke" />
      </div>

      {/* Desktop: profile picture + name */}
      <div className="hidden lg:flex items-center gap-2">
        <ProfileAvatar
          userId={userId}
          username={fullName}
          size="md"
          onProfileClick={userData?.role === "manager" ? () => setShowManagerProfile(true) : undefined}
          profileLabel={userData?.role === "manager" ? `${roleTitle} Profile` : "View Profile"}
        />
        <div className="min-w-0">
          <h4 className="text-white text-sm font-semibold truncate max-w-[120px]">
            {fullName}
          </h4>
          <p className="text-xs font-semibold">
            {userData?.role === "manager" ? (
              <button
                onClick={() => setShowManagerProfile(true)}
                className="text-blue-100 dark:text-[#1a71f6] font-semibold hover:underline"
              >
                {roleTitle} Profile
              </button>
            ) : (
              <Link href="/dashboard/profile" className="text-blue-100 dark:text-[#1a71f6] hover:underline">
                View Profile
              </Link>
            )}
          </p>
        </div>
      </div>

      {/* Mobile: profile picture — logout + profile in dropdown */}
      <div className="lg:hidden">
        <ProfileAvatar
          userId={userId}
          username={fullName}
          size="md"
          onProfileClick={userData?.role === "manager" ? () => setShowManagerProfile(true) : undefined}
          profileLabel={userData?.role === "manager" ? `${roleTitle} Profile` : "View Profile"}
          onLogout={() => setShowLogoutConfirm(true)}
        />
      </div>

      <div className="hidden lg:flex">
        <Image src={stroke} alt="stroke" />
      </div>

      <div
        onClick={() => setShowLogoutConfirm(true)}
        className="cursor-pointer border-2 border-white/50 dark:border-red-400 p-2 rounded-[12px] hidden lg:flex items-center gap-3 hover:bg-white/10 dark:hover:bg-red-50 transition"
      >
        <p className="text-white dark:text-[#ff1f1f] font-semibold">Logout</p>
        <LogoutButton />
      </div>

      </div>{/* end right side */}


      {/* ── Modals ── */}
      {selectedMsg && (
        <NotifModal item={selectedMsg} type="message" onClose={() => setSelectedMsg(null)} />
      )}
      {selectedAlert && (
        <NotifModal item={selectedAlert} type="alert" onClose={() => setSelectedAlert(null)} />
      )}
      {showAddBranch && (
        <AddBranchModal onClose={() => setShowAddBranch(false)} />
      )}
      {showManagerProfile && (
        <ManagerProfileModal onclose={() => setShowManagerProfile(false)} />
      )}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

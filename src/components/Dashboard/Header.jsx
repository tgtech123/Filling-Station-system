"use client";

import {
  Bell, BellRing, Mail, Menu, X, Check, CheckCheck,
  TriangleAlert, Info, ChevronRight,
} from "lucide-react";
import UserAvatar from "./UserAvatar";
import Image from "next/image";
import stroke from "../../assets/stroke.png";
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useImageStore } from "@/store/useImageStore";
import useNotificationStore from "@/store/useNotificationStore";

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
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
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
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  );
}

// ── Full-item modal ───────────────────────────────────────────────────────────

function NotifModal({ item, type, onClose }) {
  const sv = type === "alert" ? severityStyle(item.severity) : null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
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
  const { getUserImage } = useImageStore();

  // notification store
  const {
    messages, alerts,
    messageUnreadCount, alertUnreadCount,
    fetchMessages, fetchAlerts,
    markMessageRead, markAlertRead,
    markAllMessagesRead, markAllAlertsRead,
    startPolling, stopPolling,
  } = useNotificationStore();

  // dropdown open state
  const [msgOpen, setMsgOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // selected item for modal
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // refs for click-outside
  const msgRef = useRef(null);
  const alertRef = useRef(null);

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

  // ── Click outside to close dropdowns
  useEffect(() => {
    function handleClick(e) {
      if (msgRef.current && !msgRef.current.contains(e.target)) setMsgOpen(false);
      if (alertRef.current && !alertRef.current.contains(e.target)) setAlertOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

  const userId = userData?._id || userData?.employeeId || userData?.id;
  const uploadedImage = getUserImage(userId);

  const handleLogout = () => {
    stopPolling();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!userData) {
    return (
      <div className="px-4 z-10 shadow-md h-[90px] w-full bg-white flex items-center justify-end gap-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          <div className="h-10 w-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 z-10 shadow-md h-[90px] w-full bg-white flex items-center justify-end gap-3">

      {/* ── Notification icons (desktop only) ── */}
      <div className="hidden lg:flex items-center gap-2">

        {/* Messages */}
        <div ref={msgRef} className="relative">
          <button
            onClick={() => { setMsgOpen((v) => !v); setAlertOpen(false); }}
            className="cursor-pointer relative bg-[#f6f6f6] hover:bg-gray-100 transition-colors w-11 h-11 rounded-xl flex items-center justify-center"
            aria-label="Messages"
          >
            <Bell size={20} className={messageUnreadCount > 0 ? "text-[#1a71f6]" : "text-gray-600"} />
            <UnreadBadge count={messageUnreadCount} />
          </button>

          {msgOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-50">
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
            className="cursor-pointer relative bg-[#f6f6f6] hover:bg-gray-100 transition-colors w-11 h-11 rounded-xl flex items-center justify-center"
            aria-label="Alerts"
          >
            <Mail size={20} className={alertUnreadCount > 0 ? "text-amber-500" : "text-gray-600"} />
            <UnreadBadge count={alertUnreadCount} />
          </button>

          {alertOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-50">
              <AlertsDropdown
                alerts={alerts}
                onMarkAll={() => { markAllAlertsRead(); }}
                onItemClick={handleAlertClick}
              />
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex">
        <Image src={stroke} alt="stroke" />
      </div>

      <UserAvatar
        userId={userId}
        username={fullName}
        userRole="View Profile"
        currentImage={uploadedImage}
      />

      <div className="hidden lg:flex">
        <Image src={stroke} alt="stroke" />
      </div>

      <div
        onClick={handleLogout}
        className="cursor-pointer border-2 border-red-400 p-2 rounded-[12px] hidden lg:flex items-center gap-3 hover:bg-red-50 transition"
      >
        <p className="text-[#ff1f1f] font-semibold">Logout</p>
        <LogoutButton />
      </div>

      <div
        onClick={toggleSidebar}
        className="block lg:hidden absolute left-4 bg-[#0080FF] p-2 text-white text-lg rounded-md cursor-pointer hover:bg-blue-600 transition"
      >
        <Menu />
      </div>

      {/* ── Modals ── */}
      {selectedMsg && (
        <NotifModal item={selectedMsg} type="message" onClose={() => setSelectedMsg(null)} />
      )}
      {selectedAlert && (
        <NotifModal item={selectedAlert} type="alert" onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}

"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import MyProfileModal from "./MyProfileModal";
import { useImageStore } from "@/store/useImageStore";
import useAdminProfileStore from "@/store/useAdminProfileStore";
import useThemePersistence from "@/hooks/useThemePersistence";
import useAdminNotificationStore from "@/store/useAdminNotificationStore";
import {
  Sun, Moon, Menu, LogOut,
  Bell, X, CheckCheck, ChevronRight, Mail, TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

// ── helpers ────────────────────────────────────────────────────────────────────

function relativeTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function severityStyle(severity) {
  switch (severity) {
    case "critical": return { border: "border-l-red-500",   badge: "bg-red-100 text-red-700",    dot: "bg-red-500"   };
    case "warning":  return { border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
    default:         return { border: "border-l-blue-500",  badge: "bg-blue-100 text-blue-700",   dot: "bg-blue-500"  };
  }
}

// ── NotifDetailModal ───────────────────────────────────────────────────────────

function NotifDetailModal({ item, onClose }) {
  const sv = severityStyle(item.severity);
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b border-neutral-100 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <TriangleAlert
              size={16}
              className={`shrink-0 ${
                item.severity === "critical" ? "text-red-500"
                : item.severity === "warning" ? "text-amber-500"
                : "text-blue-500"
              }`}
            />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">{item.title}</h3>
            {item.type && (
              <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{item.type}</span>
            )}
            {item.severity && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sv.badge}`}>{item.severity}</span>
            )}
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-2 shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {item.body || item.message || "No content."}
          </p>
          {item.stationName && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Station: <span className="font-medium">{item.stationName}</span></p>
          )}
        </div>
        <div className="px-5 pb-5 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {item.createdAt ? new Date(item.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
          </p>
          <button onClick={onClose} className="cursor-pointer text-xs font-semibold text-[#1a71f6] hover:text-blue-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Header ────────────────────────────────────────────────────────────────

const HeaderTwo = ({ onMenuClick }) => {
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted]               = useState(false);
  const [notifOpen, setNotifOpen]           = useState(false);
  const [selectedNotif, setSelectedNotif]   = useState(null);
  const notifRef                            = useRef(null);
  const USER_ID = "admin-user-1";

  const { adminName, adminImage, initProfile } = useAdminProfileStore();
  const getUserImage = useImageStore((s) => s.getUserImage);
  const { theme, setTheme } = useThemePersistence();
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
    startPolling,
    stopPolling,
  } = useAdminNotificationStore();

  const handleLogout = () => {
    stopPolling();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const profileImage = mounted
    ? adminImage || getUserImage(USER_ID) || "/sammi.jpeg"
    : "/sammi.jpeg";

  useEffect(() => {
    setMounted(true);
    initProfile();
    fetchNotifications();
    startPolling();
    return () => stopPolling();
  }, []);

  // click-outside closes notification dropdown
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  const handleItemClick = (notif) => {
    const id = notif._id || notif.id;
    if (!notif.isRead) markRead(id);
    setSelectedNotif(notif);
    setNotifOpen(false);
  };

  return (
    <div className="flex justify-between items-center px-4 lg:px-6 h-[70px] lg:h-[90px] w-full shadow-md bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">

      {/* ── Hamburger — mobile only ── */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu size={22} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* ── Right-side items ── */}
      <div className="flex items-center gap-2 lg:gap-5 ml-auto">

        {/* Dark / Light toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 p-2 lg:px-3 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {!mounted ? (
            <span className="w-[18px] h-[18px] block" />
          ) : theme === "dark" ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-gray-600 dark:text-gray-300" />
          )}
          <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {mounted ? (theme === "dark" ? "Light" : "Dark") : "Dark"}
          </span>
        </button>

        <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* ── Notification bell ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="cursor-pointer relative bg-neutral-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-9 h-9 lg:w-[50px] lg:h-[40px] rounded-lg flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={20} className={unreadCount > 0 ? "text-[#1a71f6]" : "text-gray-600 dark:text-gray-300"} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[min(340px,92vw)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-gray-700 overflow-hidden z-50">
              {/* dropdown header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</p>
                <button
                  onClick={() => markAllRead()}
                  className="cursor-pointer flex items-center gap-1 text-xs font-semibold text-[#1a71f6] hover:text-blue-800 transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              </div>

              {/* list */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <Bell size={18} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-neutral-400 dark:text-gray-500">No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => {
                    const id = notif._id || notif.id;
                    const sv = severityStyle(notif.severity);
                    return (
                      <button
                        key={id}
                        onClick={() => handleItemClick(notif)}
                        className={`w-full text-left border-l-4 px-4 py-3 border-b border-neutral-50 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors ${
                          notif.isRead ? "border-l-transparent bg-white dark:bg-gray-800" : `${sv.border} bg-blue-50/20 dark:bg-gray-700/30`
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${sv.dot}`} />
                            <p className={`text-sm leading-snug truncate ${notif.isRead ? "font-normal text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-gray-100"}`}>
                              {notif.title}
                            </p>
                          </div>
                          <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">{relativeTime(notif.createdAt)}</span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate mt-0.5 ml-3">{notif.body || ""}</p>
                        {notif.stationName && (
                          <p className="text-[10px] text-blue-500 truncate mt-0.5 ml-3">{notif.stationName}</p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-gray-700">
                  <button
                    onClick={() => { setNotifOpen(false); fetchNotifications(); }}
                    className="cursor-pointer w-full text-xs font-semibold text-[#1a71f6] hover:text-blue-800 flex items-center justify-center gap-1 transition-colors"
                  >
                    Refresh <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* ── Profile ── */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative cursor-pointer flex-shrink-0"
            onClick={() => setIsModalOpen((prev) => !prev)}
          >
            <Image
              src={profileImage}
              height={36}
              width={36}
              alt="profile picture"
              className="rounded-lg object-cover"
            />
            <span className="h-3 w-3 absolute bg-[#23A149] rounded-full -bottom-0.5 -right-0.5 border-2 border-white dark:border-gray-900" />
          </div>

          <div className="hidden lg:flex flex-col gap-0.5 justify-center">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {adminName || "Admin"}
            </h1>
            <button
              onClick={() => setIsModalOpen((prev) => !prev)}
              className="text-xs font-medium text-[#1A71F6] text-left hover:underline cursor-pointer"
            >
              View profile
            </button>
          </div>
        </div>

        <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700" />

        <div
          onClick={() => setShowLogoutConfirm(true)}
          className="hidden lg:flex items-center justify-center cursor-pointer"
        >
          <div className="border-2 border-red-600 rounded-2xl px-3 py-2 flex items-center gap-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <h1 className="text-red-600 text-xs font-bold">Logout</h1>
            <LogOut size={18} className="text-red-600" />
          </div>
        </div>

      </div>

      <MyProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      {selectedNotif && (
        <NotifDetailModal item={selectedNotif} onClose={() => setSelectedNotif(null)} />
      )}
    </div>
  );
};

export default HeaderTwo;

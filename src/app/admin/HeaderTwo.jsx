"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import MyProfileModal from "./MyProfileModal";
import { useImageStore } from "@/store/useImageStore";
import useAdminProfileStore from "@/store/useAdminProfileStore";
import useThemePersistence from "@/hooks/useThemePersistence";
import { Sun, Moon, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

const HeaderTwo = ({ onMenuClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const USER_ID = "admin-user-1";

  const { adminName, adminImage, initProfile } = useAdminProfileStore();
  const getUserImage = useImageStore((s) => s.getUserImage);
  const { theme, setTheme } = useThemePersistence();
  const router = useRouter();

  const handleLogout = () => {
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
  }, []);

  return (
    <div className="flex justify-between items-center px-4 lg:px-6 h-[70px] lg:h-[90px] w-full shadow-md bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">

      {/* ── Hamburger — mobile only (left) ── */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu size={22} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* ── Right-side items ── */}
      <div className="flex items-center gap-2 lg:gap-5 ml-auto">

        {/* Dark / Light toggle — icon only on mobile, icon+label on desktop */}
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

        {/* Divider — desktop only */}
        <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Notifications */}
        <div className="bg-neutral-200 dark:bg-gray-700 rounded-lg w-9 h-9 lg:w-[50px] lg:h-[40px] flex items-center justify-center relative flex-shrink-0">
          <span className="absolute -top-1 -right-1 bg-red-600 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-white text-[10px] font-bold px-1">
            8
          </span>
          <Image
            src="/notifications.png"
            height={20}
            width={20}
            alt="notifications"
          />
        </div>

        {/* Divider — desktop only */}
        <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Profile */}
        <div className="flex items-center gap-2.5">
          {/* Avatar — always visible */}
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

          {/* Name + link — desktop only */}
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

        {/* Divider + Logout — desktop only */}
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
    </div>
  );
};

export default HeaderTwo;

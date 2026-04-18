"use client";
import React, { useEffect, useState } from "react";
import {
  Home,
  Radio,
  CreditCard,
  DollarSign,
  Activity,
  Settings,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useThemePersistence from "@/hooks/useThemePersistence";
import Image from "next/image";
import { useImageStore } from "@/store/useImageStore";
import useAdminProfileStore from "@/store/useAdminProfileStore";
import { useRouter } from "next/navigation";

const SidebarTwo = ({ activeItem, setActiveItem, sidebarOpen, setSidebarOpen }) => {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const USER_ID = "admin-user-1";

  const { adminName, adminImage, adminRole, initProfile } = useAdminProfileStore();
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

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: Home, badge: null },
    { name: "Stations", icon: Radio, badge: null },
    { name: "Subscriptions", icon: CreditCard, badge: null },
    { name: "Payments & Billing", icon: DollarSign, badge: null },
    { name: "Activity Log", icon: Activity, badge: null },
    { name: "Settings", icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isDesktop || sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full z-50 lg:relative lg:z-auto w-[16rem] xl:w-[17.5rem] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Logo */}
        <div className="p-5 xl:p-6 text-center">
          <Image src="/station-logo.png" height={100} width={100} alt="logo" />
        </div>

        {/* Menu Section */}
        <div className="px-3 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 mb-3 px-3">
            GENERAL
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveItem(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#FF9D29] text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between px-3 py-2 mb-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {!mounted ? (
                <span className="w-4 h-4 block" />
              ) : theme === "dark" ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-gray-600 dark:text-gray-400" />
              )}
              {mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Dark Mode"}
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Image
              src={profileImage}
              width={40}
              height={43}
              alt="profile pic"
              className="rounded-md"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{adminName || "Admin"}</div>
              <div className="text-xs text-neutral-300 dark:text-gray-500 truncate capitalize">
                {adminRole || "Admin"}
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
              <Image
                src="/log-out-1.png"
                height={22}
                width={22}
                alt="logout logo"
              />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default SidebarTwo;

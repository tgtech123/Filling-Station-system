"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import MyProfileModal from "./MyProfileModal";
import { useImageStore } from "@/store/useImageStore";
import useAdminProfileStore from "@/store/useAdminProfileStore";
import useThemePersistence from "@/hooks/useThemePersistence";
import { Sun, Moon } from "lucide-react";

const HeaderTwo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const USER_ID = "admin-user-1";

  const { adminName, adminImage, initProfile } = useAdminProfileStore();
  const getUserImage = useImageStore((s) => s.getUserImage);
  const { theme, setTheme } = useThemePersistence();

  const profileImage = mounted
    ? adminImage || getUserImage(USER_ID) || "/sammi.jpeg"
    : "/sammi.jpeg";

  useEffect(() => {
    setMounted(true);
    initProfile();
  }, []);

  return (
    <div className="flex justify-end p-6 items-center h-[90px] w-full shadow-md bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-6 items-center">

        {/* Dark / Light toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Notifications */}
        <div className="bg-neutral-200 dark:bg-gray-700 rounded-md w-[50px] h-[40px] flex items-center justify-center relative">
          <span className="absolute top-[-4px] right-1 bg-red-600 rounded w-[18px] h-[22px] flex items-center justify-center text-white text-xs">
            8
          </span>
          <Image
            src="/notifications.png"
            height={24}
            width={24}
            alt="notifications"
          />
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Profile */}
        <div className="flex gap-3">
          <div className="relative">
            <Image
              src={profileImage}
              height={36}
              width={40}
              alt="profile picture"
              className="rounded-md"
            />
            <span className="h-[15px] w-[15px] absolute bg-[#23A149] rounded-full bottom-[-4px] right-[-2px]" />
          </div>

          <div className="flex flex-col gap-1 justify-center">
            <h1 className="text-[1rem] font-semibold text-gray-900 dark:text-white">
              {adminName || "Admin"}
            </h1>
            <button
              onClick={() => setIsModalOpen((prev) => !prev)}
              className="text-sm font-medium text-[#1A71F6] text-left hover:underline cursor-pointer"
            >
              View profile
            </button>
          </div>
        </div>

        <MyProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(!isModalOpen)}
        />

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Logout */}
        <div className="flex items-center justify-center cursor-pointer">
          <div className="border-2 border-red-600 rounded-2xl p-3 flex items-center gap-5">
            <h1 className="text-red-600 text-[12px] font-bold leading-[140%]">
              Logout
            </h1>
            <Image src="/log-out-1.png" width={25} height={24} alt="logout" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTwo;

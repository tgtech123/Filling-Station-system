"use client";

import Image from "next/image";
import logo from "../../assets/station-logo.png";
import {
  CircleFadingArrowUp,
  CircleQuestionMark,
  House,
  Moon,
  TrendingUp,
  X,
} from "lucide-react";
import { PiToggleLeftFill } from "react-icons/pi";
import userAvatarImg from "../../assets/userAvatar.png";
import UserAvatar from "./UserAvatar";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isVisible, toggleSidebar }) {
  const pathname = usePathname();
  const username = "Oboh ThankGod";
  const userRole = "Attendant";

  const links = [
    { id: "dashboard", name: "Dashboard", icon: <House />, link: "/dashboard" },
    {
      id: "shift",
      name: "Shift",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/shifts",
    },
    {
      id: "sales",
      name: "Sales Report",
      icon: <TrendingUp />,
      link: "/dashboard/sales",
    },
  ];
  return (
    <div
      className={`fixed z-30 w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      }  lg:translate-x-0 lg:transition-none lg:flex flex-col items-center`}
    >

      <div className="flex justify-between items-start pt-2 px-2">
        <Image src={logo} width={130} alt="logo image" />
        <div className="w-full flex justify-end px-4 pt-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="cursor-pointer text-white font-semibold text-md border bg-[#1a71f6] p-2 rounded-md"
          >
            <X size={26} />
          </button>
        </div>
      </div>


      <aside className="mt-6 text-[#888] flex flex-col w-full px-4 ">
        {/* General */}
        <p className="mb-4">GENERAL</p>

        <div className="links text-sm">
          {links.map((link) => (
            <Link
              href={link.link}
              key={link.id}
              className={`flex cursor-pointer items-center gap-2 ${
                pathname === link.link
                  ? "bg-[#ff9d29] text-white"
                  : "bg-transparent text-[#888]"
              } rounded-[12px] py-3 px-6`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Tools */}
        <div>
          <p className="mb-4">TOOLS</p>

          <div className="links text-sm">
            <div className="flex items-center cursor-pointer gap-2 rounded-[12px] px-6 py-3">
              <CircleQuestionMark />
              Help
            </div>

            <div className="flex items-center justify-between gap-2 rounded-[12px] px-6 py-3">
              <div className="flex gap-2 items-center cursor-pointer">
                <Moon />
                DarkMode
              </div>
              <PiToggleLeftFill
                size={30}
                className="text-[#d0d5dd] font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 p-2 rounded-[12px] border-2 border-gray-300 flex gap-6 items-center">
          {/* User Avatar  */}
          <UserAvatar
            userAvatarImg={userAvatarImg}
            username={username}
            userRole={userRole}
          />
          <LogoutButton />
        </div>
      </aside>
    </div>
  );
}

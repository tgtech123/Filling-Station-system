"use client"

import Image from "next/image";
import logo from "../../assets/station-logo.png";
import { CircleFadingArrowUp, CircleQuestionMark, House, Moon, TrendingUp } from "lucide-react";
import { PiToggleLeftFill } from "react-icons/pi";
import userAvatarImg from "../../assets/userAvatar.png"
import UserAvatar from "./UserAvatar";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import Link from "next/link";

export default function Sidebar() {
  const [isActive, setIsActive] = useState("dashboard")
  const username = "Oboh ThankGod";
  const userRole = "Attendant";

  const links = [
    {id: "dashboard", name: "Dashboard", icon: <House />, link: "/dashboard"},
    {id: "shift", name: "Shift", icon: <CircleFadingArrowUp />, link: "/dashboard/shifts"},
    {id: "sales", name: "Sales Report", icon: <TrendingUp />, link: "/dashboard/sales"}
  ] 
  return (
    <div className="fixed z-30 w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md hidden lg:flex flex-col items-center">
      <div>
        <Image src={logo} width={130} alt="logo image" />
      </div>

      <aside className="mt-6 text-[#888] flex flex-col w-full px-4 ">
        {/* General */}
        <p className="mb-4">GENERAL</p>

        <div className="links text-sm">
          {links.map((link, linkIxdex) => (
            <Link href={link.link} key={linkIxdex} onClick={() => setIsActive(link.id)} className={`flex cursor-pointer items-center gap-2 ${isActive === link.id ? "bg-[#ff9d29] text-white" : "bg-transparent text-[#888]"} rounded-[12px] py-3 px-6`}>
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
                <PiToggleLeftFill size={30} className="text-[#d0d5dd] font-semibold" />
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

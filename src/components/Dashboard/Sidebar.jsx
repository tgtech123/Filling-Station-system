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
  Users,
  Settings,
  FileText,
  DollarSign,
  BarChart3,
  UserCheck,
  Shield,
  Database,
} from "lucide-react";
import { PiToggleLeftFill } from "react-icons/pi";
import userAvatarImg from "../../assets/userAvatar.png";
import UserAvatar from "./UserAvatar";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/app/context/RoleContext";

export default function Sidebar({ isVisible, toggleSidebar }) {
  const pathname = usePathname();
  const { userRole, getRoleInfo } = useRole();
  const username = "Oboh ThankGod";

  const allLinks = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <House />,
      link: "/dashboard",
      roles: ["cashier", "attendant", "accountant", "supervisor", "manager"],
    },
    {
      id: "payments",
      name: "Payment Processing",
      icon: <DollarSign />,
      link: "/dashboard/payments",
      roles: ["cashier", "supervisor", "manager"],
    },
    {
      id: "transactions",
      name: "Transaction History",
      icon: <FileText />,
      link: "/dashboard/transactions",
      roles: ["cashier", "supervisor", "manager"],
    },
    {
      id: "shift",
      name: "Shifts",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/shifts",
      roles: ["attendant", "supervisor", "manager"],
    },
    {
      id: "sales-entry",
      name: "Sales Entry",
      icon: <DollarSign />,
      link: "/dashboard/sales-entry",
      roles: ["supervisor", "manager"],
    },
    {
      id: "financial-reports",
      name: "Financial Reports",
      icon: <FileText />,
      link: "/dashboard/financial-reports",
      roles: ["accountant", "supervisor", "manager"],
    },
    {
      id: "accounting",
      name: "Accounting",
      icon: <Database />,
      link: "/dashboard/accounting",
      roles: ["accountant", "supervisor", "manager"],
    },
    {
      id: "sales-reports",
      name: "Sales Reports",
      icon: <TrendingUp />,
      link: "/dashboard/sales",
      roles: ["attendant", "supervisor", "manager"],
    },
    {
      id: "staff-management",
      name: "Staff Management",
      icon: <Users />,
      link: "/dashboard/staff",
      roles: ["supervisor", "manager"],
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: <BarChart3 />,
      link: "/dashboard/inventory",
      roles: ["supervisor", "manager"],
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: <BarChart3 />,
      link: "/dashboard/analytics",
      roles: ["manager"],
    },
    {
      id: "user-management",
      name: "User Management",
      icon: <UserCheck />,
      link: "/dashboard/users",
      roles: ["manager"],
    },
    {
      id: "settings",
      name: "System Settings",
      icon: <Settings />,
      link: "/dashboard/settings",
      roles: ["manager"],
    },
    {
      id: "audit",
      name: "Audit Logs",
      icon: <Shield />,
      link: "/dashboard/audit",
      roles: ["manager"],
    },
  ];

  // Filter links based on user role
  const getVisibleLinks = (userRole) => {
    if (!userRole) return [];
    return allLinks.filter((link) =>
      link.roles.includes(userRole.toLowerCase())
    );
  };

  const visibleLinks = getVisibleLinks(userRole);
  const roleInfo = getRoleInfo();

  if (!userRole) {
    return (
      <div className="fixed z-30 w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getColorClasses = (color) => {
    const colors = {
      pink: "bg-pink-500",
      orange: "bg-orange-500",
      purple: "bg-purple-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
    };
    return colors[color] || "bg-gray-500";
  };

  return (
    <div
      className={`fixed z-30 w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:transition-none flex flex-col`}
    >
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 flex justify-between items-start pt-2 px-2">
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

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto scrollbar-hide overflow-x-hidden">
        <aside className="mt-6 text-[#888] flex flex-col w-full px-4 pb-24">
          {/* Role-based greeting */}
          <div className="mb-6 px-2">
            <p className="text-xs text-[#666] mb-1">
              Access Level: {roleInfo?.level}/5
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${getColorClasses(
                  roleInfo?.color
                )}`}
              ></div>
              <span className="text-xs font-medium">{roleInfo?.name}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <p className="mb-4 text-xs font-semibold">NAVIGATION</p>

          <div className="links text-sm space-y-1 mb-8">
            {visibleLinks.map((link) => (
              <Link
                href={link.link}
                key={link.id}
                className={`flex cursor-pointer items-center gap-3 ${
                  pathname === link.link
                    ? "bg-[#ff9d29] text-white"
                    : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
                } rounded-[12px] py-3 px-4 transition-all duration-200`}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                <span className="truncate">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Tools Section */}
          <div>
            <p className="mb-4 text-xs font-semibold">TOOLS</p>

            <div className="links text-sm space-y-1">
              <div className="flex items-center cursor-pointer gap-3 rounded-[12px] px-4 py-3 hover:bg-gray-50 transition-all duration-200">
                <CircleQuestionMark size={18} />
                <span>Help & Support</span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-[12px] px-4 py-3 hover:bg-gray-50 transition-all duration-200">
                <div className="flex gap-3 items-center cursor-pointer">
                  <Moon size={18} />
                  <span>Dark Mode</span>
                </div>
                <PiToggleLeftFill
                  size={30}
                  className="text-[#d0d5dd] font-semibold cursor-pointer hover:text-[#b0b5bd] transition-colors"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Fixed User Profile Section */}
      <div className="flex-shrink-0 absolute bottom-4 left-4 right-4 p-3 rounded-[12px] border-2 border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <UserAvatar
            userAvatarImg={userAvatarImg}
            username={username}
            userRole={userRole}
          />
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

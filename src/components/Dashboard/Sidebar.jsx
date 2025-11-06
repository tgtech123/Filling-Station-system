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
  Cpu,
  Wrench,
  ChevronDown,
  ChevronUp,
  Landmark,
  Pyramid,
  History,
  LogOut,
} from "lucide-react";
import { RiOilLine } from "react-icons/ri";
import { PiToggleLeftFill } from "react-icons/pi";
import { HiOutlineChartBar } from "react-icons/hi";
import { FaFire, FaHandHoldingUsd } from "react-icons/fa";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { MdDoubleArrow, MdOutlinePeopleAlt } from "react-icons/md";
import {
  IoCheckmarkDone,
  IoDocumentText,
  IoDocumentTextOutline,
} from "react-icons/io5";
import { TfiBoltAlt } from "react-icons/tfi";
import { BiSolidTachometer } from "react-icons/bi";
import userAvatarImg from "../../assets/userAvatar.png";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TbCurrencyNaira, TbTargetArrow } from "react-icons/tb";
import { CiGrid41 } from "react-icons/ci";
import { CgTrack } from "react-icons/cg";
import { GiExpense, GiTakeMyMoney } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useImageStore } from "@/store/useImageStore";

export default function Sidebar({ isVisible, toggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const { getUserImage } = useImageStore();

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userString = localStorage.getItem("user");
        
        if (userString) {
          const user = JSON.parse(userString);
          console.log("📦 User from localStorage:", user);
          
          if (user?.role) {
            const role = user.role.toLowerCase().trim();
            console.log("✅ Setting role to:", role);
            setUserRole(role);
            setUserData(user);
          } else {
            console.log("❌ No role found in user object");
            router.push("/login");
          }
        } else {
          console.log("❌ No user found in localStorage");
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, [router]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Get role information
  const getRoleInfo = (role) => {
    const roleMap = {
      cashier: {
        name: "Cashier",
        level: 2,
        color: "bg-green-500",
      },
      attendant: {
        name: "Attendant",
        level: 1,
        color: "bg-blue-500",
      },
      supervisor: {
        name: "Supervisor",
        level: 3,
        color: "bg-purple-500",
      },
      accountant: {
        name: "Accountant",
        level: 4,
        color: "bg-yellow-500",
      },
      manager: {
        name: "Manager",
        level: 5,
        color: "bg-red-500",
      }
    };

    return roleMap[role] || {
      name: "Unknown",
      level: 0,
      color: "bg-gray-500",
    };
  };

  // Accountant dropdowns
  const reportSubLinks = [
    {
      id: "financial-statement",
      name: "Full Financial Statement",
      icon: <Landmark size={20} />,
      link: "/dashboard/reports/financialStatement",
    },
    {
      id: "profit-loss",
      name: "Profit & Loss",
      icon: <MdDoubleArrow size={20} />,
      link: "/dashboard/reports/profitLoss",
    },
    {
      id: "income",
      name: "Income",
      icon: <GiTakeMyMoney size={20} />,
      link: "/dashboard/reports/income",
    },
    {
      id: "expenses",
      name: "Expenses",
      icon: <GiExpense size={20} />,
      link: "/dashboard/reports/expenses",
    },
    {
      id: "tax-report",
      name: "Tax-Ready Report",
      icon: <IoDocumentTextOutline size={20} />,
      link: "/dashboard/reports/taxReport",
    },
  ];

  const commissionsSubLinks = [
    {
      id: "overview",
      name: "Overview",
      icon: <CiGrid41 size={20} />,
      link: "/dashboard/commissions/overview",
    },
    {
      id: "staff-tracking",
      name: "Staff Tracking",
      icon: <CgTrack size={20} />,
      link: "/dashboard/commissions/staffTracking",
    },
    {
      id: "structure",
      name: "Structure",
      icon: <Pyramid size={20} />,
      link: "/dashboard/commissions/structure",
    },
    {
      id: "payment-history",
      name: "Payment History",
      icon: <History size={20} />,
      link: "/dashboard/commissions/paymentHistory",
    },
  ];

  // All navigation links with role permissions
  const allLinks = (role) => [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <House />,
    link: `/dashboard/${role}`, 
    roles: ["cashier", "attendant", "accountant", "supervisor", "manager"],
  },
    // Cashier links
    {
      id: "attendant-report",
      name: "Attendant Report",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/attendantReport",
      roles: ["cashier"],
    },
    {
      id: "lubricants",
      name: "Lubricant Sales",
      icon: <RiOilLine size={20} />,
      link: "/dashboard/lubricantSales",
      roles: ["cashier"],
    },
    // Attendant links
    {
      id: "shift",
      name: "Shifts",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/shifts",
      roles: ["attendant"],
    },
    {
      id: "sales-reports",
      name: "Sales Reports",
      icon: <TrendingUp />,
      link: "/dashboard/sales",
      roles: ["attendant"],
    },
    // Supervisor links
    {
      id: "schedule-shift",
      name: "Schedule Shift",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/scheduleShift",
      roles: ["supervisor"],
    },
    {
      id: "shift-approval",
      name: "Shift Approval",
      icon: <IoCheckmarkDone size={20} />,
      link: "/dashboard/shiftapproval",
      roles: ["supervisor"],
    },
    {
      id: "dip-reading",
      name: "Dip Reading",
      icon: <BiSolidTachometer size={20} />,
      link: "/dashboard/dipReading",
      roles: ["supervisor"],
    },
    {
      id: "pump-performance",
      name: "Pump Performance",
      icon: <BsFillFuelPumpFill size={20} />,
      link: "/dashboard/pumpPerformance",
      roles: ["supervisor"],
    },
    {
      id: "staff-performance",
      name: "Staff Performance",
      icon: <TbTargetArrow size={20} />,
      link: "/dashboard/staffPerformance",
      roles: ["supervisor"],
    },
    // Accountant links
    {
      id: "accountant-reports",
      name: "Reports",
      icon: <HiOutlineChartBar size={20} />,
      roles: ["accountant"],
      isDropdown: true,
      subLinks: reportSubLinks,
    },
    {
      id: "commissions",
      name: "Commissions",
      icon: <FaHandHoldingUsd size={20} />,
      roles: ["accountant"],
      isDropdown: true,
      subLinks: commissionsSubLinks,
    },
    {
      id: "trends",
      name: "Trends",
      icon: <TfiBoltAlt size={20} />,
      roles: ["accountant"],
      link: "/dashboard/trends",
    },
    // Manager links
    {
      id: "fuel-management",
      name: "Fuel Management",
      icon: <FaFire size={20} />,
      link: "/dashboard/fuelManagement",
      roles: ["manager"],
    },
    {
      id: "sales-and-cash-report",
      name: "Sales & Cash Report",
      icon: <TbCurrencyNaira size={24} />,
      link: "/dashboard/sales-and-cash-report",
      roles: ["manager"],
    },
    {
      id: "pump-control",
      name: "Pump Control",
      icon: <BsFillFuelPumpFill size={20} />,
      link: "/dashboard/pumpControl",
      roles: ["manager"],
    },
    {
      id: "lubricant-management",
      name: "Lubricant Management",
      icon: <RiOilLine size={20} />,
      link: "/dashboard/lubricantManagement",
      roles: ["manager"],
    },
    {
      id: "financial-overview",
      name: "Financial Overview",
      icon: <TrendingUp />,
      link: "/dashboard/financial-overview",
      roles: ["manager"],
    },
    {
      id: "activity-logs",
      name: "Activity Logs",
      icon: <Cpu />,
      link: "/dashboard/activity-logs",
      roles: ["manager"],
    },
    {
      id: "export-reports",
      name: "Export Reports",
      icon: <IoDocumentText size={20} />,
      link: "/dashboard/exportReport",
      roles: ["manager"],
    },
    {
      id: "system-settings",
      name: "System Settings",
      icon: <Wrench />,
      link: "/dashboard/system-settings",
      roles: ["manager"],
    },
    {
      id: "staff-management",
      name: "Staff Management",
      icon: <MdOutlinePeopleAlt size={24} />,
      link: "/dashboard/staffManagement",
      roles: ["manager"],
    },
  ];

  const getVisibleLinks = (role) => {
  if (!role) return [];

  const normalizedRole = role.toLowerCase().trim();
  const links = allLinks(normalizedRole);

  return links.filter((link) => {
    if (!Array.isArray(link.roles)) return false;
    return link.roles.includes(normalizedRole);
  });
};

const visibleLinks = getVisibleLinks(userRole);
  const roleInfo = getRoleInfo(userRole);

  useEffect(() => {
    if (userRole) {
      console.log("🔍 Sidebar Debug:");
      console.log("- User Role:", userRole);
      console.log("- Role Info:", roleInfo);
      console.log("- Visible Links:", visibleLinks.length);
      console.log("- Links:", visibleLinks.map(l => l.name));
    }
  }, [userRole, roleInfo, visibleLinks]);

  const fullName = userData?.firstName && userData?.lastName 
  ? `${userData.firstName} ${userData.lastName}` 
  : userData?.firstName || userData?.lastName || "User";

  if (isLoading) {
    return (
      <div className=" z-30 md:w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    // <div
    //   className={` lg:w-[280px] lg:flex lg:relative h-[100vh] top-0 left-0 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
    //     isVisible ? "flex fixed z-50 translate-x-0" : "hidden -translate-x-full"
    //   } lg:translate-x-0 lg:transition-none flex flex-col`}
    // >

    <div
  className={`lg:w-[280px] lg:flex lg:relative h-[100vh] top-0 left-0 bg-white shadow-md transform transition-transform duration-500 ease-in-out ${
    isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
  } lg:translate-x-0 lg:opacity-100 fixed z-50 lg:transition-none flex flex-col`}
>

      {/* Header */}
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide overflow-x-hidden">
        <aside className="mt-6 text-[#888] flex flex-col w-full px-4 pb-24">
          {/* Role Info */}
          <div className="mb-6 px-2">
            <p className="text-xs text-[#666] mb-1">
              Access Level: {roleInfo?.level}/5
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${roleInfo?.color}`}></div>
              <span className="text-xs font-medium capitalize">{roleInfo?.name}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <p className="mb-4 text-xs font-semibold">NAVIGATION</p>

          {visibleLinks.length === 0 ? (
            <div className="text-xs text-gray-400 px-4 py-2">
              No menu items available for your role
            </div>
          ) : (
            <div className="links text-sm space-y-1 mb-8">
              {visibleLinks.map((link) => (
                <div key={link.id}>
                  {link.isDropdown ? (
                    <>
                      <div
                        onClick={() => toggleDropdown(link.id)}
                        className={`flex cursor-pointer items-center justify-between gap-3 ${
                          isActive(pathname, link)
                            ? "bg-[#ff9d29] text-white"
                            : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
                        } rounded-[12px] py-3 px-4 transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          <span>{link.icon}</span>
                          <span>{link.name}</span>
                        </div>
                        {openDropdown === link.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                      {openDropdown === link.id && (
                        <div className="ml-8 mt-1 space-y-1">
                          {link.subLinks.map((subLink) => (
                            <Link
                              href={subLink.link}
                              key={subLink.id}
                              className={`flex items-center gap-3 ${
                                pathname === subLink.link
                                  ? "bg-[#ff9d29] text-white"
                                  : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
                              } rounded-[12px] py-2 px-4 transition-all duration-200 text-sm`}
                            >
                              <span>{subLink.icon}</span>
                              <span>{subLink.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={link.link}
                      className={`flex items-center gap-3 ${
                        pathname === link.link
                          ? "bg-[#ff9d29] text-white"
                          : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
                      } rounded-[12px] py-3 px-4 transition-all duration-200`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tools */}
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
                className="text-[#d0d5dd] font-semibold cursor-pointer hover:text-[#b0b5bd]"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 absolute bottom-4 left-4 right-4 p-3 rounded-[12px] border-2 border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <UserAvatar
            userId={userData?.id || userData?.employeeId || userData?._id}
            username={fullName}
            userRole={userRole}
          />
          <button
            onClick={handleLogout}
            className="text-red-500 rounded-lg transition-colors"
          >
            <LogOut size={32} className="cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to check active state
function isActive(pathname, link) {
  if (link.isDropdown) {
    return link.subLinks.some((sub) => pathname === sub.link);
  }
  return pathname === link.link;
}
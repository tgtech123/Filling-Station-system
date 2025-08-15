// "use client";

// import Image from "next/image";
// import logo from "../../assets/station-logo.png";

// import {
//   CircleFadingArrowUp,
//   CircleQuestionMark,
//   House,
//   Moon,
//   TrendingUp,
//   X,
//   Cpu,
//   Wrench,
// } from "lucide-react";
// import { RiOilLine } from "react-icons/ri"
// import { PiToggleLeftFill } from "react-icons/pi";
// import { HiOutlineChartBar } from "react-icons/hi";
// import { FaFire, FaHandHoldingUsd } from "react-icons/fa";
// import { BsFillFuelPumpFill } from "react-icons/bs";
// import { MdOutlinePeopleAlt } from "react-icons/md";
// import { IoCheckmarkDone, IoDocumentText } from "react-icons/io5";
// import { TfiBoltAlt } from "react-icons/tfi";
// import { BiSolidTachometer } from "react-icons/bi";
// import userAvatarImg from "../../assets/userAvatar.png";
// import UserAvatar from "./UserAvatar";
// import LogoutButton from "./LogoutButton";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useRole } from "@/app/context/RoleContext";
// import { TbCurrencyNaira, TbTargetArrow } from "react-icons/tb";

// export default function Sidebar({ isVisible, toggleSidebar }) {
//   const pathname = usePathname();
//   const { userRole, getRoleInfo } = useRole();
//   const username = "Oboh ThankGod";

//   const allLinks = [
//     {
//       id: "dashboard",
//       name: "Dashboard",
//       icon: <House />,
//       link: "/dashboard",
//       roles: ["cashier", "attendant", "accountant", "supervisor", "manager"],
//     },
//     {
//       id: "attendant-report",
//       name: "Attendant Report",
//       icon: <CircleFadingArrowUp />,
//       link: "/dashboard/attendant-report",
//       roles: ["cashier"],
//     },
//     {
//       id: "lubricants",
//       name: "Lubricant Sales",
//       icon: <RiOilLine size={24} />,
//       link: "/dashboard/lubricantSales",
//       roles: ["cashier"],
//     },
//     {
//       id: "shift",
//       name: "Shifts",
//       icon: <CircleFadingArrowUp />,
//       link: "/dashboard/shifts",
//       roles: ["attendant"],
//     },
//     {
//       id: "fuel-management",
//       name: "Fuel Management",
//       icon: <FaFire size={24} />,
//       link: "/dashboard/fuel-management",
//       roles: ["manager"],
//     },
//     {
//       id: "shift-approval",
//       name: "Shift Approval",
//       icon: <IoCheckmarkDone size={24} />,
//       link: "/dashboard/shiftapproval",
//       roles: ["supervisor"]
//     },
//     {
//       id: "reports",
//       name: "Reports",
//       icon: <HiOutlineChartBar size={24} />,
//       link: "/dashboard/reports",
//       roles: ["accountant"],
//     },
//     {
//       id: "sales-and-cash-report",
//       name: "Sales & Cash Report",
//       icon: <TbCurrencyNaira size={24} />,
//       link: "/dashboard/sales-and-currency-report",
//       roles: ["manager"],
//     },
//     {
//       id: "sales-reports",
//       name: "Sales Reports",
//       icon: <TrendingUp />,
//       link: "/dashboard/sales",
//       roles: ["attendant"],
//     },
//     {
//       id: "staff-management",
//       name: "Staff Management",
//       icon: <MdOutlinePeopleAlt />
//     },
//     {
//       id: "schedule-shift",
//       name: "Schedule Shift",
//       icon: <CircleFadingArrowUp />,
//       link: "/dashboard/schedule-shift",
//       roles: ["supervisor"],
//     },
//     {
//       id: "dip-reading",
//       name: "Dip Reading",
//       icon: <BiSolidTachometer size={24} />,
//       link: "/dashboard/dipReading",
//       roles: ["supervisor"],
//     },
//     {
//       id: "commissions",
//       name: "Commissions",
//       icon: <FaHandHoldingUsd size={24}/>,
//       link: "/dashboard/commisions",
//       roles: ["accountant"]
//     },
//     {
//       id: "pump-performance",
//       name: "Pump Performance",
//       icon: <BsFillFuelPumpFill size={24} />,
//       link: "/dashboard/pumpPerformance",
//       roles: ["supervisor"],
//     },
//     {
//       id: "staff-performance",
//       name: "Staff Performance",
//       icon: <TbTargetArrow size={24} />,
//       link: "/dashboard/staff-performance",
//       roles: ["supervisor"],
//     },
//     {
//       id: "trends",
//       name: "Trends",
//       icon: <TfiBoltAlt size={24} />,
//       link: "/dashboard/trends",
//       roles: ["accountant"],
//     },
//     {
//       id: "pump-control",
//       name: "Pump Control",
//       icon: <BsFillFuelPumpFill size={24} />,
//       link: "/dashboard/pump-control",
//       roles: ["manager"],
//     },
//     {
//       id: "lubricant-management",
//       name: "Lubricant Management",
//       icon: <RiOilLine size={24} />,
//       link: "/dashboard/lubricant-management",
//       roles: ["manager"],
//     },
//     {
//       id: "financial-overview",
//       name: "Financial Overview",
//       icon: <TrendingUp />,
//       link: "/dashboard/financial-overview",
//       roles: ["manager"],
//     },
//     {
//       id: "activity-logs",
//       name: "Activity Logs",
//       icon: <Cpu />,
//       link: "/dashboard/activity-logs",
//       roles: ["manager"],
//     },
//     {
//       id: "export-reports",
//       name: "Export Reports",
//       icon: <IoDocumentText size={24} />,
//       link: "/dashboard/export-reports",
//       roles: ["manager"]
//     },
//     {
//       id: "system-settings",
//       name: "System Settings",
//       icon: <Wrench />,
//       link: "/dashboard/system-settings",
//       roles: ["manager"]
//     }
//   ];

//   // Filter links based on user role
//   // const getVisibleLinks = (userRole) => {
//   //   if (!userRole) return [];
//   //   return allLinks.filter((link) =>
//   //     link.roles.includes(userRole.toLowerCase())
//   //   );
//   // };

//   const getVisibleLinks = (userRole) => {
//   if (!userRole || typeof userRole !== 'string') return [];
//   return allLinks.filter(
//     (link) =>
//       Array.isArray(link.roles) &&
//       link.roles.includes(userRole.toLowerCase())
//   );
// };

//   const visibleLinks = getVisibleLinks(userRole);
//   const roleInfo = getRoleInfo();

//   if (!userRole) {
//     return (
//       <div className="fixed z-30 w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   const getColorClasses = (color) => {
//     const colors = {
//       pink: "bg-pink-500",
//       orange: "bg-orange-500",
//       purple: "bg-purple-500",
//       blue: "bg-blue-500",
//       green: "bg-green-500",
//     };
//     return colors[color] || "bg-gray-500";
//   };

//   return (
//     <div
//       className={`fixed z-30 w-[280px] h-[100vh] top-0 left-0 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
//         isVisible ? "translate-x-0" : "-translate-x-full"
//       } lg:translate-x-0 lg:transition-none flex flex-col`}
//     >
//       {/* Fixed Header Section */}
//       <div className="flex-shrink-0 flex justify-between items-start pt-2 px-2">
//         <Image src={logo} width={130} alt="logo image" />
//         <div className="w-full flex justify-end px-4 pt-4 lg:hidden">
//           <button
//             onClick={toggleSidebar}
//             className="cursor-pointer text-white font-semibold text-md border bg-[#1a71f6] p-2 rounded-md"
//           >
//             <X size={26} />
//           </button>
//         </div>
//       </div>

//       {/* Scrollable Content Section */}
//       <div className="flex-1 overflow-y-auto scrollbar-hide overflow-x-hidden">
//         <aside className="mt-6 text-[#888] flex flex-col w-full px-4 pb-24">
//           {/* Role-based greeting */}
//           <div className="mb-6 px-2">
//             <p className="text-xs text-[#666] mb-1">
//               Access Level: {roleInfo?.level}/5
//             </p>
//             <div className="flex items-center gap-2">
//               <div
//                 className={`w-2 h-2 rounded-full ${getColorClasses(
//                   roleInfo?.color
//                 )}`}
//               ></div>
//               <span className="text-xs font-medium">{roleInfo?.name}</span>
//             </div>
//           </div>

//           {/* Navigation Links */}
//           <p className="mb-4 text-xs font-semibold">NAVIGATION</p>

//           <div className="links text-sm space-y-1 mb-8">
//             {visibleLinks.map((link) => (
//               <Link
//                 href={link.link}
//                 key={link.id}
//                 className={`flex cursor-pointer items-center gap-3 ${
//                   pathname === link.link
//                     ? "bg-[#ff9d29] text-white"
//                     : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
//                 } rounded-[12px] py-3 px-4 transition-all duration-200`}
//               >
//                 <span className="flex-shrink-0">{link.icon}</span>
//                 <span className="truncate">{link.name}</span>
//               </Link>
//             ))}
//           </div>

//           {/* Tools Section */}
//           <div>
//             <p className="mb-4 text-xs font-semibold">TOOLS</p>

//             <div className="links text-sm space-y-1">
//               <div className="flex items-center cursor-pointer gap-3 rounded-[12px] px-4 py-3 hover:bg-gray-50 transition-all duration-200">
//                 <CircleQuestionMark size={18} />
//                 <span>Help & Support</span>
//               </div>

//               <div className="flex items-center justify-between gap-2 rounded-[12px] px-4 py-3 hover:bg-gray-50 transition-all duration-200">
//                 <div className="flex gap-3 items-center cursor-pointer">
//                   <Moon size={18} />
//                   <span>Dark Mode</span>
//                 </div>
//                 <PiToggleLeftFill
//                   size={30}
//                   className="text-[#d0d5dd] font-semibold cursor-pointer hover:text-[#b0b5bd] transition-colors"
//                 />
//               </div>
//             </div>
//           </div>
//         </aside>
//       </div>

//       {/* Fixed User Profile Section */}
//       <div className="flex-shrink-0 absolute bottom-4 left-4 right-4 p-3 rounded-[12px] border-2 border-gray-200 bg-white shadow-sm">
//         <div className="flex items-center justify-between">
//           <UserAvatar
//             userAvatarImg={userAvatarImg}
//             username={username}
//             userRole={userRole}
//           />
//           <LogoutButton />
//         </div>
//       </div>
//     </div>
//   );
// }



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
} from "lucide-react";
import { RiOilLine } from "react-icons/ri"
import { PiToggleLeftFill } from "react-icons/pi";
import { HiOutlineChartBar } from "react-icons/hi";
import { FaFire, FaHandHoldingUsd } from "react-icons/fa";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { MdDoubleArrow, MdOutlinePeopleAlt } from "react-icons/md";
import { IoCheckmarkDone, IoDocumentText, IoDocumentTextOutline } from "react-icons/io5";
import { TfiBoltAlt } from "react-icons/tfi";
import { BiGridAlt, BiSolidTachometer } from "react-icons/bi";
import userAvatarImg from "../../assets/userAvatar.png";
import UserAvatar from "./UserAvatar";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/app/context/RoleContext";
import { TbCurrencyNaira, TbTargetArrow } from "react-icons/tb";
import { CiGrid41 } from "react-icons/ci";
import { CgTrack } from "react-icons/cg";
import { GiExpense, GiTakeMyMoney } from "react-icons/gi";
import { useState } from "react";

export default function Sidebar({ isVisible, toggleSidebar }) {
  const pathname = usePathname();
  const { userRole, getRoleInfo } = useRole();
  const username = "Oboh ThankGod";
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const reportSubLinks = [
    {
      id: "financial-statement",
      name: "Full Financial Statement",
      icon: <Landmark size={24}/>,
      link: "/dashboard/reports/financialStatement",
    },
    {
      id: "profit-loss",
      name: "Profit & Loss",
      icon: <MdDoubleArrow size={24}/>,
      link: "/dashboard/reports/profitLoss",
    },
    {
      id: "trends",
      name: "Income",
      icon: <GiTakeMyMoney size={24}/>,
      link: "/dashboard/reports/income",
    },
    {
      id: "expenses",
      name: "Expenses",
      icon: <GiExpense size={24}/>,
      link: "/dashboard/reports/expenses",
    },
    {
      id: "tax-report",
      name: "Tax-Ready Report",
      icon: <IoDocumentTextOutline size={24}/>,
      link: "/dashboard/reports/taxReport",
    }
  ];

  const commissionsSubLinks = [
    {
      id: "overview",
      name: "Overview",
      icon: <CiGrid41 size={24}/>,
      link: "/dashboard/commissions/overview"
    },
    {
      id: "staff-tracking",
      name: "Staff Tracking",
      icon: <CgTrack size={24} />,
      link: "/dashboard/commissions/staffTracking"
    },
    {
      id: "structure",
      name: "Structure",
      icon: <Pyramid size={24} />,
      link: "/dashboard/commissions/structure"
    },
    {
      id: "payment-history",
      name: "Payment History",
      icon: <History size={24} />,
      link: "/dashboard/commissions/paymentHistory"
    }
  ]

  const allLinks = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <House />,
      link: "/dashboard",
      roles: ["cashier", "attendant", "accountant", "supervisor", "manager"],
    },
    {
      id: "attendant-report",
      name: "Attendant Report",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/attendant-report",
      roles: ["cashier"],
    },
    {
      id: "lubricants",
      name: "Lubricant Sales",
      icon: <RiOilLine size={24} />,
      link: "/dashboard/lubricantSales",
      roles: ["cashier"],
    },
    {
      id: "shift",
      name: "Shifts",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/shifts",
      roles: ["attendant"],
    },
    {
      id: "fuel-management",
      name: "Fuel Management",
      icon: <FaFire size={24} />,
      link: "/dashboard/fuel-management",
      roles: ["manager"],
    },
    {
      id: "shift-approval",
      name: "Shift Approval",
      icon: <IoCheckmarkDone size={24} />,
      link: "/dashboard/shiftapproval",
      roles: ["supervisor"]
    },
    // Combined dropdown for accountant
    {
      id: "accountant-reports",
      name: "Reports",
      icon: <HiOutlineChartBar size={24} />,
      roles: ["accountant"],
      isDropdown: true,
      subLinks: reportSubLinks
    },
    {
      id: "commissions",
      name: "Commissions",
      icon: <FaHandHoldingUsd  size={24}/>,
      roles: ["accountant"],
      isDropdown: true,
      subLinks: commissionsSubLinks
    },
    {
      id: "trends",
      name: "Trends",
      icon: <TfiBoltAlt size={24}/>,
      roles: ["accountant"],
      link: "/dashboard/trends"
    },
    {
      id: "sales-and-cash-report",
      name: "Sales & Cash Report",
      icon: <TbCurrencyNaira size={24} />,
      link: "/dashboard/sales-and-currency-report",
      roles: ["manager"],
    },
    {
      id: "sales-reports",
      name: "Sales Reports",
      icon: <TrendingUp />,
      link: "/dashboard/sales",
      roles: ["attendant"],
    },
    {
      id: "staff-management",
      name: "Staff Management",
      icon: <MdOutlinePeopleAlt />
    },
    {
      id: "schedule-shift",
      name: "Schedule Shift",
      icon: <CircleFadingArrowUp />,
      link: "/dashboard/schedule-shift",
      roles: ["supervisor"],
    },
    {
      id: "dip-reading",
      name: "Dip Reading",
      icon: <BiSolidTachometer size={24} />,
      link: "/dashboard/dipReading",
      roles: ["supervisor"],
    },
    {
      id: "pump-performance",
      name: "Pump Performance",
      icon: <BsFillFuelPumpFill size={24} />,
      link: "/dashboard/pumpPerformance",
      roles: ["supervisor"],
    },
    {
      id: "staff-performance",
      name: "Staff Performance",
      icon: <TbTargetArrow size={24} />,
      link: "/dashboard/staff-performance",
      roles: ["supervisor"],
    },
    {
      id: "pump-control",
      name: "Pump Control",
      icon: <BsFillFuelPumpFill size={24} />,
      link: "/dashboard/pump-control",
      roles: ["manager"],
    },
    {
      id: "lubricant-management",
      name: "Lubricant Management",
      icon: <RiOilLine size={24} />,
      link: "/dashboard/lubricant-management",
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
      icon: <IoDocumentText size={24} />,
      link: "/dashboard/export-reports",
      roles: ["manager"]
    },
    {
      id: "system-settings",
      name: "System Settings",
      icon: <Wrench />,
      link: "/dashboard/system-settings",
      roles: ["manager"]
    }
  ];

  const getVisibleLinks = (userRole) => {
    if (!userRole || typeof userRole !== 'string') return [];
    return allLinks.filter(
      (link) =>
        Array.isArray(link.roles) &&
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

  const isActive = (link) => {
    if (link.isDropdown) {
      return link.subLinks.some(subLink => pathname === subLink.link);
    }
    return pathname === link.link;
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
              <div key={link.id}>
                {link.isDropdown ? (
                  <>
                    <div
                      onClick={() => toggleDropdown(link.id)}
                      className={`flex cursor-pointer items-center justify-between gap-3 ${
                        isActive(link)
                          ? "bg-[#ff9d29] text-white"
                          : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
                      } rounded-[12px] py-3 px-4 transition-all duration-200`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0">{link.icon}</span>
                        <span className="truncate">{link.name}</span>
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
                            className={`flex cursor-pointer items-center gap-3 ${
                              pathname === subLink.link
                                ? "bg-[#ff9d29] text-white"
                                : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
                            } rounded-[12px] py-2 px-4 transition-all duration-200 text-sm`}
                          >
                            <span className="flex-shrink-0">{subLink.icon}</span>
                            <span className="">{subLink.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.link}
                    className={`flex cursor-pointer items-center gap-3 ${
                      pathname === link.link
                        ? "bg-[#ff9d29] text-white"
                        : "bg-transparent text-[#888] hover:bg-gray-50 hover:text-[#666]"
                    } rounded-[12px] py-3 px-4 transition-all duration-200`}
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    <span className="truncate">{link.name}</span>
                  </Link>
                )}
              </div>
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
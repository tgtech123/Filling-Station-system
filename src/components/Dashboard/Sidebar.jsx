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
  Network,
  Plus,
  BarChart2,
  Package,
  Banknote,
  ClipboardList,
  ShieldCheck,
  Building2,
  BookOpen,
  Scale,
} from "lucide-react";
import { RiOilLine } from "react-icons/ri";
import { PiToggleLeftFill, PiToggleRightFill } from "react-icons/pi";
import { HiOutlineChartBar } from "react-icons/hi";
import { FaFire, FaHandHoldingUsd } from "react-icons/fa";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { IoCheckmarkDone, IoDocumentText } from "react-icons/io5";
import { TfiBoltAlt } from "react-icons/tfi";
import { BiSolidTachometer } from "react-icons/bi";
import ProfileAvatar from "./ProfileAvatar";
import LogoutConfirmModal from "../LogoutConfirmModal";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TbCurrencyNaira, TbTargetArrow } from "react-icons/tb";
import { CiGrid41 } from "react-icons/ci";
import { CgTrack } from "react-icons/cg";
import { GiTakeMyMoney } from "react-icons/gi";
import { useState, useEffect, useRef } from "react";
import useThemePersistence from "@/hooks/useThemePersistence";
import usePaymentStore from "@/store/usePaymentStore";
import useGasStore from "@/store/useGasStore";
import AddBranchModal from "../AddBranchModal";

export default function Sidebar({ isVisible, toggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useThemePersistence();
  const { currentPlan, fetchCurrentPlan } = usePaymentStore();
  const { gasEnabled, toggleGasDepartment } = useGasStore();
  const [gasToggling, setGasToggling] = useState(false);
  const isEnterprise = currentPlan?.plan?.startsWith("enterprise");
  const isSuperManager = userData?.isSuperManager === true;
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userString = localStorage.getItem("user");
        
        if (userString) {
          const user = JSON.parse(userString);
          if (user?.role) {
            const role = user.role.toLowerCase().trim();
            setUserRole(role);
            setUserData(user);
          } else {
            router.push("/login");
          }
        } else {
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

  useEffect(() => {
    if (userRole === "manager") {
      fetchCurrentPlan();
    }
  }, [userRole]);

  // Close drawer on route change (mobile)
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (isVisible) toggleSidebar();
    }
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isVisible) toggleSidebar(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isVisible, toggleSidebar]);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Collapsible Accounting section — persisted, auto-expands on accounting routes
  const [accountingOpen, setAccountingOpen] = useState(true);
  useEffect(() => {
    if (pathname?.startsWith("/dashboard/accounting")) {
      setAccountingOpen(true);
      return;
    }
    const saved = localStorage.getItem("sidebar:accountingOpen");
    if (saved !== null) setAccountingOpen(saved === "true");
  }, []);

  const toggleAccounting = () => {
    setAccountingOpen((prev) => {
      localStorage.setItem("sidebar:accountingOpen", String(!prev));
      return !prev;
    });
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // ── Department scoping (cashiers and attendants only) ─────────────────────
  // A station can run fuel and gas with different people on each. Floor staff
  // see only the side they are assigned to; "both" sees everything. Managers,
  // owners, supervisors and accountants are not tied to a department.
  const staffDept = (userData?.department || "fuel").toLowerCase();
  const isFloorStaff = ["cashier", "attendant"].includes(
    (userData?.role || "").toLowerCase()
  );
  const gasOnlyStaff = isFloorStaff && staffDept === "gas";

  // Links every staff member keeps regardless of department — the entry point
  // and anything that is about them rather than about a product line.
  const DEPARTMENT_NEUTRAL_LINKS = ["dashboard", "gas-divider"];

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
      },
      Admin: {
        name: "Admin",
        level: 6,
        color: "bg-red-500",
      },
    };

    const info = roleMap[role] || {
      name: "Unknown",
      level: 0,
      color: "bg-gray-500",
    };

    // The station OWNER and a hired manager both have role "manager" — every
    // permission check depends on that — so the owner has to be distinguished
    // by LABEL, not by role, or they show up as just another manager.
    // Uses the server's displayRole, falling back to isOwner. Never
    // isSuperManager: sessions issued before this change set it true for every
    // manager, which would label hired managers "Owner".
    if (role === "manager" && (userData?.displayRole === "Owner" || userData?.isOwner)) {
      return { ...info, name: "Owner", level: 5, color: "bg-amber-500" };
    }

    return info;
  };

  // Salary sub-links (accountant)
  const salarySubLinks = [
    {
      id: "salary-structure",
      name: "Salary Structure",
      icon: <ClipboardList size={20} />,
      link: "/dashboard/accountant/salaryStructure",
    },
    {
      id: "salary-history",
      name: "Salary History",
      icon: <History size={20} />,
      link: "/dashboard/accountant/salaryHistory",
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
    // Gas-only cashiers and attendants land on their gas screen. The fuel
    // dashboard is blocked for them server-side, so pointing them at it would
    // just be a link to a 403.
    link: gasOnlyStaff
      ? (role === "cashier" ? "/dashboard/gas/cashier" : "/dashboard/gas/shifts")
      : `/dashboard/${role}`,
    roles: ["cashier", "attendant", "accountant", "supervisor", "manager","admin"],
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
    {
      id: "procurement-view",
      name: "View Procurement",
      icon: <Package size={20} />,
      link: "/dashboard/procurement-view",
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
      id: "stock-reconciliation",
      name: "Stock Reconciliation",
      icon: <Scale size={20} />,
      link: "/dashboard/stockReconciliation",
      roles: ["manager", "supervisor"],
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
    {
      id: "supervisor-procurement",
      name: "Procure Lubricants",
      icon: <Package size={20} />,
      link: "/dashboard/procurement",
      roles: ["supervisor"],
    },
    // Accountant links
    {
      id: "commissions",
      name: "Commissions",
      icon: <FaHandHoldingUsd size={20} />,
      roles: ["accountant"],
      isDropdown: true,
      subLinks: commissionsSubLinks,
    },
    {
      id: "salary",
      name: "Salary",
      icon: <Banknote size={20} />,
      roles: ["accountant"],
      isDropdown: true,
      subLinks: salarySubLinks,
    },
    {
      id: "fixed-assets",
      name: "Fixed Assets",
      icon: <Building2 size={20} />,
      roles: ["accountant"],
      link: "/dashboard/accountant/fixedAssets",
    },
    {
      id: "financial-entries",
      name: "Liabilities & Equity",
      icon: <BookOpen size={20} />,
      roles: ["accountant"],
      link: "/dashboard/accountant/financialEntries",
    },
    {
      id: "trends",
      name: "Trends",
      icon: <TfiBoltAlt size={20} />,
      roles: ["accountant"],
      link: "/dashboard/trends",
    },
    // ── Accounting Suite (accountant + manager oversight) ─────────────────────
    {
      id: "accounting-divider",
      isDivider: true,
      label: "📒 Accounting",
      roles: ["accountant", "manager"],
    },
    {
      id: "accounting-home",
      name: "Accounting Overview",
      icon: <HiOutlineChartBar size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting",
      roles: ["accountant", "manager"],
      section: "accounting",
    },
    {
      // The owner's half of maker-checker. A journal above the approval
      // threshold, or any supplier payment batch, cannot be released by the
      // person who raised it — in a one-accountant station the owner is the
      // only other authoriser, so without this link nothing could ever post.
      id: "accounting-approvals",
      name: "Approvals",
      icon: <ShieldCheck size={20} className="text-amber-500" />,
      link: "/dashboard/accounting/journals",
      roles: ["manager"],
      ownerOnly: true,
      section: "accounting",
    },
    {
      id: "accounting-coa",
      name: "Chart of Accounts",
      icon: <BookOpen size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/chart-of-accounts",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "accounting-journals",
      name: "Journal Entries",
      icon: <IoDocumentText size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/journals",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "accounting-payables",
      name: "Payables (AP)",
      icon: <Package size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/payables",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "accounting-receivables",
      name: "Receivables (AR)",
      icon: <Landmark size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/receivables",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "accounting-bankrec",
      name: "Bank Reconciliation",
      icon: <ShieldCheck size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/bank-reconciliation",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "accounting-tax",
      name: "Tax Engine",
      icon: <GiTakeMyMoney size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/tax",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "accounting-periods",
      name: "Period Close",
      icon: <History size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/periods",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "accounting-reports",
      name: "Financial Reports",
      icon: <BarChart2 size={20} className="text-indigo-500" />,
      link: "/dashboard/accounting/reports",
      roles: ["accountant"],
      section: "accounting",
    },
    {
      id: "supplier-payments",
      name: "Supplier Payments",
      icon: <Banknote size={20} />,
      roles: ["accountant"],
      link: "/dashboard/procurement",
      section: "accounting",
    },
    // Manager links
    {
      id: "fuel-management",
      name: "Product Management",
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
    {
      id: "analytics",
      name: "Analytics",
      icon: <BarChart2 size={18} />,
      link: "/dashboard/analytics",
      roles: ["manager"],
    },
    {
      id: "procurement",
      name: "Procure Lubricants",
      icon: <Package size={20} />,
      link: "/dashboard/procurement",
      roles: ["manager"],
    },
    {
      id: "salary-validation",
      name: "Salary Validation",
      icon: <ShieldCheck size={20} />,
      link: "/dashboard/manager/salaryValidation",
      roles: ["manager"],
    },
    // ── Fuel Loyalty links ────────────────────────────────────────────────────
    {
      id: "fuel-loyalty-divider",
      isDivider: true,
      label: "Fuel Loyalty",
      roles: ["cashier", "attendant", "manager", "admin"],
    },
    {
      id: "fuel-loyalty",
      name: "Loyalty Program",
      icon: <BsFillFuelPumpFill size={18} className="text-blue-500" />,
      link: "/dashboard/loyalty",
      roles: ["manager", "admin"],
    },
    {
      id: "fuel-loyalty-customers",
      name: "Loyalty Customers",
      icon: <MdOutlinePeopleAlt size={18} className="text-blue-500" />,
      link: "/dashboard/loyalty/customers",
      roles: ["cashier", "attendant"],
    },
    // ── Gas Department links (all gas-designated roles) ──────────────────────
    {
      id: "gas-divider",
      isDivider: true,
      label: "🔥 Gas Department",
      roles: ["cashier", "attendant", "accountant", "manager", "admin"],
    },
    {
      id: "gas-pos",
      name: "Point of Sale",
      icon: <FaFire size={18} className="text-orange-500" />,
      link: "/dashboard/gas/cashier",
      roles: ["cashier"],
    },
    {
      id: "gas-shifts",
      name: "Gas Shifts",
      icon: <CircleFadingArrowUp size={20} className="text-orange-500" />,
      link: "/dashboard/gas/shifts",
      roles: ["attendant"],
    },
    {
      id: "gas-analytics-acct",
      name: "Gas Revenue",
      icon: <TrendingUp size={20} className="text-orange-500" />,
      link: "/dashboard/gas/analytics",
      roles: ["accountant"],
    },
    {
      id: "gas-reconciliation",
      name: "Gas Reconciliation",
      icon: <ShieldCheck size={20} className="text-orange-500" />,
      link: "/dashboard/gas/reconciliation",
      roles: ["accountant", "attendant", "cashier"],
    },
    {
      id: "gas-analytics-mgr",
      name: "Gas Analytics",
      icon: <BarChart2 size={20} className="text-orange-500" />,
      link: "/dashboard/gas/analytics",
      roles: ["manager", "admin"],
    },
    {
      id: "gas-procurement",
      name: "Gas Procurement",
      icon: <Package size={20} className="text-orange-500" />,
      link: "/dashboard/gas/procurement",
      roles: ["manager", "admin"],
    },
    {
      id: "gas-inventory",
      name: "Gas Inventory",
      icon: <Banknote size={20} className="text-orange-500" />,
      link: "/dashboard/gas/inventory",
      roles: ["manager", "admin"],
    },
    {
      id: "gas-cylinders",
      name: "Gas Cylinders",
      icon: <Package size={20} className="text-orange-500" />,
      link: "/dashboard/gas/cylinders",
      roles: ["manager", "admin"],
    },
    {
      id: "gas-customers",
      name: "Loyalty Customers",
      icon: <MdOutlinePeopleAlt size={20} className="text-orange-500" />,
      link: "/dashboard/gas/customers",
      roles: ["manager", "admin", "cashier"],
    },
    // ── Admin links ──────────────────────────────────────────────────────────
    //Admin links
    {
      id: "Stations",
      name: "Stations",
      icon: <MdOutlinePeopleAlt size={24} />,
      link: "/dashboard/stations",
      roles: ["admin"],
    },
    {
      id: "Subscriptions",
      name: "Subscriptions",
      icon: <MdOutlinePeopleAlt size={24} />,
      link: "/dashboard/Subscriptions",
      roles: ["admin"],
    },
    {
      id: "Payments & Billing",
      name: "Payments & Billing",
      icon: <MdOutlinePeopleAlt size={24} />,
      link: "/dashboard/Payments & Billing",
      roles: ["admin"],
    },
    {
      id: "Activity Log",
      name: "Activity Log",
      icon: <MdOutlinePeopleAlt size={24} />,
      link: "/dashboard/Activity Log",
      roles: ["admin"],
    },
    {
      id: "Settings",
      name: "settings",
      icon: <MdOutlinePeopleAlt size={24} />,
      link: "/dashboard/settings",
      roles: ["admin"],
    },
  ];

  const getVisibleLinks = (role) => {
  if (!role) return [];

  const normalizedRole = role.toLowerCase().trim();
  const links = allLinks(normalizedRole);
  const dept = (userData?.department || "fuel").toLowerCase();

  // The owner and a hired manager share role "manager", so `roles` alone cannot
  // express "the owner only". Same signal the role badge uses.
  const isOwnerUser = userData?.displayRole === "Owner" || userData?.isOwner === true;

  return links.filter((link) => {
    if (!Array.isArray(link.roles)) return false;
    if (!link.roles.includes(normalizedRole)) return false;
    if (link.ownerOnly && !isOwnerUser) return false;

    // Cashiers and attendants see ONLY their own department.
    //
    // This used to hide gas links from fuel staff but not the reverse, so a gas
    // cashier still saw every fuel and lubricant screen. The server now blocks
    // cross-department access outright, so showing those links would just hand
    // someone a menu of 403s — and the point of the split is that each person
    // sees what they work on and nothing else.
    if (["attendant", "cashier"].includes(normalizedRole)) {
      const isGasLink = link.id?.startsWith("gas-");
      if (dept === "fuel" && isGasLink) return false;
      if (dept === "gas" && !isGasLink && !DEPARTMENT_NEUTRAL_LINKS.includes(link.id)) return false;
      // "both" sees everything — the small station where one person covers all.
    }

    if (gasEnabled === false && link.id?.startsWith("gas-")) {
      // Keep the divider visible for managers so they can use the toggle button
      if (link.id === "gas-divider" && ["manager", "admin"].includes(normalizedRole)) return true;
      return false;
    }
    return true;
  });
};

const visibleLinks = getVisibleLinks(userRole);
  const roleInfo = getRoleInfo(userRole);

  const fullName = userData?.firstName && userData?.lastName 
  ? `${userData.firstName} ${userData.lastName}` 
  : userData?.firstName || userData?.lastName || "User";

  if (isLoading) {
    return (
      <div className=" z-30 md:w-[280px] h-[100vh] top-0 left-0 bg-white dark:bg-gray-900 shadow-md flex items-center justify-center">
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
  className={`w-[280px] lg:flex lg:relative h-[100vh] top-0 left-0 bg-white dark:bg-gray-900 shadow-md transform transition-transform duration-500 ease-in-out ${
    isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
  } lg:translate-x-0 lg:opacity-100 fixed z-50 lg:transition-none flex flex-col`}
>

      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-start pt-2 px-2">
        {/* Logo + station name stacked */}
        <div className="flex flex-col gap-1">
          <div className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-100 shadow-sm flex items-center justify-center max-w-[140px]">
            {userData?.station?.logoUrl || userData?.station?.logo ? (
              <img
                src={userData.station.logoUrl || userData.station.logo}
                alt="station logo"
                className="h-9 w-auto object-contain max-w-[120px]"
              />
            ) : (
              <Image src={logo} width={120} height={36} alt="logo image" className="h-9 w-auto object-contain" />
            )}
          </div>
          {userData?.station?.name && (
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[140px] px-0.5">
              {userData.station.name}
            </p>
          )}
        </div>
        <div className="w-full flex justify-end px-4 pt-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="cursor-pointer text-white font-semibold text-md border bg-[#1a71f6] p-2 rounded-md"
          >
            <X size={26} />
          </button>
        </div>
      </div>

      {/* Mobile-only user profile card */}
      {!isLoading && userData && (
        <div className="lg:hidden mx-4 mt-3 mb-1 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <ProfileAvatar
            userId={userData?._id || userData?.id || userData?.employeeId}
            username={fullName}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{roleInfo?.name}</p>
          </div>
        </div>
      )}

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
              {visibleLinks
                .filter((link) => !(link.section === "accounting" && !accountingOpen))
                .map((link) => (
                <div key={link.id}>
                  {link.isDivider ? (
                    <div className="pt-3 pb-1 px-2">
                      <div
                        className={`flex items-center justify-between ${
                          link.id === "accounting-divider" ? "cursor-pointer select-none group" : ""
                        }`}
                        onClick={link.id === "accounting-divider" ? toggleAccounting : undefined}
                        role={link.id === "accounting-divider" ? "button" : undefined}
                        aria-expanded={link.id === "accounting-divider" ? accountingOpen : undefined}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">{link.label}</p>
                        {link.id === "accounting-divider" && (
                          <span className="text-orange-400 group-hover:text-orange-500 transition-colors">
                            {accountingOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                        {/* Gas department toggle — manager/admin only */}
                        {link.id === "gas-divider" && ["manager", "admin"].includes(userRole) && (
                          <button
                            onClick={async () => {
                              setGasToggling(true);
                              await toggleGasDepartment();
                              setGasToggling(false);
                            }}
                            disabled={gasToggling}
                            title={gasEnabled === false ? "Enable Gas Department" : "Disable Gas Department"}
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                              gasEnabled === false
                                ? "bg-orange-100 border-orange-300 text-orange-600 hover:bg-orange-200"
                                : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-500"
                            } disabled:opacity-50`}
                          >
                            {gasToggling ? (
                              <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                            ) : gasEnabled === false ? (
                              "Enable"
                            ) : (
                              "Disable"
                            )}
                          </button>
                        )}
                      </div>
                      <div className="mt-1 h-px bg-orange-100" />
                      {/* Disabled state indicator under the divider */}
                      {link.id === "gas-divider" && gasEnabled === false && (
                        <p className="text-[10px] text-red-400 font-semibold mt-1">
                          ⊘ Gas department is currently OFF
                        </p>
                      )}
                    </div>
                  ) : link.isDropdown ? (
                    <>
                      <div
                        onClick={() => toggleDropdown(link.id)}
                        className={`flex cursor-pointer items-center justify-between gap-3 ${
                          isActive(pathname, link)
                            ? "bg-[#ff9d29] text-white"
                            : "bg-transparent text-[#888] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#666] dark:hover:text-gray-300"
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
                                  : "bg-transparent text-[#888] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#666] dark:hover:text-gray-300"
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
                          : "bg-transparent text-[#888] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#666] dark:hover:text-gray-300"
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

          {/* Enterprise Section — super manager only */}
          {isEnterprise && isSuperManager && (
            <div className="mt-4 mb-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-3 mb-2">
                Enterprise
              </p>
              <button
                onClick={() => router.push("/dashboard/branches")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Network size={18} className="text-purple-600" />
                Branch Overview
              </button>
              <button
                onClick={() => router.push("/dashboard/consolidated-payroll")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Banknote size={18} className="text-purple-600" />
                Consolidated Payroll
              </button>
              <button
                onClick={() => setShowAddBranch(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Plus size={18} className="text-purple-600" />
                Add Branch
              </button>
            </div>
          )}

          {/* Tools */}
          <p className="mb-4 text-xs font-semibold">TOOLS</p>
          <div className="links text-sm space-y-1">
            <Link
              href="/dashboard/help"
              className={`flex items-center gap-3 rounded-[12px] px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${
                pathname === "/dashboard/help" ? "bg-[#ff9d29] text-white" : ""
              }`}
            >
              <CircleQuestionMark size={18} />
              <span>Help & Support</span>
            </Link>
            <div className="flex items-center justify-between gap-2 rounded-[12px] px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              <div className="flex gap-3 items-center cursor-pointer">
                <Moon size={18} />
                <span>Dark Mode</span>
              </div>
              {!mounted ? (
                <span className="w-[30px] h-[30px] block" />
              ) : theme === "dark" ? (
                <PiToggleRightFill
                  size={30}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setTheme("light")}
                />
              ) : (
                <PiToggleLeftFill
                  size={30}
                  className="text-[#d0d5dd] cursor-pointer hover:text-[#b0b5bd]"
                  onClick={() => setTheme("dark")}
                />
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 absolute bottom-4 left-4 right-4 p-3 rounded-[12px] border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ProfileAvatar
              userId={userData?._id || userData?.id || userData?.employeeId}
              username={fullName}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">{fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{roleInfo?.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-red-500 rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut size={28} className="cursor-pointer" />
          </button>
        </div>
      </div>

      {showAddBranch && (
        <AddBranchModal onClose={() => setShowAddBranch(false)} />
      )}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
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
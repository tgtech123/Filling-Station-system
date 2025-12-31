// src/app/dashboard/supervisor/supervisorData.js
import { FaGasPump } from "react-icons/fa";
import { TrendingUp } from "lucide-react";
import { LuAlarmClock } from "react-icons/lu";
import Image from "next/image";

/**
 * Maps dashboard API response to stat cards data structure
 * @param {Object} dashboard - Dashboard data from API
 * @returns {Array} Array of stat card objects with icons and formatting
 */
export const supervisorData = (dashboard) => {
  if (!dashboard) {
    // Return default structure if no data
    return [
      {
        title: "Shifts Open",
        date: "Today",
        amount: "0/0",
        changeText: "0 Not yet submitted",
        icon: (
          <Image
            src="/work-flow.png"
            alt="work-flow image"
            width={24}
            height={24}
            className="max-w-[1.5rem] max-h-[1.5rem]"
          />
        ),
      },
      {
        title: "Pending Approvals",
        date: "This month",
        amount: "0",
        change: "",
        changeText: "0 Staffs inactive",
        icon: <LuAlarmClock size={25} className="text-neutral-800 text-lg" />,
      },
      {
        title: "Active Pumps",
        date: "Today",
        amount: "0/0",
        change: "",
        changeText: "0 Under maintenance",
        icon: <FaGasPump size={25} className="text-neutral-800 text-lg" />,
      },
      {
        title: "Available Stocks",
        date: "Fuel 0Litrs  |  Lubricant 0",
        amount: "₦0",
        change: "",
        changeText: "Stock value",
        icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
      },
    ];
  }

  const {
    shiftsOpen = {},
    pendingApprovals = {},
    activePumps = {},
    availableStocks = {},
  } = dashboard;

  return [
    {
      title: "Shifts Open",
      date: "Today",
      amount: `${shiftsOpen.active || 0}/${shiftsOpen.total || 0}`,
      changeText: `${pendingApprovals.notYetSubmitted || 0} Not yet submitted`,
      icon: (
        <Image
          src="/work-flow.png"
          alt="work-flow image"
          width={24}
          height={24}
          className="max-w-[1.5rem] max-h-[1.5rem]"
        />
      ),
    },
    {
      title: "Pending Approvals",
      date: "This month",
      amount: String(pendingApprovals.total || 0),
      change: "",
      changeText: `${shiftsOpen.inactive || 0} Staffs inactive`,
      icon: <LuAlarmClock size={25} className="text-neutral-800 text-lg" />,
    },
    {
      title: "Active Pumps",
      date: "Today",
      amount: `${activePumps.active || 0}/${activePumps.total || 0}`,
      change: "",
      changeText: `${activePumps.maintenance || 0} Under maintenance`,
      icon: <FaGasPump size={25} className="text-neutral-800 text-lg" />,
    },
    {
      title: "Available Stocks",
      date: `Fuel ${availableStocks.fuelLitres?.toLocaleString() || 0}Litrs  |  Lubricant ${availableStocks.lubricantBottles || 0}`,
      amount: `₦${availableStocks.stockValue?.toLocaleString() || 0}`,
      change: "",
      changeText: "Stock value",
      icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
    },
  ];
};
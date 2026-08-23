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
    return [
      {
        title: "Shifts Open",
        date: "Today",
        amount: "No data yet",
        changeText: "—",
        icon: (
          <Image src="/work-flow.png" alt="work-flow image" width={24} height={24} className="max-w-[1.5rem] max-h-[1.5rem]" />
        ),
      },
      {
        title: "Pending Approvals",
        date: "This month",
        amount: "No data yet",
        change: "",
        changeText: "—",
        icon: <LuAlarmClock size={25} className="text-neutral-800 text-lg" />,
      },
      {
        title: "Active Pumps",
        date: "Today",
        amount: "No data yet",
        change: "",
        changeText: "—",
        icon: <FaGasPump size={25} className="text-neutral-800 text-lg" />,
      },
      {
        title: "Available Stocks",
        date: "—",
        amount: "No data yet",
        change: "",
        changeText: "—",
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
      date: `Lubricant ${availableStocks.lubricantBottles || 0} bottles`,
      // What is on the forecourt, not what it is worth. Valuing the stock is an
      // accounting question and it is answered on accounting screens.
      amount: `${availableStocks.fuelLitres?.toLocaleString() || 0} L`,
      change: "",
      changeText: "Fuel in tanks",
      icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
    },
  ];
};
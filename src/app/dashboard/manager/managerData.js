 import { Cpu, TrendingUp, Wrench } from "lucide-react";
import { BiSolidGasPump } from "react-icons/bi";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaFire } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
 import { LuUsers } from "react-icons/lu";
import { RiOilLine } from "react-icons/ri";
 import { TbCurrencyNaira } from "react-icons/tb";
 
 export const quickStat = [
    {
      id: 1,
      name: "Revenue Generated",
      icon: <TbCurrencyNaira />,
      period: "Today",
      number: "₦250,000",
    },
    {
      id: 2,
      name: "Active Staff",
      icon: <LuUsers />,
      period: "Available for work",
      number: "6/8",
    },
    {
      id: 3,
      name: "Active Pump",
      icon: <BiSolidGasPump />,
      period: "3 under maintenance",
      number: "6/11",
    },
    {
      id: 4,
      name: "Fuel Dispensed Today",
      icon: <BiSolidGasPump />,
      period: "Across all fuel types",
      number: "59649 Litres",
    },
  ];

  export const reportType = [
    {
        id: 1,
        title: "Fuel Management",
        icon: <FaFire size={24} />,
        desc: "Monitor fuel levels, update stocks and manage inventory",
        action: "Manage Inventory",
        link: "/dashboard/fuelManagement"
    },
    {
        id: 2,
        title: "Sales and Cash Report",
        icon: <TbCurrencyNaira size={24} />,
        desc: "View daily sales and cash analytics",
        action: "View Report",
        link: "/dashboard/sales-and-cash-report"
    },
    {
        id: 3,
        title: "Staff Management",
        icon: <LuUsers size={23} />,
        desc: "Manage your team members and their information",
        action: "Manage Staff",
        link: "/dashboard/staffManagement"
    },
    {
        id: 4,
        title: "Pump Control",
        icon: <BsFuelPumpFill size={21} />,
        desc: "Monitor pump status, prices and maintenance",
        action: "Control Pumps",
        link: "/dashboard/pumpControl"
    },
    {
        id: 5,
        title: "Lubricant Management",
        icon: <RiOilLine size={23} />,
        desc: "Manage lubricant inventory and track sales record",
        action: "Manage Inventory",
        link: "/dashboard/lubricantManagement"
    },
    {
        id: 6,
        title: "Financial Overview",
        icon: <TrendingUp size={23} />,
        desc: "Track revenue, expenses & profit margins",
        action: "View Expenses",
        link: "/dashboard/financial-overview"
    },
    {
        id: 7,
        title: "Activity Logs",
        icon: <Cpu size={23} />,
        desc: "Monitor and export system activity logs",
        action: "Manage Logs",
        link: "/dashboard/activity-logs"
    },
    {
        id: 8,
        title: "Export Reports",
        icon: <IoDocumentText size={23} />,
        desc: "Generate and export comprehensive station reports",
        action: "Generate Reports",
        link: "/dashboard/exportReport"
    },
    {
        id: 9,
        title: "System Settings",
        icon: <Wrench size={23} />,
        desc: "Configure prices, user and system preferences",
        action: "Open Settings",
        link: "/dashboard/system-settings"
    },
]

export const recentActivityData = [
  {
    id: 1,
    activity: "Inventory Alert",
    description: "Diesel below 20%",
    category: "alert",
    time: "Just now"
  },
  {
    id: 2,
    activity: "Morning shift sales completed - Pump 5",
    description: "Diesel - 453 Ltrs sold",
    category: "shiftComplete",
    time: "2 mins ago"
  },
  {
    id: 3,
    activity: "Maintenance scheduled",
    description: "Pump 2 - Routine service",
    category: "maintenance",
    time: "5 mins ago"
  },
  {
    id: 4,
    activity: "Stock Added",
    description: "Engine oil (1L) - 45 units added to stock",
    category: "newStock",
    time: "1 hour ago"
  },
  {
    id: 5,
    activity: "Unauthorized access alert",
    description: "Access trial from IP-2324434 address",
    category: "alert",
    time: "1 hour ago"
  },
   {
    id: 6,
    activity: "Morning shift sales completed - Pump 5",
    description: "Diesel - 453 Ltrs sold",
    category: "shiftComplete",
    time: "2 mins ago"
  },
  {
    id: 7,
    activity: "Stock Added",
    description: "Engine oil (1L) - 45 units added to stock",
    category: "newStock",
    time: "1 hour ago"
  },
]

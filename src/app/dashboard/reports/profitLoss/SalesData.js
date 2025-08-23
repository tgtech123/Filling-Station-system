// src/app/dashboard/reports/profitLoss/SalesData.js
import { FaGasPump, FaOilCan } from "react-icons/fa";
import { AiOutlineRise } from "react-icons/ai";
import { Droplets } from 'lucide-react'
import { GiSplitArrows } from "react-icons/gi";
import { HiTrendingDown } from "react-icons/hi";


export const salesData = [
  {
    title: "Total Revenue Generated",
    date: "Last Quarter",
    amount: "₦81,000",
    change: "+12%",
    changeText: "from yesterday",
    icon: "₦", // plain text symbol
  },
  {
    title: "Total Fuel Sales",
    date: "Last Quarter",
    amount: "₦22,000",
    change: "1.5%",
    changeText: "from last week",
    trend: <HiTrendingDown size={20} />,
    icon: <GiSplitArrows  className="text-neutral-800 text-lg" />,
  }, 
];

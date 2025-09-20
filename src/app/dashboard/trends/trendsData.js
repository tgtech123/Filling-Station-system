// src/app/dashboard/reports/profitLoss/SalesData.js
import { GoPeople } from "react-icons/go";
import { Users, TrendingUp } from "lucide-react"
import { TbCurrencyNaira, TbTargetArrow, TbChartBarPopular   } from "react-icons/tb";
import { FiPieChart } from "react-icons/fi";
import Image from "next/image";

export const trendsData = [
  {
    title: "Today Revenue",
    date: "This month",
    amount: "N81,000",
    change: "1.5%",
    changeText: "From last month",
    trend:  <TrendingUp size={20}/>,
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Fuel Sales Volume",
    date: "This month",
    amount: "22,424L",
    change: "0.5%",
    changeText: "From last month",
    trend: <TrendingUp size={20}/>,
    icon: <TbChartBarPopular size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Today Revenue",
    date: "This month",
    amount: "N81,000",
    change: "1.4%",
    changeText: "From last month",
    trend:  <TrendingUp size={20}/>,
    icon: <Users size={25} className="text-neutral-800 text-lg"/> ,
  },
  {
    title: "Average Transaction",
    date: "This month",
    amount: "N1,500",
    change: "1.5%",
    changeText: "From last month",
    trend: <TrendingUp size={20}/>,
    icon: <TrendingUp  size={25} className="text-neutral-800 text-lg" />,
  },
  
];

// src/app/dashboard/reports/profitLoss/SalesData.js
import { FaGasPump, FaOilCan } from "react-icons/fa";
import { AiOutlineRise } from "react-icons/ai";
import { Droplets } from 'lucide-react'
import { MdOutlineShoppingBag } from "react-icons/md";

export const salesData = [
  {
    title: "Total Revenue Generated",
    date: "June, 2025",
    amount: "₦81,000",
    change: "+12%",
    changeText: "from yesterday",
    icon: "₦", // plain text symbol
  },
  {
    title: "Total Fuel Sales",
    date: "June, 2025",
    amount: "₦22,000",
    change: "1.5%",
    changeText: "from last week",
    icon: <Droplets className="text-neutral-800 text-lg" />,
  },
  {
    title: "Total Lubricant Sales",
    date: "June, 2025",
    amount: "₦324,000",
    change: "1.5%",
    changeText: "from last month",
    icon: <FaOilCan className="text-neutral-800 text-lg" />,
  },
  {
    title: "Other Sales",
    
    amount: "₦12,000",
   
    icon: <AiOutlineRise className="text-neutral-800 text-lg" />,
  },
  
];

// src/app/dashboard/reports/profitLoss/SalesData.js
import { GoPeople } from "react-icons/go";
import { GiSplitArrows } from "react-icons/gi";
import { HiOutlineBriefcase } from "react-icons/hi2";
import { FaHandHoldingWater } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";


export const salesData = [
  {
    title: "Total Expenses",
    amount: "8",
    icon: <GoPeople  className="text-neutral-800 text-lg" />,
  },
  {
    title: "On Duty",
    date: "Today",
    amount: "6",
    icon: <HiOutlineBriefcase  className="text-neutral-800 text-lg" />,
  }, 
  {
    title: "Total Expenses",
    
    amount: "₦150,000",
    icon: <FaHandHoldingWater  className="text-neutral-800 text-lg" />,
  }, 
  {
    title: "Total Expenses",
    
    amount: "98.8%",
    icon: <TbTargetArrow  className="text-neutral-800 text-lg" />,
  }, 
];
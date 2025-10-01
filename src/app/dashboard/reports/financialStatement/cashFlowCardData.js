// src/app/dashboard/reports/profitLoss/SalesData.js
import {  TrendingDown, TrendingUp } from "lucide-react"
import { TbCurrencyNaira } from "react-icons/tb";


export const cashFlowCardData = [
  {
    title: "Total Inflow",
    date: "Today",
    amount: "₦240,000",
    change: "1.5%",
    changeText: "This month",
    trend: <TrendingUp size={20}/>,
    icon: <TbCurrencyNaira  className="text-neutral-800 text-lg" />,
  },
  {
     title: "Total Inflow",
    date: "Today",
    amount: "₦100,000",
    change: "1.5%",
    changeText: "This month",
    trend:  <TrendingDown size={20} className="text-red-600"/>,
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  }, 
  {
    title: "Net Cashflow",
    date: "This month",
    amount: "₦140,000",
    change: "1.5%",
    changeText: "From last month",
    trend:  <TrendingUp size={20}/>,
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  }, 
  
];
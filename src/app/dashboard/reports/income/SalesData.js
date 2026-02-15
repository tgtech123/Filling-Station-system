// src/app/dashboard/reports/income/SalesData.js
import { FaOilCan } from "react-icons/fa";
import { AiOutlineRise } from "react-icons/ai";
import { Droplets } from 'lucide-react'

// Get current month/year
const getCurrentPeriod = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return "0";
  return Number(value).toLocaleString('en-US');
};

export const getSalesData = (incomeReport) => {
  if (!incomeReport?.summary) {
    return [
      {
        title: "Total Revenue Generated",
        date: getCurrentPeriod(),
        amount: "₦0",
        change: "+0%",
        changeText: "from yesterday",
        icon: "₦",
      },
      {
        title: "Total Fuel Sales",
        date: getCurrentPeriod(),
        amount: "₦0",
        change: "0%",
        changeText: "from last week",
        icon: <Droplets className="text-neutral-800 text-lg" />,
      },
      {
        title: "Total Lubricant Sales",
        date: getCurrentPeriod(),
        amount: "₦0",
        change: "0%",
        changeText: "from last month",
        icon: <FaOilCan className="text-neutral-800 text-lg" />,
      },
      {
        title: "Other Sales",
        amount: "₦0",
        icon: <AiOutlineRise className="text-neutral-800 text-lg" />,
      },
    ];
  }

  const { totalRevenueGenerated, totalFuelSales, totalLubricantSales, otherSales } = incomeReport.summary;

  const fuelPercentage = totalRevenueGenerated > 0 
    ? ((totalFuelSales / totalRevenueGenerated) * 100).toFixed(1) 
    : 0;
  
  const lubricantPercentage = totalRevenueGenerated > 0 
    ? ((totalLubricantSales / totalRevenueGenerated) * 100).toFixed(1) 
    : 0;

  return [
    {
      title: "Total Revenue Generated",
      date: getCurrentPeriod(),
      amount: `₦${formatCurrency(totalRevenueGenerated)}`,
      change: "+100%",
      changeText: "from yesterday",
      icon: "₦",
    },
    {
      title: "Total Fuel Sales",
      date: getCurrentPeriod(),
      amount: `₦${formatCurrency(totalFuelSales)}`,
      change: `${fuelPercentage}%`,
      changeText: "from last week",
      icon: <Droplets className="text-neutral-800 text-lg" />,
    },
    {
      title: "Total Lubricant Sales",
      date: getCurrentPeriod(),
      amount: `₦${formatCurrency(totalLubricantSales)}`,
      change: `${lubricantPercentage}%`,
      changeText: "from last month",
      icon: <FaOilCan className="text-neutral-800 text-lg" />,
    },
    {
      title: "Other Sales",
      amount: `₦${formatCurrency(otherSales)}`,
      icon: <AiOutlineRise className="text-neutral-800 text-lg" />,
    },
  ];
};




// // src/app/dashboard/reports/profitLoss/SalesData.js
// import { FaGasPump, FaOilCan } from "react-icons/fa";
// import { AiOutlineRise } from "react-icons/ai";
// import { Droplets } from 'lucide-react'
// import { MdOutlineShoppingBag } from "react-icons/md";

// export const salesData = [
//   {
//     title: "Total Revenue Generated",
//     date: "June, 2025",
//     amount: "₦81,000",
//     change: "+12%",
//     changeText: "from yesterday",
//     icon: "₦", // plain text symbol
//   },
//   {
//     title: "Total Fuel Sales",
//     date: "June, 2025",
//     amount: "₦22,000",
//     change: "1.5%",
//     changeText: "from last week",
//     icon: <Droplets className="text-neutral-800 text-lg" />,
//   },
//   {
//     title: "Total Lubricant Sales",
//     date: "June, 2025",
//     amount: "₦324,000",
//     change: "1.5%",
//     changeText: "from last month",
//     icon: <FaOilCan className="text-neutral-800 text-lg" />,
//   },
//   {
//     title: "Other Sales",
    
//     amount: "₦12,000",
   
//     icon: <AiOutlineRise className="text-neutral-800 text-lg" />,
//   },
  
// ];

// src/app/dashboard/reports/profitLoss/trendsData.js
import { GoPeople } from "react-icons/go";
import { Users, TrendingUp, TrendingDown } from "lucide-react"
import { TbCurrencyNaira, TbTargetArrow, TbChartBarPopular } from "react-icons/tb";
import { FiPieChart } from "react-icons/fi";

export const getTrendsData = (kpis) => {
  if (!kpis) {
    return [
      {
        title: "Total Revenue",
        date: "This month",
        amount: "₦0",
        change: "0%",
        changeText: "From last month",
        trend: <TrendingUp size={20}/>,
        icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
      },
      {
        title: "Fuel Sales Volume",
        date: "This month",
        amount: "0L",
        change: "0%",
        changeText: "From last month",
        trend: <TrendingUp size={20}/>,
        icon: <TbChartBarPopular size={25} className="text-neutral-800 text-lg" />,
      },
      {
        title: "Customer Transaction",
        date: "This month",
        amount: "0",
        change: "0%",
        changeText: "From last month",
        trend: <TrendingUp size={20}/>,
        icon: <Users size={25} className="text-neutral-800 text-lg"/> ,
      },
      {
        title: "Average Transaction",
        date: "This month",
        amount: "₦0",
        change: "0%",
        changeText: "From last month",
        trend: <TrendingUp size={20}/>,
        icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
      },
    ];
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "₦0";
    return `₦${Number(value).toLocaleString('en-US')}`;
  };

  const formatVolume = (value) => {
    if (!value && value !== 0) return "0L";
    return `${Number(value).toLocaleString('en-US')}L`;
  };

  const formatChange = (change) => {
    if (!change && change !== 0) return "0%";
    const absChange = Math.abs(change);
    return `${absChange.toFixed(1)}%`;
  };

  return [
    {
      title: "Total Revenue",
      date: "This month",
      amount: formatCurrency(kpis.totalRevenue?.value),
      change: formatChange(kpis.totalRevenue?.change),
      changeText: "From last month",
      trend: kpis.totalRevenue?.changeType === "increase" ? <TrendingUp size={20}/> : <TrendingDown size={20}/>,
      icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
    },
    {
      title: "Fuel Sales Volume",
      date: "This month",
      amount: formatVolume(kpis.fuelSalesVolume?.value),
      change: formatChange(kpis.fuelSalesVolume?.change),
      changeText: "From last month",
      trend: kpis.fuelSalesVolume?.changeType === "increase" ? <TrendingUp size={20}/> : <TrendingDown size={20}/>,
      icon: <TbChartBarPopular size={25} className="text-neutral-800 text-lg" />,
    },
    {
      title: "Customer Transaction",
      date: "This month",
      amount: kpis.customerTransaction?.value || 0,
      change: formatChange(kpis.customerTransaction?.change),
      changeText: "From last month",
      trend: kpis.customerTransaction?.changeType === "increase" ? <TrendingUp size={20}/> : <TrendingDown size={20}/>,
      icon: <Users size={25} className="text-neutral-800 text-lg"/> ,
    },
    {
      title: "Average Transaction",
      date: "This month",
      amount: formatCurrency(kpis.averageTransaction?.value),
      change: formatChange(kpis.averageTransaction?.change),
      changeText: "From last month",
      trend: kpis.averageTransaction?.changeType === "increase" ? <TrendingUp size={20}/> : <TrendingDown size={20}/>,
      icon: <TrendingUp size={25} className="text-neutral-800 text-lg" />,
    },
  ];
};


// // src/app/dashboard/reports/profitLoss/SalesData.js
// import { GoPeople } from "react-icons/go";
// import { Users, TrendingUp } from "lucide-react"
// import { TbCurrencyNaira, TbTargetArrow, TbChartBarPopular   } from "react-icons/tb";
// import { FiPieChart } from "react-icons/fi";
// import Image from "next/image";

// export const trendsData = [
//   {
//     title: "Today Revenue",
//     date: "This month",
//     amount: "N81,000",
//     change: "1.5%",
//     changeText: "From last month",
//     trend:  <TrendingUp size={20}/>,
//     icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
//   },
//   {
//     title: "Fuel Sales Volume",
//     date: "This month",
//     amount: "22,424L",
//     change: "0.5%",
//     changeText: "From last month",
//     trend: <TrendingUp size={20}/>,
//     icon: <TbChartBarPopular size={25} className="text-neutral-800 text-lg" />,
//   },
//   {
//     title: "Today Revenue",
//     date: "This month",
//     amount: "N81,000",
//     change: "1.4%",
//     changeText: "From last month",
//     trend:  <TrendingUp size={20}/>,
//     icon: <Users size={25} className="text-neutral-800 text-lg"/> ,
//   },
//   {
//     title: "Average Transaction",
//     date: "This month",
//     amount: "N1,500",
//     change: "1.5%",
//     changeText: "From last month",
//     trend: <TrendingUp size={20}/>,
//     icon: <TrendingUp  size={25} className="text-neutral-800 text-lg" />,
//   },
  
// ];

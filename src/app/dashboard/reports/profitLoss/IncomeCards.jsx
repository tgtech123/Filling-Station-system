"use client"
import React from 'react'
import MyStatCard from '@/components/MyStatCard'
import { TrendingUp } from "lucide-react";
import { GiSplitArrows } from "react-icons/gi";
import { HiTrendingDown } from "react-icons/hi";

const IncomeCards = ({ profitLossData, loading }) => {
  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0";
    return Number(value).toLocaleString('en-US');
  };

  // Prepare sales data from API
  const getSalesData = () => {
    if (!profitLossData?.summary) {
      return [
        {
          title: "Total Revenue Generated",
          date: "Last Quarter",
          amount: "₦0",
          change: "+0%",
          changeText: "from last quarter",
          icon: "₦",
        },
        {
          title: "Total Fuel Sales",
          date: "Last Quarter",
          amount: "₦0",
          change: "0%",
          changeText: "from last quarter",
          trend: <HiTrendingDown size={20} />,
          icon: <GiSplitArrows className="text-neutral-800 text-lg" />,
        },
      ];
    }

    const { totalRevenueGenerated, totalExpenses, profitLoss } = profitLossData.summary;
    
    // Calculate profit margin
    const profitMargin = totalRevenueGenerated > 0 
      ? ((profitLoss / totalRevenueGenerated) * 100).toFixed(1) 
      : 0;

    return [
      {
        title: "Total Revenue Generated",
        date: "Last Quarter",
        amount: `₦${formatCurrency(totalRevenueGenerated)}`,
        change: profitLoss >= 0 ? `+${Math.abs(profitMargin)}%` : `${profitMargin}%`,
        changeText: "from last quarter",
        icon: "₦",
      },
      {
        title: "Net Profit/Loss",
        date: "Last Quarter",
        amount: `₦${formatCurrency(Math.abs(profitLoss))}`,
        change: `${Math.abs(profitMargin)}%`,
        changeText: "from last quarter",
        trend: profitLoss >= 0 ? <TrendingUp size={20} /> : <HiTrendingDown size={20} />,
        icon: <GiSplitArrows className="text-neutral-800 text-lg" />,
      },
    ];
  };

  const salesData = getSalesData();

  // Loading skeleton
  if (loading && !profitLossData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {[1, 2].map((index) => (
          <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {salesData.map((item, index) => (
          <MyStatCard
            key={index}
            title={item.title}
            date={item.date}
            amount={item.amount}
            change={item.change}
            changeText={item.changeText}
            trend={item.trend}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default IncomeCards;
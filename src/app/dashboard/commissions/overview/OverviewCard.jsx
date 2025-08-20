
  'use client'
import React from 'react'
import { Users, AlertCircle, Wallet, TrendingUp } from "lucide-react";
import { FiAlertTriangle } from "react-icons/fi";
import { GiSplitArrows } from "react-icons/gi";
import StatCard from '@/components/StatCard';
import OverviewChart from './OverviewChart';
// import { color } from 'framer-motion';



const OverviewCard = () => {
  const stats = [
    {
      title: "Total Commission",
      subtitle: "This month",
      value: "₦81,000",
      icon: "₦",
      trend: -0.5,
      trendLabel: "From last month",
      color: "text-blue-600",
    },
    {
      title: "Active Staff",
      subtitle: "This week",
      value: "12/13",
      icon: <GiSplitArrows size={18} />,
      color: "text-blue-600",
    },
    {
      title: "Average Commission Rate",
      subtitle: "Of total sales",
      value: "4.5%",
      icon: <FiAlertTriangle size={22} />,
      color: "text-blue-600",
    },
    {
      title: "Pending Payments",
      subtitle: "3 Staff members",
      value: "₦12,000",
      icon: <TrendingUp size={18} />,
      color: "text-blue-600",
    },
  ];
  return (

    <div>
        <div className='bg-white w-full rounded-2xl p-6'>
              <div >
                <h1 className='text-neutral-800 font-semibold text-xl'>Overview</h1>
                <p className='text-neutral-800 text-md'>Overview of staff performance and commissions</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-8 gap-4">
                    {stats.map((item, index) => (

                      <StatCard
                      key={index}
                        title={item.title}
                        subtitle={item.subtitle}
                        value={item.value}
                        icon= {item.icon}
                        trend={item.trend}
                        trendLabel={item.trendLabel}
                        color={item.color}
                      />
                    ))}

                    
                  </div>
              </div>
        </div>
                  
        <div className='bg-white rounded-2xl mt-4 p-6'>
          <OverviewChart/>
        </div>
    </div>

  )
}

export default OverviewCard
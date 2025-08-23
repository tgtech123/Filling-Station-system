    'use client'
import React from 'react'
import MyStatCard from '@/components/MyStatCard'
import { salesData } from './SalesData'

const IncomeCards = () => {
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
                  changeText={item.changeText }
                  trend={item.trend}
                  icon={item.icon}
                />
                ))}
            </div>
    </div>
  )
}

export default IncomeCards
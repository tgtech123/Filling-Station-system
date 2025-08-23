import MyStatCard from '@/components/MyStatCard'
import React from 'react'
import { salesData } from './SalesData'

const ExpenseCards = () => {
  return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {salesData.map((item, index) =>
                <MyStatCard
                    key={index}
                    title={item.title}
                    date={item.date}
                    amount={item.amount}
                    icon={item.icon}
                />
            )}
        </div>
    </div>
  )
}

export default ExpenseCards
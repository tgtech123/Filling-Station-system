import React from 'react'
import MyStatCard from '@/components/MyStatCard'
import { salesData } from './staffData'
import SwitchButton from './SwitchButton'


const StaffManagement = () => {
  return (
    <div className='bg-neutral-100 mt-22 p-6'>
        <div className='p-4 bg-white rounded-xl w-full mt-3 shadow-md'>
            <h1 className='text-xl mb-2 font-bold text-neutral-700'>Staff Management</h1>
            <p className='text-md font-meidum text-neutral-700'>Manage staff schedules and responsibilities</p>
            
            <span className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {salesData.map((item, index) =>
                <MyStatCard
                    key={index}
                    title={item.title}
                    date={item.date}
                    amount={item.amount}
                    icon={item.icon}
                />  
            )}           
            </span>
        </div>

        <div className='mt-4'>
            {/* the switching button here */}
            <SwitchButton/>
        </div>
    </div>
  )
}

export default StaffManagement
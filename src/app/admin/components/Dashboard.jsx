import React from 'react'
import DashboardCard from './DashboardCard'
import NetworkGrowthChart from './NetworkGrowthChart'
import RecentActivitiesTable from './RecentActivitiesTable'

const Dashboard = () => {
  return (
    <div className='p-8 '>
        <h1 className='text-[28px] font-semibold leading-[100%] mb-[0.8rem] '>General Admin Dashboard</h1>
        <p className='text-[1.125rem] text-neutral-500 leading-[100%]'>
            Welcome back, here’s your system overview and key metrics
        </p>

        <DashboardCard />

        <div className='mt-[1.5rem]'>
            <NetworkGrowthChart />
        </div>

        <div className='mt-[1.5rem]'>
            <RecentActivitiesTable />
        </div>
    </div>
  )
}

export default Dashboard
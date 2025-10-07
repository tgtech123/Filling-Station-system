    "use client"
import TableWithoutBorder from '@/components/TableWithoutBorder'
import React, { useState } from 'react'
import liveSalesFeedData from './liveSalesFeedData'
import ScheduledAttendants from './ScheduledAttendant'
import ScheduledAttendantsCard from './ScheduledAttendantsCard'

const LiveSalesAndSchedulePage = () => {
    const [isLive, setIsLive] = useState(true)
  return (
    <div className='flex gap-5 mt-[0.75rem] overflow-x-hidden'>
        {/* Live Sales Feed side */}
        <div className='bg-white rounded-2xl p-4 max-w-[34.3125rem] w-full'>
                <div className='flex justify-between'>
                    <p className='flex flex-col'>
                        <span className='text-[1.375rem] text-neutral-800 font-semibold'>Live Sales Feed</span>
                        <span className='text-[1rem] text-neutral-800'>View all sales transactions by attendant</span>
                    </p>
                    
                   {/* the live feed section */}
                   <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center w-10 h-10">
                            <div
                            className={`absolute w-8 h-8 rounded-full ${
                                isLive ? "bg-green-400" : "bg-red-400"
                            } opacity-75 animate-ping`}
                            />
                            <div
                            className={`absolute w-5 h-5 rounded-full ${
                                isLive ? "bg-green-500" : "bg-red-500"
                            } opacity-50 animate-pulse`}
                            />
                            <div
                            className={`relative w-2 h-2 rounded-full ${
                                isLive ? "bg-green-600" : "bg-red-600"
                            }`}
                            />
                        </div>
                        <span className="text-sm font-bold text-green-700">Live</span>
                    </div>
                </div>
            <div className='mt-[0.75rem]'>
                <TableWithoutBorder columns={liveSalesFeedData.headers} data={liveSalesFeedData.bodyRows} />
            </div>
        </div>


        <div>
            <ScheduledAttendantsCard />
            {/* <ScheduledAttendants /> */}
        </div>
    </div>
  )
}

export default LiveSalesAndSchedulePage
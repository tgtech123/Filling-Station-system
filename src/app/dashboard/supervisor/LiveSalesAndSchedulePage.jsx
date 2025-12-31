//     "use client"
// import TableWithoutBorder from '@/components/TableWithoutBorder'
// import React, { useState } from 'react'
// import liveSalesFeedData from './liveSalesFeedData'
// import ScheduledAttendants from './ScheduledAttendant'
// import ScheduledAttendantsCard from './ScheduledAttendantsCard'

// const LiveSalesAndSchedulePage = () => {
//     const [isLive, setIsLive] = useState(true)
//   return (
//     <div className='flex gap-5 mt-[0.75rem] w-full items-center justify-center'>
//         {/* Live Sales Feed side */}
//         <div className='bg-white rounded-2xl flex-1 p-4 w-full'>
//                 <div className='flex justify-between'>
//                     <p className='flex flex-col'>
//                         <span className='text-[1.375rem] text-neutral-800 font-semibold'>Live Sales Feed</span>
//                         <span className='text-[1rem] text-neutral-800'>View all sales transactions by attendant</span>
//                     </p>
                    
//                    {/* the live feed section */}
//                    <div className="flex items-center gap-2">
//                         <div className="relative flex items-center justify-center w-10 h-10">
//                             <div
//                             className={`absolute w-8 h-8 rounded-full ${
//                                 isLive ? "bg-green-400" : "bg-red-400"
//                             } opacity-75 animate-ping`}
//                             />
//                             <div
//                             className={`absolute w-5 h-5 rounded-full ${
//                                 isLive ? "bg-green-500" : "bg-red-500"
//                             } opacity-50 animate-pulse`}
//                             />
//                             <div
//                             className={`relative w-2 h-2 rounded-full ${
//                                 isLive ? "bg-green-600" : "bg-red-600"
//                             }`}
//                             />
//                         </div>
//                         <span className="text-sm font-bold text-green-700">Live</span>
//                     </div>
//                 </div>
//             <div className='mt-[0.75rem]'>
//                 <TableWithoutBorder columns={liveSalesFeedData.headers} data={liveSalesFeedData.bodyRows} />
//             </div>
//         </div>


//         <div className='flex-1'>
//             <ScheduledAttendantsCard />
//             {/* <ScheduledAttendants /> */}
//         </div>
//     </div>
//   )
// }

// export default LiveSalesAndSchedulePage

"use client";
import TableWithoutBorder from '@/components/TableWithoutBorder';
import React, { useState, useEffect } from 'react';
import ScheduledAttendantsCard from './ScheduledAttendantsCard';
import useSupervisorStore from '@/store/useSupervisorStore';

const LiveSalesAndSchedulePage = () => {
  const [isLive, setIsLive] = useState(true);
  const { dashboard, loading, error, fetchDashboard } = useSupervisorStore();

  useEffect(() => {
    // Fetch dashboard data on mount
    fetchDashboard();

    // Set up auto-refresh every 30 seconds for live feed
    const interval = setInterval(() => {
      fetchDashboard();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // Transform live sales feed data for table
  const liveSalesFeedData = {
    headers: ["Pump No", "Price/Ltr", "Litres", "Amount", "Timestamp", "Attendant"],
    bodyRows: dashboard?.liveSalesFeed?.map((sale) => [
      sale.pumpNo || "N/A",
      `₦${sale.pricePerLtr?.toLocaleString() || 0}`,
      `${sale.litres?.toLocaleString() || 0}L`,
      `₦${sale.amount?.toLocaleString() || 0}`,
      new Date(sale.timestamp).toLocaleTimeString(),
      sale.attendant || "Unknown",
    ]) || [],
  };

  return (
    <div className='flex gap-5 mt-[0.75rem] w-full '>
      {/* Live Sales Feed side */}
      <div className='bg-white rounded-2xl flex-1 p-4 w-full'>
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
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading live sales...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Error: {error}</div>
          ) : liveSalesFeedData.bodyRows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No sales data available</div>
          ) : (
            <TableWithoutBorder 
              columns={liveSalesFeedData.headers} 
              data={liveSalesFeedData.bodyRows} 
            />
          )}
        </div>
      </div>

      <div className='flex-1'>
        <ScheduledAttendantsCard />
      </div>
    </div>
  );
};

export default LiveSalesAndSchedulePage;
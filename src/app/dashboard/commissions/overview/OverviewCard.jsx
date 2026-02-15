'use client'
import React, { useEffect } from 'react'
import { FiAlertTriangle } from "react-icons/fi";
import { GiSplitArrows } from "react-icons/gi";
import { TrendingUp } from "lucide-react";
import StatCard from '@/components/StatCard';
import OverviewChart from './OverviewChart';
import useCommissionStore from '@/store/useCommissionStore';

const OverviewCard = ({ duration = 'thismonth' }) => {
  const { overview, loading, errors, fetchOverview } = useCommissionStore();

  useEffect(() => {
    fetchOverview(duration);
  }, [fetchOverview, duration]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0";
    return Number(value).toLocaleString('en-US');
  };

  // Prepare stats from API data
  const getStats = () => {
    if (!overview?.kpis) {
      return [
        {
          title: "Total Commission",
          subtitle: "This month",
          value: "₦0",
          icon: "₦",
          trend: 0,
          trendLabel: "From last month",
          color: "text-blue-600",
        },
        {
          title: "Active Staff",
          subtitle: "This week",
          value: "0/0",
          icon: <GiSplitArrows size={18} />,
          color: "text-blue-600",
        },
        {
          title: "Average Commission Rate",
          subtitle: "Of total sales",
          value: "0%",
          icon: <FiAlertTriangle size={22} />,
          color: "text-blue-600",
        },
        {
          title: "Pending Payments",
          subtitle: "0 Staff members",
          value: "₦0",
          icon: <TrendingUp size={18} />,
          color: "text-blue-600",
        },
      ];
    }

    const { totalCommission, activeStaff, averageCommissionRate, pendingPayments } = overview.kpis;

    return [
      {
        title: "Total Commission",
        subtitle: "This month",
        value: `₦${formatCurrency(totalCommission.value)}`,
        icon: "₦",
        trend: totalCommission.change,
        trendLabel: "From last month",
        color: "text-blue-600",
      },
      {
        title: "Active Staff",
        subtitle: "This week",
        value: `${activeStaff.value}/${activeStaff.total}`,
        icon: <GiSplitArrows size={18} />,
        color: "text-blue-600",
      },
      {
        title: "Average Commission Rate",
        subtitle: "Of total sales",
        value: `${averageCommissionRate.value}%`,
        icon: <FiAlertTriangle size={22} />,
        color: "text-blue-600",
      },
      {
        title: "Pending Payments",
        subtitle: `${pendingPayments.count} Staff member${pendingPayments.count !== 1 ? 's' : ''}`,
        value: `₦${formatCurrency(pendingPayments.value)}`,
        icon: <TrendingUp size={18} />,
        color: "text-blue-600",
      },
    ];
  };

  const stats = getStats();

  // Loading state for cards only
  if (loading.overview && !overview) {
    return (
      <div>
        <div className='bg-white w-full rounded-2xl p-6'>
          <div>
            <h1 className='text-neutral-800 font-semibold text-xl'>Overview</h1>
            <p className='text-neutral-800 text-md'>Overview of staff performance and commissions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-8 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white rounded-lg p-6 animate-pulse border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className='bg-white rounded-2xl mt-4 p-6'>
          <OverviewChart/>
        </div>
      </div>
    );
  }

  // Error state for cards only
  if (errors.overview) {
    return (
      <div>
        <div className='bg-white w-full rounded-2xl p-6'>
          <div>
            <h1 className='text-neutral-800 font-semibold text-xl'>Overview</h1>
            <p className='text-neutral-800 text-md'>Overview of staff performance and commissions</p>
            
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {errors.overview}</p>
              <button
                onClick={() => fetchOverview(duration)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        
        <div className='bg-white rounded-2xl mt-4 p-6'>
          <OverviewChart/>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='bg-white w-full rounded-2xl p-6'>
        <div>
          <h1 className='text-neutral-800 font-semibold text-xl'>Overview</h1>
          <p className='text-neutral-800 text-md'>Overview of staff performance and commissions</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-8 gap-4">
            {stats.map((item, index) => (
              <StatCard
                key={index}
                title={item.title}
                subtitle={item.subtitle}
                value={item.value}
                icon={item.icon}
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
  );
};

export default OverviewCard;



//   'use client'
// import React from 'react'
// import { Users, AlertCircle, Wallet, TrendingUp } from "lucide-react";
// import { FiAlertTriangle } from "react-icons/fi";
// import { GiSplitArrows } from "react-icons/gi";
// import StatCard from '@/components/StatCard';
// import OverviewChart from './OverviewChart';
// // import { color } from 'framer-motion';



// const OverviewCard = () => {
//   const stats = [
//     {
//       title: "Total Commission",
//       subtitle: "This month",
//       value: "₦81,000",
//       icon: "₦",
//       trend: -0.5,
//       trendLabel: "From last month",
//       color: "text-blue-600",
//     },
//     {
//       title: "Active Staff",
//       subtitle: "This week",
//       value: "12/13",
//       icon: <GiSplitArrows size={18} />,
//       color: "text-blue-600",
//     },
//     {
//       title: "Average Commission Rate",
//       subtitle: "Of total sales",
//       value: "4.5%",
//       icon: <FiAlertTriangle size={22} />,
//       color: "text-blue-600",
//     },
//     {
//       title: "Pending Payments",
//       subtitle: "3 Staff members",
//       value: "₦12,000",
//       icon: <TrendingUp size={18} />,
//       color: "text-blue-600",
//     },
//   ];
//   return (

//     <div>
//         <div className='bg-white w-full rounded-2xl p-6'>
//               <div >
//                 <h1 className='text-neutral-800 font-semibold text-xl'>Overview</h1>
//                 <p className='text-neutral-800 text-md'>Overview of staff performance and commissions</p>

//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-8 gap-4">
//                     {stats.map((item, index) => (

//                       <StatCard
//                       key={index}
//                         title={item.title}
//                         subtitle={item.subtitle}
//                         value={item.value}
//                         icon= {item.icon}
//                         trend={item.trend}
//                         trendLabel={item.trendLabel}
//                         color={item.color}
//                       />
//                     ))}

                    
//                   </div>
//               </div>
//         </div>
                  
//         <div className='bg-white rounded-2xl mt-4 p-6'>
//           <OverviewChart/>
//         </div>
//     </div>

//   )
// }

// export default OverviewCard
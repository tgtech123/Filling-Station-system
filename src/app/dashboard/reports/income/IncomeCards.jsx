'use client'
import React, { useEffect } from 'react'
import MyStatCard from '@/components/MyStatCard'
import { getSalesData } from './SalesData'
import useAccountantStore from '@/store/useAccountantStore';

const IncomeCards = ({ duration = 'thismonth' }) => {
  const { incomeReport, loading, errors, fetchIncomeReport } = useAccountantStore();

  useEffect(() => {
    fetchIncomeReport(duration);
  }, [fetchIncomeReport, duration]);

  const salesData = getSalesData(incomeReport);

  if (loading.incomeReport && !incomeReport) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (errors.incomeReport) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {errors.incomeReport}</p>
        <button
          onClick={() => fetchIncomeReport(duration)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesData.map((item, index) => (
          <MyStatCard
            key={index}
            title={item.title}
            date={item.date}
            amount={item.amount}
            change={item.change}
            changeText={item.changeText}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default IncomeCards;



//     'use client'
// import React from 'react'
// import MyStatCard from '@/components/MyStatCard'
// import { salesData } from './SalesData'

// const IncomeCards = () => {
//   return (
//     <div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {salesData.map((item, index) => (
//                 <MyStatCard
//                 key={index}
//                 title={item.title}
//                 date={item.date}
//                 amount={item.amount}
//                 change={item.change}
//                 changeText={item.changeText}
//                 icon={item.icon}
//                 />
//                 ))}
//             </div>
//     </div>
//   )
// }

// export default IncomeCards
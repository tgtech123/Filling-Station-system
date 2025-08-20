import React from 'react'
import TeamPerformanceAnalysis from './TeamPerformanceAnalysis';


const OverviewChart = () => {
    const samplePerformanceData = [
    { month: 'Jan', oneDay: 8000, dayOff: 6000, indicator: null },
    { month: 'Feb', oneDay: 9000, dayOff: 7000, indicator: null },
    { month: 'Mar', oneDay: 8500, dayOff: 9000, indicator: null },
    { month: 'Apr', oneDay: 11000, dayOff: 8000, indicator: null },
    { month: 'May', oneDay: 12000, dayOff: 10000, indicator: null },
    { month: 'Jun', oneDay: 13000, dayOff: 9500, indicator: null },
    { month: 'Jul', oneDay: 12000, dayOff: 11000, indicator: 11000 },
    { month: 'Aug', oneDay: 14000, dayOff: 12000, indicator: null },
    { month: 'Sep', oneDay: 16000, dayOff: 13000, indicator: null },
    { month: 'Oct', oneDay: 18000, dayOff: 15000, indicator: null },
    { month: 'Nov', oneDay: 20000, dayOff: 17000, indicator: null },
    { month: 'Dec', oneDay: 22000, dayOff: 19000, indicator: null }
  ];

  const sampleProductData = [
    { month: 'Jan', fuel: 3000, lubricant: 35000 },
    { month: 'Feb', fuel: 6000, lubricant: 38000 },
    { month: 'Mar', fuel: 8000, lubricant: 40000 },
    { month: 'Apr', fuel: 10000, lubricant: 38000 },
    { month: 'May', fuel: 12000, lubricant: 35000 },
    { month: 'Jun', fuel: 11000, lubricant: 32000 },
    { month: 'Jul', fuel: 13000, lubricant: 30000 },
    { month: 'Aug', fuel: 12000, lubricant: 28000 },
    { month: 'Sep', fuel: 8000, lubricant: 25000 },
    { month: 'Oct', fuel: 15000, lubricant: 42000 },
    { month: 'Nov', fuel: 25000, lubricant: 45000 },
    { month: 'Dec', fuel: 35000, lubricant: 48000 }
  ];
  return (
    <div>
        <TeamPerformanceAnalysis performanceData={samplePerformanceData} productData={sampleProductData}/>
    </div>
  )
}

export default OverviewChart
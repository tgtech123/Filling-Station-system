'use client'
import React, { useEffect, useState } from 'react';
import useTrendsStore from '@/store/useTrendsStore';

const SalesProfitPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [profitData, setProfitData] = useState([]);

  const { 
    salesRevenueTrend, 
    profitAnalysis, 
    loading 
  } = useTrendsStore();

  useEffect(() => {
    if (salesRevenueTrend && salesRevenueTrend.length > 0) {
      const transformedSalesData = salesRevenueTrend.map(item => ({
        month: item.month,
        volume: item.volume,
        revenue: item.revenue / 1000, // Convert to thousands for chart scale
      }));
      setSalesData(transformedSalesData);
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const emptyData = months.map(month => ({
        month,
        volume: 0,
        revenue: 0,
      }));
      setSalesData(emptyData);
    }
  }, [salesRevenueTrend]);

  useEffect(() => {
    if (profitAnalysis && profitAnalysis.length > 0) {
      const transformedProfitData = profitAnalysis.map(item => ({
        month: item.month,
        grossProfit: item.grossProfit / 1000, // Convert to thousands for chart scale
        netProfit: item.netProfit / 1000, // Convert to thousands for chart scale
      }));
      setProfitData(transformedProfitData);
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const emptyData = months.map(month => ({
        month,
        grossProfit: 0,
        netProfit: 0,
      }));
      setProfitData(emptyData);
    }
  }, [profitAnalysis]);

  const months = salesData.map(item => item.month);

  // Calculate totals for annotations
  const totalVolume = salesData.reduce((sum, item) => sum + (item.volume || 0), 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + (item.revenue || 0), 0) * 1000; // Convert back to actual value
  const avgGrossProfit = profitData.length > 0 
    ? profitData.reduce((sum, item) => sum + (item.grossProfit || 0), 0) / profitData.length * 1000
    : 0;
  const avgNetProfit = profitData.length > 0 
    ? profitData.reduce((sum, item) => sum + (item.netProfit || 0), 0) / profitData.length * 1000
    : 0;

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "₦0";
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    }
    return `₦${value.toLocaleString('en-US')}`;
  };

  const formatVolume = (value) => {
    if (!value && value !== 0) return "0L";
    return `${value.toLocaleString('en-US')}L`;
  };

  // Create line path for sales chart
  const createLinePath = (data, key, maxValue, chartHeight) => {
    if (!data || data.length === 0) return '';
    
    const points = data.map((item, index) => {
      if (!item[key] && item[key] !== 0) return null;
      const x = (index / (data.length - 1)) * 280;
      const y = chartHeight - (item[key] / maxValue) * chartHeight;
      return `${x},${y}`;
    }).filter(Boolean);
    
    if (points.length === 0) return '';
    return `M ${points.join(' L ')}`;
  };

  // Create scatter points for profit chart
  const createScatterPoints = (data, key, maxValue, chartHeight) => {
    if (!data || data.length === 0) return [];
    
    return data.map((item, index) => {
      const value = item[key] || 0;
      const x = (index / (data.length - 1)) * 280;
      const y = chartHeight - (value / maxValue) * chartHeight;
      return { x, y, value };
    });
  };

  // Calculate max values for scaling
  const maxRevenue = Math.max(...salesData.map(d => d.revenue || 0), 180);
  const maxProfit = Math.max(
    ...profitData.map(d => Math.max(d.grossProfit || 0, d.netProfit || 0)),
    600
  );

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 mt-[0.75rem]">
      {/* Sales & Revenue Trends */}
      <div className="bg-white rounded-lg shadow-sm p-3 h-auto flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Sales & Revenue Trends</h2>
          <div className="relative ">
            <select className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Monthly</option>
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3  bg-gray-400"></div>
            <span className="text-sm text-gray-600">Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3  bg-blue-500"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
        </div>

        {/* Chart Area */}
        {loading.dashboard ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <div className="relative ml-10 h-6">
            <svg width="360" height="200" className="overflow-visible">
              {/* Grid lines */}
              {[0, 45, 90, 135, 180].map((value, index) => (
                <g key={index}>
                  <line
                    x1="0"
                    y1={200 - (value / 180) * 200}
                    x2="280"
                    y2={200 - (value / 180) * 200}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                  <text
                    x="-10"
                    y={200 - (value / 180) * 200 + 4}
                    fontSize="12"
                    fill="#9ca3af"
                    textAnchor="end"
                  >
                    {value === 0 ? '0K' : `${value}K`}
                  </text>
                </g>
              ))}

              {/* Revenue line */}
              <path
                d={createLinePath(salesData, 'revenue', maxRevenue, 200)}
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                className="drop-shadow-sm"
              />

              {/* Volume annotation */}
              <g>
                <rect
                  x="40"
                  y="60"
                  width="60"
                  height="30"
                  fill="white"
                  stroke="#d1d5db"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  rx="4"
                />
                <text x="70" y="72" fontSize="10" fill="#6b7280" textAnchor="middle">Volume</text>
                <text x="70" y="85" fontSize="12" fill="#111827" textAnchor="middle" fontWeight="bold">
                  {formatVolume(totalVolume)}
                </text>
              </g>

              {/* Revenue annotation */}
              <g>
                <rect
                  x="200"
                  y="40"
                  width="80"
                  height="30"
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  rx="4"
                />
                <text x="240" y="52" fontSize="10" fill="#92400e" textAnchor="middle">Revenue</text>
                <text x="240" y="65" fontSize="12" fill="#92400e" textAnchor="middle" fontWeight="bold">
                  {formatCurrency(totalRevenue)}
                </text>
              </g>

              {/* Y-axis labels */}
              <g className="text-xs fill-gray-400">
                <text x="290" y="45" textAnchor="start">₦100.0M</text>
                <text x="290" y="85" textAnchor="start">₦75.0M</text>
                <text x="290" y="125" textAnchor="start">₦50.0M</text>
                <text x="290" y="165" textAnchor="start">₦25.0M</text>
                <text x="290" y="205" textAnchor="start">₦0.0M</text>
              </g>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-6 px-1">
              {months.map((month, index) => (
                <span key={index} className="text-xs text-gray-500">{month}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profit Analysis */}
      <div className="bg-white relative rounded-lg shadow-sm p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Profit Analysis</h2>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-sm text-gray-600">Gross profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Net profit</span>
          </div>
        </div>

        {/* Chart Area */}
        {loading.dashboard ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <div className="relative ml-12 h-64">
            <svg width="320" height="200" className="overflow-visible">
              {/* Grid lines */}
              {[0, 150, 300, 450, 600].map((value, index) => (
                <g key={index}>
                  <line
                    x1="0"
                    y1={200 - (value / 600) * 200}
                    x2="280"
                    y2={200 - (value / 600) * 200}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                  <text
                    x="-10"
                    y={200 - (value / 600) * 200 + 4}
                    fontSize="12"
                    fill="#9ca3af"
                    textAnchor="end"
                  >
                    {value === 0 ? '0K' : `${value}K`}
                  </text>
                </g>
              ))}

              {/* Gross profit dots */}
              {createScatterPoints(profitData, 'grossProfit', maxProfit, 200).map((point, index) => (
                <circle
                  key={`gross-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#8b5cf6"
                  className="drop-shadow-sm"
                />
              ))}

              {/* Net profit dots */}
              {createScatterPoints(profitData, 'netProfit', maxProfit, 200).map((point, index) => (
                <circle
                  key={`net-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#8b5cf6"
                  className="drop-shadow-sm"
                />
              ))}

              {/* Gross profit annotation */}
              <g>
                <rect
                  x="40"
                  y="50"
                  width="70"
                  height="30"
                  fill="white"
                  stroke="#d1d5db"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  rx="4"
                />
                <text x="75" y="62" fontSize="10" fill="#6b7280" textAnchor="middle">Gross profit</text>
                <text x="75" y="75" fontSize="12" fill="#111827" textAnchor="middle" fontWeight="bold">
                  {formatCurrency(avgGrossProfit)}
                </text>
              </g>

              {/* Net profit annotation */}
              <g>
                <rect
                  x="190"
                  y="30"
                  width="90"
                  height="30"
                  fill="#f97316"
                  rx="4"
                />
                <text x="235" y="42" fontSize="10" fill="white" textAnchor="middle">Net profit</text>
                <text x="235" y="55" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">
                  {formatCurrency(avgNetProfit)}
                </text>
              </g>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-5 px-1">
              {months.map((month, index) => (
                <span key={index} className="text-xs text-gray-500">{month}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesProfitPage;


// import React from 'react';

// const SalesProfitPage = () => {
//   // Sales & Revenue data
//   const salesData = [
//     { month: 'Jan', volume: 170, revenue: 170 },
//     { month: 'Feb', volume: 135, revenue: 135 },
//     { month: 'Mar', volume: 140, revenue: 140 },
//     { month: 'Apr', volume: 160, revenue: 160 },
//     { month: 'May', volume: 155, revenue: 155 },
//     { month: 'Jun', volume: 150, revenue: 150 },
//     { month: 'Jul', volume: 145, revenue: 145 },
//     { month: 'Aug', volume: 148, revenue: 148 },
//     { month: 'Sep', volume: 152, revenue: 152 },
//     { month: 'Oct', volume: 158, revenue: 158 },
//     { month: 'Nov', volume: 165, revenue: 165 },
//     { month: 'Dec', revenue: 180 }
//   ];

//   // Profit Analysis data
//   const profitData = [
//     { month: 'Jan', grossProfit: 200, netProfit: 180 },
//     { month: 'Feb', grossProfit: 250, netProfit: 220 },
//     { month: 'Mar', grossProfit: 180, netProfit: 160 },
//     { month: 'Apr', grossProfit: 240, netProfit: 200 },
//     { month: 'May', grossProfit: 280, netProfit: 250 },
//     { month: 'Jun', grossProfit: 320, netProfit: 280 },
//     { month: 'Jul', grossProfit: 360, netProfit: 320 },
//     { month: 'Aug', grossProfit: 340, netProfit: 300 },
//     { month: 'Sep', grossProfit: 380, netProfit: 340 },
//     { month: 'Oct', grossProfit: 320, netProfit: 280 },
//     { month: 'Nov', grossProfit: 360, netProfit: 320 },
//     { month: 'Dec', grossProfit: 380, netProfit: 340 }
//   ];

//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'];

//   // Create line path for sales chart
//   const createLinePath = (data, key, maxValue, chartHeight) => {
//     const points = data.map((item, index) => {
//       if (!item[key]) return null;
//       const x = (index / (data.length - 1)) * 280;
//       const y = chartHeight - (item[key] / maxValue) * chartHeight;
//       return `${x},${y}`;
//     }).filter(Boolean);
    
//     return `M ${points.join(' L ')}`;
//   };

//   // Create scatter points for profit chart
//   const createScatterPoints = (data, key, maxValue, chartHeight) => {
//     return data.map((item, index) => {
//       const x = (index / (data.length - 1)) * 280;
//       const y = chartHeight - (item[key] / maxValue) * chartHeight;
//       return { x, y, value: item[key] };
//     });
//   };

//   return (
//     <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 mt-[0.75rem]">
//       {/* Sales & Revenue Trends */}
//       <div className="bg-white rounded-lg shadow-sm p-3 h-auto flex-1">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-lg font-semibold text-gray-900">Sales & Revenue Trends</h2>
//           <div className="relative ">
//             <select className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option>Monthly</option>
//             </select>
//             <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//         </div>

//         {/* Legend */}
//         <div className="flex gap-4 mb-6">
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3  bg-gray-400"></div>
//             <span className="text-sm text-gray-600">Volume</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3  bg-blue-500"></div>
//             <span className="text-sm text-gray-600">Revenue</span>
//           </div>
//         </div>

//         {/* Chart Area */}
//         <div className="relative ml-10 h-6">
//           <svg width="220" height="200" className="overflow-visible">
//             {/* Grid lines */}
//             {[0, 45, 90, 135, 180].map((value, index) => (
//               <g key={index}>
//                 <line
//                   x1="0"
//                   y1={200 - (value / 180) * 200}
//                   x2="280"
//                   y2={200 - (value / 180) * 200}
//                   stroke="#f3f4f6"
//                   strokeWidth="1"
//                 />
//                 <text
//                   x="-10"
//                   y={200 - (value / 180) * 200 + 4}
//                   fontSize="12"
//                   fill="#9ca3af"
//                   textAnchor="end"
//                 >
//                   {value === 0 ? '0K' : `${value}K`}
//                 </text>
//               </g>
//             ))}

//             {/* Revenue line */}
//             <path
//               d={createLinePath(salesData, 'revenue', 180, 200)}
//               fill="none"
//               stroke="#f97316"
//               strokeWidth="3"
//               className="drop-shadow-sm"
//             />

//             {/* Volume annotation */}
//             <g>
//               <rect
//                 x="40"
//                 y="60"
//                 width="60"
//                 height="30"
//                 fill="white"
//                 stroke="#d1d5db"
//                 strokeWidth="1"
//                 strokeDasharray="3,3"
//                 rx="4"
//               />
//               <text x="70" y="72" fontSize="10" fill="#6b7280" textAnchor="middle">Volume</text>
//               <text x="70" y="85" fontSize="12" fill="#111827" textAnchor="middle" fontWeight="bold">65,000L</text>
//             </g>

//             {/* Revenue annotation */}
//             <g>
//               <rect
//                 x="200"
//                 y="40"
//                 width="80"
//                 height="30"
//                 fill="#fef3c7"
//                 stroke="#f59e0b"
//                 strokeWidth="1"
//                 rx="4"
//               />
//               <text x="240" y="52" fontSize="10" fill="#92400e" textAnchor="middle">Revenue</text>
//               <text x="240" y="65" fontSize="12" fill="#92400e" textAnchor="middle" fontWeight="bold">₦12,000,00</text>
//             </g>

//             {/* Y-axis labels */}
//             <g className="text-xs fill-gray-400">
//               <text x="320" y="45" textAnchor="start">₦100.0M</text>
//               <text x="320" y="85" textAnchor="start">₦75.0M</text>
//               <text x="320" y="125" textAnchor="start">₦50.0M</text>
//               <text x="320" y="165" textAnchor="start">₦25.0M</text>
//               <text x="320" y="205" textAnchor="start">₦0.0M</text>
//             </g>
//           </svg>

//           {/* X-axis labels */}
//           <div className="flex justify-between mt-6 px-1">
//             {months.map((month, index) => (
//               <span key={index} className="text-xs text-gray-500">{month}</span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Profit Analysis */}
//       <div className="bg-white relative rounded-lg shadow-sm p-6 flex-1">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-lg font-semibold text-gray-900">Profit Analysis</h2>
//           <div className="relative">
//             <select className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option>Monthly</option>
//               <option>Quarterly</option>
//               <option>Yearly</option>
//             </select>
//             <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//         </div>

//         {/* Legend */}
//         <div className="flex gap-4 mb-6">
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-gray-400"></div>
//             <span className="text-sm text-gray-600">Gross profit</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-orange-500"></div>
//             <span className="text-sm text-gray-600">Net profit</span>
//           </div>
//         </div>

//         {/* Chart Area */}
//         <div className="relative ml-12 h-64">
//           <svg width="320" height="200" className="overflow-visible">
//             {/* Grid lines */}
//             {[0, 150, 300, 450, 600].map((value, index) => (
//               <g key={index}>
//                 <line
//                   x1="0"
//                   y1={200 - (value / 600) * 200}
//                   x2="280"
//                   y2={200 - (value / 600) * 200}
//                   stroke="#f3f4f6"
//                   strokeWidth="1"
//                 />
//                 <text
//                   x="-10"
//                   y={200 - (value / 600) * 200 + 4}
//                   fontSize="12"
//                   fill="#9ca3af"
//                   textAnchor="end"
//                 >
//                   {value === 0 ? '0K' : `${value}K`}
//                 </text>
//               </g>
//             ))}

//             {/* Gross profit dots */}
//             {createScatterPoints(profitData, 'grossProfit', 600, 200).map((point, index) => (
//               <circle
//                 key={`gross-${index}`}
//                 cx={point.x}
//                 cy={point.y}
//                 r="4"
//                 fill="#8b5cf6"
//                 className="drop-shadow-sm"
//               />
//             ))}

//             {/* Net profit dots */}
//             {createScatterPoints(profitData, 'netProfit', 600, 200).map((point, index) => (
//               <circle
//                 key={`net-${index}`}
//                 cx={point.x}
//                 cy={point.y}
//                 r="4"
//                 fill="#8b5cf6"
//                 className="drop-shadow-sm"
//               />
//             ))}

//             {/* Gross profit annotation */}
//             <g>
//               <rect
//                 x="40"
//                 y="50"
//                 width="70"
//                 height="30"
//                 fill="white"
//                 stroke="#d1d5db"
//                 strokeWidth="1"
//                 strokeDasharray="3,3"
//                 rx="4"
//               />
//               <text x="75" y="62" fontSize="10" fill="#6b7280" textAnchor="middle">Gross profit</text>
//               <text x="75" y="75" fontSize="12" fill="#111827" textAnchor="middle" fontWeight="bold">65,000L</text>
//             </g>

//             {/* Net profit annotation */}
//             <g>
//               <rect
//                 x="190"
//                 y="30"
//                 width="90"
//                 height="30"
//                 fill="#f97316"
//                 rx="4"
//               />
//               <text x="235" y="42" fontSize="10" fill="white" textAnchor="middle">Net profit</text>
//               <text x="235" y="55" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">₦12,000,00</text>
//             </g>
//           </svg>

//           {/* X-axis labels */}
//           <div className="flex justify-between mt-5 px-1">
//             {months.map((month, index) => (
//               <span key={index} className="text-xs text-gray-500">{month}</span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesProfitPage;
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import TimeDropdown from './TimeDropdown';
import ChartLegend from './ChartLegend';

const ProductSalesChart = ({ data, timeFilter, onTimeFilterChange }) => {
  const legendItems = [
    { label: 'Fuel', color: '#8B5CF6' },
    { label: 'Lubricant', color: '#E0E7FF' }
  ];

  const totals = useMemo(() => {
    if (!data || data.length === 0) {
      return { fuel: 0, lubricant: 0, total: 0 };
    }

    const fuelTotal = data.reduce((sum, d) => sum + (d.fuel || 0), 0);
    const lubricantTotal = data.reduce((sum, d) => sum + (d.lubricant || 0), 0);

    return {
      fuel: fuelTotal,
      lubricant: lubricantTotal,
      total: fuelTotal + lubricantTotal
    };
  }, [data]);

  const formatCurrency = (value) => {
    if (!value) return '₦0';
    if (value >= 1000) {
      return `₦${(value / 1000).toFixed(1)}k`;
    }
    return `₦${value.toLocaleString('en-US')}`;
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Product Sales Overview</h3>
        <TimeDropdown value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <ChartLegend items={legendItems} />

      {totals.total > 0 && (
        <div className="mb-4 flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Fuel Total:</span>
            <span className="text-sm font-semibold text-purple-600">{formatCurrency(totals.fuel)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Lubricant Total:</span>
            <span className="text-sm font-semibold text-indigo-400">{formatCurrency(totals.lubricant)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Combined:</span>
            <span className="text-sm font-semibold text-gray-800">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="lubricantGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E0E7FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#E0E7FF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis 
              dataKey="month" 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }} 
            />
            <YAxis
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              domain={[0, 50000]}
              tickFormatter={(value) => `${value / 1000}k`}
              ticks={[0, 5000, 15000, 25000, 35000, 45000]}
            />

            <Area type="monotone" dataKey="lubricant" stackId="1" stroke="transparent" fill="url(#lubricantGradient)" />
            <Area type="monotone" dataKey="fuel" stroke="#8B5CF6" strokeWidth={3} fill="url(#fuelGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer> 
      </div>
    </div>
  );
};

export default ProductSalesChart;

// import React from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
// import TimeDropdown from './TimeDropdown';
// import ChartLegend from './ChartLegend';

// const ProductSalesChart = ({ data, timeFilter, onTimeFilterChange }) => {
//   const legendItems = [
//     { label: 'Fuel', color: '#8B5CF6' },
//     { label: 'Lubricant', color: '#E0E7FF' }
//   ];

//   return (
//     <div className="bg-white rounded-lg p-6 border border-gray-200">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-semibold text-gray-800">Product Sales Overview</h3>
//         <TimeDropdown value={timeFilter} onChange={onTimeFilterChange} />
//       </div>

//       <ChartLegend items={legendItems} />

//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data}>
//             <defs>
//               <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
//                 <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
//               </linearGradient>
//               <linearGradient id="lubricantGradient" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#E0E7FF" stopOpacity={0.8}/>
//                 <stop offset="95%" stopColor="#E0E7FF" stopOpacity={0.1}/>
//               </linearGradient>
//             </defs>

//             <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
//             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: '#9CA3AF' }}
//               domain={[0, 50000]}
//               tickFormatter={(value) => `${value / 1000}k`}
//               ticks={[0, 5000, 15000, 25000, 35000, 45000]}
//             />

//             <Area type="monotone" dataKey="lubricant" stackId="1" stroke="transparent" fill="url(#lubricantGradient)" />
//             <Area type="monotone" dataKey="fuel" stroke="#8B5CF6" strokeWidth={3} fill="url(#fuelGradient)" dot={false} />
//           </AreaChart>
//         </ResponsiveContainer> 
//       </div>
//     </div>
//   );
// };

// export default ProductSalesChart;

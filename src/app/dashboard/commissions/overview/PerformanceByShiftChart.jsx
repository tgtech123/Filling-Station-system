import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import TimeDropdown from './TimeDropdown';
import ChartLegend from './ChartLegend';
import ValueCallout from './ValueCallout';

const PerformanceByShiftChart = ({ data, timeFilter, onTimeFilterChange }) => {
  const legendItems = [
    { label: 'One-Day', color: '#F59E0B' },
    { label: 'Day-Off', color: '#3B82F6' }
  ];

  const averages = useMemo(() => {
    if (!data || data.length === 0) {
      return { oneDay: 0, dayOff: 0 };
    }

    const validData = data.filter(d => d.oneDay > 0 || d.dayOff > 0);
    
    if (validData.length === 0) {
      return { oneDay: 0, dayOff: 0 };
    }

    const oneDayTotal = validData.reduce((sum, d) => sum + (d.oneDay || 0), 0);
    const dayOffTotal = validData.reduce((sum, d) => sum + (d.dayOff || 0), 0);

    return {
      oneDay: Math.round(oneDayTotal / validData.length),
      dayOff: Math.round(dayOffTotal / validData.length)
    };
  }, [data]);

  const formatCurrency = (value) => {
    if (!value) return '₦0';
    return `₦${value.toLocaleString('en-US')}`;
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Performance by Shift</h3>
        <TimeDropdown value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <ChartLegend items={legendItems} />

      <div className="relative h-80">
        {averages.oneDay > 0 && (
          <ValueCallout 
            label="Average One-Day" 
            value={formatCurrency(averages.oneDay)} 
            position={{ x: '25%', y: '40%' }} 
            color="#F59E0B" 
            bgColor="#FEF3C7" 
          />
        )}
        {averages.dayOff > 0 && (
          <ValueCallout 
            label="Average Day-Off" 
            value={formatCurrency(averages.dayOff)} 
            position={{ x: '55%', y: '20%' }} 
            color="#3B82F6" 
            bgColor="#DBEAFE" 
          />
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              domain={[0, 'auto']}
              tickFormatter={(value) => `₦${value / 1000}k`}
            />

            <Line type="monotone" dataKey="oneDay" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#F59E0B' }} />
            <Line type="monotone" dataKey="dayOff" stroke="#3B82F6" strokeWidth={3} strokeDasharray="8 4" dot={false} activeDot={{ r: 6, fill: '#3B82F6' }} />
            <Line type="monotone" dataKey="indicator" stroke="#60A5FA" strokeWidth={2} dot={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceByShiftChart;


// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
// import TimeDropdown from './TimeDropdown';
// import ChartLegend from './ChartLegend';
// import ValueCallout from './ValueCallout';

// const PerformanceByShiftChart = ({ data, timeFilter, onTimeFilterChange }) => {
//   const legendItems = [
//     { label: 'One-Day', color: '#F59E0B' },
//     { label: 'Day-Off', color: '#3B82F6' }
//   ];

//   return (
//     <div className="bg-white rounded-lg p-6 border border-gray-200">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-semibold text-gray-800">Performance by Shift</h3>
//         <TimeDropdown value={timeFilter} onChange={onTimeFilterChange} />
//       </div>

//       <ChartLegend items={legendItems} />

//       <div className="relative h-80">
//         <ValueCallout label="Average Sale Value" value="N320,000" position={{ x: '25%', y: '40%' }} color="#6B7280" />
//         <ValueCallout label="Average Sale Value" value="N120,000" position={{ x: '45%', y: '20%' }} color="#F59E0B" bgColor='FFAF51' />

//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
//             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
//             <YAxis hide />

//             <Line type="monotone" dataKey="oneDay" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#F59E0B' }} />
//             <Line type="monotone" dataKey="dayOff" stroke="#3B82F6" strokeWidth={3} strokeDasharray="8 4" dot={false} activeDot={{ r: 6, fill: '#3B82F6' }} />
//             <Line type="monotone" dataKey="indicator" stroke="#60A5FA" strokeWidth={2} dot={false} connectNulls={false} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default PerformanceByShiftChart;

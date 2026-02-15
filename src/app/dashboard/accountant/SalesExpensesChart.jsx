 import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import TimeDropdown from './TimeDropdown';
import ChartLegend from './ChartLegend';
import ValueCallout from './ValueCallout';

const SalesExpensesChart = ({ data, loading }) => {
  const legendItems = [
    { label: 'Average Sale Value', color: '#F59E0B' },
    { label: 'Average Expenses', color: '#3B82F6' }
  ];

  // Calculate average values from data
  const averageValues = useMemo(() => {
    if (!data || data.length === 0) {
      return { avgSales: 0, avgExpenses: 0 };
    }

    const totalSales = data.reduce((sum, item) => sum + (item.averageSaleValue || 0), 0);
    const totalExpenses = data.reduce((sum, item) => sum + (item.averageExpenses || 0), 0);

    return {
      avgSales: Math.round(totalSales / data.length),
      avgExpenses: Math.round(totalExpenses / data.length),
    };
  }, [data]);

  // Format currency
  const formatCurrency = (value) => {
    return `₦${value.toLocaleString()}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Sales vs Expenses</h3>
        </div>
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading chart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Sales vs Expenses</h3>
        </div>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Sales vs Expenses</h3>
      </div>

      <ChartLegend items={legendItems} />

      <div className="relative h-80">
        <ValueCallout 
          label="Average Sale Value" 
          value={formatCurrency(averageValues.avgSales)} 
          position={{ x: '25%', y: '40%' }} 
          color="#6B7280" 
        />
        <ValueCallout 
          label="Average Expenses" 
          value={formatCurrency(averageValues.avgExpenses)} 
          position={{ x: '45%', y: '20%' }} 
          color="#F59E0B" 
          bgColor='FFAF51' 
        />

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }} 
            />
            <YAxis hide />

            <Line 
              type="monotone" 
              dataKey="averageSaleValue" 
              stroke="#F59E0B" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6, fill: '#F59E0B' }} 
            />
            <Line 
              type="monotone" 
              dataKey="averageExpenses" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              strokeDasharray="8 4" 
              dot={false} 
              activeDot={{ r: 6, fill: '#3B82F6' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesExpensesChart;
 
 
 
 // import React from 'react';
  // import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
  // import TimeDropdown from './TimeDropdown';
  // import ChartLegend from './ChartLegend';
  // import ValueCallout from './ValueCallout';

  // const SalesExpensesChart = ({ data, timeFilter, onTimeFilterChange }) => {
  //   const legendItems = [
  //     { label: 'Average Sale Value', color: '#F59E0B' },
  //     { label: 'Average Expenses', color: '#3B82F6' }
  //   ];
    

  //   return (
  //     <div className="bg-white rounded-lg p-6 border border-gray-200">
  //       <div className="flex items-center justify-between mb-6">
  //         <h3 className="text-lg font-semibold text-gray-800">Sales vs Expenses</h3>
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

  // export default SalesExpensesChart;

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import TimeDropdown from './TimeDropdown';
import ChartLegend from './ChartLegend';

const ProductSalesChart = ({ data, timeFilter, onTimeFilterChange }) => {
  const legendItems = [
    { label: 'Fuel', color: '#8B5CF6' },
    { label: 'Lubricant', color: '#E0E7FF' }
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Product Sales Overview</h3>
        <TimeDropdown value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <ChartLegend items={legendItems} />

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
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
            <YAxis
              axisLine={false}
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

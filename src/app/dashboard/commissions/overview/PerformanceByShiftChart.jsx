import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import TimeDropdown from './TimeDropdown';
import ChartLegend from './ChartLegend';
import ValueCallout from './ValueCallout';

const PerformanceByShiftChart = ({ data, timeFilter, onTimeFilterChange }) => {
  const legendItems = [
    { label: 'One-Day', color: '#F59E0B' },
    { label: 'Day-Off', color: '#3B82F6' }
  ];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Performance by Shift</h3>
        <TimeDropdown value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <ChartLegend items={legendItems} />

      <div className="relative h-80">
        <ValueCallout label="Average Sale Value" value="N320,000" position={{ x: '25%', y: '40%' }} color="#6B7280" />
        <ValueCallout label="Average Sale Value" value="N120,000" position={{ x: '45%', y: '20%' }} color="#F59E0B" bgColor='FFAF51' />

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
            <YAxis hide />

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

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import { TrendingUp } from 'lucide-react';
import Image from 'next/image';

// Sample data for the chart
const monthlyData = [
  { month: 'Jan', stations: 1050, subscriptions: 750 },
  { month: 'Feb', stations: 1400, subscriptions: 650 },
  { month: 'Mar', stations: 1050, subscriptions: 680 },
  { month: 'Apr', stations: 1050, subscriptions: 720 },
  { month: 'May', stations: 1400, subscriptions: 1050 },
  { month: 'Jun', stations: 1650, subscriptions: 1300 },
  { month: 'Jul', stations: 1300, subscriptions: 950 },
  { month: 'Aug', stations: 1250, subscriptions: 900 },
  { month: 'Sep', stations: 1350, subscriptions: 1000 },
  { month: 'Oct', stations: 1400, subscriptions: 1050 },
];

const NetworkGrowthChart = () => {
  const [activeView, setActiveView] = useState('monthly');
  
  // Custom dot component for highlighted points
  const CustomDot = (props) => {
    const { cx, cy, stroke, dataKey } = props;
    
    // Show dot only for January data point
    if (props.index === 0) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={5} 
          fill="white" 
          stroke={stroke} 
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {payload[0].payload.month}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Image src="/Trend.png" width={24} height={24} alt='trend' />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Network Growth</h2>
            <p className="text-sm text-gray-500">Station and subscription growth</p>
          </div>
        </div>
        
        {/* Toggle buttons */}
        <div className="flex gap-2 bg-[#EDF6FF] p-1 rounded-2xl">
          <button
            onClick={() => setActiveView('monthly')}
            className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
              activeView === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveView('yearly')}
            className={`px-4 py-2 rounded-3xl text-sm font-medium transition-colors ${
              activeView === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
            
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              ticks={[0, 350, 700, 1050, 1400, 1750]}
              domain={[0, 1750]}
              dx={-10}
            />
            
            {/* Vertical reference line for January */}
            <ReferenceLine 
              x="Jan" 
              stroke="#e5e7eb" 
              strokeWidth={1}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Stations line (blue) */}
            <Line 
              type="monotone" 
              dataKey="stations" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
              name="Stations"
            />
            
            {/* Subscriptions line (green) */}
            <Line 
              type="monotone" 
              dataKey="subscriptions" 
              stroke="#10b981" 
              strokeWidth={2.5}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
              name="Subscriptions"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Legend with January labels */}
        <div className="absolute left-24 top-16 flex flex-col gap-2">
          <div className="bg-white px-2 py-1 rounded text-xs">
            <span className="font-semibold text-gray-600">January, 2025</span>
          </div>
          <div className="bg-white px-2 py-1 rounded text-xs">
            <span className="text-blue-600 font-semibold">Stations: 520</span>
          </div>
          <div className="bg-white px-2 py-1 rounded text-xs">
            <span className="text-green-600 font-semibold">Subscriptions: 380</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGrowthChart;
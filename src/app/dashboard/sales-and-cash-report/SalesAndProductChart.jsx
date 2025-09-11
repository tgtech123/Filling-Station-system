    'use client'
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SalesAndProductChart = () => {
  const [leftDropdownOpen, setLeftDropdownOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);
  const [leftSelected, setLeftSelected] = useState('This month');
  const [rightSelected, setRightSelected] = useState('This month');

  const dropdownOptions = ['This week', 'This month', 'Last month', 'This year'];

  const salesData = [
    { month: 'Jan', value: 80 },
    { month: 'Feb', value: 60 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 75 },
    { month: 'Jun', value: 90 },
    { month: 'Jul', value: 85 },
    { month: 'Aug', value: 70 },
    { month: 'Sep', value: 95 },
    { month: 'Oct', value: 100 },
    { month: 'Nov', value: 110 },
    { month: 'Des', value: 120 }
  ];

  const productData = [
    { name: 'PMS', percentage: 25, color: 'bg-orange-500', volume: '2,3243 Litres' },
    { name: 'AGO', percentage: 25, color: 'bg-green-500', volume: '2,000 Litres' },
    { name: 'Diesel', percentage: 15, color: 'bg-blue-500', volume: '1,500 Litres' },
    { name: 'Gas', percentage: 35, color: 'bg-orange-400', volume: '1,300 Litres' }
  ];

  // Generate SVG path for the line chart
  const generatePath = () => {
    const width = 600;
    const height = 200;
    const points = salesData.map((item, index) => {
      const x = (index / (salesData.length - 1)) * width;
      const y = height - ((item.value - 60) / 50) * 160;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const generateAreaPath = () => {
    const width = 600;
    const height = 200;
    const points = salesData.map((item, index) => {
      const x = (index / (salesData.length - 1)) * width;
      const y = height - (item.value / 120) * height;
      return `${x},${y}`;
    });
    return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  };

  const Dropdown = ({ isOpen, setIsOpen, selected, setSelected, options }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:flex flex-wrap items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
      >
        {selected}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-blue-600 rounded-lg shadow-lg z-10 min-w-full">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-600 hover:text-white hover:rounded-2xl "
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className=" mt-[1.5rem] ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
        {/* Sales Trend Chart */}
        <div className="rounded-xl p-2 border-[1.5px] border-neutral-100">
          <div className="flex justify-between items-center mb-[1.5rem]">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
              <p className="text-sm text-gray-500">Over the selected month</p>
            </div>
            <Dropdown
              isOpen={leftDropdownOpen}
              setIsOpen={setLeftDropdownOpen}
              selected={leftSelected}
              setSelected={setLeftSelected}
              options={dropdownOptions}
            />
          </div>

          <div className="relative">
            <svg viewBox="0 0 600 200" className="w-full h-48">
              {/* Area fill */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d={generateAreaPath()}
                fill="url(#areaGradient)"
              />
              
              {/* Line */}
              <path
                d={generatePath()}
                stroke="#f97316"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {salesData.map((item, index) => {
                const x = (index / (salesData.length - 1)) * 600;
                const y = 200 - (item.value / 120) * 200;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#f97316"
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Average Sale Value indicator */}
              <g transform="translate(280, 60)">
                <rect x="-40" y="-55" width="6.625rem" height="3.0625rem" rx="15" fill="#FFAF51" />
                <text x="12" y="-40" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="500">
                  Average Sale Value
                </text>
                <text x="12" y="-20" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="600">
                  ₦120,000
                </text>
              </g>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-4 px-1">
              {salesData.map((item, index) => (
                <span key={index} className="text-xs text-gray-500">{item.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Product Sales Distribution */}
        <div className=" rounded-xl p-2 border-[1.5px] border-neutral-100 ">
          <div className="lg:flex flex-wrap lg:justify-between items-center mb-[1.5rem]">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Product Sales Distribution</h3>
              <p className="text-sm text-gray-500">Over the selected month</p>
            </div>
            <Dropdown
              isOpen={rightDropdownOpen}
              setIsOpen={setRightDropdownOpen}
              selected={rightSelected}
              setSelected={setRightSelected}
              options={dropdownOptions}
            />
          </div>

          <div className="lg:flex flex-wrap items-center lg:justify-between">
            {/* Donut Chart */}
            <div className="relative">
              <svg width="200" height="200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="40"
                />
                
                {/* PMS - 25% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="40"
                  strokeDasharray={`${25 * 4.4} ${100 * 4.4}`}
                  strokeDashoffset="0"
                  className="transition-all duration-500"
                />
                
                {/* AGO - 25% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="40"
                  strokeDasharray={`${25 * 4.4} ${100 * 4.4}`}
                  strokeDashoffset={`-${25 * 4.4}`}
                  className="transition-all duration-500"
                />
                
                {/* Diesel - 15% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="40"
                  strokeDasharray={`${15 * 4.4} ${100 * 4.4}`}
                  strokeDashoffset={`-${50 * 4.4}`}
                  className="transition-all duration-500"
                />
                
                {/* Gas - 35% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="40"
                  strokeDasharray={`${35 * 4.4} ${100 * 4.4}`}
                  strokeDashoffset={`-${65 * 4.4}`}
                  className="transition-all text-white duration-500 relative"
                />
               
              </svg>
            </div>

                       

            {/* Legend */}
            <div className="space-y-4 ml-6">
              {productData.map((product, index) => (
                <div key={index} className="flex items-center justify-between min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${product.color}`}></div>
                    <span className="text-gray-600 font-medium">{product.name}</span>
                    <span className=" text-gray-400 text-sm">{product.percentage}%</span>
                  </div>
                  <span className="text-gray-500 text-sm ml-4">{product.volume}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAndProductChart;
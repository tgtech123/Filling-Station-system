import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", Fuel: 4000, Lubricant: 3000 },
  { month: "Feb", Fuel: 3200, Lubricant: 3100 },
  { month: "Mar", Fuel: 2800, Lubricant: 4000 },
  { month: "Apr", Fuel: 2000, Lubricant: 4200 },
  { month: "Jun", Fuel: 4300, Lubricant: 2500 },
  { month: "Jul", Fuel: 3000, Lubricant: 2700 },
  { month: "Aug", Fuel: 3400, Lubricant: 2900 },
  { month: "Sep", Fuel: 3600, Lubricant: 3100 },
  { month: "Oct", Fuel: 2700, Lubricant: 2600 },
  { month: "Nov", Fuel: 2500, Lubricant: 2800 },
  { month: "Dec", Fuel: 4100, Lubricant: 3900 },
];

const ProductSalesOverviewChart = () => {
  const [filter, setFilter] = useState("Monthly");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Product Sales Overview</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-sm text-sm px-3 py-1 text-gray-600 focus:outline-none"
        >
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Yearly</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-purple-600"></span>
          <span className="text-sm text-gray-600">Fuel</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-orange-500"></span>
          <span className="text-sm text-gray-600">Lubricant</span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer>
          <BarChart data={data} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Bar dataKey="Lubricant" fill="#f97316" radius={[8, 8, 0, 0]} barSize={10} />
            <Bar dataKey="Fuel" fill="#9333ea" radius={[8, 8, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductSalesOverviewChart;

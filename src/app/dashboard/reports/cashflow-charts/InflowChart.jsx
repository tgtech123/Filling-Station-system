"use client";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Fuel", value: 140000, fill: "#0080FF" },
  { name: "Lubricant", value: 80000, fill: "#FF9900" },
  { name: "Others", value: 20000, fill: "#00C49F" },
];

export default function InflowChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Inflow</h2>
      <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>

      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="90%"
          barSize={15}
          data={data}
        >
          <RadialBar
            minAngle={15}
            label={{ position: "insideStart", fill: "#fff" }}
            background
            clockWise
            dataKey="value"
          />
          <Legend
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <p className="text-center font-bold text-xl">₦240,000</p>
    </div>
  );
}

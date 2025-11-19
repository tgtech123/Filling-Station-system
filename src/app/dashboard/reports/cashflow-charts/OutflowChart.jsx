"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Fuel Procurement", value: 50000 },
  { name: "Operational Expenses", value: 30000 },
  { name: "Staff Salaries", value: 15000 },
  { name: "Maintenance", value: 10000 },
];

const COLORS = ["#FF9900", "#00C49F", "#0080FF", "#FF6347"];

export default function OutflowChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Outflow</h2>
      <p className="text-sm text-gray-500 mb-2">Monthly breakdown</p>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>

      <p className="text-center font-bold text-xl">₦100,000</p>
    </div>
  );
}

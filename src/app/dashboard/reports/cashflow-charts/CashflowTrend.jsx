"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", inflow: 4000, outflow: 2400 },
  { month: "Feb", inflow: 3000, outflow: 1398 },
  { month: "Mar", inflow: 2000, outflow: 9800 },
  { month: "Apr", inflow: 2780, outflow: 3908 },
  { month: "May", inflow: 1890, outflow: 4800 },
  { month: "Jun", inflow: 2390, outflow: 3800 },
];

export default function CashflowTrend() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Cashflow Trend</h2>
        <select className="border rounded-md px-2 py-1 text-sm">
          <option>This month</option>
          <option>Last month</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="inflow" stroke="#FF9900" strokeWidth={2} />
          <Line type="monotone" dataKey="outflow" stroke="#0080FF" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

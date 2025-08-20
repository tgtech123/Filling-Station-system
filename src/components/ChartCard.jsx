"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartCard = ({ title, subtitle, type, data }) => {
  // ✅ Defensive check
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>

      <div className="mt-4 h-80">
        {!hasData ? (
          // ✅ Safe fallback UI
          <div className="flex items-center justify-center h-full text-gray-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" && (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="oneday"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="dayoff"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  strokeDasharray="6 6"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            )}

            {type === "area" && (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="lubricant"
                  stroke="#93C5FD"
                  fill="#93C5FD"
                  fillOpacity={0.3}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="fuel"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartCard;

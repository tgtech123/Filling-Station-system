import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DisplayCard from "./DisplayCard";

const salesData = [
  {
    month: "Jan",
    litresSold: 3800,
    saleValue: 95000,
  },
  {
    month: "Feb",
    litresSold: 3900,
    saleValue: 98000,
  },
  {
    month: "Mar",
    litresSold: 4100,
    saleValue: 102000,
  },
  {
    month: "Apr",
    litresSold: 4200,
    saleValue: 105000,
  },
  {
    month: "May",
    litresSold: 4000,
    saleValue: 100000,
  },
  {
    month: "Jun",
    litresSold: 4300,
    saleValue: 108000,
  },
  {
    month: "Jul",
    litresSold: 4324,
    saleValue: 120000,
  },
  {
    month: "Aug",
    litresSold: 4100,
    saleValue: 115000,
  },
  {
    month: "Sep",
    litresSold: 4400,
    saleValue: 118000,
  },
  {
    month: "Oct",
    litresSold: 4600,
    saleValue: 125000,
  },
  {
    month: "Nov",
    litresSold: 4800,
    saleValue: 130000,
  },
  {
    month: "Dec",
    litresSold: 5000,
    saleValue: 135000,
  },
];

// Custom tooltip to format your data nicely
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-semibold">{`Month: ${label}`}</p>
        <p className="text-blue-600">
          {`Litres Sold: ${payload[0]?.value?.toLocaleString()} L`}
        </p>
        <p className="text-orange-500">
          {`Sale Value: ₦${payload[1]?.value?.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesOverviewChart() {
  return (
    <DisplayCard>
      <div className="w-full  p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sales Overview</h2>
          <p className="text-gray-600">This month</p>
        </div>

        {/* Summary boxes */}
        <div className="flex gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Average Litres Sold</p>
            <p className="text-lg font-bold text-blue-600">4,324 Litrs</p>
          </div>
          <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p className="text-sm text-gray-600">Average Sale Value</p>
            <p className="text-lg font-bold text-orange-500">₦120,000</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={salesData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Dashed blue line for litres sold */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="litresSold"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              name="Average Litres Sold"
            />

            {/* Solid orange line for sale value */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="saleValue"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: "#f97316", r: 4 }}
              activeDot={{ r: 6 }}
              name="Average Sale Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DisplayCard>
  );
}

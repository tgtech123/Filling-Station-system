// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import DisplayCard from "./DisplayCard";

// const salesData = [
//   {
//     month: "Jan",
//     litresSold: 3800,
//     saleValue: 95000,
//   },
//   {
//     month: "Feb",
//     litresSold: 3900,
//     saleValue: 98000,
//   },
//   {
//     month: "Mar",
//     litresSold: 4100,
//     saleValue: 102000,
//   },
//   {
//     month: "Apr",
//     litresSold: 4200,
//     saleValue: 105000,
//   },
//   {
//     month: "May",
//     litresSold: 4000,
//     saleValue: 100000,
//   },
//   {
//     month: "Jun",
//     litresSold: 4300,
//     saleValue: 108000,
//   },
//   {
//     month: "Jul",
//     litresSold: 4324,
//     saleValue: 120000,
//   },
//   {
//     month: "Aug",
//     litresSold: 4100,
//     saleValue: 115000,
//   },
//   {
//     month: "Sep",
//     litresSold: 4400,
//     saleValue: 118000,
//   },
//   {
//     month: "Oct",
//     litresSold: 4600,
//     saleValue: 125000,
//   },
//   {
//     month: "Nov",
//     litresSold: 4800,
//     saleValue: 130000,
//   },
//   {
//     month: "Dec",
//     litresSold: 5000,
//     saleValue: 135000,
//   },
// ];

// // Custom tooltip to format your data nicely
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white p-3 border rounded shadow-lg">
//         <p className="font-semibold">{`Month: ${label}`}</p>
//         <p className="text-blue-600">
//           {`Litres Sold: ${payload[0]?.value?.toLocaleString()} L`}
//         </p>
//         <p className="text-orange-500">
//           {`Sale Value: ₦${payload[1]?.value?.toLocaleString()}`}
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function SalesOverviewChart() {
//   return (
//     <DisplayCard>
//       <div className="w-full h-[460px] lg:h-[445px] p-0">
//         <div className="mb-4">
//           <h2 className="text-xl font-bold text-gray-800">Sales Overview</h2>
//           <p className="text-gray-600">This month</p>
//         </div>

//         {/* Summary boxes */}
//         <div className="flex gap-4 mb-6">
//           <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
//             <p className="text-sm text-gray-600">Average Litres Sold</p>
//             <p className="text-lg font-bold text-blue-600">4,324 Litrs</p>
//           </div>
//           <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
//             <p className="text-sm text-gray-600">Average Sale Value</p>
//             <p className="text-lg font-bold text-orange-500">₦120,000</p>
//           </div>
//         </div>

//         <ResponsiveContainer width="100%" height={250}>
//           <LineChart
//             data={salesData}
//             margin={{
//               top: 5,
//               right: 30,
//               left: 20,
//               bottom: 5,
//             }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//             <XAxis
//               dataKey="month"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: "#666" }}
//             />
//             <YAxis
//               yAxisId="left"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: "#666" }}
//             />
//             <YAxis
//               yAxisId="right"
//               orientation="right"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: "#666" }}
//             />
//             <Tooltip content={<CustomTooltip />} />
//             <Legend />

//             {/* Dashed blue line for litres sold */}
//             <Line
//               yAxisId="left"
//               type="monotone"
//               dataKey="litresSold"
//               stroke="#3b82f6"
//               strokeWidth={2}
//               strokeDasharray="5 5"
//               dot={{ fill: "#3b82f6", r: 4 }}
//               activeDot={{ r: 6 }}
//               name="Average Litres Sold"
//             />

//             {/* Solid orange line for sale value */}
//             <Line
//               yAxisId="right"
//               type="monotone"
//               dataKey="saleValue"
//               stroke="#f97316"
//               strokeWidth={2}
//               dot={{ fill: "#f97316", r: 4 }}
//               activeDot={{ r: 6 }}
//               name="Average Sale Value"
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </DisplayCard>
//   );
// }


import { useEffect, useMemo } from "react";
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
import { useSalesOverview } from "@/store/useAttendantDashboardStore";

// Custom tooltip to format data nicely
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
  const { salesOverview, isLoading, error, fetchSalesOverview } = useSalesOverview();

  useEffect(() => {
    fetchSalesOverview();
  }, [fetchSalesOverview]);

  // Transform API data to match chart format
  const chartData = useMemo(() => {
    if (!salesOverview || salesOverview.length === 0) {
      return [];
    }

    return salesOverview.map(item => ({
      month: item.month,
      litresSold: item.averageLitresSold,
      saleValue: item.averageSaleValue,
    }));
  }, [salesOverview]);

  // Calculate averages for summary boxes
  const averages = useMemo(() => {
    if (chartData.length === 0) {
      return { litres: 0, sales: 0 };
    }

    const totalLitres = chartData.reduce((sum, item) => sum + item.litresSold, 0);
    const totalSales = chartData.reduce((sum, item) => sum + item.saleValue, 0);

    return {
      litres: Math.round(totalLitres / chartData.length),
      sales: Math.round(totalSales / chartData.length),
    };
  }, [chartData]);

  return (
    <DisplayCard>
      <div className="w-full h-[460px] lg:h-[445px] p-0">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sales Overview</h2>
          <p className="text-gray-600">Last 12 months</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading chart data...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
            <button 
              onClick={fetchSalesOverview}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Chart with Data */}
        {!isLoading && !error && chartData.length > 0 && (
          <>
            {/* Summary boxes */}
            <div className="flex gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Average Litres Sold</p>
                <p className="text-lg font-bold text-blue-600">
                  {averages.litres.toLocaleString()} Ltrs
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                <p className="text-sm text-gray-600">Average Sale Value</p>
                <p className="text-lg font-bold text-orange-500">
                  ₦{averages.sales.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={chartData}
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
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg 
              className="w-12 h-12 mb-3 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <p className="text-sm">No sales data available</p>
          </div>
        )}
      </div>
    </DisplayCard>
  );
}

import { useEffect } from "react";
import DisplayCard from "./DisplayCard";
import { CircleFadingArrowUp, CircleGauge, TrendingUp } from "lucide-react";
import FlashCard from "./FlashCard";
import { TbTargetArrow } from "react-icons/tb";
import { Progress } from "./Progress";
import { useAttendantDashboard } from "@/store/useAttendantDashboardStore";

export default function SalesSummary() {
  const { dashboardData, isLoading, error, fetchDashboard } = useAttendantDashboard();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Format currency
  const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return `₦${value.toLocaleString()}`;
    }
    return value;
  };

  // Transform API data to component format
  const data = dashboardData ? [
    {
      id: 1,
      name: "Total Sales",
      icon: "₦",
      period: dashboardData.totalSales.period,
      variable: formatCurrency(dashboardData.totalSales.value),
      trend: parseFloat(dashboardData.totalSales.growth?.replace(/[^0-9.-]/g, '') || 0),
      growthText: dashboardData.totalSales.growthText,
    },
    {
      id: 2,
      name: "Litres Sold",
      icon: <CircleGauge />,
      period: dashboardData.litresSold.period,
      variable: dashboardData.litresSold.value,
      trend: parseFloat(dashboardData.litresSold.growth?.replace(/[^0-9.-]/g, '') || 0),
      growthText: dashboardData.litresSold.growthText,
    },
    {
      id: 3,
      name: "Total Transaction",
      icon: <TrendingUp />,
      period: dashboardData.totalTransaction.period,
      variable: dashboardData.totalTransaction.value.toString(),
      trend: parseFloat(dashboardData.totalTransaction.growth?.replace(/[^0-9.-]/g, '') || 0),
      growthText: dashboardData.totalTransaction.growthText,
    },
    {
      id: 4,
      name: "Shifts Completed",
      icon: <CircleFadingArrowUp />,
      period: dashboardData.shiftsCompleted.period,
      variable: `${dashboardData.shiftsCompleted.current}/${dashboardData.shiftsCompleted.target}`,
      trend: null, // No trend for shifts
    },
    {
      id: 5,
      name: "Sales Target",
      icon: <TbTargetArrow />,
      period: <Progress 
        current={dashboardData.salesTarget.current} 
        target={dashboardData.salesTarget.target}
        status={dashboardData.salesTarget.status}
      />,
      salesTargetData: dashboardData.salesTarget, // Pass full data for custom rendering
    },
  ] : [
    // Fallback data while loading or on error
    {
      id: 1,
      name: "Total Sales",
      icon: "₦",
      period: "This week",
      variable: "₦0",
      trend: 0,
    },
    {
      id: 2,
      name: "Litres Sold",
      icon: <CircleGauge />,
      period: "This week",
      variable: "0Ltrs",
      trend: 0,
    },
    {
      id: 3,
      name: "Total Transaction",
      icon: <TrendingUp />,
      period: "This week",
      variable: "0",
      trend: 0,
    },
    {
      id: 4,
      name: "Shifts Completed",
      icon: <CircleFadingArrowUp />,
      period: "For this quarter",
      variable: "0/0",
      trend: null,
    },
    {
      id: 5,
      name: "Sales Target",
      icon: <TbTargetArrow />,
      period: <Progress current={0} target={0} status="In Progress" />,
    },
  ];

  return (
    <DisplayCard>
      <h2 className="text-xl mb-2 font-semibold">Dashboard</h2>
      <h4 className="text-sm font-semibold mb-6">Shift and sales summary</h4>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </p>
          <button 
            onClick={fetchDashboard}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Dashboard Cards */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
            {data.slice(0, 3).map((item) => (
              <FlashCard key={item.id} {...item} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            {data.slice(3).map((item) => (
              <FlashCard key={item.id} {...item} />
            ))}
          </div>
        </>
      )}
    </DisplayCard>
  );
}
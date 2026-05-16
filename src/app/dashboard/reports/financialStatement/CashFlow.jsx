import { useState, useEffect } from "react";
import MyStatCard from "@/components/MyStatCard";
import ReportPage from "../cashflow-charts/ReportPage";
import { TrendingDown, TrendingUp } from "lucide-react";
import { TbCurrencyNaira } from "react-icons/tb";
import useAccountantStore from "@/store/useAccountantStore";

export default function CashFlow() {
  const {
    cashflow,
    loading,
    errors,
    fetchCashflow,
  } = useAccountantStore();

  const [duration, setDuration] = useState("today");

  // Fetch initial data
  useEffect(() => {
    fetchCashflow(duration);
  }, [fetchCashflow, duration]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0";
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (!value && value !== 0) return "0.0";
    return Number(value).toFixed(1);
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Prepare card data from API - always show structure, use 0 if no data
  const getCashFlowCardData = () => {
    // Calculate changes if comparison data exists
    const inflowChange = cashflow?.comparison?.totalInflow 
      ? calculateChange(cashflow.totalInflow, cashflow.comparison.totalInflow)
      : 0;
    
    const outflowChange = cashflow?.comparison?.totalOutflow 
      ? calculateChange(cashflow.totalOutflow, cashflow.comparison.totalOutflow)
      : 0;
    
    const netCashflowChange = cashflow?.comparison?.netCashflow 
      ? calculateChange(cashflow.netCashflow, cashflow.comparison.netCashflow)
      : 0;

    return [
      {
        title: "Total Inflow",
        date: duration === "today" ? "Today" : duration === "thisweek" ? "This Week" : "This Month",
        amount: `₦${formatCurrency(cashflow?.totalInflow || 0)}`,
        change: `${formatPercentage(Math.abs(inflowChange))}%`,
        changeText: "This month",
        trend: inflowChange >= 0 
          ? <TrendingUp size={20} /> 
          : <TrendingDown size={20} className="text-red-600" />,
        icon: <TbCurrencyNaira className="text-neutral-800 text-lg" />,
        isPositive: inflowChange >= 0,
      },
      {
        title: "Total Outflow",
        date: duration === "today" ? "Today" : duration === "thisweek" ? "This Week" : "This Month",
        amount: `₦${formatCurrency(cashflow?.totalOutflow || 0)}`,
        change: `${formatPercentage(Math.abs(outflowChange))}%`,
        changeText: "This month",
        trend: outflowChange >= 0
          ? <TrendingUp size={20} className="text-red-600" />
          : <TrendingDown size={20} />,
        icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
        isPositive: outflowChange < 0, // For outflow, decrease is positive
      },
      {
        title: "Net Cashflow",
        date: duration === "today" ? "This month" : "This Period",
        amount: `₦${formatCurrency(cashflow?.netCashflow || 0)}`,
        change: `${formatPercentage(Math.abs(netCashflowChange))}%`,
        changeText: "From last month",
        trend: netCashflowChange >= 0
          ? <TrendingUp size={20} />
          : <TrendingDown size={20} className="text-red-600" />,
        icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
        isPositive: netCashflowChange >= 0,
      },
    ];
  };

  const cashFlowCardData = getCashFlowCardData();

  // Loading state
  if (loading.cashflow && !cashflow) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white rounded-xl p-5 animate-pulse border border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-2 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading cashflow data…</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.cashflow) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cashFlowCardData.map((item, index) => (
            <MyStatCard key={index} title={item.title} date={item.date} amount={item.amount}
              change={item.change} changeText={item.changeText} trend={item.trend} icon={item.icon} />
          ))}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">{errors.cashflow}</p>
          <button onClick={() => fetchCashflow(duration)}
            className="shrink-0 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Duration selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "today",     label: "Today"      },
          { value: "thisweek",  label: "This Week"  },
          { value: "thismonth", label: "This Month" },
        ].map((d) => (
          <button
            key={d.value}
            onClick={() => setDuration(d.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              duration === d.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Cashflow cards — 1 col on mobile, 3 on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cashFlowCardData.map((item, index) => (
          <MyStatCard
            key={index}
            title={item.title}
            date={item.date}
            amount={item.amount}
            change={item.change}
            changeText={item.changeText}
            trend={item.trend}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Charts section */}
      <ReportPage cashflowData={cashflow} />
    </div>
  );
}

// import MyStatCard from "@/components/MyStatCard";
// import { cashFlowCardData } from "./cashFlowCardData";
// import ReportPage from "../cashflow-charts/ReportPage";

// export default function CashFlow() {
//   return (
//     <div>
//       <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
//         {cashFlowCardData.map((item, index) => (
//           <MyStatCard
//             key={index}
//             title={item.title}
//             date={item.date}
//             amount={item.amount}
//             change={item.change}
//             changeText={item.changeText}
//             trend={item.trend}
//             icon={item.icon}
//           />
//         ))}
//       </div>

//         <ReportPage/>
//     </div>
//   );
// }

"use client";

// import DisplayCard from "./DisplayCard";
import dynamic from "next/dynamic";
import SalesSummary from "./SalesSummary";
import DailyLiveSales from "./DailyLiveSales";

const SalesChart = dynamic(() => import("../Dashboard/SalesOverviewChart"), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
});

export default function MainContainer() {
  return (
    <div className="overflow-x-hidden">
      <h1 className="text-[23px] font-semibold">Welcome, Oboh ThankGod</h1>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 w-full gap-3 ">
        <div className="col-span-1 lg:col-span-2">
          <SalesSummary />
        </div>
        <div className="col-span-1 lg:col-span-1">
          <SalesChart />
        </div>
        <div className="col-span-1 lg:col-span-1">
        <DailyLiveSales />
        </div>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import SalesSummary from "./SalesSummary";
import DailyLiveSales from "./DailyLiveSales";
import { useState, useEffect } from "react";

const SalesChart = dynamic(() => import("../Dashboard/SalesOverviewChart"), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
});

export default function MainContainer() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const userData = JSON.parse(userString);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // Create full name
  const fullName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.lastName || "User";

  return (
    <div className="overflow-x-hidden">
      <h1 className="text-[23px] font-semibold">
        Welcome, {fullName}
      </h1>
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
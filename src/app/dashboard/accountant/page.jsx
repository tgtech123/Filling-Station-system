"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { useState, useEffect } from "react";
import { samplePerformanceData, shiftSalesData } from "./accountantData";
import SalesExpensesChart from "./SalesExpensesChart";
export default function AccountantDashboard() {
  const [userData, setUserData] = useState(null);
    const [performanceTimeFilter, setPerformanceTimeFilter] = useState('This month');

  useEffect(() => {
    const getUserData = () => {
      try {
        const userString = localStorage.getItem("user");
        if (userString) {
          const parsedUser = JSON.parse(userString);
          setUserData(parsedUser);
        }
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
      }
    };

    getUserData();
  }, []);
  const fullName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData?.firstName || userData?.lastName || "User";

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold">Welcome {fullName}</h2>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="col-span-1 lg:col-span-2">

        <DisplayCard>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <h4>Shift and sales summary</h4>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {shiftSalesData.map((item) => (
              <FlashCard key={item.id} {...item} />
            ))}
          </div>
        </DisplayCard>
        </div>

        <DisplayCard>
          <SalesExpensesChart data={samplePerformanceData} timeFilter={performanceTimeFilter} onTimeFilterChange={setPerformanceTimeFilter}  />
        </DisplayCard>
      </div>
    </DashboardLayout>
  );
}

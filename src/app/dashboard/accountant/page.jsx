

"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { useState, useEffect } from "react";
import { samplePerformanceData, getDashboardFlashCards } from "./accountantData";
import SalesExpensesChart from "./SalesExpensesChart";
import ProductSalesOverviewChart from "./ProductSalesOverviewChart";
import AuditReconciledSales from "./AuditedReconciledSales";
import useAccountantStore from "@/store/useAccountantStore";
export default function AccountantDashboard() {
  const [userData, setUserData] = useState(null);
  const [performanceTimeFilter, setPerformanceTimeFilter] = useState('This month');
  
  // Get dashboard data from accountant store
  const { dashboard, loading, fetchDashboard } = useAccountantStore();

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
    fetchDashboard('today');
  }, [fetchDashboard]);

  const fullName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData?.firstName || userData?.lastName || "User";

  // Get dynamic dashboard flash cards
  const dashboardFlashCards = getDashboardFlashCards(dashboard);

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold">Welcome {fullName}</h2>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="col-span-1 lg:col-span-2">
          {/* Shift and Sales */}
          <DisplayCard>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <h4>Shift and sales summary</h4>
              </div>
              {loading.dashboard && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-4">
              {dashboardFlashCards.map((item) => (
                <FlashCard key={item.id} {...item} />
              ))}
            </div>
          </DisplayCard>
        </div>
        
        {/* Sales Expenses Chart */}
        <DisplayCard>
          <SalesExpensesChart 
            data={dashboard?.salesVsExpenseTrend || []} 
            loading={loading.dashboard}
          />
        </DisplayCard>
        
        {/* Product Sales Overview */}
        <DisplayCard>
          <ProductSalesOverviewChart
          data={dashboard?.productSalesOverview || []}
          loading={loading.dashboard}
          />
        </DisplayCard>

        <div className="col-span-1 lg:col-span-2">
          <DisplayCard>
            <AuditReconciledSales />
          </DisplayCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
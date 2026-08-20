

"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
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

  /**
   * Sales reach the accountant as they happen, not on the next reload.
   *
   * This page fetched once on mount and never again, behind a five minute
   * cache, so someone with the books open could watch a busy afternoon and see
   * nothing move. The person answerable for the money should not be the last to
   * know what came in.
   *
   * The server already announces every sale on "dashboard:refresh": lubricant
   * and store at the till, bulk gas on dispense, cylinders, shift close,
   * reconciliation and deliveries. The manager dashboard listened; this one did
   * not. `force` skips the cache, because the event IS the server saying the
   * figures just changed.
   */
  useSocket({
    "dashboard:refresh": () => fetchDashboard('today', true),
    "shift:ended":       () => fetchDashboard('today', true),
  });

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

            {/* Five across at lg gave each card ~190px, so the label and the
                icon collided. Now 3 across at lg (3 + 2 rows) and only 5 on a
                genuinely wide screen. */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
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
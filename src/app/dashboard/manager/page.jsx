'use client'

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import QuickActionsCard from "@/components/Dashboard/QuickActionsCard";
import LiveIndicator from "@/components/LiveIndicator";
import { GoHistory } from "react-icons/go";
import { CheckCheck, Plus, TriangleAlert, Wrench } from "lucide-react";
import useDashboardStore from "@/store/useDashboardStore";
import { reportType, recentActivityData } from "./managerData";

export default function ManagerDashboard() {
  const [userData, setUserData] = useState(null);

  const {tankStatus, metrics, loading, fetchTankStatus, fetchDashboardData, errors } = useDashboardStore();

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        setUserData(JSON.parse(userString));
      }
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
    }

    const token = localStorage.getItem("token");
    if (token) fetchDashboardData(token);
  }, [fetchDashboardData]);

  const fullName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData?.firstName || userData?.lastName || "User";

  if (loading.metrics) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen text-blue-600 font-semibold">
          Loading dashboard metrics...
        </div>
      </DashboardLayout>
    );
  }

  if (errors.metrics) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
          ⚠️ {errors.metrics}
        </div>
      </DashboardLayout>
    );
  }

  const data = metrics?.metrics || {};

  return (
    <DashboardLayout>
      <div className="mt-3">
        {/* Header Section */}
        <DisplayCard>
          <h2 className="text-2xl font-semibold">Welcome back, {fullName}</h2>
          <p>
            Monitor your filling station operations, manage inventory, and track
            performance all in one place.
          </p>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <FlashCard
              name="Total Revenue"
              variable="₦"
              period="Today"
              number={data.totalRevenueToday?.toLocaleString() || "0"}
            />
            <FlashCard
              name="Fuel Revenue"
              variable="₦"
              period="Today"
              number={data.fuelRevenueToday?.toLocaleString() || "0"}
            />
            <FlashCard
              name="Lubricant Revenue"
              variable="₦"
              period="Today"
              number={data.lubricantRevenueToday?.toLocaleString() || "0"}
            />
            <FlashCard
              name="Fuel Dispensed"
              variable={`${data.totalFuelDispensedToday?.toFixed(2) || "0"} L`}
              period="Today"
            />
          </div>
        </DisplayCard>

        {/* Quick Actions */}
        <div className="mt-10">
          <DisplayCard>
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <p>Perform overall operations in one click</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {reportType.map((item) => (
                <QuickActionsCard key={item.id} {...item} />
              ))}
            </div>
          </DisplayCard>
        </div>

        {/* Recent Activity and Current Product Levels */}
        <div className="mt-10">
          <DisplayCard>
            <div className="w-full gap-4 flex flex-col lg:flex-row items-start">
              {/* Recent activity */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <GoHistory size={23} className="mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Recent Activity</h3>
                      <p className="text-sm">
                        Recent activities ongoing in your station
                      </p>
                    </div>
                  </div>
                  <LiveIndicator />
                </div>

                <section className="mt-6">
                  {recentActivityData.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col lg:flex-row mb-4 items-start lg:justify-between lg:items-center"
                    >
                      <div className="flex gap-2">
                        <div className="mt-1">
                          {item.category === "alert" ? (
                            <TriangleAlert className="text-[#ff1f1f]" size={20} />
                          ) : item.category === "shiftComplete" ? (
                            <CheckCheck className="text-[#7f27ff]" size={20} />
                          ) : item.category === "maintenance" ? (
                            <Wrench className="text-[#e27d00]" size={20} />
                          ) : (
                            <Plus className="text-[#04910c]" size={20} />
                          )}
                        </div>
                        <div>
                          <h5
                            className={`text-md font-semibold ${
                              item.category === "alert"
                                ? "text-[#ff1f1f]"
                                : item.category === "shiftComplete"
                                ? "text-[#7f27ff]"
                                : item.category === "maintenance"
                                ? "text-[#e27d00]"
                                : "text-[#04910c]"
                            }`}
                          >
                            {item.activity}
                          </h5>
                          <p className="text-sm font-semibold text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm ml-8 lg:ml-0 text-gray-600">
                        {item.time}
                      </p>
                    </div>
                  ))}
                </section>
              </div>

              {/* Product levels */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold">Product Levels</h3>
                  <p className="text-sm">Current storage status</p>
                </div>

                <div className="flex flex-col">
                  {loading.tankStatus ? (
                    <p className="text-gray-500">Loading tank levels...</p>
                  ) : errors.tankStatus ? (
                    <p className="text-red-500">{errors.tankStatus}</p>
                  ) : tankStatus?.tanks?.length > 0 ? (
                    tankStatus.tanks.map((tank, index) => {
                      const color =
                        tank.percentFilled >= 80
                          ? "#7f27ff"
                          : tank.percentFilled >= 60
                          ? "#7f27ff"
                          : tank.percentFilled >= 30
                          ? "#e27d00"
                          : tank.percentFilled >= 20
                          ? "#eb2b0b"
                          : "#e27d00";

                      return (
                        <div className="mb-5" key={tank._id || `tank-${index}`}>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm text-gray-600 font-semibold">
                              {tank.fuelType}
                            </p>
                            <p className="text-sm text-gray-400">
                              {tank.currentQuantity?.toLocaleString() || 0}/{tank.limit?.toLocaleString() || 0} Litres
                            </p>
                          </div>
                          <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                            <div
                              style={{
                                width: `${tank.percentFilled || 0}%`,
                                background: color,
                              }}
                              className="relative h-6 rounded-[30px]"
                            >
                              <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No tanks available</p>
                  )}
                </div>
              </div>
            </div>
          </DisplayCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
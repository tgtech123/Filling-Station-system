'use client'

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import QuickActionsCard from "@/components/Dashboard/QuickActionsCard";
import LiveIndicator from "@/components/LiveIndicator";
import { GoHistory } from "react-icons/go";
import { CheckCheck, Plus, TriangleAlert, Wrench, History, AlertCircle, XCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useDashboardStore from "@/store/useDashboardStore";
import useActivityFeedStore from "@/store/useActivityFeedStore";
import usePaymentStore from "@/store/usePaymentStore";
import { reportType } from "./managerData";

function SubscriptionBanner() {
  const [dismissed, setDismissed] = useState(false);

  const expiryDate = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.subscriptionExpiry || user.planExpiry || "2026-06-12";
    } catch {
      return "2026-06-12";
    }
  })();

  const daysLeft = Math.floor(
    (new Date(expiryDate).getTime() - Date.now()) / 86400000
  );

  if (dismissed || daysLeft > 30) return null;

  const expired = daysLeft <= 0;
  const formattedDate = new Date(expiryDate).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 mb-4 border-l-4 transition-all duration-300 ${
        expired
          ? "bg-red-50 border-l-red-500"
          : "bg-amber-50 border-l-orange-400"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {expired
          ? <XCircle size={20} className="text-red-500 shrink-0" />
          : <AlertCircle size={20} className="text-orange-500 shrink-0" />
        }
        <p className={`text-sm font-medium truncate ${expired ? "text-red-700" : "text-amber-800"}`}>
          {expired
            ? <>Subscription plan expired. <span className="font-semibold">"View-only"</span> in Free plan.</>
            : <>Your Plus Monthly Plan expires <span className="font-semibold">{formattedDate}</span>. Renew subscription to continue enjoying benefits.</>
          }
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/dashboard/system-settings"
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors ${
            expired ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {expired ? "Upgrade Plan" : "Renew Subscription"}
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className={`cursor-pointer p-1 rounded-md transition-colors ${
            expired ? "text-red-400 hover:bg-red-100" : "text-orange-400 hover:bg-orange-100"
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function relativeTime(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ManagerDashboard() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const { tankStatus, metrics, loading, fetchDashboardData, errors } = useDashboardStore();
  const { currentPlan, fetchCurrentPlan } = usePaymentStore();
  const {
    activities,
    loading: activityLoading,
    errors: activityErrors,
    fetchActivity,
    startPolling,
    stopPolling,
  } = useActivityFeedStore();

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
    if (token) {
      fetchCurrentPlan();
      fetchDashboardData(token);
      const dashboardInterval = setInterval(() => {
        fetchDashboardData(token);
      }, 600000);
      fetchActivity().then(() => startPolling());
      return () => {
        clearInterval(dashboardInterval);
        stopPolling();
      };
    }

    return () => stopPolling();
  }, [fetchDashboardData, fetchActivity, startPolling, stopPolling]);

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
        <SubscriptionBanner />
        {/* Header Section */}
        <DisplayCard>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-2xl font-semibold">Welcome back, {fullName}</h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  currentPlan?.plan === "free"
                    ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    : currentPlan?.plan === "pro"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : currentPlan?.plan === "pro-max"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {currentPlan?.planName || "Free Plan"}
              </span>
              {(!currentPlan || currentPlan?.plan === "free") && (
                <button
                  onClick={() => router.push("/pricing")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Upgrade ↑
                </button>
              )}
              {currentPlan?.daysRemaining !== null &&
                currentPlan?.daysRemaining !== undefined &&
                currentPlan?.daysRemaining <= 7 && (
                  <span className="text-xs text-red-500 font-medium">
                    Expires in {currentPlan.daysRemaining} days
                  </span>
                )}
            </div>
          </div>
          <p>
            Monitor your filling station operations, manage inventory, and track
            performance all in one place.
          </p>

          <div className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <FlashCard
              name="Revenue Generated"
              variable="₦"
              period="Today"
              number={data.revenueGeneratedToday?.toLocaleString() || "0"}
            />
            <FlashCard
              name="Active Staff"
              period="Available for work"
              number={`${data.activeStaff?.active || 0}/${data.activeStaff?.total || 0}`}
            />
            <FlashCard
              name="Active Pump"
              period={`${data.activePumps?.underMaintenance || 0} Under maintenance`}
              number={`${data.activePumps?.active || 0}/${data.activePumps?.total || 0}`}
            />
            <FlashCard
              name="Fuel Dispensed Today"
              period="Across all fuel types"
              number={`${data.fuelDispensedToday?.toFixed(0) || "0"} Litres`}
            />
          </div>
        </DisplayCard>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-10">
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
        <div className="mt-6 sm:mt-10">
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
                  {activityLoading.activities ? (
                    <p className="text-gray-500">Loading activity...</p>
                  ) : activityErrors.activities ? (
                    <p className="text-red-500">{activityErrors.activities}</p>
                  ) : activities.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activity yet.</p>
                  ) : (
                    activities.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col lg:flex-row mb-4 items-start lg:justify-between lg:items-center"
                      >
                        <div className="flex gap-2">
                          <div className="mt-1">
                            {item.type === "alert" ? (
                              <TriangleAlert className="text-[#ff1f1f]" size={20} />
                            ) : item.type === "sale" ? (
                              <CheckCheck className="text-[#7f27ff]" size={20} />
                            ) : item.type === "maintenance" ? (
                              <Wrench className="text-[#e27d00]" size={20} />
                            ) : (
                              <Plus className="text-[#04910c]" size={20} />
                            )}
                          </div>
                          <div>
                            <h5
                              className={`text-md font-semibold ${
                                item.type === "alert"
                                  ? "text-[#ff1f1f]"
                                  : item.type === "sale"
                                  ? "text-[#7f27ff]"
                                  : item.type === "maintenance"
                                  ? "text-[#e27d00]"
                                  : "text-[#04910c]"
                              }`}
                            >
                              {item.title}
                            </h5>
                            <p className="text-sm font-semibold text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm ml-8 lg:ml-0 text-gray-600">
                          {relativeTime(item.timestamp)}
                        </p>
                      </div>
                    ))
                  )}
                </section>
              </div>

              {/* Product levels */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold flex gap-2">
                    <History size={25} />
                    Current Product Levels
                  </h3>
                  <p className="text-sm">Current storage status</p>
                </div>

                <div className="flex flex-col">
                  {loading.tankStatus ? (
                    <p className="text-gray-500">Loading tank levels...</p>
                  ) : errors.tankStatus ? (
                    <p className="text-red-500">{errors.tankStatus}</p>
                  ) : tankStatus?.tanks?.length > 0 ? (
                    tankStatus.tanks.map((tank) => {
                      const fuelTypeColors = {
                        PMS: "#7f27ff",
                        AGO: "#1a71f6",
                        Diesel: "#e27d00",
                        Gas: "#eb2b0b",
                        Kerosene: "#04910c",
                      };
                      const color = fuelTypeColors[tank.fuelType] || "#7f27ff";

                      return (
                        <div key={tank.fuelType} className="mb-5">
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
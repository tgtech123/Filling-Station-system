"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { useEffect, useState } from "react";

import { reportType, quickStat } from "./managerData";
import QuickActionsCard from "@/components/Dashboard/QuickActionsCard";
import { GoHistory } from "react-icons/go";

export default function ManagerDashboard() {
  const [userData, setUserData] = useState(null);

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
      <div className="mt-3">
        {/* Header Section */}
        <DisplayCard>
          <h2 className="text-2xl font-semibold">Welcome back, {fullName}</h2>
          <p>
            Monitor your filling station operations, manage inventory and track
            performance all in one place.
          </p>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {quickStat.map((item) => (
              <FlashCard key={item.id} {...item} />
            ))}
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
        <div className="mt-10 ">
          <DisplayCard>
            <div className="w-full gap-4 flex flex-col lg:flex-row items-start">
              {/* Recent activity */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">
                <GoHistory />
                <h3>Recent Activity</h3>
              </div>

              {/* current product levels */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">Hi</div>
            </div>
          </DisplayCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

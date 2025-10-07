"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { useEffect, useState } from "react";

import { reportType, quickStat, recentActivityData } from "./managerData";
import QuickActionsCard from "@/components/Dashboard/QuickActionsCard";
import { GoHistory } from "react-icons/go";
import LiveIndicator from "@/components/LiveIndicator";
import { CheckCheck, Plus, TriangleAlert, Wrench } from "lucide-react";

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

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="mt-1">
                      <GoHistory size={23} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Recent Activity</h3>
                      <p className="text-sm">
                        Recent activities ongoing in your station
                      </p>
                    </div>
                  </div>
                  <div>
                    <LiveIndicator />
                  </div>
                </div>

                {/* Table */}
                <section className="mt-6">
                  {recentActivityData.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col lg:flex-row mb-4 items-start lg:justify-between lg:items-center"
                    >
                      <div className="flex gap-2">
                        <div className="mt-1">
                          {item.category === "alert" ? (
                            <TriangleAlert
                              className="text-[#ff1f1f]"
                              size={20}
                            />
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
                      <div>
                        <p className="text-sm ml-8 lg:ml-0 text-gray-600">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </section>
              </div>

              {/* current product levels */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <p className="text-sm">
                    Recent activities ongoing in your station
                  </p>
                </div>

                <div className="flex flex-col">
                  {/* Progress */}
                  <div className="mb-5">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-gray-600 font-semibold">PMS</p>
                      <p className="text-sm text-gray-400">8,000/10,000 Litres</p>
                    </div>
                    <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                      <div
                        style={{ width: "90%" }}
                        className={`relative h-6 rounded-[30px] bg-[#7f27ff]`}
                      >
                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-600">
                        AGO
                      </p>
                      <p className="text-sm text-gray-400">8,000/10,000 Litres</p>
                    </div>
                    <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                      <div
                        style={{ width: "90%" }}
                        className={`relative h-6 rounded-[30px] bg-[#7f27ff]`}
                      >
                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-gray-600">
                        Diesel
                      </p>
                      <p className="text-sm text-gray-400">250/10,000 Litres</p>
                    </div>
                    <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                      <div
                        style={{ width: "50%" }}
                        className={`relative h-6 rounded-[30px] bg-[#e27d00]`}
                      >
                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-gray-600">Gas</p>
                      <p className="text-sm text-gray-400">3,000/10,000 Litres</p>
                    </div>
                    <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                      <div
                        style={{ width: "30%" }}
                        className={`relative h-6 rounded-[30px] bg-[#eb2b0b]`}
                      >
                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm text-gray-600">
                        Kerosene
                      </p>
                      <p className="text-sm text-gray-400">5,000/10,000 Litres</p>
                    </div>
                    <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                      <div
                        style={{ width: "50%" }}
                        className={`relative h-6 rounded-[30px] bg-[#e27d00]`}
                      >
                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </DisplayCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

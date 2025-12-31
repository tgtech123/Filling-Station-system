"use client"
import React, { useEffect, useState } from "react";
import MyStatCard from "@/components/MyStatCard";
import LiveSalesAndSchedulePage from "./LiveSalesAndSchedulePage";
import useSupervisorStore from "@/store/useSupervisorStore";
import { supervisorData } from "./supervisorData";

const Dashboard = () => {
  const [userData, setUserData] = useState(false);
  
  // Get dashboard data and actions from Zustand store
  const { 
    dashboard, 
    loading, 
    error, 
    fetchDashboard 
  } = useSupervisorStore();

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

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const fullName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData?.firstName || userData?.lastName || "User";

  // Map API data to stat cards using supervisorData function
  const statCardsData = supervisorData(dashboard);

  // Loading state
  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <p className="text-red-600 font-semibold">Error loading dashboard</p>
          <p className="text-red-500 mt-2">{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold text-lg">Welcome, {fullName}</h1>

      <div className="bg-white rounded-2xl p-5 mt-[1.5rem]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-semibold text-[1.5rem] text-neutral-800 leading-[100%]">
              Dashboard
            </h1>
            <p className="text-[1.125rem] mt-[0.75rem]">
              Real-time monitoring and quick statistics
            </p>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={() => fetchDashboard()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {statCardsData.map((item, index) => (
            <MyStatCard
              key={index}
              title={item.title}
              date={item.date}
              amount={item.amount}
              change={item.change}
              changeText={item.changeText}
              icon={item.icon}
            />
          ))}
        </div>

        {/* Error banner if there's an error but data exists */}
        {error && dashboard && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ Some data may be outdated. {error}
            </p>
          </div>
        )}
      </div>

      <LiveSalesAndSchedulePage 
        liveSalesFeed={dashboard?.liveSalesFeed || []}
        scheduledAttendants={dashboard?.scheduledAttendants || {}}
      />
    </div>
  );
};

export default Dashboard;
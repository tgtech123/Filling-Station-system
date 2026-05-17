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

  // Error / no-data state
  if (error && !dashboard) {
    return (
      <div>
        <h1 className="font-bold text-lg">Welcome, {fullName}</h1>
        <div className="bg-white rounded-2xl p-5 mt-[1.5rem]">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="font-semibold text-xl sm:text-2xl text-neutral-800">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">Real-time monitoring and quick statistics</p>
            </div>
            <button
              onClick={() => fetchDashboard()}
              className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              ↻ Retry
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCardsData.map((item, index) => (
              <MyStatCard key={index} title={item.title} date={item.date} amount={item.amount} change={item.change} changeText={item.changeText} icon={item.icon} />
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">No data yet — data will appear once activity is recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold text-lg">Welcome, {fullName}</h1>

      <div className="bg-white rounded-2xl p-5 mt-[1.5rem]">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="font-semibold text-xl sm:text-2xl text-neutral-800">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Real-time monitoring and quick statistics</p>
          </div>
          <button
            onClick={() => fetchDashboard()}
            disabled={loading}
            className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
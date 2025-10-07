  "use client"
import React, { useEffect, useState } from "react";
import { supervisorData } from "./supervisorData";
import MyStatCard from "@/components/MyStatCard";
import LiveSalesAndSchedulePage from "./LiveSalesAndSchedulePage";

const Dashboard = () => {

  const [userData, setUserData] =useState(false)

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
    <div>
      <h1 className="font-bold text-lg">Welcome, {fullName}</h1>

      <div className="bg-white rounded-2xl p-5 mt-[1.5rem]">
        <h1 className="font-semibold text-[1.5rem] text-neutral-800 leading-[100%]">
          Dashboard
        </h1>
        <p className="text-[1.125rem] mt-[0.75rem]">
          Real-time monitoring and quick statistics
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {supervisorData.map((item, index) => (
           
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
      </div>

      <LiveSalesAndSchedulePage />
    </div>
  );
};

export default Dashboard;

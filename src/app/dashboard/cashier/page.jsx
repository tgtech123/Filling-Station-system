    'use client'
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import MyStatCard from "@/components/MyStatCard";
import { useEffect, useState } from "react";
import cashierCards from "./cashierData";
import DailyAttendantSales from "./DailyAttendantSales";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import { dailyAttendantSalesColumns, dailyAttendantSalesData } from "./dailyAttendantSalesData";


export default function CashierDashboard() {
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
        <DashboardLayout>
            <div className="overflow-x-hidden w-full">
                
                <h1 className="text-[1.25rem] font-semibold">Welcome, {fullName}</h1>
                
                    <div className="bg-white p-5 rounded-2xl mt-[0.75rem] w-full">
                        <h1 className="text-[1.25rem] font-semibold">Dashboard</h1>
                        <p className="mt-[0.5rem] text-[1rem]">Overview of Fuel and lubricant sales</p>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {cashierCards.map((item, index) => {
                                // Handle the special progress card
                                if (item.title === "Sales Target") {
                                const { labelLeft, labelRight, current, target, barColor } = item.amount;
                                const progress = Math.min((current / target) * 100, 100);

                                return (
                                    <div
                                    key={index}
                                    className="bg-white rounded-2xl  p-4 flex flex-col justify-between border border-gray-100"
                                    >
                                    <h2 className="text-sm text-center font-semibold text-gray-600">{item.title}</h2>

                                    <div className=" space-y-2">
                                        <div className="flex justify-between text-xs text-gray-500">
                                        <span>{labelLeft}</span>
                                        <span>{labelRight}</span>
                                        </div>

                                        <div className="w-full relative bg-gray-100 rounded-full h-4">
                                            <span className=" absolute top-[-9px] right-12 w-8 h-8 bg-neutral-300 rounded-full"></span>
                                        <div
                                            className={`${barColor} h-4 rounded-full transition-all duration-500`}
                                            style={{ width: `${progress}%` }}
                                        >
                                            
                                        </div>
                                        </div>

                                        <p className="text-xs text-gray-500 text-right mt-1">
                                        {progress.toFixed(1)}% completed
                                        </p>
                                    </div>
                                    </div>
                                );
                                }

                                // Handle normal stat cards
                                return (
                                <MyStatCard
                                    key={index}
                                    title={item.title}
                                    date={item.date}
                                    amount={item.amount}
                                    changeText={item.changeText}
                                    icon={item.icon}
                                    trend={item.trend}
                                    className="h-[9.5rem]"
                                />
                                );
                            })}
                        </div>

                    </div>
               
               
                
                <DailyAttendantSales />
                
                

            </div>
        </DashboardLayout>
    )
}
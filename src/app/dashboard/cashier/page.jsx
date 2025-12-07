//     'use client'
// import DashboardLayout from "@/components/Dashboard/DashboardLayout";
// import MyStatCard from "@/components/MyStatCard";
// import { useEffect, useState } from "react";
// import cashierCards from "./cashierData";
// import DailyAttendantSales from "./DailyAttendantSales";
// import DisplayCard from "@/components/Dashboard/DisplayCard";
// import TableWithoutBorder from "@/components/TableWithoutBorder";
// import { dailyAttendantSalesColumns, dailyAttendantSalesData } from "./dailyAttendantSalesData";


// export default function CashierDashboard() {
//     const [userData, setUserData] =useState(false)

//    useEffect(() => {
//   const getUserData = () => {
//     try {
//       const userString = localStorage.getItem("user");
//       if (userString) {
//         const parsedUser = JSON.parse(userString);
//         setUserData(parsedUser);
//       }
//     } catch (error) {
//       console.error("❌ Error parsing user data:", error);
//     }
//   };

//   getUserData();
// }, []);

// const fullName =
//   userData?.firstName && userData?.lastName
//     ? `${userData.firstName} ${userData.lastName}`
//     : userData?.firstName || userData?.lastName || "User";

//     return (
//         <DashboardLayout>
//             <div className="overflow-x-hidden w-full">
                
//                 <h1 className="text-[1.25rem] font-semibold">Welcome, {fullName}</h1>
                
//                     <div className="bg-white p-5 rounded-2xl mt-[0.75rem] w-full">
//                         <h1 className="text-[1.25rem] font-semibold">Dashboard</h1>
//                         <p className="mt-[0.5rem] text-[1rem]">Overview of Fuel and lubricant sales</p>

//                         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                             {cashierCards.map((item, index) => {
//                                 // Handle the special progress card
//                                 if (item.title === "Sales Target") {
//                                 const { labelLeft, labelRight, current, target, barColor } = item.amount;
//                                 const progress = Math.min((current / target) * 100, 100);

//                                 return (
//                                     <div
//                                     key={index}
//                                     className="bg-white rounded-2xl  p-4 flex flex-col justify-between border border-gray-100"
//                                     >
//                                     <h2 className="text-sm text-center font-semibold text-gray-600">{item.title}</h2>

//                                     <div className=" space-y-2">
//                                         <div className="flex justify-between text-xs text-gray-500">
//                                         <span>{labelLeft}</span>
//                                         <span>{labelRight}</span>
//                                         </div>

//                                         <div className="w-full relative bg-gray-100 rounded-full h-4">
//                                             <span className=" absolute top-[-9px] right-12 w-8 h-8 bg-neutral-300 rounded-full"></span>
//                                         <div
//                                             className={`${barColor} h-4 rounded-full transition-all duration-500`}
//                                             style={{ width: `${progress}%` }}
//                                         >
                                            
//                                         </div>
//                                         </div>

//                                         <p className="text-xs text-gray-500 text-right mt-1">
//                                         {progress.toFixed(1)}% completed
//                                         </p>
//                                     </div>
//                                     </div>
//                                 );
//                                 }

//                                 // Handle normal stat cards
//                                 return (
//                                 <MyStatCard
//                                     key={index}
//                                     title={item.title}
//                                     date={item.date}
//                                     amount={item.amount}
//                                     changeText={item.changeText}
//                                     icon={item.icon}
//                                     trend={item.trend}
//                                     className="h-[9.5rem]"
//                                 />
//                                 );
//                             })}
//                         </div>

//                     </div>
               
               
                
//                 <DailyAttendantSales />
                
                

//             </div>
//         </DashboardLayout>
//     )
// }

'use client'
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import MyStatCard from "@/components/MyStatCard";
import { useEffect, useState } from "react";
import DailyAttendantSales from "./DailyAttendantSales";
import cashierCards from "./cashierData";
import { useCashierDashboard } from "@/store/useCashierDashboardStore";

export default function CashierDashboard() {
    const [userData, setUserData] = useState(false);
    const { dashboardData, isLoading, error, fetchDashboard } = useCashierDashboard();

    // Fetch user data from localStorage
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

    // Fetch dashboard data from API
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Debug: Log dashboard data when it changes
    useEffect(() => {
        if (dashboardData) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 CASHIER DASHBOARD DATA');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Full Dashboard Data:', dashboardData);
            console.log('\n💰 Reconciled Cash:');
            console.log('  Value:', dashboardData.reconciledCash?.value);
            console.log('  Period:', dashboardData.reconciledCash?.period);
            console.log('  Growth:', dashboardData.reconciledCash?.growth);
            console.log('\n⚠️ Discrepancies:');
            console.log('  Value:', dashboardData.discrepancies?.value);
            console.log('\n🛢️ Lubricant Units:');
            console.log('  Value:', dashboardData.lubricantUnitsSold?.value);
            console.log('\n🎯 Sales Target:');
            console.log('  Current:', dashboardData.salesTarget?.current);
            console.log('  Target:', dashboardData.salesTarget?.target);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
    }, [dashboardData]);

    const fullName =
        userData?.firstName && userData?.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : userData?.firstName || userData?.lastName || "User";

    // Map API data to existing card structure
    const getUpdatedCards = () => {
        if (!dashboardData) return cashierCards;

        return cashierCards.map((card) => {
            switch (card.title) {
                case "Reconciled Cash":
                    return {
                        ...card,
                        amount: `₦${dashboardData.reconciledCash.value.toLocaleString()}`,
                        date: dashboardData.reconciledCash.period,
                        trend: dashboardData.reconciledCash.growth,
                        changeText: dashboardData.reconciledCash.growthText,
                    };

                case "Discrepancies":
                    return {
                        ...card,
                        amount: `₦${dashboardData.discrepancies.value.toLocaleString()}`,
                        date: dashboardData.discrepancies.period,
                    };

                case "Lubricant unit sold":
                    return {
                        ...card,
                        amount: dashboardData.lubricantUnitsSold.value,
                        date: dashboardData.lubricantUnitsSold.period,
                        trend: dashboardData.lubricantUnitsSold.growth,
                        changeText: dashboardData.lubricantUnitsSold.growthText,
                    };

                case "Sales Target":
                    return {
                        ...card,
                        amount: {
                            ...card.amount,
                            current: dashboardData.salesTarget.current,
                            target: dashboardData.salesTarget.target,
                        },
                    };

                default:
                    return card;
            }
        });
    };

    const updatedCards = getUpdatedCards();

    return (
        <DashboardLayout>
            <div className="overflow-x-hidden w-full">
                
                <h1 className="text-[1.25rem] font-semibold">Welcome, {fullName}</h1>
                
                <div className="bg-white p-5 rounded-2xl mt-[0.75rem] w-full">
                    <h1 className="text-[1.25rem] font-semibold">Dashboard</h1>
                    <p className="mt-[0.5rem] text-[1rem]">Overview of Fuel and lubricant sales</p>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <span className="ml-3 text-gray-600">Loading dashboard data...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                            <p className="text-red-800 text-sm">
                                <strong>Error:</strong> {error}
                            </p>
                            <button
                                onClick={fetchDashboard}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Dashboard Cards */}
                    {!isLoading && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {updatedCards.map((item, index) => {
                                // Handle the special progress card (Sales Target)
                                if (item.title === "Sales Target") {
                                    const { labelLeft, labelRight, current, target, barColor } = item.amount;
                                    const progress = Math.min((current / target) * 100, 100);

                                    return (
                                        <div
                                            key={index}
                                            className="bg-white rounded-2xl p-4 flex flex-col justify-between border border-gray-100"
                                        >
                                            <h2 className="text-sm text-center font-semibold text-gray-600">
                                                {item.title}
                                            </h2>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{labelLeft}</span>
                                                    <span>{labelRight}</span>
                                                </div>

                                                <div className="w-full relative bg-gray-100 rounded-full h-4">
                                                    <span className="absolute top-[-9px] right-12 w-8 h-8 bg-neutral-300 rounded-full"></span>
                                                    <div
                                                        className={`${barColor} h-4 rounded-full transition-all duration-500`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>

                                                <p className="text-xs text-gray-500 text-right mt-1">
                                                    {progress.toFixed(1)}% completed
                                                </p>

                                                {/* Show actual amounts */}
                                                <div className="flex justify-between text-xs font-medium text-gray-700 mt-2 pt-2 border-t border-gray-100">
                                                    <span>₦{current.toLocaleString()}</span>
                                                    <span>₦{target.toLocaleString()}</span>
                                                </div>
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
                    )}
                </div>
                
                <DailyAttendantSales />
            </div>
        </DashboardLayout>
    );
}
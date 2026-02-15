'use client'
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getTrendsData } from "./trendsData";
import MyStatCard from "@/components/MyStatCard";
import SalesProfitPage from "./SalesProfitPage";
import PaymentCommissionPage from "./PaymentCommissionPage";
import useTrendsStore from "@/store/useTrendsStore";

export default function Trends() {
    const [trendsData, setTrendsData] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState('thismonth');

    const { 
        kpis, 
        loading, 
        errors, 
        fetchDashboard 
    } = useTrendsStore();

    useEffect(() => {
        fetchDashboard(selectedDuration);
    }, [fetchDashboard, selectedDuration]);

    useEffect(() => {
        if (kpis) {
            const transformedData = getTrendsData(kpis);
            setTrendsData(transformedData);
        } else {
            const emptyData = getTrendsData(null);
            setTrendsData(emptyData);
        }
    }, [kpis]);

    const handleDurationChange = (e) => {
        setSelectedDuration(e.target.value);
    };

    return (
        <DashboardLayout>
            <div>
                <div className="bg-white rounded-2xl w-full p-5">
                    <div className="flex items-center justify-between mb-4">
                        <span>
                            <h1 className="text-[1.5rem] font-semibold mb-[0.75rem]">Trends</h1>
                            <h1 className="text-[1.125rem]">Track sales trends, revenue, and operational metrics</h1>
                        </span>

                        <select
                            value={selectedDuration}
                            onChange={handleDurationChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="today">Today</option>
                            <option value="thisweek">This Week</option>
                            <option value="thismonth">This Month</option>
                            <option value="thisquarter">This Quarter</option>
                            <option value="thisyear">This Year</option>
                        </select>
                    </div>

                    {loading.dashboard ? (
                        <div className="grid lg:grid-cols-4 grid-cols-2 gap-5">
                            {[1, 2, 3, 4].map((index) => (
                                <div key={index} className="bg-white rounded-lg p-6 animate-pulse border">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : errors.dashboard ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">Error: {errors.dashboard}</p>
                            <button
                                onClick={() => fetchDashboard(selectedDuration)}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <span className="grid lg:grid-cols-4 grid-cols-2 gap-5">
                            {trendsData.map((item, i) =>
                                <MyStatCard 
                                    key={i} 
                                    title={item.title} 
                                    date={item.date} 
                                    change={item.change} 
                                    amount={item.amount} 
                                    changeText={item.changeText} 
                                    icon={item.icon} 
                                    trend={item.trend} 
                                />
                            )}
                        </span>
                    )}
                </div>
                    
                <div>
                    <SalesProfitPage />
                </div>
                
                <PaymentCommissionPage />
            </div>
        </DashboardLayout>
    )
}


// import DashboardLayout from "@/components/Dashboard/DashboardLayout";
// import { trendsData } from "./trendsData";
// import MyStatCard from "@/components/MyStatCard";
// import SalesProfitPage from "./SalesProfitPage";
// import PaymentCommissionPage from "./PaymentCommissionPage";

// export default function Trends() {
//     return (
//         <DashboardLayout>
//             <div>
//                 <div className="bg-white rounded-2xl w-full p-5  ">
//                     <div>
//                         <span>
//                             <h1 className="text-[1.5rem] font-semibold mb-[0.75rem]">Trends</h1>
//                             <h1 className="text-[1.125rem]">Track sales trends, revenue, and operational metrics</h1>
//                         </span>
//                     </div>
//                     <span className="grid lg:grid-cols-4 grid-cols-2 gap-5">
//                         {trendsData.map((item, i) =>
//                             <MyStatCard key={i} title={item.title} date={item.date} change={item.change} amount={item.amount} changeText={item.changeText} icon={item.icon} trend={item.trend} />
//                         )}
//                     </span>
//                 </div>
                    
//                 <div>
//                     <SalesProfitPage />
//                 </div>
                
//                     <PaymentCommissionPage />
                
//             </div>
//         </DashboardLayout>
//     )
// }
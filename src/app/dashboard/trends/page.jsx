import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { trendsData } from "./trendsData";
import MyStatCard from "@/components/MyStatCard";
import SalesProfitPage from "./SalesProfitPage";
import PaymentCommissionPage from "./PaymentCommissionPage";

export default function Trends() {
    return (
        <DashboardLayout>
            <div>
                <div className="bg-white rounded-2xl w-full p-5  ">
                    <div>
                        <span>
                            <h1 className="text-[1.5rem] font-semibold mb-[0.75rem]">Trends</h1>
                            <h1 className="text-[1.125rem]">Track sales trends, revenue, and operational metrics</h1>
                        </span>
                    </div>
                    <span className="grid lg:grid-cols-4 grid-cols-2 gap-5">
                        {trendsData.map((item, i) =>
                            <MyStatCard key={i} title={item.title} date={item.date} change={item.change} amount={item.amount} changeText={item.changeText} icon={item.icon} trend={item.trend} />
                        )}
                    </span>
                </div>
                    
                <div>
                    <SalesProfitPage />
                </div>
                
                    <PaymentCommissionPage />
                
            </div>
        </DashboardLayout>
    )
}
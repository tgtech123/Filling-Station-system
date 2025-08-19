import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { Download, ListFilter, TrendingUp, Users } from "lucide-react";
import { TbTargetArrow } from "react-icons/tb";
import StaffPerformanceCard from "./StaffPerfomanceCard";
// import img1 from "/"

export default function staffPerformance() {

    const staffData = [
        {
            id: 1,
            staffImg: "/john-melo-1.png",
            staffName: "John Melo",
            role: "Attendant",
            completedShifts: "50/96",
            salesTargetTrend: "1.5%",
            shiftType: "One Day/Evening",
            LtrsSold: 4536,
            totalSales: "₦2,500,000",
            discrepancy: 3,
            customerRating: "4.6/5/0",
            errorCount: 2,
            efficiencyScore: "93%"
        },
        {
            id: 2,
            staffImg: "/john-melo-2.png",
            staffName: "John Meelo",
            role: "Attendant",
            completedShifts: "50/96",
            salesTargetTrend: "1.5%",
            shiftType: "One Day/Evening",
            LtrsSold: 4536,
            totalSales: "₦2,500,000",
            discrepancy: 4,
            customerRating: "4.4/5/0",
            errorCount: 2,
            efficiencyScore: "95%"
        },
    ]
    return (
        <DashboardLayout>
            <DisplayCard>
                <h2 className="text-2xl font-semibold text-gray-600">Staff Performance Reports</h2>
                <p className="text-gray-600 font-semibold">Comprehensive analytics for staff members</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <FlashCard 
                    name="Active Staff"
                    period="Today"
                    icon={<Users />}
                    variable="7/8"
                    />
                
                <FlashCard
                    name="Total Sales"
                    period="Today"
                    icon="₦"
                    variable="₦2,000,000"
                />
                <FlashCard
                    name="Average Efficiency"   
                    icon={<TbTargetArrow />}
                    variable="98%"
                />
                <FlashCard
                    name="Top Performer"   
                    period="Exceeding all targets"
                    icon={<TrendingUp />}
                    variable="John Melo"
                />
                </div>
            </DisplayCard>

            <div className="my-4">
                <DisplayCard>
                    <header className="flex justify-end gap-4">
                        <button className="cursor-pointer flex items-center gap-2 py-2 px-4 border-2 rounded-[14px] border-gray-300">
                            Filter
                            <ListFilter />
                        </button>

                        <button className="cursor-pointer flex items-center gap-2 py-2 px-6  rounded-[14px] bg-[#0080ff] text-white">
                            Export
                            <Download />
                        </button>
                    </header>
                    
                    <div className="mt-2 flex flex-col gap-4">
                        {staffData.map((item) => (
                            <StaffPerformanceCard 
                                key={item.id}
                                imgName={item.staffImg}
                                name={item.staffName}
                                role={item.role}
                                completedShifts={item.completedShifts}
                                targetTrend={item.salesTargetTrend}
                                shiftType={item.shiftType}
                                ltrsSold={item.LtrsSold}
                                totalSales={item.totalSales}
                                discrepancy={item.discrepancy}
                                customerRating={item.customerRating}
                                errorCount={item.errorCount}
                                efficiencyScore={item.efficiencyScore}
                            />
                        ))}
                    </div>
                    
                </DisplayCard>
            </div>
        </DashboardLayout>
    )
}
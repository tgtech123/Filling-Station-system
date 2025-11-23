    "use client"
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RxTriangleRight } from "react-icons/rx";
import { GoPlus } from "react-icons/go";
import ExpenseCards from "./ExpenseCards";
import ExpensePage from "./ExpensePage";
import { useState } from "react";
import AddExpenseModal from "./AddExpenseModal";

export default function Expenses() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);

    return (
        <DashboardLayout>
            <div>
                <div className="mb-6">
                    <h1 className="text-xl sm:text-lg lg:text-xl text-neutral-700 font-bold mb-2">
                        Reports
                     </h1>
                    <div className="flex flex-wrap items-center gap-1 text-sm sm:text-base">
                                <p className="text-neutral-400 font-medium">Report</p>
                                <RxTriangleRight size={20} className="text-neutral-500" />
                                <p className="text-blue-600 font-semibold">Expenses</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5">
                    <div className="flex justify-between">
                        <span className="text-[#525252] flex flex-col gap-2">
                            <h1 className="text-xl font-bold">Expenses</h1>
                            <p>Approve, record and export all expense logs and report</p>
                        </span>

                        <span >
                            <button onClick={handleOpen} className="border-[1.5px] font-bold cursor-pointer text-neutral-800 border-neutral-300 rounded-xl px-4 py-2 flex gap-2 ">
                               <span className="hidden lg:inline"> Add expense</span>
                                <GoPlus size={27} />
                            </button>
                            <AddExpenseModal isOpen={isModalOpen} onClose={handleClose}/>
                        </span>
                    </div>
                    
                        {/* the cards section */}
                    <div>
                        <ExpenseCards/>
                    </div>
                </div>

                <ExpensePage/>
            </div>
        </DashboardLayout>
    )
}
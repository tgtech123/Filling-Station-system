import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { RxTriangleRight } from "react-icons/rx";
import PaymentHist from "./PaymentHist";

export default function PaymentHistory() {
    return (
        <DashboardLayout>
           <div className="flex flex-col mt-6">
                <h1 className="text-2xl text-neutral-800 font-bold mb-1">Commissions</h1>
                <span className="flex">
                    <p className="text-neutral-400 font-medium">Commission </p>
                    <RxTriangleRight size={28} className="text-neutral-500"/>
                    <p className="text-blue-600 font-semibold">Payment history</p>
                </span>

                {/* pass the search and table below */}
                <div className="bg-white rounded-xl p-4 mt-4 w-full">
                    <span className="flex flex-col gap-1">
                        <h1 className="text-lg font-bold text-neutral-800">Payment History</h1>
                        <p>Staff commission payment history</p>
                    </span>

                    <PaymentHist/>
                </div>
            </div>
        </DashboardLayout>
    )
}
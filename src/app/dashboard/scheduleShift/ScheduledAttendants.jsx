import DisplayCard from "@/components/Dashboard/DisplayCard";
import { User } from "lucide-react";

export default function ScheduledAttendants({title, period, time, assignedAttendants}) {
    return (
        <div className="bg-white border-2 border-[#e7e7e7] p-4 rounded-[14px] text-gray-600">
            <header className="flex justify-between items-end border-b-1 pb-4 border-[#e7e7e7]">
                <div className="flex flex-col gap-2">
                    <h4 className=" font-semibold text-xl">{title}</h4>
                    <p>{period}</p>
                </div>
                <p className="font-medium">{time}</p>
            </header>
            <section>
                <div className="font-semibold mt-6 flex gap-2 items-center">
                    <User />
                    <h5 className="text-lg">Assigned Staff</h5>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                    {console.log("Scheduled attendants data:", JSON.stringify(assignedAttendants?.[0]))}
                    {assignedAttendants.map((attendant, index) => {
                        const name   = typeof attendant === "string" ? attendant : attendant.name;
                        const pumpNo = typeof attendant === "object" ? attendant.pumpNo : null;
                        const status = typeof attendant === "object" ? attendant.status : null;
                        return (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span>{name}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    {pumpNo && <span>Pump {pumpNo}</span>}
                                    {status && (
                                        <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                                            status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : status === "closed"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}>
                                            {status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    )
}
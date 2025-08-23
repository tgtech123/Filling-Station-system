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
                    {assignedAttendants.map((attendant, index) => (
                        <p key={index}>{attendant}</p>
                    ))}
                </div>
            </section>
        </div>
    )
}
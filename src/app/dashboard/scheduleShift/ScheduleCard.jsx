import { Progress } from "@/components/Dashboard/Progress";
import { Button } from "@/components/ui/button";
import { CircleFadingArrowUp, Mail, Phone } from "lucide-react";

export default function ScheduleCard({
  img,
  name,
  onDuty,
  email,
  phone,
  responsibilities,
  shiftSchedule,
  role,
  onOpen,
  
}) {
  return (
    <div className="px-2 lg:px-3 py-4 rounded-[10px] bg-white  border-2 border-[#e7e7e7]">
      {/* first */}
      <div className="flex justify-between items-start pb-6 border-b-1 border-gray-200">
        <div className="flex gap-2 items-center">
          <img src={img} alt="" />
          <div>
            <h4 className="font-semibold text-lg">{name}</h4>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>

        <button
          className={`p-[6px] rounded-[10px] text-sm ${
            onDuty
              ? "bg-[#b2ffb4] text-[#04910c]"
              : "text-gray-700 bg-[#c1bcbc]"
          }`}
        >
          {onDuty ? "On Duty" : "Off Duty"}
        </button>
      </div>

      {/* Second */}
      <div className=" my-4 flex flex-col gap-3 text-sm text-gray-500 font-medium">
        <div className="flex gap-2">
          <CircleFadingArrowUp />
          {shiftSchedule}
        </div>
        <div className="flex gap-2">
          <Phone />
          {phone}
        </div>
        <div className="flex gap-2">
          <Mail />
          {email}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <p>Sales Target</p>
          <p>Monthly</p>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full relative overflow-hidden">
          <div
            className={`h-4 bg-[#0080ff] rounded-full transition-all duration-500`}
            style={{ width: `40%` }}
          ></div>
        </div>
        <div className="flex justify-end text-xs text-gray-700 font-medium">
            ₦120,000/₦350,000
        </div>
      </div>

      {/* Fourth */}
      <div>
        <h5 className="text-gray-600 font-semibold text-sm my-3">Responsibilities</h5>
        <p className="text-gray-600 text-sm">{responsibilities}</p>
      </div>


      <button onClick={onOpen} className="bg-[#0080ff] cursor-pointer hover:bg-[#076dd4] text-white py-2 px-4 rounded-[10px] w-full my-3 text-sm font-medium">Schedule Attendant</button>
    </div>
  );
}

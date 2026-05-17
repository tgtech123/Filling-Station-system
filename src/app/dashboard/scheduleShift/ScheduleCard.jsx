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
  salesTarget,
}) {
  return (
    <div className="px-3 py-4 rounded-[10px] bg-white border-2 border-[#e7e7e7] min-w-0">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b border-gray-200 gap-2">
        <div className="flex gap-2 items-center min-w-0">
          <img
            src={img}
            alt={name}
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
            onError={(e) => { e.target.src = "/default-avatar.png"; }}
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-base truncate">{name}</h4>
            <p className="text-xs text-gray-500 truncate">{role}</p>
          </div>
        </div>

        <span
          className={`shrink-0 px-2 py-1 rounded-lg text-xs font-semibold ${
            onDuty ? "bg-[#b2ffb4] text-[#04910c]" : "text-gray-600 bg-gray-200"
          }`}
        >
          {onDuty ? "On Duty" : "Off Duty"}
        </span>
      </div>

      {/* Details */}
      <div className="my-3 flex flex-col gap-2 text-sm text-gray-500 font-medium">
        <div className="flex items-start gap-2 min-w-0">
          <CircleFadingArrowUp size={16} className="shrink-0 mt-0.5" />
          <span className="truncate">{shiftSchedule}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Phone size={16} className="shrink-0" />
          <span className="truncate">{phone}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Mail size={16} className="shrink-0" />
          <span className="truncate text-xs">{email}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <p>Sales Target</p>
          <p>{salesTarget?.duration || "—"}</p>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full relative overflow-hidden">
          <div
            className="h-4 bg-[#0080ff] rounded-full transition-all duration-500"
            style={{
              width: salesTarget?.targetAmount
                ? `${Math.min((salesTarget.currentProgress / salesTarget.targetAmount) * 100, 100)}%`
                : "0%"
            }}
          ></div>
        </div>
        <div className="flex justify-end text-xs text-gray-700 font-medium">
          ₦{(salesTarget?.currentProgress ?? 0).toLocaleString()}/₦{(salesTarget?.targetAmount ?? 0).toLocaleString()}
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

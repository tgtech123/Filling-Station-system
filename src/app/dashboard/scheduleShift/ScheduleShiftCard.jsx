// import CustomSelect from "@/components/CustomSelect";
import { X } from "lucide-react";

export default function ScheduleShiftCard({ user, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 z-50 bg-black/30">
      <div className="bg-white flex flex-col rounded-xl p-6 w-full sm:overflow-y-auto max-w-[400px] shadow-xl">
        <header className="flex justify-end mb-4" onClick={onClose}>
          <X />
        </header>

        <div>
          <h5 className="font-semibold text-lg text-gray-700">
            Schedule Attendant
          </h5>
          <p className="text-sm">
            Manage {user.name}'s work schedule and shift
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div>
            <p className="font-semibold text-sm">Shift type</p>
            <select className="text-sm w-full p-2 rounded-[8px] text-gray-400 border-2 border-gray-300">
              <option>New Shift</option>
              <option>Old Shift</option>
            </select>
          </div>

          <div>
            <p className="font-semibold text-sm">Start Date</p>
            <input
              type="date"
              className="text-sm w-full p-2 rounded-[8px] text-gray-400 border-2 border-gray-300"
              placeholder="Start date"
            />
          </div>

          <div>
            <p className="font-semibold text-sm">End Date</p>
            <input
              type="date"
              className="text-sm w-full p-2 rounded-[8px] text-gray-400 border-2 border-gray-300"
              placeholder="Start date"
            />
          </div>
        </div>

        <div className="my-4 pt-4 border-t-1 flex flex-col gap-3 border-gray-300">
          <h5 className="font-semibold text-md">Recent Changes</h5>
          <div className="flex justify-between text-xs text-gray-600">
            <p>
                Switched to day-off shift on Dec 15
            </p>
            <p>2 days ago</p>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <p>
                Switched to full-time shift (6am - 10pm) on Dec. 15
            </p>
            <p>1 week ago</p>
          </div>
           <div className="flex justify-between text-xs text-gray-600">
            <p>
                Switched to day-off shift on Dec 15
            </p>
            <p>2 days ago</p>
          </div>
        </div>
      <button className="w-full cursor-pointer bg-[#0080ff] text-sm text-white p-2 rounded-[8px]">Save Changes</button>
      </div>

    </div>
  );
}

import { X } from "lucide-react";

export default function SchedulePumpMaintenanceModal({ onclose }) {
  return (
    // overlay
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[350px]  lg:max-w-[450px] p-3 lg:p-4 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Schedule Pump Maintenance</h4>
          <p>Enter details</p>
        </div>

        <form className="flex flex-col gap-2 w-full">
            <div>
              <p className="text-sm font-semibold">
                Pump Number
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="e.g Pump 6"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Maintenance Type
              </p>
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g Routine Service"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Duration
              </p>
              <input
                type="date"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="E.g 5 days"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Additional Note
              </p>
              <input
                type="date"
                className="w-full border-2 border-gray-300 p-2 rounded-[8px]"
                placeholder="Write additional note.."
              />
            </div>
            
          
          <button
            type="button"
            className="mt-6 flex justify-center p-2 bg-blue-600 hover:bg-blue-400 text-white font-semibold rounded-md"
          >
            Schedule Maintenance
          </button>
        </form>
      </div>
    </div>
  );
}

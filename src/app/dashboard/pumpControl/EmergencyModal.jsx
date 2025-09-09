import { X } from "lucide-react";

export default function EmergencyModal({ onclose }) {
  return (
    // overlay
    <div className="fixed px-4 lg:px-0 inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-white border-2 rounded-lg w-full max-w-[350px]  lg:max-w-[450px] p-3 lg:p-4 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mt-2 mb-4 flex justify-end" onClick={onclose}>
          <X className="cursor-pointer" />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg">Emergency Stop All</h4>
        </div>

        <p>
            To continue, "Stop All" would shut down every pump operations available in the filling station.
        </p>
        
          
        <div className="flex justify-center gap-6">
          <button
            onClick={onclose}
            type="button"
            className="mt-6 flex justify-center py-2 px-12 border-3 border-[#0080ff] text-[#0080ff] font-semibold rounded-md"
            >
            Cancel
          </button>
          <button
            type="button"
            className="mt-6 flex justify-center items-center py-2 px-12 bg-[#f00] text-white font-semibold rounded-md"
            >
            Yes, Stop All
          </button>
        </div>
     
      </div>
    </div>
  );
}

import DisplayCard from "@/components/Dashboard/DisplayCard";
import { ChevronDown, Download, Filter, ListFilter, Search, X } from "lucide-react";

export default function LubricantTracker({ onclose }) {
  return (
    <div className="fixed px-4 lg:px-0 inset-0  z-50 flex items-center justify-center bg-black/50">
      {/* modal box */}
      <div className="bg-[#f6f6f6] border-2 rounded-lg w-full max-w-[400px] lg:max-w-[1000px] p-3 lg:p-6 max-h-[80vh] scrollbar-hide overflow-y-auto">
        <div className="mb-4 flex justify-end cursor-pointer">
          <X onClick={onclose} />
        </div>
        <header className="mb-8">
          <h2 className="font-semibold text-2xl"> Lubricant Tracker</h2>
          <p>Track lubricant purchases and records</p>
        </header>

        <DisplayCard>
          <div className="flex flex-col lg:flex-row justify-between items-center">

            <div className="relative w-full lg:w-1/2">
              <input
                type="text"
                className="w-full border-2 border-gray-300 p-2 rounded-xl"
              />
              <Search className="absolute top-2 right-3" />
            </div>

            <div className="flex gap-4">
                <button className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300">
                    Duration
                    <ChevronDown />
                </button>
                <button className="flex gap-2 items-center p-2 rounded-[10px] border-2 border-gray-300">
                    Filter
                    <ListFilter />
                </button>
                <button className="flex gap-2 items-center p-2 rounded-[10px] bg-[#0080ff] text-white">
                    Export
                    <Download />
                </button>
            </div>
          </div>
        </DisplayCard>
      </div>
    </div>
  );
}

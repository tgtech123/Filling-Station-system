import { X, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function PumpControl() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[150px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link href="/dashboard" className="cursor-pointer border-3 flex  gap-2 border-none lg:border-[#0080ff]  py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold">
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-2xl font-semibold">Pump Control</h4>
        </div>
        <div className="flex gap-2 items-center">
          <button className="cursor-pointer border-3 flex gap-2 items-center border-[#f00] hover:text-white py-2 px-6 rounded-[12px] text-[#f00]">
            Emergency Stop All
            <div className="border-2 text-sm border-[#f00] rounded=[14px]"><X size={16} className="text-[#f00]" /></div>
          </button>
          <button
            // onClick={handleOpenLubricantModal}
            className="cursor-pointer border-3 flex gap-2 border-[#0080ff] hover:bg-[#0080ff] hover:text-white py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold"
          >
            Add Lubricant
            <Plus />
          </button>
        </div>
      </header>
    </div>
  );
}

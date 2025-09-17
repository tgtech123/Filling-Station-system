import React from "react";
import { X, ArrowLeft, Wrench, ChevronDown, Download } from "lucide-react";
import Link from "next/link";
import { overviewCardData } from "./overviewCardData";
import FlashCard from "@/components/Dashboard/FlashCard";
import TabButtons from "./TabButtons";
const page = () => {
  return (
    <div className="bg-neutral-100 min-h-screen rounded-2xl ">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[170px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link
            href="/dashboard"
            className="cursor-pointer border-2 flex  gap-2  lg:border-[#0080ff]  py-2 px-4 rounded-[12px] text-[#0080ff] font-semibold"
          >
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-xl font-semibold">Financial Overview</h4>
        </div>
        <div className="flex gap-2 items-center">
          <button
            //   onClick={() => setShowEmergencyModal(true)}
            className="text-sm lg:text-md cursor-pointer border-[1.5px] flex gap-3 justify-between items-center text-neutral-800 border-neutral-300 font-bold  py-3 px-4 text-[0.75rem] rounded-xl "
          >
            Duration
            <div>
              <ChevronDown size={22} />
            </div>
          </button>
          <button
            // onClick={() => setShowMaintenanceModal(true)}
            className="cursor-pointer text-sm lg:text-md flex gap-2 bg-[#0080ff] text-white py-3 px-6 rounded-[12px] font-semibold"
          >
            Export
            <Download size={18} />
          </button>
        </div>
      </header>

      <div className="bg-white p-5 mx-10 rounded-2xl">
        <h1 className="mb-[0.75rem] font-semibold text-[1.5rem] text-neutral-800 leading-[100%]">
          Financial Overview
        </h1>
        <h1 className="text-[1.125rem] leading-[100%]">
          Track revenue, expenses and profit margins
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-[1.5rem]">
          {overviewCardData.map((item, i) => (
            <FlashCard
              key={i}
              name={item.name}
              number={item.number}
              period={item.period}
              icon={item.icon}
            />
          ))}
        </div>
      </div>

      <TabButtons />
    </div>
  );
};

export default page;

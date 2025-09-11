"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { X, ArrowLeft, Wrench, Plus } from "lucide-react";
import Link from "next/link";
import { pumpControlData } from "./pumpControlData";
import PumpDisplay from "./PumpDisplay";
import AddNewPumpModal from "./AddNewPumpModal";
import { useState } from "react";
import SchedulePumpMaintenanceModal from "./SchedulePumpMaintenanceModal";
import EmergencyModal from "./EmergencyModal";

export default function PumpControl() {
  const [ showPumpModal, setShowPumpModal ] = useState(false);
  const [ showMaintenanceModal, setShowMaintenanceModal ] = useState(false);
  const [ showEmergencyModal, setShowEmergencyModal ] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[170px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link href="/dashboard" className="cursor-pointer border-3 flex  gap-2 border-none lg:border-[#0080ff]  py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold">
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-2xl font-semibold">Pump Control</h4>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setShowEmergencyModal(true)} className="text-sm lg:text-md cursor-pointer border-3 flex gap-2 items-center border-[#f00] hover:bg-[#f00] hover:text-white py-2 px-3 lg:px-6 rounded-[12px] text-[#f00]">
            Emergency Stop All
            <div className="border-2 text-sm border-[#f00] rounded=[14px]"><X size={16} className="text-[#f00]" /></div>
          </button>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="cursor-pointer text-sm lg:text-md flex gap-2 bg-[#0080ff] text-white py-3 px-3 lg:px-6 rounded-[12px] font-semibold"
          >
            Schedule Maintenance
            <Wrench size={18} />
          </button>
        </div>
      </header>


       <div className="px-6 lg:px-[40px]">
              <DisplayCard>
                <div className="flex justify-between items-center ">
                  <div>
                    <h4 className="text-xl font-semibold">Lubricant Management</h4>
                    <p className="mb-6">Monitor lubricant inventory and track cashier sales</p>
                  </div>
                  <button onClick={() => setShowPumpModal(true)} className="cursor-pointer text-sm lg:text-md flex items-center gap-2 border-3 border-[#0080ff] text-[#0080ff] py-3 px-3 lg:px-6 rounded-[12px] font-semibold">
                    Add new Pump
                    <Plus size={22} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                  {pumpControlData.map((item) => (
                    <FlashCard
                      key={item.id}
                      name={item.title}
                      icon={item.icon}
                      period={item.period}
                      number={item.number}
                    />
                  ))}
                </div>
              </DisplayCard>
        </div>

        <div className="px-6 lg:px-[40px] pb-10 mt-4">
              <PumpDisplay />
        </div>

        {showPumpModal && <AddNewPumpModal onclose={() => setShowPumpModal(false)}/>}
        {showMaintenanceModal && <SchedulePumpMaintenanceModal onclose={() => setShowMaintenanceModal(false)}/>}
        {showEmergencyModal && <EmergencyModal onclose={() => setShowEmergencyModal(false)}/>}
    </div>
  );
}

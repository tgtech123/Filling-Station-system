"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { ArrowLeft, ArrowUp, House, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import FuelTank from "./FuelTank";
import Deliveries from "./Deliveries";
import { GiExpense, GiFuelTank } from "react-icons/gi";

export default function FuelManagement() {
    const [activeTab, setActiveTab] = useState("fuelTank")

    const handleClick = (id) => {
        setActiveTab(id)
    }
  const fuelManagementData = [
    {
      id: 1,
      title: "Daily Consumption",
      icon: <GiExpense />,
      period: "Across all fuel types",
      number: "4234 Litres",
    },
    {
      id: 2,
      title: "Weekly Average Consumption",
      icon: <TrendingUp />,
      period: "Across all fuel types",
      number: "34,435 Litres",
    },
    {
      id: 3,
      title: "Total Capacity Available",
      icon: <GiFuelTank />,
      period: "In all tanks",
      number: "40,000 Litres",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[150px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <button className="cursor-pointer border-3 flex  gap-2 border-none lg:border-[#0080ff]  py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold">
            <ArrowLeft />
            Back to Dashboard
          </button>
          <h4 className="text-2xl font-semibold">Fuel Management</h4>
        </div>
        <div>
          <button className="cursor-pointer border-3 flex gap-2 border-[#0080ff] hover:bg-[#0080ff] hover:text-white py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold">
            Schedule Delivery
            <Plus />
          </button>
        </div>
      </header>

      <div className="px-6 lg:px-[40px]">
        <DisplayCard>
          <h4 className="text-xl font-semibold">Fuel Management</h4>
          <p className="mb-6">Monitor fuel levels and manage inventory</p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {fuelManagementData.map((item) => (
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

      {/* Navigation Tab */}
      <div className="mt-10 px-6 lg:px-[40px] flex flex-col gap-3 lg:gap-0 lg:flex-row justify-between items-start lg:items-center">
        <div className="bg-white border-2 border-gray-300 flex gap-4 py-2 px-6 rounded-[10px]">
            <div id="fuelTank" onClick={() => handleClick("fuelTank")}  className={`px-6 py-2 rounded-[8px] cursor-pointer ${activeTab === "fuelTank" ? "bg-[#d9edff] font-semibold text-[#0080ff]" : "bg-transparent text-inherit"} flex gap-2`}>
                <House />
                Fuel Tank
            </div>
            <div id="Deliveries" onClick={() => handleClick("Deliveries")} className={`px-6 py-2 rounded-[8px] cursor-pointer ${activeTab === "Deliveries" ? "bg-[#d9edff] font-semibold text-[#0080ff]" : "bg-transparent text-inherit"} flex gap-2`}>
                <House />
                Order & Deliveries
            </div>
        </div>

        <div>
            <button className="flex border-3 py-2 px-6 rounded-[10px] gap-1 font-semibold text-[#0080ff] cursoor-pointer border-[#0080ff] bg-white">
                Add Fuel Tank
                <Plus />
            </button>
        </div>

      </div>
        <div className="mt-10 px-6 lg:px-[40px]">
            {activeTab === "fuelTank" && <FuelTank />}
            {activeTab === "Deliveries" && <Deliveries />}
        </div>
    </div>
  );
}

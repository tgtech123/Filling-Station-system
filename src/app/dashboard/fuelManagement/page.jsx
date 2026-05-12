"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { ArrowLeft, ArrowUp, House, Plus, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import useFuelManagementStore from "@/store/useFuelManagementStore";
import FuelTank from "./FuelTank";
import Deliveries from "./Deliveries";
import { GiExpense, GiFuelTank } from "react-icons/gi";
import AddTankModal from "./AddTankModal";
import ScheduleDeliveryModal from "./ScheduleDeliveryModal";
import Link from "next/link";
import { useTankStore } from "@/store/tankStore";

export default function FuelManagement() {
    const [activeTab, setActiveTab] = useState("fuelTank");
    const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

    const { fuelData, loading, errors, fetchFuelManagement } = useFuelManagementStore();
    const { tanks } = useTankStore();
    const hasTanks = tanks && tanks.length > 0;

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) fetchFuelManagement(token);
    }, [fetchFuelManagement]);

    const handleOpenFuelModal = () => {
      setIsFuelModalOpen(true);
    }

    const handleCloseFuelModal = () => {
      setIsFuelModalOpen(false);
    }

    const handleOpenDeliveryModal = () => {
      setIsDeliveryModalOpen(true);
    }

    const handleCloseDeliveryModal = () => {
      setIsDeliveryModalOpen(false);
    }

    const handleClick = (id) => {
        setActiveTab(id)
    }


  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[150px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link href="/dashboard" className="cursor-pointer border-3 flex  gap-2 border-none lg:border-[#0080ff]  py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold">
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-2xl font-semibold">Fuel Management</h4>
        </div>
        <div>
          <div className="relative group">
            <button
              onClick={hasTanks ? handleOpenDeliveryModal : undefined}
              disabled={!hasTanks}
              className={`border-3 flex gap-2 py-2 px-6 rounded-[12px] font-semibold transition-colors ${
                hasTanks
                  ? "cursor-pointer border-[#0080ff] hover:bg-[#0080ff] hover:text-white text-[#0080ff]"
                  : "cursor-not-allowed border-gray-300 text-gray-400 bg-gray-50"
              }`}
            >
              Schedule Delivery
              <Plus />
            </button>
            {!hasTanks && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs font-medium rounded-lg px-3 py-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Add a fuel tank first to schedule delivery
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-[40px]">
        <DisplayCard>
          <h4 className="text-xl font-semibold">Fuel Management</h4>
          <p className="mb-6">Monitor fuel levels and manage inventory</p>

          {loading.fuelManagement ? (
            <p className="text-gray-500">Loading fuel data...</p>
          ) : errors.fuelManagement ? (
            <p className="text-red-500">{errors.fuelManagement}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <FlashCard
                name="Daily Consumption"
                icon={<GiExpense />}
                period="Across all fuel types"
                number={`${fuelData?.dailyConsumption?.toLocaleString() || "0"} Litres`}
              />
              <FlashCard
                name="Weekly Average Consumption"
                icon={<TrendingUp />}
                period="Across all fuel types"
                number={`${fuelData?.weeklyAverageConsumption?.toLocaleString() || "0"} Litres`}
              />
              <FlashCard
                name="Total Capacity Available"
                icon={<GiFuelTank />}
                period="In all tanks"
                number={`${fuelData?.totalCapacityAvailable?.toLocaleString() || "0"} Litres`}
              />
            </div>
          )}
        </DisplayCard>
      </div>

      {/* Navigation Tab */}
      <div className="mt-10 px-6 lg:px-[40px] flex flex-col text-sm lg:text-md gap-3 lg:gap-0 lg:flex-row justify-between items-start lg:items-center">
        <div className="bg-white border-2 border-gray-300 flex gap-4 py-2 px-6 rounded-[10px]">
            <div id="fuelTank" onClick={() => handleClick("fuelTank")}  className={`px-6 py-2 rounded-[8px] cursor-pointer ${activeTab === "fuelTank" ? "bg-[#d9edff] font-semibold text-[#0080ff]" : "bg-transparent text-inherit"} flex items-center gap-2`}>
                <House />
                Fuel Tank
            </div>
            <div id="Deliveries" onClick={() => handleClick("Deliveries")} className={`px-6 py-2 rounded-[8px] cursor-pointer ${activeTab === "Deliveries" ? "bg-[#d9edff] font-semibold text-[#0080ff]" : "bg-transparent text-inherit"} flex items-center gap-2`}>
                <House />
                Order & Deliveries
            </div>
        </div>

        <div>
            <button onClick={handleOpenFuelModal} className="flex border-3 items-center py-2 px-6 rounded-[10px] gap-1 font-semibold text-[#0080ff] cursor-pointer border-[#0080ff] bg-white">
                Add Fuel Tank
                <Plus />
            </button>
        </div>

      </div>
        <div className=" min-h-screen h-auto mt-10 px-6 lg:px-[40px]">
            {activeTab === "fuelTank" && <FuelTank />}
            {activeTab === "Deliveries" && <Deliveries />}
        </div>

        {isFuelModalOpen && (
          <AddTankModal onclose={handleCloseFuelModal} />
        )}

        {isDeliveryModalOpen && (
          <ScheduleDeliveryModal onclose={handleCloseDeliveryModal} />
        )}
    </div>

  );
}

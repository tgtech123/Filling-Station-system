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
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
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
              </div>

              {/* Per-fuel-type inventory breakdown */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <GiFuelTank className="text-gray-500" size={20} />
                  <h5 className="font-semibold text-gray-700">Current Inventory by Fuel Type</h5>
                  <span className="text-xs text-gray-400 font-medium">
                    — Total: {fuelData?.totalCapacityAvailable?.toLocaleString() || "0"} Litres
                  </span>
                </div>
                {fuelData?.capacityByFuelType?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {fuelData.capacityByFuelType.map(({ fuelType, currentQuantity }) => {
                      const colors = {
                        PMS:      { bg: "bg-purple-50",  border: "border-purple-200", text: "text-purple-700",  dot: "bg-purple-500"  },
                        AGO:      { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",    dot: "bg-blue-500"    },
                        Diesel:   { bg: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700",  dot: "bg-orange-500"  },
                        DPK:      { bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",   dot: "bg-green-500"   },
                        Kerosene: { bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",   dot: "bg-green-500"   },
                        LPG:      { bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",     dot: "bg-red-500"     },
                        Gas:      { bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",     dot: "bg-red-500"     },
                      };
                      const c = colors[fuelType] || { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", dot: "bg-gray-500" };
                      return (
                        <div key={fuelType} className={`${c.bg} ${c.border} border rounded-2xl p-4`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                            <p className={`text-xs font-bold uppercase tracking-wide ${c.text}`}>{fuelType}</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">
                            {currentQuantity?.toLocaleString() || "0"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">Litres available</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tank data available.</p>
                )}
              </div>
            </>
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

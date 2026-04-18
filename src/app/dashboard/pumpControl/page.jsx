"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { X, ArrowLeft, Wrench, Plus, TrendingUp, Droplets } from "lucide-react";
import Link from "next/link";
import { FaGasPump } from "react-icons/fa";
import PumpDisplay from "./PumpDisplay";
import AddNewPumpModal from "./AddNewPumpModal";
import { useState, useEffect } from "react";
import SchedulePumpMaintenanceModal from "./SchedulePumpMaintenanceModal";
import EmergencyModal from "./EmergencyModal";
import usePumpControlStore from "@/store/usePumpControlStore";
import useEmergencyStore from "@/store/useEmergencyStore";

export default function PumpControl() {
  const [showPumpModal, setShowPumpModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const { pumpData, loading, errors, fetchPumpControl } = usePumpControlStore();
  const { emergencyMode, fetchStatus } = useEmergencyStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchPumpControl(token);
    fetchStatus();
  }, [fetchPumpControl, fetchStatus]);

  return (
    <div className="bg-gray-100 dark:bg-gray-950 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-0 bg-white dark:bg-gray-900 shadow-sm h-[170px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className="mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link
            href="/dashboard"
            className="cursor-pointer border-3 flex gap-2 border-none lg:border-[#0080ff] py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold"
          >
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-2xl font-semibold">Pump Control</h4>
        </div>
        <div className="flex gap-2 items-center">
          {/* Emergency Stop button — appearance changes based on emergencyMode */}
          <button
            onClick={() => {
              console.log("Emergency button clicked")
              setShowEmergencyModal(true)
            }}
            className={`text-sm lg:text-md cursor-pointer border-3 flex gap-2 items-center py-2 px-3 lg:px-6 rounded-[12px] transition-colors ${
              emergencyMode
                ? "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                : "border-[#f00] text-[#f00] hover:bg-[#f00] hover:text-white"
            }`}
          >
            {emergencyMode ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                Deactivate Emergency
              </>
            ) : (
              <>
                Emergency Stop All
                <div className="border-2 text-sm border-[#f00] rounded-[14px]">
                  <X size={16} className="text-[#f00]" />
                </div>
              </>
            )}
          </button>
          <button
            onClick={() => {
              console.log("Maintenance button clicked")
              setShowMaintenanceModal(true)
            }}
            className="cursor-pointer text-sm lg:text-md flex gap-2 bg-[#0080ff] text-white py-3 px-3 lg:px-6 rounded-[12px] font-semibold"
          >
            Schedule Maintenance
            <Wrench size={18} />
          </button>
        </div>
      </header>

      {/* Emergency banner — shown when emergencyMode is active */}
      {emergencyMode && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-semibold">
          🚨 Emergency Stop Active — All staff are locked out
        </div>
      )}

      <div className="px-6 lg:px-[40px] mt-10">
        <DisplayCard>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xl font-semibold">Pump Control</h4>
              <p className="mb-6 text-neutral-600">
                Monitor pump status, price management & maintenance
              </p>
            </div>
            <button
              onClick={() => setShowPumpModal(true)}
              className="cursor-pointer text-sm lg:text-md flex items-center gap-2 border-3 border-[#0080ff] text-[#0080ff] py-3 px-3 lg:px-6 rounded-[12px] font-semibold"
            >
              Add new Pump
              <Plus size={22} />
            </button>
          </div>

          {loading.pumpControl ? (
            <p className="text-gray-500">Loading pump data...</p>
          ) : errors.pumpControl ? (
            <p className="text-red-500">{errors.pumpControl}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <FlashCard
                name="Active Pump"
                icon={<FaGasPump />}
                number={`${pumpData?.activePumps?.active || 0}/${pumpData?.activePumps?.total || 0}`}
              />
              <FlashCard
                name="Under Maintenance"
                icon={<Wrench />}
                number={pumpData?.underMaintenance || 0}
              />
              <FlashCard
                name="Total Fuel Sales"
                icon={<TrendingUp />}
                number={`₦${pumpData?.totalFuelSales?.toLocaleString() || "0"}`}
              />
              <FlashCard
                name="Fuel Dispensed Across"
                icon={<Droplets />}
                number={`${pumpData?.fuelDispensedAcross?.toLocaleString() || "0"}L`}
              />
            </div>
          )}
        </DisplayCard>
      </div>

      <div className="px-6 lg:px-[40px] pb-10 mt-4">
        <PumpDisplay />
      </div>

      {showPumpModal && <AddNewPumpModal onclose={() => setShowPumpModal(false)} />}
      {showMaintenanceModal && (
        <SchedulePumpMaintenanceModal onclose={() => setShowMaintenanceModal(false)} />
      )}
      {showEmergencyModal && (
        <EmergencyModal onclose={() => setShowEmergencyModal(false)} />
      )}
    </div>
  );
}

"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { ArrowLeft, House, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { TbCurrencyNaira } from "react-icons/tb";
import LubricantSales from "./LubricantSales";
import Inventory from "./Inventory";
import AddLubricantModal from "./AddLubricantModal";
import Link from "next/link";
import { CgTrack } from "react-icons/cg";
import LubricantTracker from "./LubricantTracker";

export default function LubricantManagement() {
  const [isLubricantModalOpen, setIsLubricantModalOpen] = useState(false);
  const [showLubricantTracker, setShowLubricantTracker] = useState(false);
  const [activeTab, setActiveTab] = useState("Lubricant sales");

  const handleOpenLubricantModal = () => {
    setIsLubricantModalOpen(true);
  };

  const handleLubricantModalClose = () => {
    setIsLubricantModalOpen(false);
  };

  const handleClick = (id) => {
    setActiveTab(id);
  };

  const lubricantManagementData = [
    {
      id: 1,
      title: "Today Sales",
      icon: <TbCurrencyNaira />,
      number: "₦120,000",
    },
    {
      id: 2,
      title: "Total Products",
      icon: <TrendingUp />,
      number: "7",
    },
    {
      id: 3,
      title: "Total Inventory Value",
      icon: <TrendingUp />,
      number: "₦120,000,000",
    },
    {
      id: 4,
      title: "Low Stock",
      icon: <TrendingUp />,
      number: <span className="text-red-500">0</span>,
    },
  ];
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[150px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className=" mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link
            href="/dashboard"
            className="cursor-pointer border-3 flex  gap-2 border-none lg:border-[#0080ff]  py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold"
          >
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-2xl font-semibold">Lubricant Management</h4>
        </div>
        <div>
          <button
            onClick={handleOpenLubricantModal}
            className="cursor-pointer border-3 flex gap-2 border-[#0080ff] hover:bg-[#0080ff] hover:text-white py-2 px-6 rounded-[12px] text-[#0080ff] font-semibold"
          >
            Add Lubricant
            <Plus />
          </button>
        </div>
      </header>

      <div className="px-6 lg:px-[40px]">
        <DisplayCard>
          <h4 className="text-xl font-semibold">Lubricant Management</h4>
          <p className="mb-6">
            Monitor lubricant inventory and track cashier sales
          </p>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {lubricantManagementData.map((item) => (
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
      <div className="mt-10 px-6 lg:px-[40px] flex flex-col text-sm lg:text-md gap-3 lg:gap-0 lg:flex-row justify-between items-start lg:items-center">
        <div className="bg-white border-2 border-gray-300 flex gap-4 py-2 px-6 rounded-[10px]">
          <div
            id="Lubricant sales"
            onClick={() => handleClick("Lubricant sales")}
            className={`px-6 py-2 rounded-[8px] cursor-pointer ${
              activeTab === "Lubricant sales"
                ? "bg-[#d9edff] font-semibold text-[#0080ff]"
                : "bg-transparent text-inherit"
            } flex items-center gap-2`}
          >
            <House className="hidden lg:flex" />
            Lubricant sales
          </div>
          <div
            id="Inventory"
            onClick={() => handleClick("Inventory")}
            className={`px-6 py-2 rounded-[8px] cursor-pointer ${
              activeTab === "Inventory"
                ? "bg-[#d9edff] font-semibold text-[#0080ff]"
                : "bg-transparent text-inherit"
            } flex items-center gap-2`}
          >
            <House className="hidden lg:flex" />
            Inventory
          </div>
        </div>

        <div onClick={() => setShowLubricantTracker(true)} className="p-2 flex font-semibold cursor-pointer text-[#0080ff] items-center border-2 rounded-[8px] border-[#0080ff]">
          Track Invoice Record
          <CgTrack size={24} className="text-[#0080ff]" />
        </div>
      </div>

      <div className=" min-h-screen h-auto mt-10 px-6 pb-10 lg:px-[40px]">
        {activeTab === "Lubricant sales" && <LubricantSales />}
        {activeTab === "Inventory" && <Inventory />}
      </div>

      {isLubricantModalOpen && (
        <AddLubricantModal onclose={handleLubricantModalClose} />
      )}

      {showLubricantTracker && (
        <LubricantTracker onclose={() => setShowLubricantTracker(false)} />
      )}
    </div>
  );
}

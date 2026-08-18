"use client";

import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import { ArrowLeft, Home, Plus, TrendingUp, FileText } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { TbCurrencyNaira } from "react-icons/tb";
import LubricantSales from "./LubricantSales";
import Inventory from "./Inventory";
import AddLubricantModal from "./AddLubricantModal";
import PricingDefaultsModal from "./PricingDefaultsModal";
import Link from "next/link";
import { CgTrack } from "react-icons/cg";
import LubricantTracker from "./LubricantTracker";
import { useLubricantStore } from "@/store/lubricantStore";
import LubricantStockModal from "../lubricantSales/LubricantStockModal";
import { getCurrentUser } from "@/lib/currentUser";

export default function LubricantManagement() {
  const [isLubricantModalOpen, setIsLubricantModalOpen] = useState(false);
  const [showLubricantTracker, setShowLubricantTracker] = useState(false);
  const [activeTab, setActiveTab] = useState("Lubricant sales");
  const [showPricingDefaults, setShowPricingDefaults] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  /**
   * Booking a supplier invoice lived only on the cashier's sales page, whose
   * sidebar link no role but the cashier has. A manager could reach it by
   * typing the URL and no other way. The action belongs here, beside the rest
   * of the stock and pricing controls, gated to the roles the server accepts.
   */
  const [role, setRole] = useState(null);
  useEffect(() => setRole(getCurrentUser()?.role || null), []);
  const canAddStock = ["manager", "supervisor", "admin"].includes(role);

  const { lubricants, dailySummary, fetchLubricants, fetchDailySummary } = useLubricantStore();

  // 🆕 Initial data load
  useEffect(() => {
    fetchLubricants();
    fetchDailySummary();
  }, [fetchLubricants, fetchDailySummary]);

  // 🆕 Refresh data when Add Lubricant modal closes
  useEffect(() => {
    if (!isLubricantModalOpen) {
      fetchLubricants();
      fetchDailySummary();
    }
  }, [isLubricantModalOpen, fetchLubricants, fetchDailySummary]);

  // Booking a supplier invoice moves stock and cost, so the cards must re-read.
  useEffect(() => {
    if (!showStockModal) {
      fetchLubricants();
      fetchDailySummary();
    }
  }, [showStockModal, fetchLubricants, fetchDailySummary]);

  // 🆕 Refresh data when Tracker modal closes (in case stock was added)
  useEffect(() => {
    if (!showLubricantTracker) {
      fetchLubricants();
      fetchDailySummary();
    }
  }, [showLubricantTracker, fetchLubricants, fetchDailySummary]);

  // 🆕 Refresh data when tab changes (ensures fresh data on each view)
  useEffect(() => {
    fetchLubricants();
    fetchDailySummary();
  }, [activeTab, fetchLubricants, fetchDailySummary]);

  // Use data from API daily summary or calculate from lubricants
  const summaryData = useMemo(() => {
    // If we have daily summary from API, use it
    if (dailySummary && Object.keys(dailySummary).length > 0) {
      return {
        todaySales: dailySummary.totalAmountSold || 0,
        totalProducts: dailySummary.totalLubricants || lubricants.length,
        totalInventoryValue: dailySummary.totalInventoryValue || 0,
        lowStockCount: dailySummary.lowStockCount || 0,
      };
    }

    // Otherwise calculate from lubricants data
    if (!lubricants.length) {
      return {
        todaySales: 0,
        totalProducts: 0,
        totalInventoryValue: 0,
        lowStockCount: 0,
      };
    }

    const totalProducts = lubricants.length;

    const totalInventoryValue = lubricants.reduce((sum, lub) => {
      if (!lub) return sum;
      const qty = Number(lub.qtyInStock) || 0;
      const price = Number(lub.unitPrice) || 0;
      return sum + qty * price;
    }, 0);

    const lowStockCount = lubricants.filter((lub) => {
      if (!lub) return false;
      const qty = Number(lub.qtyInStock) || 0;
      const reorder = Number(lub.reOrderLevel) || 0;
      return qty < reorder;
    }).length;

    return {
      todaySales: 0,
      totalProducts,
      totalInventoryValue,
      lowStockCount,
    };
  }, [lubricants, dailySummary]);

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
      number: `₦${summaryData.todaySales.toLocaleString()}`,
    },
    {
      id: 2,
      title: "Total Products",
      icon: <TrendingUp />,
      number: summaryData.totalProducts.toString(),
    },
    {
      id: 3,
      title: "Total Inventory Value",
      icon: <TrendingUp />,
      number: `₦${Math.round(summaryData.totalInventoryValue).toLocaleString()}`,
    },
    {
      id: 4,
      title: "Low Stock",
      icon: <TrendingUp />,
      number: (
        <span className={summaryData.lowStockCount > 0 ? "text-red-500" : ""}>
          {summaryData.lowStockCount}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="px-4 lg:px-[40px] mb-4 lg:mb-6 bg-white dark:bg-gray-900 shadow-sm py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 sm:items-center">
          <Link
            href="/dashboard"
            className="cursor-pointer flex gap-2 items-center border-2 border-[#0080ff] py-2 px-4 rounded-[12px] text-[#0080ff] font-semibold text-sm"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h4 className="text-xl sm:text-2xl font-semibold">Lubricant Management</h4>
        </div>
        <div className="flex gap-2">
          {/* The margins every new product starts from. Sits beside "Add"
              because that is where someone realises the default is wrong. */}
          <button
            onClick={() => setShowPricingDefaults(true)}
            className="cursor-pointer flex gap-2 items-center border-2 border-gray-300 hover:bg-gray-100 py-2 px-4 rounded-[12px] text-gray-600 font-semibold text-sm transition-colors"
          >
            Pricing defaults
          </button>
          {canAddStock && (
            <button
              onClick={() => setShowStockModal(true)}
              className="cursor-pointer flex gap-2 items-center border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white py-2 px-4 rounded-[12px] text-emerald-600 font-semibold text-sm transition-colors"
            >
              <FileText size={18} />
              Add Stock (Invoice)
            </button>
          )}
          <button
            onClick={handleOpenLubricantModal}
            className="cursor-pointer flex gap-2 items-center border-2 border-[#0080ff] hover:bg-[#0080ff] hover:text-white py-2 px-5 rounded-[12px] text-[#0080ff] font-semibold text-sm transition-colors"
          >
            <Plus size={18} />
            Add Lubricant
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
      <div className="mt-4 lg:mt-8 px-4 lg:px-[40px] flex flex-col sm:flex-row text-sm gap-3 sm:gap-0 sm:justify-between sm:items-center">
        <div className="bg-white border-2 border-gray-300 flex gap-2 py-2 px-3 rounded-[10px] w-full sm:w-auto overflow-x-auto">
          <div
            id="Lubricant sales"
            onClick={() => handleClick("Lubricant sales")}
            className={`px-4 py-2 rounded-[8px] cursor-pointer whitespace-nowrap ${
              activeTab === "Lubricant sales"
                ? "bg-[#d9edff] font-semibold text-[#0080ff]"
                : "bg-transparent text-inherit"
            } flex items-center gap-2`}
          >
            <Home size={16} className="hidden sm:flex shrink-0" />
            Lubricant Sales
          </div>
          <div
            id="Inventory"
            onClick={() => handleClick("Inventory")}
            className={`px-4 py-2 rounded-[8px] cursor-pointer whitespace-nowrap ${
              activeTab === "Inventory"
                ? "bg-[#d9edff] font-semibold text-[#0080ff]"
                : "bg-transparent text-inherit"
            } flex items-center gap-2`}
          >
            <Home size={16} className="hidden sm:flex shrink-0" />
            Inventory
          </div>
        </div>

        <div
          onClick={() => setShowLubricantTracker(true)}
          className="p-2 flex font-semibold cursor-pointer text-[#0080ff] items-center gap-1 border-2 rounded-[8px] border-[#0080ff] w-fit text-sm"
        >
          Track Purchases & Invoices
          <CgTrack size={20} className="text-[#0080ff]" />
        </div>
      </div>

      <div className="min-h-screen h-auto mt-4 lg:mt-8 px-4 pb-10 lg:px-[40px]">
        {activeTab === "Lubricant sales" && <LubricantSales />}
        {activeTab === "Inventory" && <Inventory />}
      </div>

      {isLubricantModalOpen && (
        <AddLubricantModal onclose={handleLubricantModalClose} />
      )}
      {showPricingDefaults && (
        <PricingDefaultsModal onClose={() => setShowPricingDefaults(false)} />
      )}

      {showLubricantTracker && (
        <LubricantTracker onclose={() => setShowLubricantTracker(false)} />
      )}

      {showStockModal && canAddStock && (
        <LubricantStockModal onClose={() => setShowStockModal(false)} />
      )}
    </div>
  );
}
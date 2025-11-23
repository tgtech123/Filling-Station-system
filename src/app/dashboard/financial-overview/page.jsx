'use client'

import React, { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, Download } from "lucide-react";
import Link from "next/link";
import { overviewCardData } from "./overviewCardData";
import FlashCard from "@/components/Dashboard/FlashCard";
import TabButtons from "./TabButtons";
import { useFinancialStore } from "@/store/useFinancialStore";

const Page = () => {
  const { overview, fetchOverview, loading, errors } = useFinancialStore();

  // Debug: Log what we're getting from the store
  console.log('Store values:', { overview, loading, errors });

  useEffect(() => {
    // Fetch financial overview when component mounts
    fetchOverview();
  }, [fetchOverview]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  // Update the overview card data with live financial data
  const updatedOverviewCardData = overviewCardData.map((item) => {
    if (loading?.overview) {
      return { ...item, number: "Loading..." };
    }

    // Map according to the actual API response structure
    switch (item.name) {
      case "Today Revenue":
        return {
          ...item,
          number: formatCurrency(overview?.todayRevenue),
        };
      case "Total Expenses":
        return {
          ...item,
          number: formatCurrency(overview?.totalExpenses),
        };
      case "Net profit":
        return {
          ...item,
          number: formatCurrency(overview?.netProfit),
        };
      case "Profit Margin":
        return {
          ...item,
          number: overview?.profitMargin || "0%", // Already formatted as string with %
        };
      default:
        return item;
    }
  });

  return (
    <div className="bg-neutral-100 min-h-screen rounded-2xl">
      <header className="px-4 lg:px-[40px] mb-10 bg-white shadow-sm h-[170px] lg:h-[90px] flex flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-center lg:justify-between">
        <div className="mt-2 lg:mt-0 flex flex-col lg:flex-row gap-0 lg:gap-4 items-center">
          <Link
            href="/dashboard"
            className="cursor-pointer border-2 flex gap-2 lg:border-[#0080ff] py-2 px-4 rounded-[12px] text-[#0080ff] font-semibold"
          >
            <ArrowLeft />
            Back to Dashboard
          </Link>
          <h4 className="text-xl font-semibold">Financial Overview</h4>
        </div>
        <div className="flex gap-2 items-center">
          <button className="text-sm lg:text-md cursor-pointer border-[1.5px] flex gap-3 justify-between items-center text-neutral-800 border-neutral-300 font-bold py-3 px-4 text-[0.75rem] rounded-xl">
            Duration
            <div>
              <ChevronDown size={22} />
            </div>
          </button>
          <button className="cursor-pointer text-sm lg:text-md flex gap-2 bg-[#0080ff] text-white py-3 px-6 rounded-[12px] font-semibold">
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

        {errors?.overview && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading financial overview: {errors.overview}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-[1.5rem]">
          {updatedOverviewCardData.map((item, i) => (
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

export default Page;
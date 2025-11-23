
"use client";
import React, { useState, useEffect } from "react";
import { House, Plus } from "lucide-react";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import salesGrowthTable from "./salesGrowthTable";
import BreakdownPage from "./BreakdownPage";
import ExpenseMgtPage from "./ExpenseMgtPage";
import ProfitMargins from "./ProfitMargins";
import AddExpenseModalPage from "./AddExpenseModalPage";
import { useFinancialStore } from "@/store/useFinancialStore";

const TabButtons = () => {
  const [isMove, setIsMove] = useState("moveOne");
  const [openModal, setOpenModal] = useState(false);
  
  const { revenueAnalysis, fetchRevenueAnalysis, loading, errors } = useFinancialStore();

  useEffect(() => {
    // Fetch revenue analysis when component mounts
    if (isMove === "moveOne") {
      fetchRevenueAnalysis();
    }
  }, [isMove, fetchRevenueAnalysis]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(numValue) ? '0%' : `${numValue.toFixed(1)}%`;
  };

  // Transform revenue analysis data into table format
  const getRevenueTableData = () => {
    if (loading.revenueAnalysis) {
      return {
        header: salesGrowthTable.header,
        body: [["Loading...", "...", "...", "...", "..."]]
      };
    }

    if (errors.revenueAnalysis || !revenueAnalysis || revenueAnalysis.length === 0) {
      return salesGrowthTable; // Fallback to default data
    }

    // Map API data to table format
    const tableBody = revenueAnalysis.map(item => [
      item.category || item.name || "N/A",
      formatCurrency(item.today),
      formatCurrency(item.thisWeek),
      formatCurrency(item.thisMonth),
      formatPercentage(item.growth)
    ]);

    return {
      header: salesGrowthTable.header,
      body: tableBody
    };
  };

  const revenueTableData = getRevenueTableData();

  return (
    <div className="mx-10 mt-[1.5rem]">
      <div className="bg-white border-[1px] grid grid-cols-2 lg:grid-cols-3 rounded-2xl border-neutral-200 w-fit h-fit lg:w-[43.25rem] lg:h-[3.0625rem]">
        <div className="flex items-center p-2">
          <button
            id="moveOne"
            onClick={() => setIsMove("moveOne")}
            className={`flex items-center justify-center gap-2 rounded-lg text-[1rem] cursor-pointer p-2 w-fit h-fit lg:w-[13.583rem] lg:h-[2.0625rem] ${
              isMove === "moveOne"
                ? "bg-[#D9EDFF] text-[#1A71F6]"
                : "bg-transparent text-neutral-200"
            }`}
          >
            <House />
            <span>Overview</span>
          </button>
        </div>
        <div className="flex items-center p-2">
          <button
            id="moveTwo"
            onClick={() => setIsMove("moveTwo")}
            className={`flex items-center justify-center gap-2 rounded-lg text-[1rem] cursor-pointer p-1 w-fit h-fit lg:w-[13.583rem] lg:h-[2.0625rem] ${
              isMove === "moveTwo"
                ? "bg-[#D9EDFF] text-[#1A71F6]"
                : "bg-transparent text-neutral-200"
            }`}
          >
            <House />
            <span>Expense management</span>
          </button>
        </div>
        <div className="flex items-center p-2">
          <button
            id="moveThree"
            onClick={() => setIsMove("moveThree")}
            className={`flex items-center justify-center gap-2 rounded-lg text-[1rem] cursor-pointer p-1 w-fit h-fit lg:w-[13.583rem] lg:h-[2.0625rem] ${
              isMove === "moveThree"
                ? "bg-[#D9EDFF] text-[#1A71F6]"
                : "bg-transparent text-neutral-200"
            }`}
          >
            <House />
            <span>Profit margins</span>
          </button>
        </div>
      </div>

      {isMove === "moveTwo" && (
        <div>
          <button
            onClick={() => setOpenModal(true)}
            className="flex absolute right-12 top-105 cursor-pointer text-[1rem] font-bold text-[#1A71F6] border-[2px] border-[#1A71F6] rounded-[0.75rem] px-[1.5rem] py-[0.75rem]"
          >
            <span className="hidden lg:inline">Add New Expense</span>
            <Plus size={26} />
          </button>
        </div>
      )}
      <AddExpenseModalPage isOpen={openModal} onClose={() => setOpenModal(false)} />

      {isMove === "moveOne" && (
        <div>
          <div className="mt-[1.5rem]">
            <BreakdownPage />
          </div>

          {/* The Revenue Analysis Table */}
          <div className="bg-white rounded-2xl flex flex-col mt-[1.5rem] p-4">
            <span className="mb-[1.25rem]">
              <h1 className="text-[1.375rem] font-semibold leading-[134%]">
                Revenue Analysis
              </h1>
              <h4 className="text-[1rem] text-neutral-800 leading-[150%]">
                Detailed breakdown of revenue streams
              </h4>
            </span>

            {errors.revenueAnalysis && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error loading revenue analysis: {errors.revenueAnalysis}
              </div>
            )}

            <TableWithoutBorder
              columns={revenueTableData.header}
              data={revenueTableData.body}
            />
          </div>
        </div>
      )}

      {isMove === "moveTwo" && (
        <div className="mt-[1.5rem]">
          <ExpenseMgtPage />
        </div>
      )}

      {isMove === "moveThree" && (
        <div className="mt-[1.5rem]">
          <ProfitMargins />
        </div>
      )}
    </div>
  );
};

export default TabButtons;
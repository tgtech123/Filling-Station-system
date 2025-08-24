"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import { ChevronDown, Download, House } from "lucide-react";
import { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import IncomeStatement from "./IncomeStatement";
import BalanceSheet from "./BalanceSheet";
import CashFlow from "./CashFlow";
import KeyRatio from "./KeyRatio";
import { Button } from "@/components/ui/button";

export default function FinancialStatement() {
  const [active, setActive] = useState("linkOne");
  const [showFilter, setShowFilter] = useState(false);
  return (
    <DashboardLayout>
      <h3 className="mt-4 text-gray-600 text-2xl font-semibold">Reports</h3>
      <div className="mt-2 mb-4 flex items-center gap-1 font-semibold">
        <h4 className="text-gray-500">Report</h4>
        <IoMdArrowDropright className="text-gray-600" size={24} />
        <h4 className="text-[#1a71f6]">Full Financial Statement</h4>
      </div>

      {/* head section */}
      <DisplayCard>
        <header className="flex flex-col lg:flex-row items-center justify-between">
            <div>
                <h3 className="font-semibold text-2xl text-gray-600">Full Financial Statement</h3>
                <p className="text-gray-600 font-medium">View and export all financial statements</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowFilter(true)} className="cursor-pointer flex gap-2 items-center border-2 border-[#e7e7e7] p-2 rounded-[8px]">
                    Compare
                    <ChevronDown />
                </button>
                <button className="cursor-pointer bg-[#0080ff] text-white p-2 rounded-[8px] flex items-center gap-2">Export <Download size={19} /></button>
            </div>
        </header>

        <div className="bg-white w-full grid grid-cols-4 gap-2 text-sm  py-2 px-3 rounded-[14px] shadow-xs border-2 border-[#e7e7e7]">
          <div
            onClick={() => setActive("linkOne")}
            id="linkOne"
            className={`flex items-end  justify-center px-4 lg:px-12 gap-2 py-2 ${
              active === "linkOne"
                ? "bg-[#d9edff] text-[#1a71f6]"
                : "bg-white text-gray-400"
            } font-semibold cursor-pointer rounded-[10px]`}
          >
            <House className="hidden lg:flex" />
            Income Statement
          </div>
          <div
            onClick={() => setActive("linkTwo")}
            id="linkTwo"
            className={`flex items-end justify-center rounded-[10px] cursor-pointer px-4 lg:px-12 gap-2 ${
              active === "linkTwo"
                ? "bg-[#d9edff] text-[#1a71f6]"
                : "bg-white text-gray-400"
            } font-semibold py-2`}
          >
            <House className="hidden lg:flex"  />
            Balance Sheet
          </div>
          <div
            onClick={() => setActive("linkThree")}
            id="linkThree"
            className={`flex items-end justify-center rounded-[10px] cursor-pointer px-4 lg:px-12 gap-2 ${
              active === "linkThree"
                ? "bg-[#d9edff] text-[#1a71f6]"
                : "bg-white text-gray-400"
            } font-semibold py-2`}
          >
            <House className="hidden lg:flex"  />
            Cashflow
          </div>
          <div
            onClick={() => setActive("linkFour")}
            id="linkFour"
            className={`flex items-end justify-center rounded-[10px] cursor-pointer px-4 lg:px-12 gap-2 ${
              active === "linkFour"
                ? "bg-[#d9edff] text-[#1a71f6]"
                : "bg-white text-gray-400"
            } font-semibold py-2`}
          >
            <House className="hidden lg:flex"  />
            Key Ratio
          </div>
        </div>
      </DisplayCard>

    <div className="mt-6"></div>

      {active === "linkOne" && (
        <IncomeStatement showFilter={showFilter} />
      )}

      {active === "linkTwo" && (
        <BalanceSheet />
      )}

      {active === "linkThree" && (
        <CashFlow />
      )}

      {active === "linkFour" && (
        <KeyRatio />
      )}
    </DashboardLayout>
  );
}

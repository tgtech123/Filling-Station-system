"use client";
import React, { useState } from "react";
import { House, Plus } from "lucide-react";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import salesGrowthTable from "./salesGrowthTable";
import BreakdownPage from "./BreakdownPage";
import ExpenseMgtPage from "./ExpenseMgtPage";
import ProfitMargins from "./ProfitMargins";

const TabButtons = () => {
  const [isMove, setIsMove] = useState("moveOne");
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
                    <button className="flex absolute right-12 top-105 cursor-pointer text-[1rem] font-bold text-[#1A71F6] border-[2px] border-[#1A71F6] rounded-[0.75rem] px-[1.5rem] py-[0.75rem] ">
                        <span className="hidden lg:inline">Add New Expense</span>
                        <Plus size={26} />
                    </button>
                </div>
            )}


      {isMove === "moveOne" && (
        <div>
          
          <div className="mt-[1.5rem]">
                <BreakdownPage />
          </div>

          <div className="bg-white rounded-2xl flex flex-col mt-[1.5rem] p-4">
            <span className="mb-[1.25rem]">
              <h1 className="text-[1.375rem] font-semibold leading-[134%]">
                Revenue Analysis
              </h1>
              <h4 className="text-[1rem] text-neutral-800 leading-[150%]">
                Detailed breakdown of revenue streams
              </h4>
            </span>

            <TableWithoutBorder
              columns={salesGrowthTable.header}
              data={salesGrowthTable.body}
            />
          </div>
        </div>
      )}
    
      {isMove === "moveTwo" && (
        <div className="mt-[1.5rem]">
            <ExpenseMgtPage />
        </div>
      )}

      {isMove === "moveThree" &&(
        <div className="mt-[1.5rem]">
            <ProfitMargins />
        </div>
      )}
    </div>
  );
};

export default TabButtons;

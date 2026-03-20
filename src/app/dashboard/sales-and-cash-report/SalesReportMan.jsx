"use client";
import MyStatCard from "@/components/MyStatCard";
import React, { useState } from "react";
import { LuHouse } from "react-icons/lu";
import { Search } from "lucide-react";
import { salesData } from "./salesData";
import SalesAndProductChart from "./SalesAndProductChart";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import { columnsHeader, dataRows } from "./transactionData";
import CashRecord from "./CashRecord";
import { cashData } from "./cashReportData";
// import { salesData } from "../reports/expenses/SalesData";

const SalesReportMan = () => {
  const [isActiveTab, setIsActiveTab] = useState("TabOne");
  const [searchQue, setSearchQue] = useState("");

  const filterSearch = dataRows.filter((item) => {
    const TnxId = item[1]?.toLowerCase();
    const productType = item[3]?.toLowerCase();
    const query = searchQue.toLowerCase();

    return TnxId?.includes(query) || productType?.includes(query);
  });
  return (
    <div className="px-10 mt-[2.125rem]">
      <div className="bg-white rounded-2xl mt-[1.5rem] p-4 w-full">
        <div className="lg:flex flex-wrap lg:justify-between">
          {isActiveTab === "TabOne" ? (
            <p className="flex flex-col">
              <span className="mb-[0.5rem] text-[1.125rem] font-semibold">
                Sales Report Overview
              </span>
              <span className="mb-[0.5rem] text-sm text-neutral-800">
                Monitor and track sales transactions in your station
              </span>
            </p>
          ) : (
            <p className="flex flex-col">
              <span className="mb-[0.5rem] text-[1.125rem] font-semibold">
                Cash Report Overview
              </span>
              <span className="mb-[0.5rem] text-sm text-neutral-800">
                Monitor and track reconciled cash records
              </span>
            </p>
          )}

          <div className="bg-white border-[1.7px] border-neutral-200 max-w-[28.5625rem] max-h-[3.0625rem] flex justify-between w-full p-1 rounded-2xl">
            <span
              id="TabOne"
              onClick={() => setIsActiveTab("TabOne")}
              className={`flex w-fit font-semibold items-center px-8 py-1.5 gap-2 ${
                isActiveTab === "TabOne"
                  ? "bg-[#d9edff]  text-[#1a71f6]"
                  : "bg-white text-neutral-200"
              }  cursor-pointer rounded-lg`}
            >
              <LuHouse size={26} /> Sales report
            </span>

            <span
              id="TabTwo"
              onClick={() => setIsActiveTab("TabTwo")}
              className={`flex  font-semibold items-center lg:px-8 px-4 gap-2 rounded-lg cursor-pointer  ${
                isActiveTab === "TabTwo"
                  ? "bg-[#d9edff] text-[#1a71f6]"
                  : "bg-white text-neutral-200"
              }`}
            >
              <LuHouse size={26} /> Cash report
            </span>
          </div>
        </div>

        {isActiveTab === "TabOne" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
              {salesData.map((item, index) => (
                <MyStatCard
                  key={index}
                  title={item.title}
                  date={item.date}
                  amount={item.amount}
                  icon={item.icon}
                />
              ))}
            </div>

            <div>
              <SalesAndProductChart />
            </div>
          </div>
        )}
      </div>

      {isActiveTab === "TabOne" && (
        <div className="bg-white rounded-2xl mt-[1.5rem] p-4">
          <div className="lg:flex lg:justify-between flex-wrap mb-[1.5rem]  ">
            <span className="flex flex-col gap-1">
              <h1 className="text-neutral-800 font-semibold text-[1.125rem]">
                Recent Transactions
              </h1>
              <h1 className="text-[0.8rem]">Latest sales activities</h1>
            </span>

            {/* the Search Bar session */}
            <div className="relative flex items-center ">
              <input
                type="text"
                value={searchQue}
                onChange={(e) => setSearchQue(e.target.value)}
                placeholder="Search by TnxId or product type"
                className="w-[20rem] h-[2.385rem] rounded-lg pl-10 border-[1.7px] border-neutral-300 outline-none focus:border-[1.7px] focus:border-blue-600"
              />
              <Search size={24} className="text-neutral-400 absolute ml-2" />
            </div>
          </div>
          <TableWithoutBorder
            columns={columnsHeader}
            data={filterSearch}
          />
        </div>
      )}

      {isActiveTab === "TabTwo" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
          {cashData.map((item, ix) => (
            <div key={ix} className="">
              <MyStatCard
                title={item.title}
                date={item.date}
                amount={item.amount}
                icon={item.icon}
              />
            </div>
          ))}
        </div>
      )}

      <span>{isActiveTab === "TabTwo" && <CashRecord />}</span>
    </div>
  );
};

export default SalesReportMan;

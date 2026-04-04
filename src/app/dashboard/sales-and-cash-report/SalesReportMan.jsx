"use client";
import React, { useState, useEffect } from "react";
import { LuHouse } from "react-icons/lu";
import { Search } from "lucide-react";
import MyStatCard from "@/components/MyStatCard";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import SalesAndProductChart from "./SalesAndProductChart";
import CashRecord from "./CashRecord";
import { getSalesData } from "./salesData";
import { getCashData } from "./cashReportData";
import { columnsHeader } from "./transactionData"; // dataRows is no longer imported — data comes from API
import useManagerReportsStore from "@/store/useManagerReportsStore";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Format ISO timestamp → "12:32 PM"
const formatTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
};

// Format amount number → "₦24,000"
const formatAmount = (amount) => {
  if (amount == null) return "—";
  return `₦${Number(amount).toLocaleString()}`;
};

// Capitalise first letter of role string ("attendant" → "Attendant")
const formatRole = (role) => {
  if (!role) return "—";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Map a single recentTransactions item from the API → flat array row
// API shape: { timestamp, txnId, pumpNo, productType, quantity, amount, role }
const mapTransactionRow = (txn) => [
  formatTime(txn.timestamp),
  txn.txnId      ?? "—",
  txn.pumpNo      ?? "—",
  txn.productType ?? "—",
  txn.quantity    ?? "—",
  formatAmount(txn.amount),
  formatRole(txn.role),
];

// ── Component ─────────────────────────────────────────────────────────────────
const SalesReportMan = () => {
  const [isActiveTab, setIsActiveTab] = useState("TabOne");
  const [searchQue, setSearchQue] = useState("");

  const salesOverview      = useManagerReportsStore((state) => state.salesOverview);
  const cashOverview       = useManagerReportsStore((state) => state.cashOverview);
  const errors             = useManagerReportsStore((state) => state.errors);
  const fetchSalesOverview = useManagerReportsStore((state) => state.fetchSalesOverview);
  const fetchCashOverview  = useManagerReportsStore((state) => state.fetchCashOverview);

  // Granular loading selectors
  const salesCardsLoading = useManagerReportsStore((state) => state.loading.salesOverview);
  const cashCardsLoading  = useManagerReportsStore((state) => state.loading.cashOverview);

  useEffect(() => {
    fetchSalesOverview(undefined, false);
  }, []);

  useEffect(() => {
    if (isActiveTab === "TabTwo") {
      fetchCashOverview();
    }
  }, [isActiveTab]);

  const salesData = getSalesData(salesOverview);
  const cashData  = getCashData(cashOverview);

  // ── Map API recentTransactions → 2D row arrays for the table ───────────────
  // Source: salesOverview.recentTransactions (already fetched on mount)
  const allTransactionRows = (salesOverview?.recentTransactions ?? []).map(mapTransactionRow);

  // Client-side search — filters by TXNID (index 1) or Product type (index 3)
  const filteredTransactions = allTransactionRows.filter((row) => {
    const query = searchQue.toLowerCase();
    return (
      row[1]?.toLowerCase().includes(query) ||
      row[3]?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="px-10 mt-[2.125rem]">

      {/* ── Header Card ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl mt-[1.5rem] p-4 w-full">
        <div className="lg:flex flex-wrap lg:justify-between">
          <p className="flex flex-col">
            <span className="mb-[0.5rem] text-[1.125rem] font-semibold">
              {isActiveTab === "TabOne"
                ? "Sales Report Overview"
                : "Cash Report Overview"}
            </span>
            <span className="mb-[0.5rem] text-sm text-neutral-800">
              {isActiveTab === "TabOne"
                ? "Monitor and track sales transactions in your station"
                : "Monitor and track reconciled cash records"}
            </span>
          </p>

          {/* Tab switcher */}
          <div className="bg-white border-[1.7px] border-neutral-200 max-w-[28.5625rem] max-h-[3.0625rem] flex justify-between w-full p-1 rounded-2xl">
            <span
              onClick={() => setIsActiveTab("TabOne")}
              className={`flex w-fit font-semibold items-center px-8 py-1.5 gap-2 cursor-pointer rounded-lg ${
                isActiveTab === "TabOne"
                  ? "bg-[#d9edff] text-[#1a71f6]"
                  : "bg-white text-neutral-200"
              }`}
            >
              <LuHouse size={26} /> Sales report
            </span>

            <span
              onClick={() => setIsActiveTab("TabTwo")}
              className={`flex font-semibold items-center lg:px-8 px-4 gap-2 rounded-lg cursor-pointer ${
                isActiveTab === "TabTwo"
                  ? "bg-[#d9edff] text-[#1a71f6]"
                  : "bg-white text-neutral-200"
              }`}
            >
              <LuHouse size={26} /> Cash report
            </span>
          </div>
        </div>

        {/* ── Sales Tab — Stat Cards + Chart ──────────────────────────────────── */}
        {isActiveTab === "TabOne" && (
          <div>
            {errors?.salesOverview && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {errors.salesOverview}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {salesCardsLoading
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="h-[7rem] rounded-2xl bg-neutral-100 animate-pulse" />
                  ))
                : salesData.map((item, index) => (
                    <MyStatCard
                      key={index}
                      title={item.title}
                      date={item.date}
                      amount={item.amount}
                      icon={item.icon}
                    />
                  ))}
            </div>

            {/* SalesAndProductChart manages its own skeleton via loading.salesChart */}
            <SalesAndProductChart />
          </div>
        )}
      </div>

      {/* ── Sales Tab — Recent Transactions ───────────────────────────────────── */}
      {isActiveTab === "TabOne" && (
        <div className="bg-white rounded-2xl mt-[1.5rem] p-4">
          <div className="lg:flex lg:justify-between flex-wrap mb-[1.5rem]">
            <span className="flex flex-col gap-1">
              <h1 className="text-neutral-800 font-semibold text-[1.125rem]">
                Recent Transactions
              </h1>
              <h1 className="text-[0.8rem]">Latest sales activities</h1>
            </span>

            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQue}
                onChange={(e) => setSearchQue(e.target.value)}
                placeholder="Search by txnId or product type"
                className="w-[20rem] h-[2.785rem] rounded-lg pl-10 border-[1.7px] border-neutral-300 outline-none focus:border-2 focus:border-blue-600"
              />
              <Search size={24} className="text-neutral-400 absolute ml-2" />
            </div>
          </div>

          {/* Skeleton while initial sales data loads */}
          {salesCardsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <TableWithoutBorder
              columns={columnsHeader}
              data={filteredTransactions}
            />
          )}
        </div>
      )}

      {/* ── Cash Tab — Stat Cards + Records  */}
      {isActiveTab === "TabTwo" && (
        <>
          {errors?.cashOverview && (
            <div className="mt-[1.5rem] p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {errors.cashOverview}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-[1.5rem]">
            {cashCardsLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="h-[7rem] rounded-2xl bg-neutral-100 animate-pulse" />
                ))
              : cashData.map((item, index) => (
                  <MyStatCard
                    key={index}
                    title={item.title}
                    date={item.date}
                    amount={item.amount}
                    icon={item.icon}
                  />
                ))}
          </div>

          <CashRecord />
        </>
      )}

    </div>
  );
};

export default SalesReportMan;
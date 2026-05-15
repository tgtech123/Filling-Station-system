"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import { ChevronDown, ChevronUp, Download, X, ArrowUpDown, BarChart2 } from "lucide-react";
import { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import IncomeStatement from "./IncomeStatement";
import BalanceSheet from "./BalanceSheet";
import CashFlow from "./CashFlow";
import KeyRatio from "./KeyRatio";
import useAccountantStore from "@/store/useAccountantStore";

// ── Helpers ──────────────────────────────────────────────────────────────────
function monthToRange(monthStr) {
  // "2025-05" → { startDate: "2025-05-01", endDate: "2025-05-31" }
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end   = new Date(y, m, 0);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate:   end.toISOString().split("T")[0],
  };
}

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonthStr() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtMonthLabel(m) {
  if (!m) return "—";
  const [y, mo] = m.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[Number(mo) - 1]} ${y}`;
}

// Quick preset pairs [currentMonth, previousMonth]
const PRESETS = [
  { label: "This vs Last Month",   fn: () => [currentMonthStr(), prevMonthStr()] },
  {
    label: "This vs Last Quarter",
    fn: () => {
      const now   = new Date();
      const curQ  = Math.floor(now.getMonth() / 3);
      const curY  = now.getFullYear();
      const cur   = `${curY}-${String(curQ * 3 + 1).padStart(2, "0")}`;   // first month of current quarter
      const prevM = new Date(curY, curQ * 3 - 1, 1);
      const prev  = `${prevM.getFullYear()}-${String(prevM.getMonth() + 1).padStart(2, "0")}`;
      return [cur, prev];
    },
  },
  {
    label: "This vs Last Year",
    fn: () => {
      const y = new Date().getFullYear();
      return [`${y}-01`, `${y - 1}-01`];
    },
  },
];

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "linkOne",   label: "Income Statement", hasCompare: true  },
  { id: "linkTwo",   label: "Balance Sheet",    hasCompare: false },
  { id: "linkThree", label: "Cashflow",          hasCompare: false },
  { id: "linkFour",  label: "Key Ratios",        hasCompare: false },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FinancialStatement() {
  const [active, setActive]           = useState("linkOne");
  const [showCompare, setShowCompare] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(currentMonthStr);
  const [previousMonth, setPreviousMonth] = useState(prevMonthStr);
  const [compareActive, setCompareActive] = useState(false); // whether a comparison is applied

  const { fetchIncomeStatement, loading } = useAccountantStore();

  const activeTab = TABS.find((t) => t.id === active);

  function openCompare() {
    setShowCompare(true);
  }

  function closeCompare() {
    setShowCompare(false);
  }

  function applyComparison() {
    const curr = monthToRange(currentMonth);
    const prev = monthToRange(previousMonth);
    fetchIncomeStatement(curr.startDate, curr.endDate, prev.startDate, prev.endDate);
    setCompareActive(true);
    setShowCompare(false);
  }

  function clearComparison() {
    const curr = monthToRange(currentMonth);
    fetchIncomeStatement(curr.startDate, curr.endDate);
    setCompareActive(false);
  }

  function applyPreset(preset) {
    const [cur, prev] = preset.fn();
    setCurrentMonth(cur);
    setPreviousMonth(prev);
  }

  return (
    <DashboardLayout>
      <h3 className="mt-4 text-gray-600 text-2xl font-semibold">Reports</h3>
      <div className="mt-2 mb-4 flex items-center gap-1 font-semibold">
        <h4 className="text-gray-500">Report</h4>
        <IoMdArrowDropright className="text-gray-600" size={24} />
        <h4 className="text-[#1a71f6]">Full Financial Statement</h4>
      </div>

      {/* ── Header card ─────────────────────────────────────────── */}
      <DisplayCard>
        <header className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-2xl text-gray-600">Full Financial Statement</h3>
            <p className="text-gray-500 font-medium text-sm mt-0.5">View and export all financial statements</p>
          </div>

          <div className="flex gap-2 items-center">
            {/* Compare — only on Income Statement tab */}
            {activeTab?.hasCompare && (
              <div className="relative">
                <button
                  onClick={showCompare ? closeCompare : openCompare}
                  className={`cursor-pointer flex gap-2 items-center border-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    compareActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-[#e7e7e7] text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <BarChart2 size={16} />
                  {compareActive ? `${fmtMonthLabel(currentMonth)} vs ${fmtMonthLabel(previousMonth)}` : "Compare"}
                  {showCompare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Clear comparison chip */}
                {compareActive && (
                  <button
                    onClick={clearComparison}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
                    title="Clear comparison"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            )}

            <button className="cursor-pointer bg-[#0080ff] text-white px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors">
              Export <Download size={16} />
            </button>
          </div>
        </header>

        {/* ── Tab bar ─────────────────────────────────────────────── */}
        <div className="bg-white w-full grid grid-cols-4 gap-2 text-sm py-2 px-3 rounded-[14px] shadow-xs border-2 border-[#e7e7e7] mt-4">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center justify-center px-2 lg:px-6 gap-2 py-2 font-semibold cursor-pointer rounded-[10px] transition-colors text-center text-xs sm:text-sm ${
                active === tab.id
                  ? "bg-[#d9edff] text-[#1a71f6]"
                  : "bg-white text-gray-400 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </DisplayCard>

      <div className="mt-6" />

      {active === "linkOne"   && <IncomeStatement />}
      {active === "linkTwo"   && <BalanceSheet />}
      {active === "linkThree" && <CashFlow />}
      {active === "linkFour"  && <KeyRatio />}

      {/* ══ Comparison Modal ══════════════════════════════════════════════════ */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20 pr-6 bg-black/20 backdrop-blur-[1px]"
          onClick={(e) => e.target === e.currentTarget && closeCompare()}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] overflow-hidden border border-gray-100 animate-in slide-in-from-top-2 duration-200">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BarChart2 size={15} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Comparison Selector</h3>
              </div>
              <button onClick={closeCompare} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* Quick presets */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Select</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-xs font-medium transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Current period */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Current period
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm text-gray-700 bg-white font-medium appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {fmtMonthLabel(currentMonth)} · 1 – {new Date(...currentMonth.split("-").map((v, i) => i === 1 ? Number(v) : Number(v)), 0).getDate()} days
                </p>
              </div>

              {/* Swap arrow */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    const tmp = currentMonth;
                    setCurrentMonth(previousMonth);
                    setPreviousMonth(tmp);
                  }}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  title="Swap periods"
                >
                  <ArrowUpDown size={14} />
                </button>
              </div>

              {/* Previous period */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Previous period
                </label>
                <div className="relative">
                  <input
                    type="month"
                    value={previousMonth}
                    onChange={(e) => setPreviousMonth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm text-gray-700 bg-white font-medium appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-400">{fmtMonthLabel(previousMonth)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={closeCompare}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyComparison}
                disabled={!currentMonth || !previousMonth || loading.incomeStatement}
                className="flex-2 flex-grow py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading.incomeStatement ? "Loading…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

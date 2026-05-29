"use client";

import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import {
  ChevronDown, ChevronUp, Download, X, ArrowUpDown,
  BarChart2, FileText, FileSpreadsheet,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import IncomeStatement from "./IncomeStatement";
import BalanceSheet from "./BalanceSheet";
import CashFlow from "./CashFlow";
import KeyRatio from "./KeyRatio";
import useAccountantStore from "@/store/useAccountantStore";

// ── Date helpers ──────────────────────────────────────────────────────────────
function monthToRange(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    startDate: `${y}-${pad(m)}-01`,
    endDate:   `${y}-${pad(m)}-${new Date(y, m, 0).getDate()}`,
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
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(mo)-1]} ${y}`;
}
function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n) {
  if (n === null || n === undefined) return "N/A";
  return `${Number(n).toFixed(2)}%`;
}
function fmtX(n) {
  if (n === null || n === undefined) return "N/A";
  return `${Number(n).toFixed(2)}x`;
}

// ── CSV builder ───────────────────────────────────────────────────────────────
function buildCSV(active, { incomeStatement, balanceSheet, cashflow, keyRatios }) {
  const rows = [];
  const row  = (...cols) => rows.push(cols.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","));

  if (active === "linkOne") {
    const IS  = incomeStatement || {};
    const cmp = IS.comparison;
    row("INCOME STATEMENT");
    row("Section", "Item", "Current Period", "Previous Period", "Variance");
    row("","","","","");
    row("REVENUE");
    row("", "PMS Sales",        `₦${fmt(IS.revenue?.pmsSales)}`,       cmp ? `₦${fmt(cmp.revenue?.pmsSales)}`       : "", "");
    row("", "AGO / Diesel",     `₦${fmt(IS.revenue?.agoSales)}`,       cmp ? `₦${fmt(cmp.revenue?.agoSales)}`       : "", "");
    row("", "DPK / Kerosene",   `₦${fmt(IS.revenue?.dpkSales)}`,       cmp ? `₦${fmt(cmp.revenue?.dpkSales)}`       : "", "");
    row("", "Lubricant Sales",  `₦${fmt(IS.revenue?.lubricantSales)}`, cmp ? `₦${fmt(cmp.revenue?.lubricantSales)}` : "", "");
    row("", "TOTAL REVENUE",    `₦${fmt(IS.revenue?.totalRevenue)}`,   cmp ? `₦${fmt(cmp.revenue?.totalRevenue)}`   : "", "");
    row("","","","","");
    row("COST OF GOODS SOLD");
    row("", "Fuel Cost of Sales",       `₦${fmt(IS.costOfGoodsSold?.fuelCOGS)}`,      cmp ? `₦${fmt(cmp.costOfGoodsSold?.fuelCOGS)}`      : "", "");
    row("", "Lubricant Cost of Sales",  `₦${fmt(IS.costOfGoodsSold?.lubricantCOGS)}`, cmp ? `₦${fmt(cmp.costOfGoodsSold?.lubricantCOGS)}` : "", "");
    row("", "TOTAL COGS",               `₦${fmt(IS.costOfGoodsSold?.totalCOGS)}`,     cmp ? `₦${fmt(cmp.costOfGoodsSold?.totalCOGS)}`     : "", "");
    row("","","","","");
    row("", "GROSS PROFIT", `₦${fmt(IS.grossProfit)}`, cmp ? `₦${fmt(cmp.grossProfit)}` : "", "");
    row("","","","","");
    row("OPERATING EXPENSES");
    row("", "Salaries & Wages",        `₦${fmt(IS.operatingExpenses?.salariesAndWages)}`,      cmp ? `₦${fmt(cmp.operatingExpenses?.salariesAndWages)}`      : "", "");
    row("", "Utilities",               `₦${fmt(IS.operatingExpenses?.utilities)}`,             cmp ? `₦${fmt(cmp.operatingExpenses?.utilities)}`             : "", "");
    row("", "Maintenance & Repairs",   `₦${fmt(IS.operatingExpenses?.maintenance)}`,           cmp ? `₦${fmt(cmp.operatingExpenses?.maintenance)}`           : "", "");
    row("", "Other Expenses",          `₦${fmt(IS.operatingExpenses?.otherExpenses)}`,         cmp ? `₦${fmt(cmp.operatingExpenses?.otherExpenses)}`         : "", "");
    row("", "TOTAL OPERATING EXPENSES",`₦${fmt(IS.operatingExpenses?.totalOperatingExpenses)}`,cmp ? `₦${fmt(cmp.operatingExpenses?.totalOperatingExpenses)}`: "", "");
    row("","","","","");
    row("", "NET PROFIT", `₦${fmt(IS.netProfit)}`, cmp ? `₦${fmt(cmp.netProfit)}` : "", "");
  }

  else if (active === "linkTwo") {
    const BS = balanceSheet || {};
    row("BALANCE SHEET");
    row("Section", "Item", "Value");
    row("","","");
    row("CURRENT ASSETS");
    row("", "Cash and Cash Equivalent", `₦${fmt(BS.assets?.currentAssets?.cashAndCashEquivalent)}`);
    row("", "Inventory - Fuel",         `₦${fmt(BS.assets?.currentAssets?.inventoryFuel)}`);
    row("", "Inventory - Lubricant",    `₦${fmt(BS.assets?.currentAssets?.inventoryLubricant)}`);
    row("", "TOTAL CURRENT ASSETS",     `₦${fmt(BS.assets?.currentAssets?.totalCurrentAssets)}`);
    row("","","");
    row("FIXED ASSETS");
    row("", "Land & Building",  `₦${fmt(BS.assets?.fixedAssets?.landAndBuilding)}`);
    row("", "Fuel Dispenser",   `₦${fmt(BS.assets?.fixedAssets?.fuelDispenser)}`);
    row("", "Other Equipment",  `₦${fmt(BS.assets?.fixedAssets?.otherEquipment)}`);
    row("", "TOTAL FIXED ASSETS",`₦${fmt(BS.assets?.fixedAssets?.totalFixedAssets)}`);
    row("", "TOTAL ASSETS",     `₦${fmt(BS.assets?.totalAssets)}`);
    row("","","");
    row("CURRENT LIABILITIES");
    row("", "Accounts Payable",          `₦${fmt(BS.liabilities?.currentLiabilities?.accountsPayable)}`);
    row("", "Accrued Expenses",          `₦${fmt(BS.liabilities?.currentLiabilities?.accruedExpenses)}`);
    row("", "Tax Payable",               `₦${fmt(BS.liabilities?.currentLiabilities?.taxPayable)}`);
    row("", "TOTAL CURRENT LIABILITIES",`₦${fmt(BS.liabilities?.currentLiabilities?.totalCurrentLiabilities)}`);
    row("","","");
    row("LONG-TERM LIABILITIES");
    row("", "Long-term Loans",      `₦${fmt(BS.liabilities?.longTermLiabilities?.longTermLoans)}`);
    row("", "Equipment Financing",  `₦${fmt(BS.liabilities?.longTermLiabilities?.equipmentFinancing)}`);
    row("", "TOTAL LONG-TERM",      `₦${fmt(BS.liabilities?.longTermLiabilities?.totalLongTermLiabilities)}`);
    row("", "TOTAL LIABILITIES",    `₦${fmt(BS.liabilities?.totalLiabilities)}`);
    row("","","");
    row("EQUITY");
    row("", "Owner's Capital",       `₦${fmt(BS.equity?.ownersCapital)}`);
    row("", "Retained Earnings",     `₦${fmt(BS.equity?.retainedEarnings)}`);
    row("", "Current Year Earnings", `₦${fmt(BS.equity?.currentYearEarnings)}`);
    row("", "TOTAL EQUITY",          `₦${fmt(BS.equity?.totalEquity)}`);
    row("","","");
    row("", "TOTAL LIABILITIES & EQUITY", `₦${fmt(BS.totalLiabilitiesAndEquity)}`);
  }

  else if (active === "linkThree") {
    const CF = cashflow || {};
    row("CASH FLOW STATEMENT");
    row("Item", "Value");
    row("Total Inflow",  `₦${fmt(CF.totalInflow)}`);
    row("Total Outflow", `₦${fmt(CF.totalOutflow)}`);
    row("Net Cashflow",  `₦${fmt(CF.netCashflow)}`);
    row("","");
    row("INFLOW BREAKDOWN");
    row("Fuel Sales",      `₦${fmt(CF.inflowBreakdown?.fuel)}`);
    row("Lubricant Sales", `₦${fmt(CF.inflowBreakdown?.lubricant)}`);
    row("","");
    row("OUTFLOW BREAKDOWN");
    row("Fuel Procurement",       `₦${fmt(CF.outflowBreakdown?.fuelProcurement)}`);
    row("Operational Expenses",   `₦${fmt(CF.outflowBreakdown?.operationalExpenses)}`);
    row("Staff Salaries",         `₦${fmt(CF.outflowBreakdown?.staffSalaries)}`);
    row("Maintenance",            `₦${fmt(CF.outflowBreakdown?.maintenance)}`);
    row("","");
    if (CF.recentTransactions?.length) {
      row("RECENT TRANSACTIONS");
      row("Date", "Description", "Amount", "Type");
      CF.recentTransactions.forEach((t) =>
        row(
          t.date ? new Date(t.date).toLocaleDateString("en-GB") : "",
          t.service || "",
          `₦${fmt(t.amount)}`,
          t.type || ""
        )
      );
    }
  }

  else if (active === "linkFour") {
    const KR = keyRatios || {};
    row("KEY FINANCIAL RATIOS");
    row("Category", "Ratio", "Value");
    row("","","");
    row("PROFITABILITY");
    row("", "Gross Profit Margin",     fmtPct(KR.profitability?.grossProfitMargin));
    row("", "Operating Profit Margin", fmtPct(KR.profitability?.operatingProfitMargin));
    row("", "Net Profit Margin",       fmtPct(KR.profitability?.netProfitMargin));
    row("", "Return on Assets",        fmtPct(KR.profitability?.returnOnAssets));
    row("", "Return on Equity",        fmtPct(KR.profitability?.returnOnEquity));
    row("","","");
    row("LIQUIDITY");
    row("", "Current Ratio",   KR.liquidity?.currentRatio  ?? "N/A");
    row("", "Quick Ratio",     KR.liquidity?.quickRatio    ?? "N/A");
    row("", "Cash Ratio",      KR.liquidity?.cashRatio     ?? "N/A");
    row("", "Working Capital", `₦${fmt(KR.liquidity?.workingCapital)}`);
    row("","","");
    row("EFFICIENCY");
    row("", "Inventory Turnover",     fmtX(KR.efficiency?.inventoryTurnover));
    row("", "Asset Turnover",         fmtX(KR.efficiency?.assetTurnover));
    row("", "Receivables Turnover",   KR.efficiency?.receivablesTurnover ?? "N/A (cash business)");
    row("", "Day Sales Outstanding",  KR.efficiency?.daySalesOutstanding ?? "N/A");
    row("","","");
    row("LEVERAGE");
    row("", "Debt-to-Assets",     fmtPct(KR.leverage?.debtToAssets));
    row("", "Debt-to-Equity",     fmtPct(KR.leverage?.debtToEquity));
    row("", "Interest Coverage",  KR.leverage?.interestCoverage  ?? "N/A");
    row("", "Equity Multiplier",  KR.leverage?.equityMultiplier  ?? "N/A");
  }

  return rows.join("\n");
}

// ── Print HTML builder ────────────────────────────────────────────────────────
function buildPrintHTML(activeTab, data) {
  const { incomeStatement, balanceSheet, cashflow, keyRatios } = data;
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const table = (headers, rows) => `
    <table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;

  const section = (title, content) => `
    <div class="section">
      <h3>${title}</h3>
      ${content}
    </div>`;

  let body = "";

  if (activeTab === "linkOne") {
    const IS  = incomeStatement || {};
    const cmp = IS.comparison;
    const cols = cmp
      ? ["Description", "Current Period", "Previous Period", "Variance"]
      : ["Description", "Amount"];

    const varPct = (c, p) => {
      if (!p) return "—";
      const pct = ((c - p) / Math.abs(p)) * 100;
      return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
    };

    const revRows = [
      ["PMS Sales",       `₦${fmt(IS.revenue?.pmsSales)}`,       ...(cmp ? [`₦${fmt(cmp.revenue?.pmsSales)}`,       varPct(IS.revenue?.pmsSales,       cmp.revenue?.pmsSales)]       : [])],
      ["AGO / Diesel",    `₦${fmt(IS.revenue?.agoSales)}`,       ...(cmp ? [`₦${fmt(cmp.revenue?.agoSales)}`,       varPct(IS.revenue?.agoSales,       cmp.revenue?.agoSales)]       : [])],
      ["DPK / Kerosene",  `₦${fmt(IS.revenue?.dpkSales)}`,       ...(cmp ? [`₦${fmt(cmp.revenue?.dpkSales)}`,       varPct(IS.revenue?.dpkSales,       cmp.revenue?.dpkSales)]       : [])],
      ["Lubricant Sales", `₦${fmt(IS.revenue?.lubricantSales)}`, ...(cmp ? [`₦${fmt(cmp.revenue?.lubricantSales)}`, varPct(IS.revenue?.lubricantSales, cmp.revenue?.lubricantSales)] : [])],
      ["<strong>TOTAL REVENUE</strong>", `<strong>₦${fmt(IS.revenue?.totalRevenue)}</strong>`, ...(cmp ? [`<strong>₦${fmt(cmp.revenue?.totalRevenue)}</strong>`, varPct(IS.revenue?.totalRevenue, cmp.revenue?.totalRevenue)] : [])],
    ];

    const cogsRows = [
      ["Fuel Cost of Sales",       `₦${fmt(IS.costOfGoodsSold?.fuelCOGS)}`,       ...(cmp ? [`₦${fmt(cmp.costOfGoodsSold?.fuelCOGS)}`,       ""] : [])],
      ["Lubricant Cost of Sales",  `₦${fmt(IS.costOfGoodsSold?.lubricantCOGS)}`,  ...(cmp ? [`₦${fmt(cmp.costOfGoodsSold?.lubricantCOGS)}`,  ""] : [])],
      ["<strong>TOTAL COGS</strong>", `<strong>₦${fmt(IS.costOfGoodsSold?.totalCOGS)}</strong>`, ...(cmp ? [`<strong>₦${fmt(cmp.costOfGoodsSold?.totalCOGS)}</strong>`, ""] : [])],
    ];

    const expRows = [
      ["Salaries & Wages",         `₦${fmt(IS.operatingExpenses?.salariesAndWages)}`,       ...(cmp ? [`₦${fmt(cmp.operatingExpenses?.salariesAndWages)}`, ""]       : [])],
      ["Utilities",                `₦${fmt(IS.operatingExpenses?.utilities)}`,              ...(cmp ? [`₦${fmt(cmp.operatingExpenses?.utilities)}`, ""]              : [])],
      ["Maintenance & Repairs",    `₦${fmt(IS.operatingExpenses?.maintenance)}`,            ...(cmp ? [`₦${fmt(cmp.operatingExpenses?.maintenance)}`, ""]            : [])],
      ["Other Expenses",           `₦${fmt(IS.operatingExpenses?.otherExpenses)}`,          ...(cmp ? [`₦${fmt(cmp.operatingExpenses?.otherExpenses)}`, ""]          : [])],
      ["<strong>TOTAL OPERATING EXPENSES</strong>", `<strong>₦${fmt(IS.operatingExpenses?.totalOperatingExpenses)}</strong>`, ...(cmp ? [`<strong>₦${fmt(cmp.operatingExpenses?.totalOperatingExpenses)}</strong>`, ""] : [])],
    ];

    body = `
      ${section("Revenue", table(cols, revRows))}
      ${section("Cost of Goods Sold", table(cols, cogsRows))}
      <div class="summary-line">GROSS PROFIT: <strong>₦${fmt(IS.grossProfit)}</strong></div>
      ${section("Operating Expenses", table(cols, expRows))}
      <div class="summary-line net">NET PROFIT: <strong>₦${fmt(IS.netProfit)}</strong></div>
    `;
  }

  else if (activeTab === "linkTwo") {
    const BS = balanceSheet || {};
    body = `
      ${section("Current Assets", table(["Item","Value"], [
        ["Cash and Cash Equivalent", `₦${fmt(BS.assets?.currentAssets?.cashAndCashEquivalent)}`],
        ["Inventory - Fuel",         `₦${fmt(BS.assets?.currentAssets?.inventoryFuel)}`],
        ["Inventory - Lubricant",    `₦${fmt(BS.assets?.currentAssets?.inventoryLubricant)}`],
        ["<strong>Total Current Assets</strong>", `<strong>₦${fmt(BS.assets?.currentAssets?.totalCurrentAssets)}</strong>`],
      ]))}
      ${section("Fixed Assets", table(["Item","Value"], [
        ["Land & Building",  `₦${fmt(BS.assets?.fixedAssets?.landAndBuilding)}`],
        ["Fuel Dispenser",   `₦${fmt(BS.assets?.fixedAssets?.fuelDispenser)}`],
        ["Other Equipment",  `₦${fmt(BS.assets?.fixedAssets?.otherEquipment)}`],
        ["<strong>Total Fixed Assets</strong>", `<strong>₦${fmt(BS.assets?.fixedAssets?.totalFixedAssets)}</strong>`],
        ["<strong>TOTAL ASSETS</strong>", `<strong>₦${fmt(BS.assets?.totalAssets)}</strong>`],
      ]))}
      ${section("Liabilities", table(["Item","Value"], [
        ["Accounts Payable",          `₦${fmt(BS.liabilities?.currentLiabilities?.accountsPayable)}`],
        ["Accrued Expenses",          `₦${fmt(BS.liabilities?.currentLiabilities?.accruedExpenses)}`],
        ["Tax Payable",               `₦${fmt(BS.liabilities?.currentLiabilities?.taxPayable)}`],
        ["Long-term Loans",           `₦${fmt(BS.liabilities?.longTermLiabilities?.longTermLoans)}`],
        ["Equipment Financing",       `₦${fmt(BS.liabilities?.longTermLiabilities?.equipmentFinancing)}`],
        ["<strong>TOTAL LIABILITIES</strong>", `<strong>₦${fmt(BS.liabilities?.totalLiabilities)}</strong>`],
      ]))}
      ${section("Equity", table(["Item","Value"], [
        ["Owner's Capital",       `₦${fmt(BS.equity?.ownersCapital)}`],
        ["Retained Earnings",     `₦${fmt(BS.equity?.retainedEarnings)}`],
        ["Current Year Earnings", `₦${fmt(BS.equity?.currentYearEarnings)}`],
        ["<strong>TOTAL EQUITY</strong>", `<strong>₦${fmt(BS.equity?.totalEquity)}</strong>`],
        ["<strong>TOTAL LIABILITIES & EQUITY</strong>", `<strong>₦${fmt(BS.totalLiabilitiesAndEquity)}</strong>`],
      ]))}
    `;
  }

  else if (activeTab === "linkThree") {
    const CF = cashflow || {};
    body = `
      ${section("Summary", table(["Item","Value"], [
        ["Total Inflow",  `₦${fmt(CF.totalInflow)}`],
        ["Total Outflow", `₦${fmt(CF.totalOutflow)}`],
        ["<strong>Net Cashflow</strong>", `<strong>₦${fmt(CF.netCashflow)}</strong>`],
      ]))}
      ${section("Inflow Breakdown", table(["Source","Amount"], [
        ["Fuel Sales",      `₦${fmt(CF.inflowBreakdown?.fuel)}`],
        ["Lubricant Sales", `₦${fmt(CF.inflowBreakdown?.lubricant)}`],
      ]))}
      ${section("Outflow Breakdown", table(["Category","Amount"], [
        ["Fuel Procurement",     `₦${fmt(CF.outflowBreakdown?.fuelProcurement)}`],
        ["Operational Expenses", `₦${fmt(CF.outflowBreakdown?.operationalExpenses)}`],
        ["Staff Salaries",       `₦${fmt(CF.outflowBreakdown?.staffSalaries)}`],
        ["Maintenance",          `₦${fmt(CF.outflowBreakdown?.maintenance)}`],
      ]))}
      ${CF.recentTransactions?.length ? section("Recent Transactions", table(
        ["Date","Description","Amount","Type"],
        CF.recentTransactions.map(t => [
          t.date ? new Date(t.date).toLocaleDateString("en-GB") : "",
          t.service || "",
          `₦${fmt(t.amount)}`,
          t.type || "",
        ])
      )) : ""}
    `;
  }

  else if (activeTab === "linkFour") {
    const KR = keyRatios || {};
    const na = v => v === null || v === undefined ? "N/A" : v;
    body = `
      ${section("Profitability Ratios", table(["Ratio","Value"], [
        ["Gross Profit Margin",     fmtPct(KR.profitability?.grossProfitMargin)],
        ["Operating Profit Margin", fmtPct(KR.profitability?.operatingProfitMargin)],
        ["Net Profit Margin",       fmtPct(KR.profitability?.netProfitMargin)],
        ["Return on Assets",        fmtPct(KR.profitability?.returnOnAssets)],
        ["Return on Equity",        fmtPct(KR.profitability?.returnOnEquity)],
      ]))}
      ${section("Liquidity Ratios", table(["Ratio","Value"], [
        ["Current Ratio",   na(KR.liquidity?.currentRatio)],
        ["Quick Ratio",     na(KR.liquidity?.quickRatio)],
        ["Cash Ratio",      na(KR.liquidity?.cashRatio)],
        ["Working Capital", `₦${fmt(KR.liquidity?.workingCapital)}`],
      ]))}
      ${section("Efficiency Ratios", table(["Ratio","Value"], [
        ["Inventory Turnover",    fmtX(KR.efficiency?.inventoryTurnover)],
        ["Asset Turnover",        fmtX(KR.efficiency?.assetTurnover)],
        ["Receivables Turnover",  na(KR.efficiency?.receivablesTurnover)],
        ["Day Sales Outstanding", na(KR.efficiency?.daySalesOutstanding)],
      ]))}
      ${section("Leverage Ratios", table(["Ratio","Value"], [
        ["Debt-to-Assets",    fmtPct(KR.leverage?.debtToAssets)],
        ["Debt-to-Equity",    fmtPct(KR.leverage?.debtToEquity)],
        ["Interest Coverage", na(KR.leverage?.interestCoverage)],
        ["Equity Multiplier", na(KR.leverage?.equityMultiplier)],
      ]))}
    `;
  }

  const tabLabels = {
    linkOne: "Income Statement", linkTwo: "Balance Sheet",
    linkThree: "Cash Flow Statement", linkFour: "Key Financial Ratios",
  };

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${tabLabels[activeTab]} — ${date}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 24px 32px; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  h2 { font-size: 13px; color: #555; margin-bottom: 16px; font-weight: 400; }
  h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
       color: #444; margin: 16px 0 6px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th { background: #f5f5f5; text-align: left; padding: 5px 8px; font-size: 10px;
       text-transform: uppercase; letter-spacing: .04em; color: #666; }
  td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .summary-line { background:#e8f5e9; border-left:3px solid #4caf50; padding:7px 12px;
                  margin:8px 0; font-size:13px; }
  .summary-line.net { background:#e3f2fd; border-left-color:#1976d2; }
  .section { margin-bottom: 4px; }
  @media print {
    body { padding: 16px; }
    @page { margin: 12mm; size: A4; }
    * { color: #000000 !important; opacity: 1 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #fff !important; }
  }
</style>
</head>
<body>
  <h1>${tabLabels[activeTab]}</h1>
  <h2>Generated on ${date}</h2>
  ${body}
</body>
</html>`;
}

// ── Compare presets ───────────────────────────────────────────────────────────
const PRESETS = [
  { label: "This vs Last Month", fn: () => [currentMonthStr(), prevMonthStr()] },
  {
    label: "This vs Last Quarter",
    fn: () => {
      const now = new Date();
      const curQ = Math.floor(now.getMonth() / 3);
      const curY = now.getFullYear();
      const cur  = `${curY}-${String(curQ * 3 + 1).padStart(2, "0")}`;
      const prevM = new Date(curY, curQ * 3 - 1, 1);
      return [cur, `${prevM.getFullYear()}-${String(prevM.getMonth() + 1).padStart(2, "0")}`];
    },
  },
  {
    label: "This vs Last Year",
    fn: () => { const y = new Date().getFullYear(); return [`${y}-01`, `${y-1}-01`]; },
  },
];

const TABS = [
  { id: "linkOne",   label: "Income Statement", hasCompare: true  },
  { id: "linkTwo",   label: "Balance Sheet",    hasCompare: false },
  { id: "linkThree", label: "Cashflow",          hasCompare: false },
  { id: "linkFour",  label: "Key Ratios",        hasCompare: false },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FinancialStatement() {
  const [active, setActive]               = useState("linkOne");
  const [showCompare, setShowCompare]     = useState(false);
  const [showExport, setShowExport]       = useState(false);
  const [currentMonth, setCurrentMonth]   = useState(currentMonthStr);
  const [previousMonth, setPreviousMonth] = useState(prevMonthStr);
  const [compareActive, setCompareActive] = useState(false);
  const exportRef = useRef(null);

  const {
    fetchIncomeStatement, loading,
    incomeStatement, balanceSheet, cashflow, keyRatios,
  } = useAccountantStore();

  const activeTab = TABS.find((t) => t.id === active);

  // Close export dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Compare handlers ──────────────────────────────────────────────────────
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

  // ── Export handlers ───────────────────────────────────────────────────────
  function handleExportCSV() {
    setShowExport(false);
    const csv  = buildCSV(active, { incomeStatement, balanceSheet, cashflow, keyRatios });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const name = TABS.find(t => t.id === active)?.label.replace(/ /g, "_") || "report";
    a.href     = url;
    a.download = `${name}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPDF() {
    setShowExport(false);
    const html  = buildPrintHTML(active, { incomeStatement, balanceSheet, cashflow, keyRatios });
    const win   = window.open("", "_blank", "width=900,height=700");
    if (!win) { alert("Allow pop-ups to export PDF."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
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
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-xl sm:text-2xl text-gray-600">Full Financial Statement</h3>
            <p className="text-gray-500 font-medium text-sm mt-0.5">View and export all financial statements</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center shrink-0">
            {/* Compare — Income Statement only */}
            {activeTab?.hasCompare && (
              <div className="relative">
                <button
                  onClick={() => { setShowExport(false); setShowCompare(v => !v); }}
                  className={`cursor-pointer flex gap-2 items-center border-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    compareActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-[#e7e7e7] text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <BarChart2 size={16} />
                  {compareActive
                    ? `${fmtMonthLabel(currentMonth)} vs ${fmtMonthLabel(previousMonth)}`
                    : "Compare"}
                  {showCompare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {compareActive && (
                  <button onClick={clearComparison}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
                    title="Clear comparison">
                    <X size={10} />
                  </button>
                )}
              </div>
            )}

            {/* Export dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => { setShowCompare(false); setShowExport(v => !v); }}
                className="cursor-pointer bg-[#0080ff] hover:bg-blue-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Export
                {showExport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showExport && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-40">
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FileSpreadsheet size={15} className="text-green-600 shrink-0" />
                    <div className="text-left">
                      <p className="font-medium leading-tight">Download CSV</p>
                      <p className="text-xs text-gray-400">Open in Excel / Sheets</p>
                    </div>
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FileText size={15} className="text-red-500 shrink-0" />
                    <div className="text-left">
                      <p className="font-medium leading-tight">Export PDF</p>
                      <p className="text-xs text-gray-400">Print or save as PDF</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Tab bar ─────────────────────────────────────────────── */}
        <div className="bg-white w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm py-2 px-3 rounded-[14px] border-2 border-[#e7e7e7] mt-4">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActive(tab.id)}
              className={`flex items-center justify-center px-2 py-2.5 font-semibold cursor-pointer rounded-[10px] transition-colors text-center text-xs sm:text-sm leading-snug ${
                active === tab.id ? "bg-[#d9edff] text-[#1a71f6]" : "bg-white text-gray-400 hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
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
          onClick={(e) => e.target === e.currentTarget && setShowCompare(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] overflow-hidden border border-gray-100">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BarChart2 size={15} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Comparison Selector</h3>
              </div>
              <button onClick={() => setShowCompare(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Select</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button key={p.label} onClick={() => applyPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-xs font-medium transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100" />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current period</label>
                <input type="month" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm text-gray-700 bg-white font-medium cursor-pointer hover:border-gray-300 transition-colors" />
                <p className="text-xs text-gray-400">{fmtMonthLabel(currentMonth)}</p>
              </div>

              <div className="flex items-center justify-center">
                <button onClick={() => { const t = currentMonth; setCurrentMonth(previousMonth); setPreviousMonth(t); }}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  title="Swap periods">
                  <ArrowUpDown size={14} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Previous period</label>
                <input type="month" value={previousMonth} onChange={(e) => setPreviousMonth(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm text-gray-700 bg-white font-medium cursor-pointer hover:border-gray-300 transition-colors" />
                <p className="text-xs text-gray-400">{fmtMonthLabel(previousMonth)}</p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setShowCompare(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={applyComparison}
                disabled={!currentMonth || !previousMonth || loading.incomeStatement}
                className="flex-grow py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading.incomeStatement ? "Loading…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

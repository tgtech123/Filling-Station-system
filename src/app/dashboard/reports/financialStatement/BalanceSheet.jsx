import { useState, useEffect } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import useAccountantStore from "@/store/useAccountantStore";

export default function BalanceSheet() {
  const { balanceSheet, loading, errors, fetchBalanceSheet } = useAccountantStore();
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const pad = (n) => String(n).padStart(2, "0");
    const startDate = `${y}-${pad(m + 1)}-01`;
    const endDate   = `${y}-${pad(m + 1)}-${new Date(y, m + 1, 0).getDate()}`;
    setDateRange({ startDate, endDate });
    fetchBalanceSheet(startDate, endDate);
  }, [fetchBalanceSheet]);

  const fc = (v) =>
    `₦${Number(v || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const periodLabel = () => {
    if (!dateRange.startDate) return "";
    const d = new Date(dateRange.startDate);
    return `${["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  };

  if (loading.balanceSheet && !balanceSheet) {
    return (
      <DisplayCard>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="mt-2 text-sm text-gray-500">Loading balance sheet…</p>
          </div>
        </div>
      </DisplayCard>
    );
  }

  if (errors.balanceSheet) {
    return (
      <DisplayCard>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Error: {errors.balanceSheet}</p>
          <button
            onClick={() => fetchBalanceSheet(dateRange.startDate, dateRange.endDate)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </DisplayCard>
    );
  }

  const ca  = balanceSheet?.assets?.currentAssets   || {};
  const fa  = balanceSheet?.assets?.fixedAssets      || {};
  const cl  = balanceSheet?.liabilities?.currentLiabilities  || {};
  const ltl = balanceSheet?.liabilities?.longTermLiabilities || {};
  const eq  = balanceSheet?.equity || {};

  const TotalBar = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4 mt-2 py-3 px-4 bg-gray-100 rounded-lg">
      <p className="text-gray-700 font-semibold text-sm">{label}</p>
      <p className="text-gray-700 font-semibold text-sm shrink-0">{fc(value)}</p>
    </div>
  );

  const SectionBox = ({ title, children }) => (
    <div className="border border-[#e7e7e7] rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h4 className="font-semibold text-gray-600 uppercase text-sm tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <DisplayCard>
      <h4 className="text-gray-600 text-lg sm:text-xl font-semibold mb-4">{periodLabel()}</h4>

      <div className="space-y-4">

        {/* ── ASSETS ── */}
        <SectionBox title="Assets">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-px bg-[#e7e7e7]">
            <div className="bg-white p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Current Assets</p>
              <Table
                columns={["Item", "Amount"]}
                data={[
                  ["Cash & Cash Equivalent",  fc(ca.cashAndCashEquivalent)],
                  ["Inventory — Fuel",         fc(ca.inventoryFuel)],
                  ["Inventory — Lubricant",    fc(ca.inventoryLubricant)],
                  ["Total Current Assets",     fc(ca.totalCurrentAssets)],
                ]}
                highlightedRowIndices={[3]}
              />
            </div>
            <div className="bg-white p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Fixed Assets</p>
              <Table
                columns={["Item", "Amount"]}
                data={[
                  ["Land & Building",  fc(fa.landAndBuilding)],
                  ["Fuel Dispenser",   fc(fa.fuelDispenser)],
                  ["Other Equipment",  fc(fa.otherEquipment)],
                  ["Total Fixed Assets", fc(fa.totalFixedAssets)],
                ]}
                highlightedRowIndices={[3]}
              />
            </div>
          </div>
          <div className="px-3 pb-3">
            <TotalBar label="TOTAL ASSETS" value={balanceSheet?.assets?.totalAssets} />
          </div>
        </SectionBox>

        {/* ── LIABILITIES ── */}
        <SectionBox title="Liabilities">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-px bg-[#e7e7e7]">
            <div className="bg-white p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Current Liabilities</p>
              <Table
                columns={["Item", "Amount"]}
                data={[
                  ["Accounts Payable",        fc(cl.accountsPayable)],
                  ["Accrued Expenses",         fc(cl.accruedExpenses)],
                  ["Tax Payable",              fc(cl.taxPayable)],
                  ["Total Current Liabilities",fc(cl.totalCurrentLiabilities)],
                ]}
                highlightedRowIndices={[3]}
              />
            </div>
            <div className="bg-white p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Long-Term Liabilities</p>
              <Table
                columns={["Item", "Amount"]}
                data={[
                  ["Long-term Loans",      fc(ltl.longTermLoans)],
                  ["Equipment Financing",  fc(ltl.equipmentFinancing)],
                  ["Total Long-term",      fc(ltl.totalLongTermLiabilities)],
                ]}
                highlightedRowIndices={[2]}
              />
            </div>
          </div>
          <div className="px-3">
            <TotalBar label="TOTAL LIABILITIES" value={balanceSheet?.liabilities?.totalLiabilities} />
          </div>
        </SectionBox>

        {/* ── EQUITY ── */}
        <SectionBox title="Equity">
          <div className="p-3">
            <Table
              columns={["Item", "Amount"]}
              data={[
                ["Owner's Capital",       fc(eq.ownersCapital)],
                ["Retained Earnings",     fc(eq.retainedEarnings)],
                ["Current Year Earnings", fc(eq.currentYearEarnings)],
                ["Total Equity",          fc(eq.totalEquity)],
              ]}
              highlightedRowIndices={[3]}
            />
          </div>
        </SectionBox>

        {/* ── Grand total ── */}
        <div className="flex items-center justify-between gap-4 py-4 px-5 bg-gray-800 text-white rounded-xl">
          <p className="font-bold text-sm sm:text-base">TOTAL LIABILITIES & EQUITY</p>
          <p className="font-bold text-sm sm:text-base shrink-0">{fc(balanceSheet?.totalLiabilitiesAndEquity)}</p>
        </div>

      </div>
    </DisplayCard>
  );
}

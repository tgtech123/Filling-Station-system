'use client';
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import TableHere from '@/components/TableHere';
import useManagerReportsStore from '@/store/useManagerReportsStore';

// ── Column headers — match the API fields in order ────────────────────────────
const colHeader = [
  "Date",
  "Attendant",
  "Pump No",
  "Product",
  "Litres Sold",
  "Price/Ltr",
  "Amount",
  "Cash Received",
  "Discrepancy",
  "Status",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatCurrency = (value) => {
  if (value == null) return "—";
  return `₦${Number(value).toLocaleString()}`;
};

const formatDiscrepancy = (value) => {
  if (value == null) return "—";
  const num = Number(value);
  if (num > 0) return `+₦${num.toLocaleString()}`;
  if (num < 0) return `-₦${Math.abs(num).toLocaleString()}`;
  return `₦0`;
};

// ── Map a single cashOverview record → flat row array ─────────────────────────
// API shape: { date, attendant, pumpNo, product, litresSold,
//              pricePerLtr, amount, cashReceived, discrepancies, status }
const mapCashRow = (record) => [
  formatDate(record.date),
  record.attendant          ?? "—",
  record.pumpNo             ?? "—",
  record.product            ?? "—",
  record.litresSold != null ? `${record.litresSold}L` : "—",
  formatCurrency(record.pricePerLtr),
  formatCurrency(record.amount),
  formatCurrency(record.cashReceived),
  formatDiscrepancy(record.discrepancies),
  record.status             ?? "—",
];

// ── Component ─────────────────────────────────────────────────────────────────
const CashRecord = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const cashOverview  = useManagerReportsStore((state) => state.cashOverview);
  const cashLoading   = useManagerReportsStore((state) => state.loading.cashOverview);
  const cashError     = useManagerReportsStore((state) => state.errors.cashOverview);

  // Map API records → 2D row arrays
  const allRows = (cashOverview?.records ?? []).map(mapCashRow);

  // Client-side search — filters by Attendant (index 1) or Product (index 3)
  const filteredRows = allRows.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      row[1]?.toLowerCase().includes(query) ||
      row[3]?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white rounded-2xl mt-[1.5rem] flex flex-col p-[1rem]">
      <div className="lg:flex flex-wrap w-full lg:gap-0 gap-4 justify-between mb-[1.25rem]">
        <p className="flex flex-col">
          <span className="font-semibold text-[1.2rem] text-neutral-800">
            Cash Reconciliation Records
          </span>
          <span className="text-[0.9rem]">Monitor reconciliation activities</span>
        </p>

        {/* Search bar */}
        <div className="relative flex items-center lg:mt-0 mt-[1rem]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Attendant or Product"
            className="w-[20.718rem] h-[2.325rem] pl-10 text-gray-700 text-sm border-2 border-neutral-300 rounded-lg focus:border-2 focus:border-blue-500 focus:outline-none"
          />
          <Search size={26} className="absolute ml-2 mt-6 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Error state */}
      {cashError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {cashError}
        </div>
      )}

      {/* Loading skeleton */}
      {cashLoading ? (
        <div className="space-y-3 mt-[1rem]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <TableHere columns={colHeader} data={filteredRows} />
      )}
    </div>
  );
};

export default CashRecord;
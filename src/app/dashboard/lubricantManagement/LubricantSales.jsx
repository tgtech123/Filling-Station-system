"use client";

import React, { useEffect, useMemo, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import CustomTable from "@/components/Table";
import useStaffStore from "@/store/useStaffStore";
import { useLubricantStore } from "@/store/lubricantStore";


export default function LubricantSales() {
  const { transactions: transactionsRaw, transactionsLoading: loading, fetchAllTransactions } = useLubricantStore();
  const [flatRows, setFlatRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🆕 Filter states
  const [selectedCashier, setSelectedCashier] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("");

  // 🆕 Get staff from store
  const { staff, getAllStaff } = useStaffStore();

  const itemsPerPage = 10;

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return iso;
    }
  };

  // Fetch staff on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) getAllStaff(token);
  }, [getAllStaff]);

  // Fetch transactions from shared store on mount
  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // Flatten transactions -> array of arrays for CustomTable
  // row layout: [date, cashier, txnId, barcode, productName, qty, amount, displayPayment, filterKey]
  //   [7] displayPayment — shown in the table  (e.g. "Cash (mixed)")
  //   [8] filterKey      — used for filtering  (e.g. "cash")
  useEffect(() => {
    const rows = [];
    (transactionsRaw || []).forEach((txn) => {
      const date      = txn?.date ? formatDate(txn.date) : "";
      const cashier   = txn?.staffName ?? "Unknown";
      const txnId     = txn?.txnId ?? "";
      const method    = txn?.paymentMethod ?? "";
      const breakdown = txn?.paymentBreakdown;
      const items     = Array.isArray(txn.items) ? txn.items : [];

      if (method === "mixed") {
        // Build one row per active breakdown component (breakdown amount as the amount)
        const components = breakdown ? [
          { key: "cash",     label: "Cash (mixed)",     amount: Number(breakdown.cash     || 0) },
          { key: "transfer", label: "Transfer (mixed)",  amount: Number(breakdown.transfer || 0) },
          { key: "POS",      label: "POS (mixed)",       amount: Number(breakdown.POS      || 0) },
        ].filter((c) => c.amount > 0) : [];

        const productSummary =
          items.length === 0  ? "—" :
          items.length === 1  ? (items[0]?.productName ?? "—") :
          `${items[0]?.productName ?? "Item"} +${items.length - 1} more`;

        const totalQty = items.reduce((s, i) => s + (i?.qtySold || 0), 0);

        if (components.length > 0) {
          // Has breakdown — push one row per payment component
          components.forEach(({ key, label, amount }) => {
            rows.push([date, cashier, txnId, "", productSummary, totalQty, amount, label, key]);
          });
        } else {
          // No breakdown data (old transaction) — show as a single "mixed" row per item
          if (items.length === 0) {
            rows.push([date, cashier, txnId, "", productSummary, totalQty, txn.totalAmount || 0, "mixed", "mixed"]);
          } else {
            items.forEach((it) => {
              rows.push([
                date, cashier, txnId,
                it?.barcode ?? "",
                it?.productName ?? "",
                it?.qtySold ?? 0,
                it?.amount ?? 0,
                "mixed", "mixed",
              ]);
            });
          }
        }
      } else {
        // Non-mixed: one row per item (unchanged behaviour)
        if (items.length === 0) {
          rows.push([date, cashier, txnId, "", "", 0, 0, method, method]);
        } else {
          items.forEach((it) => {
            rows.push([
              date,
              cashier,
              txnId,
              it?.barcode ?? "",
              it?.productName ?? "",
              it?.qtySold ?? 0,
              it?.amount ?? 0,
              method,
              method,
            ]);
          });
        }
      }
    });

    setFlatRows(rows);
  }, [transactionsRaw]);

  // 🆕 Enhanced filter logic (search + filters)
  const filteredData = useMemo(() => {
    let result = flatRows;

    // Apply search term
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((row) =>
        row.some((cell) => String(cell ?? "").toLowerCase().includes(lower))
      );
    }

    // Apply cashier filter
    if (selectedCashier) {
      result = result.filter((row) => {
        const rowCashier = String(row[1] ?? "").toLowerCase();
        const filterCashier = selectedCashier.toLowerCase();
        return rowCashier === filterCashier;
      });
    }

    // Apply date filter
    if (selectedDate) {
      result = result.filter((row) => row[0] === selectedDate);
    }

    // Apply payment type filter — use canonical key [8] so "cash" matches
    // both pure-cash rows and "Cash (mixed)" rows
    if (selectedPaymentType) {
      result = result.filter((row) => row[8] === selectedPaymentType);
    }

    return result;
  }, [flatRows, searchTerm, selectedCashier, selectedDate, selectedPaymentType]);

  // Calculate total amount from filtered data
  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, row) => {
      const amount = parseFloat(row[6]) || 0;
      return sum + amount;
    }, 0);
  }, [filteredData]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedCashier, selectedDate, selectedPaymentType]);

  // Get unique canonical payment types for the filter dropdown (row[8])
  const paymentTypes = useMemo(() => {
    const types = new Set();
    flatRows.forEach((row) => {
      if (row[8]) types.add(row[8]);
    });
    return Array.from(types);
  }, [flatRows]);

  // Human-readable label for a canonical payment key
  const paymentTypeLabel = (key) => {
    const map = { cash: "Cash", transfer: "Transfer", POS: "POS", mixed: "Mixed" };
    return map[key] ?? key;
  };

  // 🆕 Get unique dates from transactions
  const uniqueDates = useMemo(() => {
    const dates = new Set();
    flatRows.forEach((row) => {
      if (row[0]) dates.add(row[0]);
    });
    return Array.from(dates).sort((a, b) => {
      // Sort dates in descending order (most recent first)
      const dateA = a.split('/').reverse().join('-');
      const dateB = b.split('/').reverse().join('-');
      return dateB.localeCompare(dateA);
    });
  }, [flatRows]);

  // 🆕 Handle filter clear
  const handleClearFilters = () => {
    setSelectedCashier("");
    setSelectedDate("");
    setSelectedPaymentType("");
  };

  // 🆕 Check if any filter is active
  const hasActiveFilters = selectedCashier || selectedDate || selectedPaymentType;

  const columns = ["Date", "Cashier", "Txn Id", "Barcode", "Product Name", "Quantity Sold", "Amount", "Payment"];

  return (
    <DisplayCard>
      <header className="flex flex-col lg:flex-row gap-2 lg:gap-0 justify-between items-start lg:items-end">
        <div>
          <h3 className="text-xl font-semibold">Recent Transactions</h3>
          <p>Latest sales activities</p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 w-full sm:w-[300px] lg:w-[400px] rounded-[8px] border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            placeholder="Search transactions..."
          />
          <Search className="text-gray-400 absolute top-2 right-3" />
        </div>
      </header>

      {/* 🆕 FILTERS SECTION */}
      <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cashier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cashier
            </label>
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="w-full p-2 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Cashiers</option>
              {staff
                .filter((cashier) => cashier.role === "cashier")
                .map((cashier) => {
                  const fullName = `${cashier.firstName} ${cashier.lastName}`;
                  return (
                    <option key={cashier._id} value={fullName}>
                      {fullName}
                    </option>
                  );
                })}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Dates</option>
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value)}
              className="w-full p-2 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Payment Types</option>
              {paymentTypes.map((type) => (
                <option key={type} value={type}>
                  {paymentTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              className={`w-full p-2 rounded-md font-medium transition-colors ${
                hasActiveFilters
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedCashier && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Cashier: {selectedCashier}
              </span>
            )}
            {selectedDate && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Date: {selectedDate}
              </span>
            )}
            {selectedPaymentType && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Payment: {paymentTypeLabel(selectedPaymentType)}
              </span>
            )}
          </div>
        )}
      </div>

      {(searchTerm || hasActiveFilters) && (
        <div className="text-sm text-gray-600 my-2">
          {totalItems > 0
            ? `Showing ${totalItems} result${totalItems !== 1 ? "s" : ""}`
            : `No results found`}
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading transactions...</div>
      ) : (
        <>
          <CustomTable columns={columns} data={currentData} />
          
          {/* Total Amount Display */}
          {totalItems > 0 && (
            <div className="mt-6 flex justify-end">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-4 w-full sm:w-auto sm:min-w-[250px]">
                <p className="text-sm text-gray-600 mb-1">
                  {searchTerm || hasActiveFilters ? "Filtered Total Amount" : "Total Amount"}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ₦{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {(searchTerm || hasActiveFilters) && (
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {totalItems} transaction{totalItems !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          {totalItems > 0 && totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={(p) => setCurrentPage(p)}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
          
          {!loading && flatRows.length === 0 && (
            <div className="text-center py-8 text-gray-500">No transactions recorded yet.</div>
          )}
        </>
      )}
    </DisplayCard>
  );
}
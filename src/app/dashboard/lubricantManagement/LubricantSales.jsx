"use client";

import React, { useEffect, useMemo, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";
import CustomTable from "@/components/Table";
import useStaffStore from "@/store/useStaffStore";

const API_URL = process.env.NEXT_PUBLIC_API || "";

export default function LubricantSales() {
  const [loading, setLoading] = useState(false);
  const [transactionsRaw, setTransactionsRaw] = useState([]);
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

  // 🆕 Fetch staff on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      getAllStaff(token);
    }
  }, [getAllStaff]);

  // 🆕 Debug logs for staff
  useEffect(() => {
    console.log("=== STAFF DEBUG ===");
    console.log("Staff array:", staff);
    console.log("Staff count:", staff.length);
    if (staff.length > 0) {
      console.log("First staff member:", staff[0]);
      console.log("Staff usernames:", staff.map(s => s.username));
    }
  }, [staff]);

  // 🆕 Debug logs for transactions
  useEffect(() => {
    if (flatRows.length > 0) {
      console.log("=== TRANSACTIONS DEBUG ===");
      console.log("Total transactions:", flatRows.length);
      console.log("First transaction row:", flatRows[0]);
      console.log("Cashier in first transaction (index 1):", flatRows[0]?.[1]);
      
      // Get unique cashiers from transactions
      const uniqueCashiers = [...new Set(flatRows.map(row => row[1]))];
      console.log("Unique cashiers in transactions:", uniqueCashiers);
    }
  }, [flatRows]);

  useEffect(() => {
    let mounted = true;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`${API_URL}/api/lubricant/transactions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to fetch transactions");
        }

        const json = await res.json();
        const dataArray = Array.isArray(json?.data) ? json.data : [];
        if (mounted) setTransactionsRaw(dataArray);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (mounted) setTransactionsRaw([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTransactions();
    return () => { mounted = false; };
  }, []);

  // Flatten transactions -> array of arrays for CustomTable
  useEffect(() => {
    const rows = [];
    (transactionsRaw || []).forEach((txn) => {
      const date = txn?.date ? formatDate(txn.date) : "";
      const cashier = txn?.staffName ?? "Unknown";
      const txnId = txn?.txnId ?? "";
      const payment = txn?.paymentMethod ?? "";

      const items = Array.isArray(txn.items) ? txn.items : [];

      if (items.length === 0) {
        rows.push([date, cashier, txnId, "", "", 0, 0, payment]);
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
            payment
          ]);
        });
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

    // Apply payment type filter
    if (selectedPaymentType) {
      result = result.filter((row) => row[7] === selectedPaymentType);
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

  // 🆕 Get unique payment types from transactions
  const paymentTypes = useMemo(() => {
    const types = new Set();
    flatRows.forEach((row) => {
      if (row[7]) types.add(row[7]);
    });
    return Array.from(types);
  }, [flatRows]);

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
            className="p-2 min-w-[300px] lg:min-w-[400px] rounded-[8px] w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
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
                  {type}
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
                Payment: {selectedPaymentType}
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
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-4 min-w-[250px]">
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
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDailySales } from "@/store/useCashierDashboardStore";
import { Search, AlertCircle, RefreshCw } from "lucide-react";

const DailyAttendantSales = () => {
  const {
    dailySales,
    isLoading,
    isBackgroundRefreshing,
    error,
    fetchDailySales,
    reconcileCash,
    startPolling,
    stopPolling,
  } = useDailySales();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [cashInputs, setCashInputs] = useState({});
  const [reconcilingIds, setReconcilingIds] = useState(new Set());
  // Optimistic UI: { [saleId]: Date } — set immediately on reconcile so the row
  // renders as "Reconciled" before the next fetchDailySales completes.
  const [localReconciledMap, setLocalReconciledMap] = useState({});

  const columns = [
    "Date",
    "Attendant",
    "Pump No",
    "Product",
    "Shift Open",
    "Shift Close",
    "Litres Sold",
    "Amount",
    "Cash Received",
    "Discrepancy",
    "Status",
    "Action",
  ];

  const getDateLabel = (dateStr) => {
    if (!dateStr) return { label: "—", overdue: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / 86400000);
    if (diff === 0) return { label: "Today", overdue: false };
    if (diff === 1) return { label: "Yesterday", overdue: false };
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return { label, overdue: diff > 3 };
  };

  const getAttendantName = (sale) => {
    if (typeof sale.attendant === "string") return sale.attendant;
    if (sale.attendant?.fullName) return sale.attendant.fullName;
    if (sale.attendant?.firstName && sale.attendant?.lastName)
      return `${sale.attendant.firstName} ${sale.attendant.lastName}`;
    if (sale.attendant?.name) return sale.attendant.name;
    if (sale.attendantName) return sale.attendantName;
    return "-";
  };

  const fmtMoney = (n) =>
    n != null
      ? `₦${parseFloat(n)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      : "-";

  useEffect(() => {
    fetchDailySales({ limit: 100 });
    startPolling();
    return () => stopPolling();
  }, []);

  // Backend returns ALL shifts from the last 24 hrs (reconciled + unreconciled).
  // Show everything — unreconciled first (newest at top), reconciled below (newest at top).
  const visibleSales = useMemo(() => {
    if (!dailySales) return [];
    return [...dailySales].sort((a, b) => {
      const aRec = a.reconciled || !!localReconciledMap[a._id];
      const bRec = b.reconciled || !!localReconciledMap[b._id];
      if (!aRec && bRec) return -1;
      if (aRec && !bRec) return 1;
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });
  }, [dailySales, localReconciledMap]);

  // Only count server-unreconciled shifts as pending
  const pendingCount = useMemo(
    () => visibleSales.filter((s) => !s.reconciled).length,
    [visibleSales],
  );

  const overdueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visibleSales.filter((s) => {
      if (s.reconciled || localReconciledMap[s._id]) return false;
      const d = new Date(s.date || s.createdAt);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;
  }, [visibleSales, localReconciledMap]);

  const handleCashInputChange = (saleId, value) => {
    setCashInputs((prev) => ({
      ...prev,
      [saleId]: value.replace(/[^0-9.]/g, ""),
    }));
  };

  const handleReconcile = async (sale) => {
    const saleId = sale._id;
    const cashReceived = parseFloat(cashInputs[saleId]);

    if (!cashReceived || cashReceived <= 0) {
      alert("Please enter a valid cash amount before reconciling");
      return;
    }

    const attendantName = getAttendantName(sale);
    const confirmed = window.confirm(
      `Reconcile this shift?\n\nAttendant: ${attendantName}\nExpected: ${fmtMoney(sale.amount)}\nCash Received: ${fmtMoney(cashReceived)}`,
    );
    if (!confirmed) return;

    // Set optimistic state BEFORE the API call so any re-render triggered by
    // the store's internal fetchDailySales already sees this row as reconciled.
    setLocalReconciledMap((prev) => ({ ...prev, [saleId]: new Date() }));
    setReconcilingIds((prev) => new Set(prev).add(saleId));

    try {
      const result = await reconcileCash(
        saleId,
        cashReceived,
        "Reconciled from daily sales",
      );
      if (result.success) {
        setCashInputs((prev) => {
          const next = { ...prev };
          delete next[saleId];
          return next;
        });
      } else {
        // Rollback optimistic state
        setLocalReconciledMap((prev) => {
          const next = { ...prev };
          delete next[saleId];
          return next;
        });
        alert(`❌ Failed to reconcile: ${result.error}`);
      }
    } catch (err) {
      setLocalReconciledMap((prev) => {
        const next = { ...prev };
        delete next[saleId];
        return next;
      });
      console.error("Reconciliation error:", err);
      alert("❌ An error occurred during reconciliation");
    } finally {
      setReconcilingIds((prev) => {
        const next = new Set(prev);
        next.delete(saleId);
        return next;
      });
    }
  };

  const handleFilterChange = (status) => {
    setFilters({ status });
    fetchDailySales({ status: status || undefined, limit: 100 });
  };

  // Filter visibleSales first, then transform — avoids index mismatches
  const filteredSales = useMemo(() => {
    let sales = visibleSales;
    if (filters.status) {
      sales = sales.filter((s) => {
        const isRec = s.reconciled || !!localReconciledMap[s._id];
        if (filters.status === "Pending") return !isRec;
        if (filters.status === "Matched")
          return s.status === "Matched" || isRec;
        if (filters.status === "Flagged") return s.status === "Flagged";
        return true;
      });
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      sales = sales.filter((s) => {
        const name = getAttendantName(s).toLowerCase();
        const product = (
          typeof s.product === "string" ? s.product : s.product?.name || ""
        ).toLowerCase();
        const pump = String(s.pumpNo || "").toLowerCase();
        return name.includes(q) || product.includes(q) || pump.includes(q);
      });
    }
    return sales;
  }, [visibleSales, filters.status, searchTerm, localReconciledMap]);

  const filteredData = useMemo(() => {
    return filteredSales.map((sale) => {
      const isReconciled = sale.reconciled || !!localReconciledMap[sale._id];
      const isReconciling = reconcilingIds.has(sale._id);
      const attendantName = getAttendantName(sale);
      const { label: dateLabel, overdue: isOverdue } = getDateLabel(
        sale.date || sale.createdAt,
      );

      const dateCell =
        isOverdue && !isReconciled ? (
          <span className="text-red-500 text-xs font-semibold">
            ⚠️ Overdue — {dateLabel}
          </span>
        ) : (
          <span>{dateLabel}</span>
        );

      let discrepancyEl = <span className="text-gray-400">—</span>;
      if (sale.cashReceived != null) {
        const disc = sale.discrepancy || sale.discrepancies || 0;
        const abs = Math.abs(disc)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (disc > 0)
          discrepancyEl = (
            <span className="text-green-600 font-semibold">+₦{abs}</span>
          );
        else if (disc < 0)
          discrepancyEl = (
            <span className="text-red-600 font-semibold">-₦{abs}</span>
          );
        else discrepancyEl = <span className="text-gray-600">₦0.00</span>;
      }

      const statusCell =
        sale.status === "Matched" ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            Matched
          </span>
        ) : sale.status === "Flagged" ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Flagged
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );

      const actionCell = isReconciled ? (
        <input
          type="checkbox"
          checked
          readOnly
          className="w-4 h-4 accent-neutral-300 cursor-not-allowed opacity-60"
        />
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={cashInputs[sale._id] || ""}
            onChange={(e) => handleCashInputChange(sale._id, e.target.value)}
            placeholder={fmtMoney(sale.amount)}
            className="border border-neutral-500 rounded-md w-[9rem] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isReconciling}
          />
          <button
            onClick={() => handleReconcile(sale)}
            disabled={isReconciling || !cashInputs[sale._id]}
            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isReconciling ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin inline-block h-3 w-3 border-b-2 border-white rounded-full" />
                ...
              </span>
            ) : (
              "Reconcile"
            )}
          </button>
        </div>
      );

      return [
        dateCell,
        attendantName,
        sale.pumpNo || sale.pumpTitle || "-",
        typeof sale.product === "string"
          ? sale.product
          : sale.product?.name || "-",
        sale.shiftOpen || "-",
        sale.shiftClose || "-",
        sale.litresSold ? `${parseFloat(sale.litresSold).toFixed(2)}L` : "-",
        fmtMoney(sale.amount),
        fmtMoney(sale.cashReceived),
        discrepancyEl,
        statusCell,
        actionCell,
      ];
    });
  }, [filteredSales, localReconciledMap, cashInputs, reconcilingIds]);

  return (
    <div className="bg-white w-full rounded-2xl p-5 mt-[1.5rem]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-[1rem]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[1.125rem] font-medium">
              Daily Attendant Slaes Summary 
            </h1>
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
              {pendingCount} pending
            </span>
            {isBackgroundRefreshing && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <RefreshCw size={10} className="animate-spin" />
                updating...
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Enter cash received and click Reconcile to confirm
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Matched">Matched</option>
            <option value="Flagged">Flagged</option>
          </select>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Overdue Banner */}
      {!isLoading && overdueCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            You have {overdueCount} unreconciled shift
            {overdueCount !== 1 ? "s" : ""} from previous days. Please reconcile
            them.
          </p>
        </div>
      )}

      {/* Loading — only on first load when there is no data yet */}
      {isLoading && dailySales.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <span className="ml-3 text-gray-600">Loading sales data...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={() => fetchDailySales({ limit: 100 })}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* No shifts at all */}
      {!isLoading &&
        !error &&
        visibleSales.length === 0 &&
        pendingCount === 0 && (
          <p className="text-green-600 text-center font-semibold py-8">
            ✅ All shifts reconciled!
          </p>
        )}

      {/* Empty filter/search result */}
      {!isLoading &&
        !error &&
        filteredSales.length === 0 &&
        visibleSales.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">No results</p>
            <p className="text-sm mt-1">
              {searchTerm || filters.status
                ? "Try adjusting your filters"
                : "No shifts available"}
            </p>
          </div>
        )}

      {/* Table */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-max">
            <table className="min-w-full text-sm text-left border border-neutral-50 text-gray-700">
              <thead className="text-sm font-semibold text-gray-600">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 bg-neutral-100 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, rowIndex) => {
                  const sale = filteredSales[rowIndex];
                  return (
                    <tr
                      key={sale?._id || rowIndex}
                      className="hover:bg-gray-50"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-4 whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {!isLoading && !error && visibleSales.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-gray-600">
              Total:{" "}
              <span className="font-semibold">{visibleSales.length}</span>
            </span>
            <span className="text-gray-600">
              Pending:{" "}
              <span className="font-semibold text-yellow-600">
                {pendingCount}
              </span>
            </span>
            <span className="text-gray-600">
              Reconciled:{" "}
              <span className="font-semibold text-green-600">
                {visibleSales.length - pendingCount}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAttendantSales;

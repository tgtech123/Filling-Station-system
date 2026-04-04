"use client";

import React, { useMemo } from "react";
import TableWithoutBorder from "@/components/TableWithoutBorder";
import { useDailySales } from "@/store/useCashierDashboardStore";

const DailyAttendantSummarySection = () => {
  const { dailySales, isLoading, error, fetchDailySales } = useDailySales();

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Filter to today's shifts only
  const todaySales = useMemo(() => {
    if (!dailySales) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dailySales.filter((s) => {
      const d = new Date(s.date || s.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  }, [dailySales]);

  const columns = [
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
  ];

  const rows = useMemo(() => {
    return todaySales.map((sale) => {
      let attendantName = "-";
      if (typeof sale.attendant === "string") attendantName = sale.attendant;
      else if (sale.attendant?.fullName) attendantName = sale.attendant.fullName;
      else if (sale.attendant?.firstName && sale.attendant?.lastName)
        attendantName = `${sale.attendant.firstName} ${sale.attendant.lastName}`;
      else if (sale.attendant?.name) attendantName = sale.attendant.name;
      else if (sale.attendantName) attendantName = sale.attendantName;

      const isReconciled =
        sale.reconciled || sale.status === "Matched" || sale.status === "Flagged";

      const fmt = (n) =>
        n != null
          ? `₦${parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
          : "-";

      let discrepancyEl = "-";
      if (sale.cashReceived != null) {
        const disc = sale.discrepancy || sale.discrepancies || 0;
        const abs = Math.abs(disc).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (disc > 0)
          discrepancyEl = <span className="text-green-600 font-semibold">+₦{abs}</span>;
        else if (disc < 0)
          discrepancyEl = <span className="text-red-600 font-semibold">-₦{abs}</span>;
        else discrepancyEl = <span className="text-gray-600">₦0.00</span>;
      }

      const statusBadge = isReconciled ? (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            sale.status === "Matched"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {sale.status}
        </span>
      ) : (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Pending
        </span>
      );

      return [
        attendantName,
        sale.pumpNo || sale.pumpTitle || "-",
        typeof sale.product === "string" ? sale.product : sale.product?.name || "-",
        sale.shiftOpen || "-",
        sale.shiftClose || "-",
        sale.litresSold ? `${parseFloat(sale.litresSold).toFixed(2)}L` : "-",
        fmt(sale.amount),
        fmt(sale.cashReceived),
        discrepancyEl,
        statusBadge,
      ];
    });
  }, [todaySales]);

  return (
    <div className="bg-white w-full rounded-2xl p-5 mt-[1.5rem]">
      <div className="mb-4">
        <h1 className="text-[1.125rem] font-medium">Daily Attendant Sales Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Today's shift sales — {todayStr}</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      {error && !isLoading && (
        <p className="text-red-600 text-sm py-4">
          Error loading data.{" "}
          <button
            onClick={() => fetchDailySales({ limit: 100 })}
            className="underline"
          >
            Retry
          </button>
        </p>
      )}

      {!isLoading && !error && todaySales.length === 0 && (
        <p className="text-center text-gray-500 py-8">No shifts recorded today yet.</p>
      )}

      {!isLoading && !error && todaySales.length > 0 && (
        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-max">
            <TableWithoutBorder columns={columns} data={rows} />
          </div>
        </div>
      )}

      {/* Quick stats */}
      {!isLoading && !error && todaySales.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-sm">
          <span className="text-gray-600">
            Shifts today:{" "}
            <span className="font-semibold text-neutral-800">{todaySales.length}</span>
          </span>
          <span className="text-gray-600">
            Reconciled:{" "}
            <span className="font-semibold text-green-600">
              {
                todaySales.filter(
                  (s) => s.reconciled || s.status === "Matched" || s.status === "Flagged"
                ).length
              }
            </span>
          </span>
          <span className="text-gray-600">
            Pending:{" "}
            <span className="font-semibold text-yellow-600">
              {
                todaySales.filter(
                  (s) => !s.reconciled && s.status !== "Matched" && s.status !== "Flagged"
                ).length
              }
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default DailyAttendantSummarySection;

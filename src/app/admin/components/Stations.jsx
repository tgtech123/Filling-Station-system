"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import StatGrid from "./StatGrid";
import { stationData } from "./stationData";
import SearchBarButtons from "./SearchBarButtons";
import DataTable from "./DataTable";
import { stationsTableData } from "./stationsTableData";
import * as XLSX from "xlsx";
import useAdminStore from "@/store/useAdminStore";
import { Gauge, CreditCard, XCircle, PauseCircle } from "lucide-react";

const TABLE_HEADERS = stationsTableData.headers;

const Stations = ({ onViewStation }) => {
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const { stations, loading, fetchStations, stationsStats, fetchStationsStats } = useAdminStore();

  useEffect(() => {
    fetchStations();
    fetchStationsStats();
  }, []);

  // Debounced search — 500ms
  const handleSearchChange = (value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStations(value);
    }, 500);
  };

  // Map real station objects to the shape DataTable expects
  const rows = useMemo(() => {
    if (!stations || stations.length === 0) return [];
    return stations.map((s, i) => ({
      id: s._id || s.id || `ST-${String(i + 1).padStart(3, "0")}`,
      stationName: s.name || s.stationName || "—",
      owner: s.owner?.name || s.ownerName || s.location || "—",
      plan: s.subscription?.plan || s.plan || "—",
      expiryDate: s.subscription?.expiryDate
        ? new Date(s.subscription.expiryDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : s.expiryDate || "—",
      status: s.isActive === false ? "Suspended" : s.status || "Active",
      action: "more",
      // keep the full raw object so modals can read it
      _raw: s,
    }));
  }, [stations]);

  // Build growth display: "+5.2%", "0%", "-3.1%"
  const fmtGrowth = (g) => {
    if (g == null || g === 0) return { text: "0%", color: "gray" };
    return g > 0
      ? { text: `+${g}%`, color: "green" }
      : { text: `${g}%`, color: "red" };
  };

  // Stats cards from stationsStats (fall back to hardcoded)
  const statCards = useMemo(() => {
    if (!stationsStats) return stationData;
    const s = stationsStats;
    const g1 = fmtGrowth(s.totalRegisteredStationsGrowth);
    const g2 = fmtGrowth(s.activeSubscriptionsGrowth);
    const g3 = fmtGrowth(s.expiredSubscriptionsGrowth);
    const g4 = fmtGrowth(s.suspendedStationsGrowth);
    return [
      {
        id: 1,
        label: "Total Registered Stations",
        value: s.totalRegisteredStations?.toLocaleString() ?? "—",
        change: g1.text,
        changeLabel: "From last month",
        showChange: true,
        icon: Gauge,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        changeColor: g1.color,
      },
      {
        id: 2,
        label: "Active Subscriptions",
        value: s.activeSubscriptions?.toLocaleString() ?? "—",
        change: g2.text,
        changeLabel: "From last month",
        showChange: true,
        icon: CreditCard,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        changeColor: g2.color,
      },
      {
        id: 3,
        label: "Expired Subscriptions",
        value: s.expiredSubscriptions?.toLocaleString() ?? "—",
        change: g3.text,
        changeLabel: "From last month",
        showChange: true,
        icon: XCircle,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        changeColor: g3.color,
      },
      {
        id: 4,
        label: "Suspended Stations",
        value: s.suspendedStations?.toLocaleString() ?? "—",
        change: g4.text,
        changeLabel: "From last month",
        showChange: true,
        icon: PauseCircle,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        changeColor: g4.color,
      },
    ];
  }, [stationsStats]);

  const handleExport = () => {
    const exportRows = rows.length > 0 ? rows : [];
    const headers = TABLE_HEADERS.filter((h) => h.key !== "action").map((h) => h.label);
    const data = exportRows.map((row) => {
      const obj = {};
      TABLE_HEADERS.forEach((h) => {
        if (h.key !== "action" && h.key !== "_raw") obj[h.label] = row[h.key];
      });
      return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stations");
    XLSX.writeFile(workbook, "stations.xlsx");
  };

  const displayRows = rows.length > 0 ? rows : stationsTableData.rows;

  return (
    <div className="p-[2rem]">
      <h1 className="text-[28px] font-semibold mb-[0.8rem]">
        Filling Stations
      </h1>

      <p className="text-neutral-500 text-[1.125rem] mb-[1.5rem]">
        Manage all registered filling stations and their subscriptions
      </p>

      <StatGrid data={statCards} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl mt-[1.5rem]">
        <SearchBarButtons
          searchValue={search}
          onSearchChange={handleSearchChange}
          onExport={handleExport}
        />

        {loading && (
          <p className="text-center text-gray-400 py-6 font-medium">
            Loading stations...
          </p>
        )}

        {!loading && (
          <div className="mt-[1.5rem]">
            <DataTable
              headers={TABLE_HEADERS}
              rows={displayRows}
              onActionClick={() => {}}
              onViewStation={onViewStation}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations;

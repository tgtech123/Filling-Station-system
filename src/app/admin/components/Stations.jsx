"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import StatGrid from "./StatGrid";
import { stationData } from "./stationData";
import SearchBarButtons from "./SearchBarButtons";
import DataTable from "./DataTable";
import { stationsTableData } from "./stationsTableData";
import * as XLSX from "xlsx";
import useAdminStore from "@/store/useAdminStore";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
} from "@heroicons/react/24/outline";

const TABLE_HEADERS = stationsTableData.headers;

const Stations = ({ onViewStation }) => {
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const { stations, loading, fetchStations, overview } = useAdminStore();

  useEffect(() => {
    fetchStations();
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

  // Stats cards from overview (fall back to hardcoded)
  const statCards = useMemo(() => {
    if (!overview) return stationData;
    return [
      {
        id: 1,
        label: "Total Registered Stations",
        value: overview.totalStations ?? "—",
        change: overview.totalStationsChange || "+0%",
        icon: BuildingStorefrontIcon,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        changeColor: "green",
      },
      {
        id: 2,
        label: "Active Stations",
        value: overview.activeStations ?? "—",
        change: overview.activeStationsChange || "+0%",
        icon: CheckCircleIcon,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        changeColor: "green",
      },
      {
        id: 3,
        label: "Suspended Stations",
        value: overview.suspendedStations ?? "—",
        change: overview.suspendedStationsChange || "+0%",
        icon: PauseCircleIcon,
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-600",
        changeColor: "green",
      },
      {
        id: 4,
        label: "Total Staff",
        value: overview.totalStaff ?? "—",
        change: overview.totalStaffChange || "+0%",
        icon: XCircleIcon,
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        changeColor: "green",
      },
    ];
  }, [overview]);

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

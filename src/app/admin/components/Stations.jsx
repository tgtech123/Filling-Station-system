"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import StatGrid from "./StatGrid";
import SearchBarButtons from "./SearchBarButtons";
import DataTable from "./DataTable";
import { stationsTableData } from "./stationsTableData";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import useAdminStore from "@/store/useAdminStore";
import { Gauge, CreditCard, XCircle, PauseCircle } from "lucide-react";

const TABLE_HEADERS = stationsTableData.headers;

const PLAN_LABELS = {
  free: "Free",
  pro: "Pro",
  "pro-max": "Pro Max",
  enterprise: "Enterprise",
  "enterprise-pro": "Enterprise Pro",
  "enterprise-max": "Enterprise Max",
};

const formatPlan = (slug) => PLAN_LABELS[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "—");

const formatExpiry = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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

  // Map real station objects to the shape DataTable expects.
  //
  // Branches are ORDERED UNDER the account that owns them rather than scattered
  // through the list by creation date. A branch is a site, not a customer — it
  // inherits the parent's plan and is never billed separately — so listing them
  // as peers made one Enterprise account look like several paying stations.
  const rows = useMemo(() => {
    if (!stations || stations.length === 0) return [];

    const idOf = (s) => String(s._id || s.id || "");
    const roots = stations.filter((s) => !s.isBranch);
    const branchesByParent = new Map();
    for (const s of stations) {
      if (!s.isBranch) continue;
      const key = String(s.parentStationId || "");
      if (!branchesByParent.has(key)) branchesByParent.set(key, []);
      branchesByParent.get(key).push(s);
    }

    // Root, then its branches — depth-first, because a branch can itself have
    // branches (FLOURISH GG - ELIOZU sits under Flourish GG, which sits under
    // Woleche). Walking only one level deep left grandchildren stranded at the
    // bottom of the list, detached from the account they belong to.
    const ordered = [];
    const depthOf = new Map();
    // Staff across a whole account — the root plus every branch beneath it,
    // at any depth. Accumulated during the same walk so it stays correct
    // however deeply branches are nested.
    const groupStaffByRoot = new Map();

    const walk = (node, depth, rootId) => {
      ordered.push(node);
      depthOf.set(idOf(node), depth);
      groupStaffByRoot.set(
        rootId,
        (groupStaffByRoot.get(rootId) ?? 0) + Number(node.staffCount ?? 0)
      );
      for (const child of branchesByParent.get(idOf(node)) ?? []) {
        if (!ordered.includes(child)) walk(child, depth + 1, rootId);
      }
    };
    for (const root of roots) walk(root, 0, idOf(root));

    // A branch whose parent isn't in the current result set (a search hit, say)
    // must still be listed — never silently drop a station.
    for (const s of stations) {
      if (s.isBranch && !ordered.includes(s)) {
        ordered.push(s);
        depthOf.set(idOf(s), 1);
      }
    }

    return ordered.map((s, i) => ({
      id: s._id || s.id || `ST-${String(i + 1).padStart(3, "0")}`,
      // Branch rows are indented and named against their parent so the
      // relationship is obvious at a glance; roots show their branch count.
      stationName: s.isBranch
        ? `${"  ".repeat(depthOf.get(idOf(s)) || 1)}↳ ${
            s.name || s.stationName || "—"
          }`
        : `${s.name || s.stationName || "—"}${
            s.branchCount > 0
              ? `  (${s.branchCount} branch${s.branchCount === 1 ? "" : "es"})`
              : ""
          }`,
      owner: s.isBranch
        ? `Branch of ${s.parentName || s.ownerName || "—"}`
        : s.ownerName || s.manager?.name || "—",
      // Staff on this station. For an account with branches the total across
      // the whole group is shown too, since that is the number that matters
      // when you are looking at what one customer actually runs.
      staff: (() => {
        const own = Number(s.staffCount ?? 0);
        if (s.isBranch) return String(own);
        const groupTotal = groupStaffByRoot.get(idOf(s)) ?? own;
        return groupTotal > own ? `${own}  (${groupTotal} total)` : String(own);
      })(),
      // Branches inherit the parent's plan and expiry — they are not billed on
      // their own. Repeating the plan on every branch row is what made a single
      // Enterprise subscription look like several. Marked as inherited instead.
      plan: s.isBranch ? "Inherited" : formatPlan(s.plan || "free"),
      expiryDate: s.isBranch ? "—" : formatExpiry(s.planExpiryDate),
      status: s.isActive === false ? "Suspended" : s.status || "Active",
      action: "more",
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

  // Stats cards from stationsStats
  const statCards = useMemo(() => {
    if (!stationsStats) return [
      { id: 1, label: "Total Registered Stations", value: "—", change: "0%", changeLabel: "From last month", showChange: true, icon: Gauge, iconBg: "bg-blue-50", iconColor: "text-blue-600", changeColor: "gray" },
      { id: 2, label: "Active Subscriptions", value: "—", change: "0%", changeLabel: "From last month", showChange: true, icon: CreditCard, iconBg: "bg-blue-50", iconColor: "text-blue-600", changeColor: "gray" },
      { id: 3, label: "Expired Subscriptions", value: "—", change: "0%", changeLabel: "From last month", showChange: true, icon: XCircle, iconBg: "bg-red-50", iconColor: "text-red-500", changeColor: "gray" },
      { id: 4, label: "Suspended Stations", value: "—", change: "0%", changeLabel: "From last month", showChange: true, icon: PauseCircle, iconBg: "bg-amber-50", iconColor: "text-amber-600", changeColor: "gray" },
    ];
    const s = stationsStats;
    const g1 = fmtGrowth(s.totalRegisteredStationsGrowth);
    const g2 = fmtGrowth(s.activeSubscriptionsGrowth);
    const g3 = fmtGrowth(s.expiredSubscriptionsGrowth);
    const g4 = fmtGrowth(s.suspendedStationsGrowth);
    return [
      {
        id: 1,
        label: "Registered Accounts",
        value: s.totalRegisteredStations?.toLocaleString() ?? "—",
        change: g1.text,
        // This counts billable ACCOUNTS. Branch sites are shown alongside so the
        // real footprint is visible without being counted as paying customers.
        changeLabel:
          s.totalBranchSites > 0
            ? `+ ${s.totalBranchSites} branch site${s.totalBranchSites === 1 ? "" : "s"}`
            : "From last month",
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

  const handleExport = async () => {
    const headers = TABLE_HEADERS.filter((h) => h.key !== "action" && h.key !== "_raw").map((h) => h.label);
    const data = rows.map((row) =>
      TABLE_HEADERS.filter((h) => h.key !== "action" && h.key !== "_raw").map((h) => row[h.key])
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stations");
    worksheet.addRow(headers);
    data.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "stations.xlsx");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl lg:text-[28px] font-semibold mb-[0.8rem]">
        Filling Stations
      </h1>

      <p className="text-neutral-500 text-sm sm:text-base lg:text-[1.125rem] mb-[1.5rem]">
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

        {!loading && rows.length === 0 && (
          <p className="text-center text-gray-400 py-10 font-medium">
            No stations found.
          </p>
        )}

        {!loading && rows.length > 0 && (
          <div className="mt-[1.5rem]">
            <DataTable
              headers={TABLE_HEADERS}
              rows={rows}
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

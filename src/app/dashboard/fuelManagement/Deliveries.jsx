"use client";
import { useEffect, useRef, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import CustomTable from "./CustomTable";
import { ChevronDown, Download, Filter, Search, X } from "lucide-react";

const STATUS_OPTIONS = ["All", "Pending", "Completed", "Canceled"];
const FUEL_OPTIONS = ["All", "PMS", "AGO", "Kerosene", "Gas"];

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fuelFilter, setFuelFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API ||
    "https://fueldesk-station-server.onrender.com";

  const columns = [
    "Tank Title",
    "Fuel Type",
    "Quantity (L)",
    "Supplier",
    "Expected Delivery",
    "Status",
  ];

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/delivery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && Array.isArray(result.data)) {
        setDeliveries(result.data);
      } else {
        console.error("Error fetching deliveries:", result.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkAsCompleted = async (supplyId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/delivery/update-supply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplyId, status: "Completed" }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Delivery marked as completed");
        fetchDeliveries();
      } else {
        alert(data.error || data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating");
    }
  };

  // Filtered deliveries (search + status + fuel type)
  const filteredDeliveries = deliveries.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      [d.tankTitle, d.fuelType, d.supplier].some((v) =>
        v?.toLowerCase().includes(q)
      );
    const matchStatus =
      statusFilter === "All" ||
      d.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchFuel =
      fuelFilter === "All" ||
      d.fuelType?.toLowerCase() === fuelFilter.toLowerCase();
    return matchSearch && matchStatus && matchFuel;
  });

  const tableData = filteredDeliveries.map((d) => [
    d.tankTitle || "N/A",
    d.fuelType || "N/A",
    `${d.quantity || 0} L`,
    d.supplier || "N/A",
    d.deliveryDate
      ? new Date(d.deliveryDate).toLocaleDateString()
      : "N/A",
    d.status || "Pending",
  ]);

  // Uses filteredDeliveries index so row actions stay correct after filtering
  const handleStatusAction = (action, row, rowIndex) => {
    const delivery = filteredDeliveries[rowIndex];
    if (!delivery) return;
    if (action === "complete") handleMarkAsCompleted(delivery._id);
  };

  // ── Export helpers ──────────────────────────────────────────────
  const exportCSV = () => {
    const csvRows = [columns, ...tableData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deliveries.csv";
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(13);
    doc.text("Recent Deliveries", 14, 15);
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 22,
      theme: "grid",
      styles: { fontSize: 8.5, lineColor: [200, 200, 200], lineWidth: 0.3 },
      headStyles: { fillColor: [0, 128, 255], lineColor: [0, 96, 200], lineWidth: 0.3 },
    });
    doc.save("deliveries.pdf");
    setExportOpen(false);
  };

  const hasActiveFilters = statusFilter !== "All" || fuelFilter !== "All";
  const activeFilterCount =
    (statusFilter !== "All" ? 1 : 0) + (fuelFilter !== "All" ? 1 : 0);

  return (
    <DisplayCard>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-semibold">Recent Deliveries</h3>
          <p className="text-sm text-gray-500">
            Track fuel schedules and deliveries
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-7 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-2 focus:border-yellow-500 dark:focus:border-yellow-400 w-64"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter */}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-2 rounded-lg transition-colors ${
              hasActiveFilters || filterOpen
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-400 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Filter size={14} />
            Filter
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((v) => !v)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-2 border-yellow-200 rounded-lg bg-[#0080ff] text-white hover:bg-[#0a71d8] transition-colors"
            >
              <Download size={14} />
              Export
              <ChevronDown size={12} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <button
                  onClick={exportCSV}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={exportPDF}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {filterOpen && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    statusFilter === s
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Fuel Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FUEL_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFuelFilter(f)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    fuelFilter === f
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end sm:pb-0.5">
              <button
                onClick={() => {
                  setStatusFilter("All");
                  setFuelFilter("All");
                }}
                className="text-xs text-red-500 hover:text-red-700 underline whitespace-nowrap"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <p className="text-sm text-gray-500 py-4">Loading deliveries...</p>
      ) : filteredDeliveries.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          No deliveries match your search or filters.
        </p>
      ) : (
        <CustomTable
          data={tableData}
          columns={columns}
          onStatusAction={handleStatusAction}
          lastColumnType="status"
        />
      )}
    </DisplayCard>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import CustomTable from "./CustomTable";
import { ChevronDown, Download, Filter, Search, X, CheckCircle2, Loader2 } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

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
    "Product Type",
    "Quantity (L)",
    "Purchase Ref",
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

  // Socket: delivery created/completed anywhere refreshes this table live
  useSocket({ "delivery:updated": () => fetchDeliveries() });

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

  // Receive dialog — captures the ACTUAL litres delivered (GRN leg of the
  // 3-way match). The ordered quantity stays frozen on the record, so short
  // or over deliveries surface when the accountant matches the invoice.
  const [receiveTarget, setReceiveTarget] = useState(null); // the delivery being received
  const [receivedQty, setReceivedQty] = useState("");
  const [receiving, setReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState("");

  const openReceive = (delivery) => {
    setReceiveTarget(delivery);
    setReceivedQty(String(delivery.orderedQuantity ?? delivery.quantity ?? ""));
    setReceiveError("");
  };

  const handleConfirmReceive = async () => {
    const qty = Number(receivedQty);
    if (isNaN(qty) || qty < 0) {
      setReceiveError("Enter the actual litres received (0 or more).");
      return;
    }
    setReceiving(true);
    setReceiveError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/delivery/update-supply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplyId: receiveTarget._id,
          status: "Completed",
          receivedQuantity: qty,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReceiveTarget(null);
        fetchDeliveries();
      } else {
        setReceiveError(data.error || data.message || "Failed to complete delivery");
      }
    } catch (err) {
      console.error(err);
      setReceiveError("Something went wrong while updating");
    } finally {
      setReceiving(false);
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
    d.purchaseRef || "—",
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
    if (action === "complete") openReceive(delivery);
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
              Product Type
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

      {/* ── Receive Delivery modal — records ACTUAL litres received ── */}
      {receiveTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && !receiving && setReceiveTarget(null)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Receive Delivery</h3>
              <button
                onClick={() => !receiving && setReceiveTarget(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3 mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Tank</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {receiveTarget.tankTitle} ({receiveTarget.fuelType})
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Supplier</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{receiveTarget.supplier || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ordered</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">
                    {Number(receiveTarget.orderedQuantity ?? receiveTarget.quantity ?? 0).toLocaleString()} L
                  </span>
                </div>
              </div>

              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-1">
                Actual litres received *
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Enter what the tanker actually discharged. Short or over deliveries are
                flagged automatically when the supplier&apos;s invoice is matched.
              </p>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={receivedQty}
                onChange={(e) => setReceivedQty(e.target.value)}
                className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 p-2.5 rounded-xl text-lg font-bold mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Variance hint against the ordered quantity */}
              {receivedQty !== "" &&
                !isNaN(Number(receivedQty)) &&
                Number(receivedQty) !== Number(receiveTarget.orderedQuantity ?? receiveTarget.quantity ?? 0) && (
                  <p className="text-xs font-semibold text-amber-600 mb-2">
                    {Number(receivedQty) < Number(receiveTarget.orderedQuantity ?? receiveTarget.quantity ?? 0)
                      ? `Short delivery: ${(Number(receiveTarget.orderedQuantity ?? receiveTarget.quantity ?? 0) - Number(receivedQty)).toLocaleString()} L less than ordered`
                      : `Over delivery: ${(Number(receivedQty) - Number(receiveTarget.orderedQuantity ?? receiveTarget.quantity ?? 0)).toLocaleString()} L more than ordered`}
                  </p>
                )}

              {receiveError && <p className="text-xs text-red-500 mb-2">{receiveError}</p>}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setReceiveTarget(null)}
                  disabled={receiving}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReceive}
                  disabled={receiving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {receiving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Confirm &amp; Fill Tank
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DisplayCard>
  );
}

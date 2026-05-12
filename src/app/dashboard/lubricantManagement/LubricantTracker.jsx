"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import {
  Calendar,
  Check,
  ChevronDown,
  Download,
  Eye,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import InvoiceModal from "./InvoiceModal";
import FilterModal from "./FilterModal";
import { useLubricantStore } from "@/store/lubricantStore";

const DURATION_OPTIONS = [
  { label: "All Time",  value: "all"     },
  { label: "Daily",     value: "daily"   },
  { label: "Weekly",    value: "weekly"  },
  { label: "Monthly",   value: "monthly" },
  { label: "Yearly",    value: "yearly"  },
];

function isInDurationRange(dateStr, duration) {
  if (!dateStr || duration === "all") return true;
  const date = new Date(dateStr);
  const now  = new Date();
  switch (duration) {
    case "daily":
      return date.toDateString() === now.toDateString();
    case "weekly": {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo && date <= now;
    }
    case "monthly":
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    case "yearly":
      return date.getFullYear() === now.getFullYear();
    default:
      return true;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try { return new Date(dateStr).toLocaleDateString("en-GB"); } catch { return dateStr; }
}

export default function LubricantTracker({ onclose }) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage]           = useState(1);
  const [showInvoiceModal, setShowInvoiceModal]  = useState(false);
  const [showFilterModal, setShowFilterModal]    = useState(false);
  const [tableData, setTableData]                = useState([]);
  const [selectedInvoice, setSelectedInvoice]    = useState(null);
  const [searchTerm, setSearchTerm]              = useState("");
  const [duration, setDuration]                  = useState("all");
  const [showDurationDrop, setShowDurationDrop]  = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedPayments, setSelectedPayments]  = useState([]);
  const [loading, setLoading]                    = useState(false);

  const durationRef = useRef(null);
  const { getAllPurchases } = useLubricantStore();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAllPurchases();
        setTableData(res.data || []);
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [getAllPurchases]);

  // Close duration dropdown on outside click
  useEffect(() => {
    function onOutsideClick(e) {
      if (durationRef.current && !durationRef.current.contains(e.target))
        setShowDurationDrop(false);
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // Unique filter values derived from data
  const uniqueSuppliers = useMemo(
    () => [...new Set(tableData.map((p) => p.supplier).filter(Boolean))],
    [tableData]
  );
  const uniquePayments = useMemo(
    () => [...new Set(tableData.map((p) => p.paymentMethod).filter(Boolean))],
    [tableData]
  );

  // Filtered dataset
  const filteredData = useMemo(() => {
    return tableData.filter((purchase) => {
      if (!isInDurationRange(purchase.purchaseDate, duration)) return false;
      if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(purchase.supplier)) return false;
      if (selectedPayments.length > 0 && !selectedPayments.includes(purchase.paymentMethod)) return false;
      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        const haystack = [
          purchase.invoiceNo,
          purchase.supplier,
          purchase.paymentMethod,
          formatDate(purchase.purchaseDate),
          purchase.items?.map((i) => i.productName)?.join(" ") ?? "",
        ].join(" ").toLowerCase();
        if (!haystack.includes(lower)) return false;
      }
      return true;
    });
  }, [tableData, duration, selectedSuppliers, selectedPayments, searchTerm]);

  // Reset to page 1 whenever filters change
  useEffect(() => setCurrentPage(1), [searchTerm, duration, selectedSuppliers, selectedPayments]);

  const totalPages   = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex   = (currentPage - 1) * itemsPerPage;
  const currentData  = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const purchaseMap = {};
  currentData.forEach((p) => { purchaseMap[p.invoiceNo] = p; });

  // Export filtered data as CSV
  const handleExport = () => {
    if (!filteredData.length) return;
    const headers = ["Invoice No", "Supplier", "Payment Method", "Date", "Products", "Total Amount"];
    const rows = filteredData.map((p) => [
      p.invoiceNo,
      p.supplier,
      p.paymentMethod,
      formatDate(p.purchaseDate),
      p.items?.map((i) => i.productName)?.join(" | ") ?? "",
      p.totalAmount,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `lubricant-tracker-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeDurationLabel = DURATION_OPTIONS.find((o) => o.value === duration)?.label || "All Time";
  const hasFilters = selectedSuppliers.length > 0 || selectedPayments.length > 0;
  const filterCount = selectedSuppliers.length + selectedPayments.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-5xl shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-hide">

          {/* ── Sticky header ── */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-start justify-between z-10">
            <div>
              <h2 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">Lubricant Tracker</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Track lubricant purchases and invoice records
              </p>
            </div>
            <button
              onClick={onclose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-0.5"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-4 sm:p-6">

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">

              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search invoice, supplier, product..."
                  className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">

                {/* Duration dropdown */}
                <div ref={durationRef} className="relative">
                  <button
                    onClick={() => setShowDurationDrop((v) => !v)}
                    className={`h-full flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                      duration !== "all"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Calendar size={15} />
                    <span className="hidden sm:inline">{activeDurationLabel}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${showDurationDrop ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showDurationDrop && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setDuration(opt.value); setShowDurationDrop(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                            duration === opt.value
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {opt.label}
                          {duration === opt.value && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter */}
                <button
                  onClick={() => setShowFilterModal(true)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                    hasFilters
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <ListFilter size={15} />
                  <span className="hidden sm:inline">Filter</span>
                  {hasFilters && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {filterCount}
                    </span>
                  )}
                </button>

                {/* Export */}
                <button
                  onClick={handleExport}
                  disabled={!filteredData.length}
                  title={!filteredData.length ? "No data to export" : `Export ${filteredData.length} records`}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {(duration !== "all" || hasFilters) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {duration !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                    <Calendar size={11} />
                    {activeDurationLabel}
                    <button onClick={() => setDuration("all")} className="hover:opacity-70 ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {selectedSuppliers.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                    {s}
                    <button onClick={() => setSelectedSuppliers((p) => p.filter((x) => x !== s))} className="hover:opacity-70 ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {selectedPayments.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full">
                    {p}
                    <button onClick={() => setSelectedPayments((prev) => prev.filter((x) => x !== p))} className="hover:opacity-70 ml-0.5">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => { setDuration("all"); setSelectedSuppliers([]); setSelectedPayments([]); setSearchTerm(""); }}
                  className="px-3 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Record count */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              {loading ? "Loading records..." : `Showing ${filteredData.length} of ${tableData.length} records`}
            </p>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <Download size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No records found</p>
                <p className="text-xs mt-1">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <>
                <Table
                  columns={["Invoice No", "Supplier", "Payment Method", "Date", "Products", "Total Amount"]}
                  data={currentData.map((purchase) => [
                    purchase.invoiceNo,
                    purchase.supplier,
                    purchase.paymentMethod,
                    formatDate(purchase.purchaseDate),
                    purchase.items?.map((i) => i.productName)?.join(", ") ?? "—",
                    `₦${new Intl.NumberFormat("en-NG").format(purchase.totalAmount)}`,
                  ])}
                  renderActions={(row) => {
                    const purchase = purchaseMap[row[0]];
                    return (
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setSelectedInvoice(purchase); setShowInvoiceModal(true); }}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                          title="Preview Invoice"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => { setSelectedInvoice(purchase); setShowInvoiceModal(true); }}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 transition-colors"
                          title="Download Invoice"
                        >
                          <Download size={17} />
                        </button>
                      </div>
                    );
                  }}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredData.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  className="mt-5"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {showInvoiceModal && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setShowInvoiceModal(false)} />
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          suppliers={uniqueSuppliers}
          paymentMethods={uniquePayments}
          selectedSuppliers={selectedSuppliers}
          selectedPayments={selectedPayments}
          onApply={(suppliers, payments) => {
            setSelectedSuppliers(suppliers);
            setSelectedPayments(payments);
            setShowFilterModal(false);
          }}
          onReset={() => {
            setSelectedSuppliers([]);
            setSelectedPayments([]);
            setShowFilterModal(false);
          }}
        />
      )}
    </div>
  );
}
"use client";
import { useEffect, useMemo, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import { useLubricantStore } from "@/store/lubricantStore";
import ProductTrackerModal from "./ProductTrackerModal";
import { getCurrentUser } from "@/lib/currentUser";
import { API_URL } from "@/lib/config";
import { useSocket } from "@/hooks/useSocket";

export default function Inventory() {
    const { 
        lubricants, 
        weeklySummary,
        monthlySummary,
        loading, 
        fetchLubricants, 
        fetchWeeklySummary,
        fetchMonthlySummary
    } = useLubricantStore();

    const [viewMode, setViewMode] = useState("week"); // "week" or "month"

    // Product tracker: which item is open, and the search that finds it.
    const [trackedProduct, setTrackedProduct] = useState(null);
    const [trackerSearch, setTrackerSearch]   = useState("");

    /**
     * Retired products are hidden from every daily list, which is the point of
     * retiring them. But auditing one is the reason it was retired rather than
     * deleted, so the tracker has to be able to reach it.
     */
    const [showRetired, setShowRetired] = useState(false);
    const [retiredProducts, setRetiredProducts] = useState([]);

    useEffect(() => {
        if (!showRetired || retiredProducts.length) return;
        fetch(`${API_URL}/api/lubricant?includeRetired=true`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                const all = (Array.isArray(d) ? d : d?.data || []).filter(Boolean);
                setRetiredProducts(all.filter((p) => p.isActive === false));
            })
            .catch(() => {});
    }, [showRetired, retiredProducts.length]);

    /**
     * Who may open the trail.
     *
     * The tracker exposes cost, supplier and every write-off with its reason,
     * and it carries the correction form. That is management and books work.
     * The server refuses a cashier outright, so hiding it here only stops the
     * app offering a door that will not open.
     */
    const [role, setRole] = useState(null);
    useEffect(() => setRole(getCurrentUser()?.role || null), []);
    const canTrack = ["manager", "supervisor", "accountant", "admin"].includes(role);

    /**
     * The same live signal the till uses.
     *
     * A manager watching inventory while a supervisor books in a delivery
     * should see the counts move, not discover them on the next reload.
     */
    useSocket({
        "catalogue:changed": () => fetchLubricants(),
    });

    const trackableProducts = useMemo(() => {
        const q = trackerSearch.trim().toLowerCase();
        const all = [
            ...(lubricants || []).filter(Boolean),
            ...(showRetired ? retiredProducts : []),
        ];
        // Unsearched, show the ones most likely to be queried: empty or nearly
        // empty shelves are what sends someone looking at history.
        if (!q) {
            return [...all]
                .sort((a, b) => (Number(a.qtyInStock) || 0) - (Number(b.qtyInStock) || 0))
                .slice(0, 12);
        }
        return all.filter(
            (l) =>
                String(l.productName || "").toLowerCase().includes(q) ||
                String(l.barcode || "").toLowerCase().includes(q)
        );
    }, [lubricants, trackerSearch, showRetired, retiredProducts]);

    useEffect(() => {
        const loadData = async () => {
            await fetchLubricants();
            await fetchWeeklySummary();
            await fetchMonthlySummary();
        };
        
        loadData();
    }, [fetchLubricants, fetchWeeklySummary, fetchMonthlySummary]);

    // 🆕 Use weekly or monthly summary based on viewMode
    const activeSummary = viewMode === "week" ? weeklySummary : monthlySummary;

    // 🆕 Dynamic sales map based on view mode
    const salesMap = useMemo(() => {
        const map = new Map();
        
        const summaryArray = Array.isArray(activeSummary) ? activeSummary : [];

        if (!summaryArray.length) {
            return map;
        }
        
        summaryArray.forEach((item) => {
            const lubricantId = item.lubricantId;
            const quantity = viewMode === "week" 
                ? (item.qtySoldThisWeek || 0) 
                : (item.qtySoldThisMonth || 0);
            const price = item.unitPrice || 0;
            
            if (lubricantId) {
                map.set(lubricantId.toString(), {
                    quantity: quantity,
                    revenue: quantity * price
                });
            }
        });
        
        return map;
    }, [activeSummary, viewMode]);

    const inventoryColumns = [
        "Product Name",
        // Replaces "Product Type", which was hardcoded to "Lubricant" on every
        // row and told the user nothing. Category is the field that actually
        // varies now, and it is what decides how the sale is reported.
        "Category",
        "Qty in Stock",
        "Price Per Unit",
        viewMode === "week" ? "Qty Sold This Week" : "Qty Sold This Month" // 🆕 Dynamic column
    ];

    const bestSellingColumns = [
        "Rank",
        "Product Name",
        "Quantity Sold",
        "Revenue"
    ];

    // Transform lubricants data to array of arrays
    const inventoryData = useMemo(() => {
        if (!lubricants.length) return [];

        return lubricants
            .filter((lub) => lub && lub._id)
            .map(lub => {
                const quantity = lub.qtyInStock || 0;
                const price = lub.sellingPrice || lub.unitPrice || 0;

                const sale = salesMap.get(lub._id.toString());
                const soldQty = sale?.quantity || 0;

                const CATEGORY_LABEL = {
                    lubricant: "Lubricant",
                    drinks: "Store — Drinks",
                    snacks: "Store — Snacks",
                    other: "Store — Other",
                };

                /**
                 * Stock in base units, with the pack equivalent alongside.
                 *
                 * "240 pieces" is the truth but not the answer to the question
                 * a manager is actually asking at the shelf, which is how many
                 * packs they can still sell. Shown for the largest unit only —
                 * listing every unit turns a column into a paragraph.
                 */
                const baseUnit = lub.baseUnit || "piece";
                const biggest = (lub.saleUnits || []).reduce(
                    (best, u) => (!best || u.factor > best.factor ? u : best),
                    null
                );
                const stockLabel = biggest && quantity >= biggest.factor
                    ? `${quantity} ${baseUnit}s (${Math.floor(quantity / biggest.factor)} ${biggest.name}s)`
                    : `${quantity} ${baseUnit}${quantity === 1 ? "" : "s"}`;

                return [
                    lub.productName || "—",
                    CATEGORY_LABEL[lub.category] || "Lubricant",
                    stockLabel,
                    `₦${price?.toLocaleString() || 0}`,
                    soldQty
                ];
            });
    }, [lubricants, salesMap]);

    // Transform top selling products to array of arrays
    const topSellingData = useMemo(() => {
        if (!lubricants.length || salesMap.size === 0) return [];

        const salesArray = Array.from(salesMap.entries()).map(([lubricantId, data]) => {
            const lubricant = lubricants.filter(Boolean).find(lub => lub._id?.toString() === lubricantId);
            return {
                lubricantId,
                productName: lubricant?.productName || "Unknown",
                quantity: data.quantity,
                revenue: data.revenue
            };
        });
        
        const sorted = salesArray.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        
        return sorted.map((item, index) => [
            index + 1,
            item.productName,
            item.quantity,
            `₦${Math.round(item.revenue).toLocaleString()}`
        ]);
    }, [lubricants, salesMap]);

    // Get progress bar data for top 4 products
    const progressData = useMemo(() => {
        if (!lubricants.length) return [];

        return lubricants.filter(Boolean).slice(0, 4).map(lub => {
            const quantity = lub.qtyInStock || 0;
            const maxStock = lub.reOrderLevel ? lub.reOrderLevel * 20 : 100;
            const percentage = quantity > 0 ? Math.min((quantity / maxStock) * 100, 100) : 0;
            let color = "#7f27ff";
            
            if (percentage < 20) {
                color = "#eb2b0b";
            } else if (percentage < 50) {
                color = "#e27d00";
            }

            return {
                name: lub.productName,
                current: quantity,
                max: maxStock,
                percentage,
                color
            };
        });
    }, [lubricants]);

    if (loading && !lubricants.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading inventory...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row w-full gap-3">
            <div className="w-full lg:w-4/7">
                <DisplayCard>
                    <h3 className="text-xl font-semibold">Lubricant Inventory</h3>
                    <p className="mb-4">
                        Track lubricant stock levels and sales performance
                    </p>
                    <Table
                        columns={inventoryColumns}
                        data={inventoryData}
                    />

                    {/* ── Product tracker ──────────────────────────────────
                        Opened when the shelf and the system disagree. Kept
                        beside the inventory table because that is where someone
                        notices the number is wrong. */}
                    {canTrack && (
                    <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Track a product
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                            Every delivery, sale and correction for one item — and where to fix the count.
                        </p>
                        <label className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                checked={showRetired}
                                onChange={(e) => setShowRetired(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Include retired products
                        </label>
                        <input
                            value={trackerSearch}
                            onChange={(e) => setTrackerSearch(e.target.value)}
                            placeholder="Search by name or barcode…"
                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm mb-2"
                        />
                        <div className="max-h-56 overflow-y-auto space-y-1">
                            {trackableProducts.map((lub) => (
                                <button
                                    key={lub._id}
                                    onClick={() => setTrackedProduct(lub)}
                                    className="w-full flex items-center justify-between gap-3 text-left border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                                        {lub.productName}
                                        {lub.isActive === false && (
                                            <span className="ml-2 text-[10px] font-bold uppercase text-gray-400 border border-gray-300 rounded px-1.5 py-0.5">
                                                Retired
                                            </span>
                                        )}
                                    </span>
                                    <span className={`text-xs font-semibold shrink-0 ${Number(lub.qtyInStock) <= 0 ? "text-red-500" : "text-gray-400"}`}>
                                        {lub.qtyInStock} {lub.baseUnit || "piece"}{Number(lub.qtyInStock) === 1 ? "" : "s"}
                                    </span>
                                </button>
                            ))}
                            {trackableProducts.length === 0 && (
                                <p className="text-xs text-gray-400 py-3 text-center">No product matches that.</p>
                            )}
                        </div>
                    </div>
                    )}
                    {/* Progress Bars */}
                    <div className="mt-6 space-y-4">
                        {progressData.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between mb-1">
                                    <p className="text-sm text-gray-600">{item.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {item.current}/{item.max} Units
                                    </p>
                                </div>
                                {(() => {
                                    const pct = Math.max(0, Math.min(100, Number(item.percentage) || 0));
                                    return (
                                        <div className="relative h-6 w-full bg-gray-200 rounded-[30px]">
                                            <div
                                                style={{ width: `${pct}%`, backgroundColor: item.color }}
                                                className="h-6 rounded-[30px] transition-all duration-300"
                                            />
                                            {/* Travel reduced by the knob's own width, so an
                                                empty shelf does not push it off the left. */}
                                            <div
                                                style={{ left: `calc(${pct}% - ${(pct / 100) * 32}px)` }}
                                                className="absolute top-1/2 -translate-y-1/2 bg-[#dad6d6] h-8 w-8 rounded-full border-2 border-white shadow-sm transition-all duration-300"
                                            />
                                        </div>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                </DisplayCard>
            </div>

            <div className="w-full lg:w-3/7">
                <DisplayCard>
                    <h3 className="text-xl font-semibold">Top Selling Products</h3>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4">
                        <p>Best Performing lubricants</p>
                        
                        {/* 🆕 Toggle Buttons */}
                        <div className="p-[4px] bg-[#0080ff] rounded-[8px] flex gap-[4px] text-sm">
                            <button 
                                onClick={() => setViewMode("week")}
                                className={`p-2 rounded-[8px] font-semibold transition-colors ${
                                    viewMode === "week" 
                                        ? "bg-white text-[#0080ff]" 
                                        : "text-white"
                                }`}
                            >
                                This Week
                            </button>
                            <button 
                                onClick={() => setViewMode("month")}
                                className={`rounded-[8px] p-2 font-semibold transition-colors ${
                                    viewMode === "month" 
                                        ? "bg-white text-[#0080ff]" 
                                        : "text-white"
                                }`}
                            >
                                This Month
                            </button>
                        </div>
                    </div>
                    <Table
                        columns={bestSellingColumns}
                        data={topSellingData}
                    />
                </DisplayCard>
            </div>

            {trackedProduct && canTrack && (
                <ProductTrackerModal
                    product={trackedProduct}
                    onClose={() => {
                        setTrackedProduct(null);
                        // A correction may have changed the count — reload so the
                        // table beside it is not left showing the old figure.
                        fetchLubricants();
                    }}
                />
            )}
        </div>
    );
}
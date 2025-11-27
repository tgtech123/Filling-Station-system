"use client";
import { useEffect, useMemo, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import { useLubricantStore } from "@/store/lubricantStore";

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
        
        console.log(`${viewMode} summary:`, activeSummary);
        
        const summaryArray = Array.isArray(activeSummary) ? activeSummary : [];
        
        if (!summaryArray.length) {
            console.log(`No ${viewMode} summary data available`);
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
        
        console.log(`${viewMode} sales map:`, Array.from(map.entries()));
        
        return map;
    }, [activeSummary, viewMode]);

    const inventoryColumns = [
        "Product Name",
        "Product Type",
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
        
        return lubricants.map(lub => {
            const quantity = lub.qtyInStock || 0;
            const price = lub.sellingPrice || lub.unitPrice || 0;
            
            const sale = salesMap.get(lub._id.toString());
            const soldQty = sale?.quantity || 0;

            return [
                lub.productName,
                lub.productType || "N/A",
                quantity,
                `₦${price?.toLocaleString() || 0}`,
                soldQty
            ];
        });
    }, [lubricants, salesMap]);

    // Transform top selling products to array of arrays
    const topSellingData = useMemo(() => {
        if (!lubricants.length || salesMap.size === 0) return [];
        
        const salesArray = Array.from(salesMap.entries()).map(([lubricantId, data]) => {
            const lubricant = lubricants.find(lub => lub._id === lubricantId);
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
        
        return lubricants.slice(0, 4).map(lub => {
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
                                <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                                    <div 
                                        style={{ 
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color 
                                        }}
                                        className="relative h-6 rounded-[30px]"
                                    >
                                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                                    </div>
                                </div>
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
        </div>
    );
}
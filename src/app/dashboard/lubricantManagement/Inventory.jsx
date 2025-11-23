"use client";

import { useEffect, useMemo } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import { useLubricantStore } from "@/store/lubricantStore";

export default function Inventory() {
    const { 
        lubricants, 
        weeklySummary,
        loading, 
        fetchLubricants, 
        fetchWeeklySummary
    } = useLubricantStore();

    useEffect(() => {
        const loadData = async () => {
            await fetchLubricants();
            await fetchWeeklySummary();
        };
        
        loadData();
    }, [fetchLubricants, fetchWeeklySummary]);

    // Use weekly summary data directly (now it's properly calculated from transactions)
    const weeklySalesMap = useMemo(() => {
        const map = new Map();
        
        console.log("Weekly summary:", weeklySummary);
        
        // Weekly summary is an array of lubricants with qtySoldThisWeek
        const summaryArray = Array.isArray(weeklySummary) ? weeklySummary : [];
        
        if (!summaryArray.length) {
            console.log("No weekly summary data available");
            return map;
        }
        
        summaryArray.forEach((item) => {
            const lubricantId = item.lubricantId;
            const quantity = item.qtySoldThisWeek || 0;
            const price = item.unitPrice || 0;
            
            if (lubricantId) {
                map.set(lubricantId.toString(), {
                    quantity: quantity,
                    revenue: quantity * price
                });
            }
        });
        
        console.log("Weekly sales map:", Array.from(map.entries()));
        
        return map;
    }, [weeklySummary]);
    const inventoryColumns = [
        "Product Name",
        "Product Type",
        "Qty in Stock",
        "Price Per Unit",
        "Qty Sold This Week"
    ];

    // Column headers for best selling table
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
            
            // Get weekly sales from our map using _id
            const weeklySale = weeklySalesMap.get(lub._id.toString());
            const soldQty = weeklySale?.quantity || 0;

            return [
                lub.productName,
                lub.productType || "N/A",
                quantity,
                `₦${price?.toLocaleString() || 0}`,
                soldQty
            ];
        });
    }, [lubricants, weeklySalesMap]);

    // Transform top selling products to array of arrays
    const topSellingData = useMemo(() => {
        if (!lubricants.length || weeklySalesMap.size === 0) return [];
        
        // Convert map to array and sort by quantity sold
        const salesArray = Array.from(weeklySalesMap.entries()).map(([lubricantId, data]) => {
            const lubricant = lubricants.find(lub => lub._id === lubricantId);
            return {
                lubricantId,
                productName: lubricant?.productName || "Unknown",
                quantity: data.quantity,
                revenue: data.revenue
            };
        });
        
        // Sort by quantity descending and take top 5
        const sorted = salesArray.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        
        return sorted.map((item, index) => [
            index + 1,
            item.productName,
            item.quantity,
            `₦${Math.round(item.revenue).toLocaleString()}`
        ]);
    }, [lubricants, weeklySalesMap]);

    // Get progress bar data for top 4 products
    const progressData = useMemo(() => {
        if (!lubricants.length) return [];
        
        return lubricants.slice(0, 4).map(lub => {
            const quantity = lub.qtyInStock || 0;
            const maxStock = lub.reOrderLevel ? lub.reOrderLevel * 20 : 100; // Estimate max based on reorder level
            const percentage = quantity > 0 ? Math.min((quantity / maxStock) * 100, 100) : 0;
            let color = "#7f27ff"; // Purple for high stock
            
            if (percentage < 20) {
                color = "#eb2b0b"; // Red for low stock
            } else if (percentage < 50) {
                color = "#e27d00"; // Orange for medium stock
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
                        <p>
                            Best Performing lubricants
                        </p>

                        <div className="p-[4px] bg-[#0080ff] rounded-[8px] flex gap-[4px] text-sm">
                            <button className="p-2 rounded-[8px] bg-white text-[#0080ff] font-semibold">
                                This Week
                            </button>
                            <button className="rounded-[8px] p-2 text-white font-semibold">
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
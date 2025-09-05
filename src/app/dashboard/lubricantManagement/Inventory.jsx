import DisplayCard from "@/components/Dashboard/DisplayCard";
import Table from "./Table";
import { bestSellingLubricantRows, bestSellingLubricantsColumns, inventoryColumns, inventoryDataRows } from "./lubricantData";

export default function Inventory() {
    return (
        <div className="flex flex-col lg:flex-row w-full gap-3">

            <div className="w-full lg:w-4/7">
                <DisplayCard>
                    <h3 className="text-xl font-semibold">Lubricant Inventory</h3>
                    <p>
                        Track lubricant stock levels and sales performance
                    </p>

                    <Table 
                        columns={inventoryColumns}
                        data={inventoryDataRows}
                    />

                    {/* Progress */}
                            <>
                                <div className="flex justify-between mb-1">
                                    <p className="text-sm text-gray-600">Motor Engine Oil</p>
                                    <p className="text-sm text-gray-400">900/1000 Unit</p>
                                </div>
                                <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                                    <div style={{ width: "90%" }} className={`relative h-6 rounded-[30px] bg-[#7f27ff]`}>
                                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                                    </div>
                                </div>
                            </>
                            <>
                                <div className="flex justify-between mb-1">
                                    <p className="text-sm text-gray-600">Motor Engine Oil (1L)</p>
                                    <p className="text-sm text-gray-400">200/2000 Unit</p>
                                </div>
                                <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                                    <div style={{ width: "90%" }} className={`relative h-6 rounded-[30px] bg-[#7f27ff]`}>
                                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                                    </div>
                                </div>
                            </>
                            <>
                                <div className="flex justify-between mb-1">
                                    <p className="text-sm text-gray-600">Motor Engine Oil (5L)</p>
                                    <p className="text-sm text-gray-400">250/2000 Unit</p>
                                </div>
                                <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                                    <div style={{ width: "80%" }} className={`relative h-6 rounded-[30px] bg-[#e27d00]`}>
                                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                                    </div>
                                </div>
                            </>
                            <>
                                <div className="flex justify-between mb-1">
                                    <p className="text-sm text-gray-600">Engine Oil (5L)</p>
                                    <p className="text-sm text-gray-400">250/2000 Unit</p>
                                </div>
                                <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                                    <div style={{ width: "60%" }} className={`relative h-6 rounded-[30px] bg-[#eb2b0b]`}>
                                        <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                                    </div>
                                </div>
                            </>
                </DisplayCard>
            </div>

            <div className="w-full lg:w-3/7">
                <DisplayCard>
                    <h3 className="text-xl font-semibold">Top Selling Products</h3>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">

                        <p>
                            Best Performing lubricants
                        </p>

                        <div className="p-[4px] bg-[#0080ff] rounded-[8px] flex gap-[4px] text-sm">
                            <button className="p-2 rounded-[8px] bg-white text-[#0080ff] font-semibold">This Week</button>
                            <button className="rounded-[8px] p-2 text-white font-semibold">This Week</button>
                        </div>

                    </div>

                    <Table 
                        columns={bestSellingLubricantsColumns}
                        data={bestSellingLubricantRows}
                    />
                </DisplayCard>
            </div>
        </div>
    )
}
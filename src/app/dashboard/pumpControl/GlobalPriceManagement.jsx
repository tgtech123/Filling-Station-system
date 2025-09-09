export default function GlobalPriceManagement() {
    return (
        <div className="rounded-[10px] border-1 border-gray-300 p-4">
            <h3 className="text-2xl font-semibold">Global Price Management</h3>
            <p>
                Update fuel prices across multiple pumps
            </p>

            <form className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    <div>
                        <p className="font-semibold text-sm">PMS</p>
                        <input 
                            type="text" 
                            className="border-2 border-gray-400 focus:border-3 focus:border-[#0080ff] p-2 rounded-[8px] w-full"
                            placeholder="120"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Diesel</p>
                        <input 
                            type="text" 
                            className="border-2 border-gray-400 focus:border-3 focus:border-[#0080ff] p-2 rounded-[8px] w-full"
                            placeholder="250"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Kerosense</p>
                        <input 
                            type="text" 
                            className="border-2 border-gray-400 focus:border-3 focus:border-[#0080ff] p-2 rounded-[8px] w-full"
                            placeholder="180"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Gas</p>
                        <input 
                            type="text" 
                            className="border-2 focus:border-3 focus:border-[#0080ff] border-gray-400 p-2 rounded-[8px] w-full"
                            placeholder="120"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-10">
                    <button className="cursor-pointer hover:bg-[#0a71d8] bg-[#0080ff] text-white text-sm py-3 px-4 rounded-[8px]">Update All Prices</button>
                </div>
            </form>
        </div>
    )
}
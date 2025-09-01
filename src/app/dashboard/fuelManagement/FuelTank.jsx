import DisplayCard from "@/components/Dashboard/DisplayCard"

export default function FuelTank() {

    const tankData = [
        {
            id: 1,
            tankName: "Tank A",
            product: "Diesel",
            tankLevel: "High",
            litres: "9,600 Ltrs",
            percentFull: "96%"
        },
        {
            id: 2,
            tankName: "Tank B",
            product: "PMS",
            tankLevel: "Low",
            litres: "2,000 Ltrs",
            percentFull: "20%"
        },
        {
            id: 3,
            tankName: "Tank C",
            product: "Kerosene",
            tankLevel: "High",
            litres: "9,600 Ltrs",
            percentFull: "96%"
        },
        {
            id: 4,
            tankName: "Tank D",
            product: "Fuel",
            tankLevel: "Good",
            litres: "5,000 Ltrs",
            percentFull: "50%"
        },
    ]
    return (
        <DisplayCard>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                {tankData.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-[12px] border-2 border-gray-300">
                        <header className="flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                                <div className="bg-gray-300 h-14 w-14 rounded-full flex items-center justify-center">
                                    <img src="/tank.png" alt="" />
                                </div>
                                <div>
                                    <h5 className="mb-1 text-xl font-semibold">{item.tankName}</h5>
                                    <p>{item.product}</p>
                                </div>
                            </div>

                            {item.tankLevel === "Good" ? (
                                <button className="bg-[#dcd2ff] py-1 px-2 font-medium rounded-[8px] text-sm text-[#7f27ff]">Good</button>
                                ) : item.tankLevel === "High" ? (
                                <button className="bg-[#b2ffb4] py-1 px-2 font-medium rounded-[8px] text-sm text-[#04910c]">High</button>
                                ) : (
                                <button className="rounded-[8px] bg-[#ffdcdc] text-[#f00] text-sm py-1 px-2 font-medium">Low</button>
                                )}
                        </header>

                        <div className="w-[70%] bg-gray-200 h-[1px] my-8"></div>

                        <section>
                            <div className="mb-2 flex justify-between items-center">
                                <p className="text-sm font-semibold">Level</p>
                                <p className="text-sm font-medium">{item.litres}</p>
                            </div>
                            {/* Progress */}
                            <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                                <div style={{ width: item.percentFull }} className={`relative h-6 rounded-[30px] ${item.tankLevel === "High" ? "bg-[#0080ff]" : item.tankLevel === "Low" ? "bg-[#f00]" : "bg-[#e27d00]"}`}>
                                    <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                                </div>
                            </div>

                            <div className="mt-2 flex justify-between text-gray-500 items-center">
                                <p className="text-sm font-medium">{item.percentFull} Full</p>
                                <p className="text-sm font-medium">Capped: 10,000 Litres</p>
                            </div>
                        </section>
                    </div>
                ))}
            </div>
        </DisplayCard>
    )
}
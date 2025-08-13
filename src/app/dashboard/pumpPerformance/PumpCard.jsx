import { Check, Moon, Wrench, X } from "lucide-react";

export default function PumpCard({ name, product, status, price, litresSold, totalDaySales}) {
    return (
        <div className="border-2 border-gray-300 rounded-[10px] p-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex justify-center items-center">
                        <img src="/pump.png" alt="" />
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold MB-2">{name}</h4>
                        <p>{product}</p>
                    </div>
                </div>

                <button className={`rounded-[10px] font-semibold p-2 ${status === "Active" ? "bg-[#b2ffb4] text-[#04910c]" : status === "Inactive" ? "bg-[#d1d1d1] text-[#b0b0b0]" : status === "Idle" ? "bg-[#dcd2ff] text-[#7f27ff]" : "bg-[#fec6aa] text-[#eb2b0b]"}`}>
                     {status === "Active" ? (
                        <span className="flex items-center text-sm">
                            {status}
                            <Check size={18}/>
                        </span>
                      ) : status === "Inactive" ? (
                      <span className="flex items-center text-xs">
                        {status}
                        <X size={18} />
                      </span> 
                      ) : status === "Idle" ? (
                      <span className="flex items-center text-sm">
                        {status}
                        <Moon size={18} />
                      </span> 
                      ) : (
                      <span className="flex items-center text-sm">
                        {status}
                        <Wrench size={18} />
                      </span>
                      )
                      }
                </button>
            </div>

            <div className="my-6 h-[1px] w-[80%] bg-gray-300"></div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        <img src="/priceIcon.png" alt="" />
                        Price/Litre
                    </div>
                    <div>
                        <p className="font-semibold">₦{price}</p>
                    </div>
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        <img src="/pumpNozzle.png" alt="" />
                        Litres Sold Today
                    </div>
                    <div>
                        <p className="font-semibold">{litresSold}</p>
                    </div>
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        {+totalDaySales > 0 ? (
                            <img src="/trend.png" alt="" /> 
                        ) : (
                        <img src="/empty.png" alt="" />
                    )}
                        Sales Today
                    </div>
                    <div>
                        <p className="font-semibold">₦{totalDaySales}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
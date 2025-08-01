import { TrendingUp } from "lucide-react";

export default function FlashCard({name, icon, period, variable, trend}) {
    return (
        <div className={`min-h-[150px] flex flex-col justify-between h-auto p-4 border-2 rounded-[20px] border-[#e7e7e7]`}>

            <div className="flex  justify-between">
                <div></div>
                <div className="flex flex-col items-center">
                    <h4 className="font-semibold">{name}</h4>
                    <div className="text-sm text-[#737373]">
                    {typeof period === "string" ? <p>{period}</p> : period}
                    </div>

                </div>
                <span className="text-xl">{icon}</span>
            </div>

            <div className="flex justify-between">
                <h3 className="text-2xl font-semibold text-[#1a71f6]">{variable}</h3>
                {trend && (
                    <div className="text-[#04910c] flex items-center gap-1 font-semibold">
                        <TrendingUp />{trend}%
                    </div>
                )}
            </div>

        </div>
    )
}
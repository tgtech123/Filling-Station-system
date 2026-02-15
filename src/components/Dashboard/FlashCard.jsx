import { TrendingUp } from "lucide-react";

export default function FlashCard({ name, icon, period, variable, trend, number }) {

  return (
    <div className="group min-h-[150px] flex flex-col justify-between h-auto p-2 lg:p-4 border-2 rounded-[20px] hover:bg-[#1a71f6] cursor-pointer border-[#e7e7e7] hover:text-white transition-colors duration-200">
      <div className="flex justify-between">
        <div></div>
        <div className="flex flex-col items-center text-[#737373] group-hover:text-white transition-colors">
          <h4 className="font-semibold">{name}</h4>
          <div className="text-sm">
            {typeof period === "string" ? <p>{period}</p> : period}
          </div>
        </div>
        <span className="text-xl">{icon}</span>
      </div> 

      <div className="flex justify-between">
        <h3 className="text-2xl font-semibold text-[#1a71f6] group-hover:text-white transition-colors">{variable}</h3>
        {number && (
          <h3 className="text-xl lg:text-2xl mx-auto font-semibold text-[#1a71f6] group-hover:text-white transition-colors">{number}</h3>
        )}
        {trend && (
          <div className="text-[#04910c] group-hover:text-white flex items-center gap-1 font-semibold transition-colors">
            <TrendingUp />
            {trend}%
          </div>
        )}
      </div>
    </div>
  );
}

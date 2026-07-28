import { TrendingUp } from "lucide-react";

export default function FlashCard({ name, icon, period, variable, trend, number }) {

  return (
    <div className="group min-h-[130px] sm:min-h-[150px] flex flex-col justify-between h-auto p-3 sm:p-4 border-2 rounded-[20px] hover:bg-[#1a71f6] cursor-pointer border-[#e7e7e7] dark:border-gray-600 dark:bg-gray-800 hover:text-white transition-colors duration-200">
      <div className="flex justify-between">
        <div></div>
        <div className="flex flex-col items-center text-[#737373] dark:text-gray-300 group-hover:text-white transition-colors">
          <h4 className="font-semibold text-sm sm:text-base">{name}</h4>
          <div className="text-xs sm:text-sm">
            {typeof period === "string" ? <p>{period}</p> : period}
          </div>
        </div>
        <span className="text-xl">{icon}</span>
      </div> 

      <div className="flex justify-between">
        <h3 className="text-lg sm:text-2xl font-semibold text-[#1a71f6] dark:text-blue-400 group-hover:text-white transition-colors">{variable}</h3>
        {/*
          `number != null` — NOT a truthiness check. A card whose value is the
          number 0 would short-circuit `{number && …}`, and React then renders a
          bare `0` text node with no <h3> around it: no font size, no colour, no
          mx-auto. That is why "Under Maintenance: 0" and the zeroed Activity
          Log counters sat out of line with every other card.
        */}
        {number != null && number !== "" && (
          <h3 className="text-base sm:text-xl lg:text-2xl mx-auto font-semibold text-[#1a71f6] dark:text-blue-400 group-hover:text-white transition-colors">{number}</h3>
        )}
        {trend != null && trend !== "" && (
          <div className="text-[#04910c] dark:text-green-400 group-hover:text-white flex items-center gap-1 font-semibold transition-colors">
            <TrendingUp />
            {trend}%
          </div>
        )}
      </div>
    </div>
  );
}

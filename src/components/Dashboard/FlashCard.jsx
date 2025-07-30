import { TrendingUp } from "lucide-react";

export default function FlashCard({name, icon, period, variable, trend}) {
    return (
        <div className={`min-h-[150px] flex flex-col justify-between h-auto p-4 border-2 rounded-[20px] hover:bg-[#1a71f6] cursor-pointer hover:text-white border-[#e7e7e7]`}>

            <div className="flex  justify-between">
                <div></div>
                <div className="flex flex-col items-center">
                    <h4 className="font-semibold">{name}</h4>
                    <div className="text-sm text-[#737373]">{period}</div>
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

// import React from "react";

// export default function Progress ({ 
//   current = 40, 
//   target = 100, 
//   unit = "₦",
//   progressColor = "bg-blue-600"
// }) {
//   const progressPercent = Math.min((current / target) * 100, 100);
//   const isOverTarget = current > target;

//   return (
//     <div className="w-full">
//       {/* Values */}
//       <div className="flex justify-between text-xs mb-1">
//         <span className={isOverTarget ? 'text-green-600' : 'text-blue-600'}>
//           {unit}{current.toLocaleString()}
//         </span>
//         <span className="text-gray-500">
//           {unit}{target.toLocaleString()}
//         </span>
//       </div>

//       {/* Progress Bar */}
//       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//         <div
//           className={`h-2 ${isOverTarget ? 'bg-green-600' : progressColor} rounded-full transition-all duration-500`}
//           style={{ width: `${progressPercent}%` }}
//         ></div>
//       </div>

//       {/* Percentage */}
//       <div className="text-center text-xs text-gray-500 mt-1">
//         {progressPercent.toFixed(0)}%
//       </div>
//     </div>
//   );
// };